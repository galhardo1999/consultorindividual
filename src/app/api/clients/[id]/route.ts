import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  nomeCompleto: z.string().min(2).optional(),
  telefone: z.string().min(8).optional(),
  email: z.string().email().optional().or(z.literal("")).optional(),
  document: z.string().optional(),
  cidadeAtual: z.string().optional(),
  origemLead: z.string().optional(),
  estagioJornada: z.string().optional(),
  objetivoCompra: z.string().optional(),
  formaPagamento: z.string().optional(),
  nivelUrgencia: z.string().optional(),
  observacoes: z.string().optional(),
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
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const dataToUpdate = { ...parsed.data };
  Object.keys(dataToUpdate).forEach((key) => {
    if ((dataToUpdate as any)[key] === "") {
      (dataToUpdate as any)[key] = null;
    }
  });

  const cliente = await prisma.cliente.update({
    where: { id },
    data: dataToUpdate as never,
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
