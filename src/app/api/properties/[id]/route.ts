import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  titulo: z.string().min(2).optional(),
  tipoImovel: z.string().optional(),
  finalidade: z.string().optional(),
  preco: z.number().positive().optional(),
  cidade: z.string().min(2).optional(),
  bairro: z.string().optional(),
  endereco: z.string().optional(),
  codigoInterno: z.string().optional(),
  descricao: z.string().optional(),
  quartos: z.number().int().optional(),
  suites: z.number().int().optional(),
  banheiros: z.number().int().optional(),
  vagasGaragem: z.number().int().optional(),
  areaUtil: z.number().optional(),
  valorCondominio: z.number().optional(),
  valorIptu: z.number().optional(),
  mobiliado: z.boolean().optional(),
  aceitaFinanciamento: z.boolean().optional(),
  aceitaPermuta: z.boolean().optional(),
  status: z.string().optional(),
  origemCaptacao: z.string().optional(),
  destaques: z.string().optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.usuario?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const imovel = await prisma.imovel.findFirst({
    where: { id, usuarioId: session.usuario.id },
    include: {
      caracteristicas: true,
      interesses: {
        include: { cliente: true },
        orderBy: { atualizadoEm: "desc" },
      },
    },
  });

  if (!imovel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(imovel);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.usuario?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.imovel.findFirst({ where: { id, usuarioId: session.usuario.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const imovel = await prisma.imovel.update({ where: { id }, data: parsed.data as never });
  return NextResponse.json(imovel);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.usuario?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.imovel.findFirst({ where: { id, usuarioId: session.usuario.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const imovel = await prisma.imovel.update({
    where: { id },
    data: { arquivadoEm: new Date(), status: "ARQUIVADO" as never },
  });

  return NextResponse.json(imovel);
}
