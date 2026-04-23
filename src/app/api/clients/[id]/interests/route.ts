import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const interestSchema = z.object({
  imovelId: z.string(),
  statusInteresse: z.string().optional(),
  nivelPrioridade: z.string().optional(),
  ehFavorito: z.boolean().optional(),
  apresentadoEm: z.string().optional(),
  feedback: z.string().optional(),
  motivoRejeicao: z.string().optional(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.usuario?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clienteId } = await params;

  // Verify cliente belongs to usuario
  const cliente = await prisma.cliente.findFirst({ where: { id: clienteId, usuarioId: session.usuario.id } });
  if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const parsed = interestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const interesse = await prisma.clientPropertyInterest.upsert({
    where: { clientId_propertyId: { clienteId, imovelId: parsed.data.imovelId } },
    create: {
      clienteId,
      ...parsed.data,
      apresentadoEm: parsed.data.apresentadoEm ? new Date(parsed.data.apresentadoEm) : undefined,
    } as never,
    update: {
      ...parsed.data,
      apresentadoEm: parsed.data.apresentadoEm ? new Date(parsed.data.apresentadoEm) : undefined,
    } as never,
  });

  return NextResponse.json(interesse, { status: 201 });
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.usuario?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id: clienteId } = await params;

  const interesses = await prisma.clientPropertyInterest.findMany({
    where: { clienteId, cliente: { usuarioId: session.usuario.id } },
    include: { imovel: true },
    orderBy: { atualizadoEm: "desc" },
  });

  return NextResponse.json(interesses);
}
