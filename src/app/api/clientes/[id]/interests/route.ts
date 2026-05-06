import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { NivelPrioridade, StatusInteresse } from "@prisma/client";

const interesseSchema = z.object({
  imovelId: z.string().min(1),
  statusInteresse: z.enum(StatusInteresse).optional(),
  nivelPrioridade: z.enum(NivelPrioridade).optional(),
  ehFavorito: z.boolean().optional(),
  apresentadoEm: z
    .string()
    .optional()
    .nullable()
    .refine(
      (valor) => !valor || !Number.isNaN(new Date(valor).getTime()),
      "Data de apresentacao invalida"
    ),
  feedback: z.string().optional().nullable(),
  motivoRejeicao: z.string().optional().nullable(),
});

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: clienteId } = await params;
    const usuarioId = session.user.id;
    const cliente = await prisma.cliente.findFirst({
      where: { id: clienteId, usuarioId },
      select: { id: true },
    });
    if (!cliente) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const corpo = await req.json();
    const parsed = interesseSchema.safeParse(corpo);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados invalidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const imovel = await prisma.imovel.findFirst({
      where: { id: parsed.data.imovelId, usuarioId },
      select: { id: true },
    });
    if (!imovel) return NextResponse.json({ error: "Imovel invalido" }, { status: 404 });

    const dadosInteresse = {
      imovelId: parsed.data.imovelId,
      statusInteresse: parsed.data.statusInteresse,
      nivelPrioridade: parsed.data.nivelPrioridade,
      ehFavorito: parsed.data.ehFavorito,
      apresentadoEm: parsed.data.apresentadoEm ? new Date(parsed.data.apresentadoEm) : null,
      feedback: parsed.data.feedback ?? null,
      motivoRejeicao: parsed.data.motivoRejeicao ?? null,
    };

    const interesse = await prisma.interesseClienteImovel.upsert({
      where: { clienteId_imovelId: { clienteId, imovelId: parsed.data.imovelId } },
      create: {
        clienteId,
        ...dadosInteresse,
      },
      update: dadosInteresse,
    });

    return NextResponse.json(interesse, { status: 201 });
  } catch (erro) {
    console.error("[CLIENTES INTERESSES POST]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id: clienteId } = await params;

    const interesses = await prisma.interesseClienteImovel.findMany({
      where: { clienteId, cliente: { usuarioId: session.user.id }, imovel: { usuarioId: session.user.id } },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipoImovel: true,
            precoVenda: true,
            cidade: true,
            bairro: true,
            status: true,
          },
        },
      },
      orderBy: { atualizadoEm: "desc" },
    });

    return NextResponse.json(interesses);
  } catch (erro) {
    console.error("[CLIENTES INTERESSES GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
