import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// ─── Schema ───────────────────────────────────────────────────────────────────

const proprietarioSchema = z.object({
  nomeCompleto: z.string().min(2),
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

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

function serverError(label: string, error: unknown) {
  console.error(label, error);
  return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
}

async function getSession() {
  const session = await auth();
  return session?.user?.id ? session : null;
}

function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20")));
  return { page, limit, skip: (page - 1) * limit };
}

// ─── GET /proprietarios ───────────────────────────────────────────────────────

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? undefined;
    const status = searchParams.get("status") ?? undefined;
    const { page, limit, skip } = parsePagination(searchParams);

    const where = {
      usuarioId: session.user.id,
      ...(search && {
        OR: [
          { nomeCompleto: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { cidade: { contains: search, mode: "insensitive" as const } },
          { documento: { contains: search, mode: "insensitive" as const } },
        ],
      }),
      ...(status && { status: status as never }),
    };

    const [proprietarios, total] = await Promise.all([
      prisma.proprietario.findMany({
        where,
        include: { _count: { select: { imoveis: true } } },
        orderBy: { atualizadoEm: "desc" },
        skip,
        take: limit,
      }),
      prisma.proprietario.count({ where }),
    ]);

    return NextResponse.json({ proprietarios, total, page, limit });
  } catch (error) {
    return serverError("[PROPRIETARIOS GET]", error);
  }
}

// ─── POST /proprietarios ──────────────────────────────────────────────────────

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) return unauthorized();

  try {
    const body = await request.json();
    const parsed = proprietarioSchema.safeParse(body);

    if (!parsed.success)
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );

    const { email, ...rest } = parsed.data;

    const proprietario = await prisma.proprietario.create({
      data: { ...rest, email: email || undefined, usuarioId: session.user.id } as never,
    });

    return NextResponse.json(proprietario, { status: 201 });
  } catch (error) {
    return serverError("[PROPRIETARIOS POST]", error);
  }
}