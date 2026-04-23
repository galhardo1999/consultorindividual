import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const clientSchema = z.object({
  // Dados Básicos
  nomeCompleto: z.string().min(2),
  telefone: z.string().min(8),
  whatsapp: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  documento: z.string().optional(),
  dataNascimento: z.string().optional(),
  estadoCivil: z.string().optional(),
  temFilhos: z.boolean().optional(),
  profissao: z.string().optional(),
  rendaMensal: z.number().optional(),
  cidadeAtual: z.string().optional(),
  origemLead: z.string().optional(),
  responsavel: z.string().optional(),
  // Jornada / Status
  estagioJornada: z.string().optional(),
  temperaturaLead: z.string().optional(),
  objetivoCompra: z.string().optional(),
  formaPagamento: z.string().optional(),
  nivelUrgencia: z.string().optional(),
  prazoCompra: z.string().optional(),
  budgetMaximo: z.number().optional(),
  possuiImovelVender: z.boolean().optional(),
  preAprovacaoCredito: z.string().optional(),
  proximoContato: z.string().optional(),
  observacoes: z.string().optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const estagioJornada = searchParams.get("estagioJornada") || undefined;
  const nivelUrgencia = searchParams.get("nivelUrgencia") || undefined;
  const status = searchParams.get("status") || undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = {
    usuarioId: session.user.id,
    arquivadoEm: status === "ARQUIVADO" ? { not: null } : null,
    ...(search && {
      OR: [
        { nomeCompleto: { contains: search, mode: "insensitive" as const } },
        { email: { contains: search, mode: "insensitive" as const } },
        { telefone: { contains: search } },
      ],
    }),
    ...(estagioJornada && { estagioJornada: estagioJornada as never }),
    ...(nivelUrgencia && { nivelUrgencia: nivelUrgencia as never }),
  };

  const [clientes, total] = await Promise.all([
    prisma.cliente.findMany({
      where,
      include: {
        preferencia: true,
        _count: { select: { interacoes: true, interesses: true } },
      },
      orderBy: { atualizadoEm: "desc" },
      skip,
      take: limit,
    }),
    prisma.cliente.count({ where }),
  ]);

  return NextResponse.json({ clientes, total, page, limit });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = clientSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { documento, dataNascimento, proximoContato, ...rest } = parsed.data;
    const dataToCreate: Record<string, unknown> = {
      ...rest,
      documento: documento || null,
      // Convert date strings to proper Date objects for Prisma
      dataNascimento: dataNascimento ? new Date(`${dataNascimento}T00:00:00.000Z`) : null,
      proximoContato: proximoContato ? new Date(proximoContato) : null,
    };
    Object.keys(dataToCreate).forEach((key) => {
      if (dataToCreate[key] === "") {
        dataToCreate[key] = null;
      }
    });

    const cliente = await prisma.cliente.create({
      data: {
        ...dataToCreate,
        usuarioId: session.user.id,
      } as never,
    });

    return NextResponse.json(cliente, { status: 201 });
  } catch (error) {
    console.error("[CLIENTS POST]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
