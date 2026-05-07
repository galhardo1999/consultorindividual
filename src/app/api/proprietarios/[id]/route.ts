import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isDocumentoDuplicado } from "@/lib/documentValidation";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const updateSchema = z.object({
  nomeCompleto: z.string().min(2).optional(),
  email: z.string().email().optional().or(z.literal("")),
  telefone: z.string().optional(),
  whatsapp: z.string().optional(),
  documento: z.string().optional(),
  tipoPessoa: z.enum(["PESSOA_FISICA", "PESSOA_JURIDICA"]).optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum(["ATIVO", "INATIVO", "ARQUIVADO"]).optional(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ContextoRota = { params: Promise<{ id: string }> };

const naoAutorizado = () =>
  NextResponse.json({ error: "Unauthorized" }, { status: 401 });

const naoEncontrado = () =>
  NextResponse.json({ error: "Not found" }, { status: 404 });

const erroInterno = (label: string, erro: unknown) => {
  console.error(label, erro);
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
};

// Retorna sessão com usuário garantidamente autenticado
const obterSessao = async () => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session as typeof session & { user: { id: string } };
};

// Verifica se o proprietário pertence ao usuário
const verificarProprietario = (id: string, usuarioId: string) =>
  prisma.proprietario.findFirst({ where: { id, usuarioId } });

// ─── GET /proprietarios/[id] ──────────────────────────────────────────────────

export async function GET(_req: Request, { params }: ContextoRota) {
  const session = await obterSessao();
  if (!session) return naoAutorizado();

  const { id } = await params;

  const proprietario = await prisma.proprietario.findFirst({
    where: { id, usuarioId: session.user.id },
    include: {
      imoveis: {
        orderBy: { atualizadoEm: "desc" },
        include: { fotos: { orderBy: { isCapa: "desc" } } },
      },
    },
  });

  return proprietario ? NextResponse.json(proprietario) : naoEncontrado();
}

// ─── PATCH /proprietarios/[id] ────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: ContextoRota) {
  const session = await obterSessao();
  if (!session) return naoAutorizado();

  const { id } = await params;

  const [existente, corpo] = await Promise.all([
    verificarProprietario(id, session.user.id),
    req.json(),
  ]);

  if (!existente) return naoEncontrado();

  const parsed = updateSchema.safeParse(corpo);
  if (!parsed.success)
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });

  const { email, ...resto } = parsed.data;

  if (resto.documento) {
    const duplicado = await isDocumentoDuplicado(resto.documento, session.user.id, "PROPRIETARIO", id);
    if (duplicado) {
      return NextResponse.json({ error: "Já existe um cadastro com este CPF/CNPJ." }, { status: 400 });
    }
  }

  try {
    const proprietario = await prisma.proprietario.update({
      where: { id, usuarioId: session.user.id },
      data: { ...resto, email: email || null },
    });

    return NextResponse.json(proprietario);
  } catch (erro) {
    return erroInterno("[PROPRIETARIOS PATCH]", erro);
  }
}

// ─── DELETE /proprietarios/[id] ───────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: ContextoRota) {
  const session = await obterSessao();
  if (!session) return naoAutorizado();

  const { id } = await params;

  const existente = await verificarProprietario(id, session.user.id);
  if (!existente) return naoEncontrado();

  try {
    // onDelete: SetNull trata a desvinculação de imóveis automaticamente
    await prisma.proprietario.delete({ where: { id, usuarioId: session.user.id } });
    return NextResponse.json({ ok: true });
  } catch (erro) {
    return erroInterno("[PROPRIETARIOS DELETE]", erro);
  }
}
