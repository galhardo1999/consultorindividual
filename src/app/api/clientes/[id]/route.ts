import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  // Dados Básicos
  nomeCompleto: z.string().min(2).optional(),
  telefone: z.string().min(8).optional(),

  email: z.union([z.string().email(), z.literal(""), z.undefined()]),
  whatsapp: z.string().optional().nullable(),
  documento: z.string().optional(),
  dataNascimento: z.string().optional(),
  estadoCivil: z.string().optional(),
  temFilhos: z.boolean().optional(),
  profissao: z.string().optional(),
  rendaMensal: z.number().optional(),
  cidadeAtual: z.string().optional(),
  origemLead: z.string().optional(),
  // Jornada / Status
  estagioJornada: z.string().optional(),
  objetivoCompra: z.string().optional(),
  formaPagamento: z.string().optional(),
  nivelUrgencia: z.string().optional(),
  prazoCompra: z.string().optional(),
  budgetMaximo: z.number().optional(),
  preAprovacaoCredito: z.string().optional(),
  proximoContato: z.string().optional(),
  observacoes: z.string().optional(),
  preferencia: z.object({
    tipoImovel: z.string().optional().nullable(),
    precoMinimo: z.number().optional().nullable(),
    precoMaximo: z.number().optional().nullable(),
    cidadeInteresse: z.string().optional().nullable(),
    bairrosInteresse: z.string().optional().nullable(),
    minQuartos: z.number().optional().nullable(),
    areaMinima: z.number().optional().nullable(),
    aceitaFinanciamento: z.boolean().optional().nullable(),
    aceitaPermuta: z.boolean().optional().nullable(),
    notasPessoais: z.string().optional().nullable(),
  }).optional(),
});

async function getClient(id: string, usuarioId: string) {
  return prisma.cliente.findFirst({ where: { id, usuarioId } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const cliente = await prisma.cliente.findFirst({
    where: { id, usuarioId: session?.user?.id || "" },
    include: {
      preferencia: true,
      interacoes: { orderBy: { dataInteracao: "desc" } },
      interesses: {
        include: { imovel: true },
        orderBy: { atualizadoEm: "desc" },
      },
      etiquetasCliente: { include: { etiqueta: true } },
    },
  });

  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cliente);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getClient(id, session?.user?.id || "");
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });

  const { dataNascimento, proximoContato, preferencia, ...rest } = parsed.data;
  const dataToUpdate: Record<string, unknown> = {
    ...rest,
    dataNascimento: dataNascimento && !isNaN(new Date(`${dataNascimento}T00:00:00.000Z`).getTime()) 
      ? new Date(`${dataNascimento}T00:00:00.000Z`) 
      : dataNascimento === "" ? null : undefined,
    proximoContato: proximoContato && !isNaN(new Date(proximoContato).getTime()) 
      ? new Date(proximoContato) 
      : proximoContato === "" ? null : undefined,
  };
  // Remove undefined keys so Prisma doesn't try to set them
  Object.keys(dataToUpdate).forEach((key) => {
    if (dataToUpdate[key] === undefined) delete dataToUpdate[key];
    if (dataToUpdate[key] === "") dataToUpdate[key] = null;
  });

  const cliente = await prisma.cliente.update({
    where: { id },
    data: {
      ...dataToUpdate,
      preferencia: preferencia ? {
        upsert: {
          create: preferencia as any,
          update: preferencia as any
        }
      } : undefined
    } as any,
  });

  return NextResponse.json(cliente);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await getClient(id, session?.user?.id || "");
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Soft delete / archive
  const cliente = await prisma.cliente.update({
    where: { id },
    data: { arquivadoEm: new Date(), status: "ARQUIVADO" as never },
  });

  return NextResponse.json(cliente);
}
