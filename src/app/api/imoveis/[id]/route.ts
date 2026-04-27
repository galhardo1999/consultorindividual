import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateSchema = z.object({
  titulo: z.string().min(2).optional(),
  tipoImovel: z.string().optional(),
  finalidade: z.string().optional(),
  preco: z.number().nonnegative().optional(),
  cidade: z.string().min(2).optional(),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  codigoInterno: z.string().optional(),
  descricao: z.string().optional(),
  quartos: z.number().int().nullable().optional(),
  suites: z.number().int().nullable().optional(),
  banheiros: z.number().int().nullable().optional(),
  vagasGaragem: z.number().int().nullable().optional(),
  areaUtil: z.number().nullable().optional(),
  valorCondominio: z.number().nullable().optional(),
  valorIptu: z.number().nullable().optional(),
  mobiliado: z.boolean().optional(),
  aceitaFinanciamento: z.boolean().optional(),
  aceitaPermuta: z.boolean().optional(),
  status: z.string().optional(),
  destaques: z.string().optional(),
  proprietarioId: z.string().optional().nullable(),
  fotos: z.array(z.string()).optional(),
});

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const imovel = await prisma.imovel.findFirst({
    where: { id, usuarioId: session.user.id },
    include: {
      caracteristicas: true,
      proprietario: { select: { id: true, nomeCompleto: true, telefone: true, email: true } },
      interesses: {
        include: { cliente: true },
        orderBy: { atualizadoEm: "desc" },
      },
      fotos: { orderBy: { ordem: 'asc' } },
    },
  });

  if (!imovel) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(imovel);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.imovel.findFirst({ where: { id, usuarioId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const dataToUpdate = { ...parsed.data } as Record<string, any>;
  const fotos = dataToUpdate.fotos as string[] | undefined;
  delete dataToUpdate.fotos;

  const addressChanged =
    (dataToUpdate.cidade !== undefined && dataToUpdate.cidade !== existing.cidade) ||
    (dataToUpdate.bairro !== undefined && dataToUpdate.bairro !== existing.bairro) ||
    (dataToUpdate.cep !== undefined && dataToUpdate.cep !== existing.cep) ||
    (dataToUpdate.endereco !== undefined && dataToUpdate.endereco !== existing.endereco) ||
    (dataToUpdate.numero !== undefined && dataToUpdate.numero !== existing.numero);

  if (addressChanged) {
    dataToUpdate.latitude = null;
    dataToUpdate.longitude = null;
  }

  if (fotos && fotos.length > 0) {
    const existingFotosCount = await prisma.fotoImovel.count({ where: { imovelId: id } });
    dataToUpdate.fotos = {
      create: fotos.map((url, idx) => ({
        url,
        isCapa: existingFotosCount === 0 && idx === 0,
        ordem: existingFotosCount + idx,
      }))
    };
  }

  const imovel = await prisma.imovel.update({ where: { id }, data: dataToUpdate as never });
  return NextResponse.json(imovel);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const existing = await prisma.imovel.findFirst({ where: { id, usuarioId: session.user.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const imovel = await prisma.imovel.update({
    where: { id },
    data: { arquivadoEm: new Date(), status: "ARQUIVADO" as never },
  });

  return NextResponse.json(imovel);
}
