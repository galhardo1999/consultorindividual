import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { enviarEmailRecuperacaoSenha } from "@/lib/email";

const esquema = z.object({
  email: z.string().email("E-mail inválido"),
});

// Rate limiting simples em memória — 3 tentativas por IP a cada 15 min
const mapaRateLimit = new Map<string, { tentativas: number; resetEm: number }>();
const LIMITE_TENTATIVAS = 3;
const JANELA_MS = 15 * 60 * 1000;

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  // Rate limiting por IP
  const ip = req.headers.get("x-forwarded-for") ?? "desconhecido";
  const agora = Date.now();
  const entrada = mapaRateLimit.get(ip);

  if (entrada && agora < entrada.resetEm) {
    if (entrada.tentativas >= LIMITE_TENTATIVAS) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
        { status: 429 }
      );
    }
    entrada.tentativas += 1;
  } else {
    mapaRateLimit.set(ip, { tentativas: 1, resetEm: agora + JANELA_MS });
  }

  try {
    const corpo = await req.json();
    const parsed = esquema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Busca o usuário — mesmo que não exista, retornamos 200 para não vazar informações
    const usuario = await prisma.usuario.findUnique({
      where: { email },
      select: { id: true, nome: true, email: true },
    });

    if (usuario) {
      // Invalida tokens anteriores do mesmo usuário
      await prisma.tokenRecuperacaoSenha.updateMany({
        where: { usuarioId: usuario.id, usado: false },
        data: { usado: true },
      });

      // Gera novo token seguro
      const token = crypto.randomBytes(32).toString("hex");
      const expiraEm = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

      await prisma.tokenRecuperacaoSenha.create({
        data: {
          usuarioId: usuario.id,
          token,
          expiraEm,
        },
      });

      // Envia e-mail (não bloqueia o retorno em caso de falha de e-mail)
      try {
        await enviarEmailRecuperacaoSenha(usuario.email, usuario.nome, token);
      } catch (erroEmail) {
        console.error("[recuperar-senha] Erro ao enviar e-mail:", erroEmail);
      }
    }

    // Retorno genérico — nunca revela se o e-mail existe ou não
    return NextResponse.json({
      mensagem:
        "Se este e-mail estiver cadastrado, você receberá as instruções em instantes.",
    });
  } catch (erro) {
    console.error("[recuperar-senha] Erro interno:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
};
