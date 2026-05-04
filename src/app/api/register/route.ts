import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// ─── Rate limiting simples em memória (Edge-safe) ─────────────────────────────
// Para produção com múltiplas instâncias, use Upstash Redis

const tentativas = new Map<string, { contagem: number; resetEm: number }>();
const LIMITE_TENTATIVAS = 5;
const JANELA_MS = 15 * 60 * 1000; // 15 minutos

function limparEntradasExpiradas() {
  const agora = Date.now();
  for (const [ip, entrada] of tentativas.entries()) {
    if (agora > entrada.resetEm) tentativas.delete(ip);
  }
}

const verificarRateLimit = (ip: string): boolean => {
  limparEntradasExpiradas();
  const agora = Date.now();
  const entrada = tentativas.get(ip);

  if (!entrada || agora > entrada.resetEm) {
    tentativas.set(ip, { contagem: 1, resetEm: agora + JANELA_MS });
    return true;
  }

  if (entrada.contagem >= LIMITE_TENTATIVAS) return false;

  entrada.contagem += 1;
  return true;
};

// ─── Schema de validação ───────────────────────────────────────────────────────

const registerSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z
    .string()
    .min(6, "Senha deve ter pelo menos 6 caracteres")
    .regex(/[a-zA-Z]/, "Senha deve conter pelo menos 1 letra")
    .regex(/[0-9]/, "Senha deve conter pelo menos 1 número"),
  telefone: z.string().optional(),
});

// ─── POST /api/register ───────────────────────────────────────────────────────

export async function POST(request: Request) {
  try {
    // Lê IP do header (Vercel/proxy) ou fallback
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "unknown";

    if (!verificarRateLimit(ip)) {
      return NextResponse.json(
        { error: "Muitas tentativas. Aguarde 15 minutos e tente novamente." },
        { status: 429 }
      );
    }

    const corpo = await request.json();
    const parsed = registerSchema.safeParse(corpo);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { nome, email, password, telefone } = parsed.data;

    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
    }

    const senhaHash = await bcrypt.hash(password, 12);

    const usuario = await prisma.usuario.create({
      data: { nome, email, senhaHash, telefone },
    });

    return NextResponse.json(
      { id: usuario.id, nome: usuario.nome, email: usuario.email },
      { status: 201 }
    );
  } catch (erro) {
    console.error("[REGISTER]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
