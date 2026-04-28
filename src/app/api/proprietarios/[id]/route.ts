import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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

type RouteContext = { params: Promise<{ id: string }> };

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

async function resolveOwner(id: string, usuarioId: string) {
  return prisma.proprietario.findFirst({ where: { id, usuarioId } });
}

async function getSession() {
  const session = await auth();
  return session?.user?.id ? session : null;
}

// ─── GET /proprietarios/[id] ──────────────────────────────────────────────────

export async function GET(_req: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const proprietario = await prisma.proprietario.findFirst({
    where: { id, usuarioId: session?.user?.id || "" },
    include: {
      imoveis: { orderBy: { atualizadoEm: "desc" } },
    },
  });

  return proprietario ? NextResponse.json(proprietario) : notFound();
}

// ─── PATCH /proprietarios/[id] ────────────────────────────────────────────────

export async function PATCH(req: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const [existing, body] = await Promise.all([
    resolveOwner(id, session?.user?.id || ""),
    req.json(),
  ]);

  if (!existing) return notFound();

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success)
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const { email, ...rest } = parsed.data;

  const proprietario = await prisma.proprietario.update({
    where: { id },
    data: { ...rest, email: email || null } as never,
  });

  return NextResponse.json(proprietario);
}

// ─── DELETE /proprietarios/[id] ───────────────────────────────────────────────

export async function DELETE(_req: Request, { params }: RouteContext) {
  const session = await getSession();
  if (!session) return unauthorized();

  const { id } = await params;

  const existing = await resolveOwner(id, session?.user?.id || "");
  if (!existing) return notFound();

  // onDelete: SetNull handles clearing proprietarioId on imoveis
  await prisma.proprietario.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}