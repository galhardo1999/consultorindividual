import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const esquema = z.object({
  token: z.string().min(1, "Token obrigatório"),
  novaSenha: z.string().min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export const POST = async (req: NextRequest): Promise<NextResponse> => {
  try {
    const corpo = await req.json();
    const parsed = esquema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { token, novaSenha } = parsed.data;

    // Busca o token e valida
    const registro = await prisma.tokenRecuperacaoSenha.findUnique({
      where: { token },
      include: { usuario: { select: { id: true } } },
    });

    if (!registro || registro.usado || registro.expiraEm < new Date()) {
      return NextResponse.json(
        { error: "Link inválido ou expirado. Solicite um novo link de recuperação." },
        { status: 400 }
      );
    }

    // Gera hash da nova senha com salt 12 (conforme AGENTS.md)
    const senhaHash = await bcrypt.hash(novaSenha, 12);

    // Atualiza senha e marca token como usado em transação
    await prisma.$transaction([
      prisma.usuario.update({
        where: { id: registro.usuario.id },
        data: { senhaHash },
      }),
      prisma.tokenRecuperacaoSenha.update({
        where: { id: registro.id },
        data: { usado: true },
      }),
    ]);

    return NextResponse.json({ mensagem: "Senha redefinida com sucesso." });
  } catch (erro) {
    console.error("[redefinir-senha] Erro interno:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
};
