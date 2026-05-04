import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const campoOpcional = z.string().optional().nullable();
const numeroOpcional = z.number().optional().nullable();
const boolOpcional = z.boolean().optional().nullable();

const updateSchema = z.object({
  // Dados Básicos
  nomeCompleto: z.string().min(2).optional(),
  telefone: z.string().min(8).optional(),
  email: z.union([z.string().email(), z.literal(""), z.null(), z.undefined()]).optional(),
  whatsapp: campoOpcional,
  documento: campoOpcional,
  dataNascimento: campoOpcional,
  estadoCivil: campoOpcional,
  temFilhos: boolOpcional,
  profissao: campoOpcional,
  rendaMensal: numeroOpcional,
  cidadeAtual: campoOpcional,
  origemLead: campoOpcional,
  // Jornada / Status
  estagioJornada: campoOpcional,
  objetivoCompra: campoOpcional,
  formaPagamento: campoOpcional,
  nivelUrgencia: campoOpcional,
  prazoCompra: campoOpcional,
  budgetMaximo: numeroOpcional,
  preAprovacaoCredito: campoOpcional,
  proximoContato: campoOpcional,
  observacoes: campoOpcional,
  preferencia: z.object({
    tipoImovel: campoOpcional,
    precoMinimo: numeroOpcional,
    precoMaximo: numeroOpcional,
    cidadeInteresse: campoOpcional,
    bairrosInteresse: campoOpcional,
    minQuartos: numeroOpcional,
    areaMinima: numeroOpcional,
    aceitaFinanciamento: boolOpcional,
    aceitaPermuta: boolOpcional,
    notasPessoais: campoOpcional,
  }).optional(),
});

async function getClient(id: string, usuarioId: string) {
  return prisma.cliente.findFirst({ where: { id, usuarioId } });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
  const cliente = await prisma.cliente.findFirst({
    where: { id, usuarioId: session.user.id },
    include: {
      preferencia: true,
      // Limita interações para evitar overfetch em clientes com histórico longo
      interacoes: {
        orderBy: { dataInteracao: "desc" },
        take: 50,
      },
      interesses: {
        // Seleciona apenas campos necessários do imóvel em vez de include completo
        select: {
          id: true,
          clienteId: true,
          imovelId: true,
          statusInteresse: true,
          nivelPrioridade: true,
          ehFavorito: true,
          apresentadoEm: true,
          feedback: true,
          motivoRejeicao: true,
          criadoEm: true,
          atualizadoEm: true,
          imovel: {
            select: {
              id: true,
              titulo: true,
              tipoImovel: true,
              finalidade: true,
              status: true,
              cidade: true,
              bairro: true,
              precoVenda: true,
              valorAluguel: true,
              quartos: true,
              banheiros: true,
              vagasGaragem: true,
              areaUtil: true,
              fotos: { select: { url: true, isCapa: true }, take: 1 },
            },
          },
        },
        orderBy: { atualizadoEm: "desc" },
      },
      etiquetasCliente: { include: { etiqueta: true } },
    },
  });

  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const existing = await getClient(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });

    const { dataNascimento, proximoContato, preferencia, ...rest } = parsed.data;
    const dataToUpdate: Record<string, unknown> = { ...rest };

    if (dataNascimento !== undefined) {
      dataToUpdate.dataNascimento = dataNascimento && !isNaN(new Date(`${dataNascimento}T00:00:00.000Z`).getTime())
        ? new Date(`${dataNascimento}T00:00:00.000Z`)
        : null;
    }
    if (proximoContato !== undefined) {
      dataToUpdate.proximoContato = proximoContato && !isNaN(new Date(proximoContato).getTime())
        ? new Date(proximoContato)
        : null;
    }

    Object.keys(dataToUpdate).forEach((key) => {
      if (dataToUpdate[key] === "") dataToUpdate[key] = null;
    });

    const cliente = await prisma.cliente.update({
      where: { id, usuarioId: session.user.id },
      data: {
        ...dataToUpdate,
        ...(preferencia ? {
          preferencia: {
            upsert: {
              create: preferencia,
              update: preferencia,
            },
          },
        } : {}),
      },
    });

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  try {
    const existing = await getClient(id, session.user.id);
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const cliente = await prisma.cliente.update({
      where: { id, usuarioId: session.user.id },
      data: { arquivadoEm: new Date(), status: "ARQUIVADO" },
    });

    return NextResponse.json(cliente);
  } catch {
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
