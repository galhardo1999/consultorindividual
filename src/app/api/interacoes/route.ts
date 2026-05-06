import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoInteracao } from "@prisma/client";

const interactionSchema = z.object({
  clienteId: z.string().min(1),
  imovelId: z.string().min(1).optional().nullable(),
  tipoInteracao: z.enum(TipoInteracao),
  titulo: z.string().min(2),
  descricao: z.string().optional().nullable(),
  dataInteracao: z.string().min(1).refine((valor) => !Number.isNaN(new Date(valor).getTime()), "Data invÃ¡lida"),
  proximoFollowUp: z.string().optional().nullable().refine(
    (valor) => !valor || !Number.isNaN(new Date(valor).getTime()),
    "Follow-up invÃ¡lido"
  ),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const clienteId = searchParams.get("clienteId") || undefined;

  const interacoes = await prisma.interacao.findMany({
    where: {
      usuarioId: session.user.id,
      ...(clienteId && { clienteId }),
    },
    include: {
      cliente: { select: { id: true, nomeCompleto: true } },
      imovel: { select: { id: true, titulo: true, cidade: true, bairro: true } },
    },
    orderBy: { dataInteracao: "desc" },
    take: 50,
  });

  return NextResponse.json(interacoes);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = interactionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const usuarioId = session.user.id;
    const [cliente, imovel] = await Promise.all([
      prisma.cliente.findFirst({
        where: { id: parsed.data.clienteId, usuarioId },
        select: { id: true },
      }),
      parsed.data.imovelId
        ? prisma.imovel.findFirst({
            where: { id: parsed.data.imovelId, usuarioId },
            select: { id: true },
          })
        : Promise.resolve(null),
    ]);

    if (!cliente) {
      return NextResponse.json({ error: "Cliente invÃ¡lido" }, { status: 404 });
    }

    if (parsed.data.imovelId && !imovel) {
      return NextResponse.json({ error: "ImÃ³vel invÃ¡lido" }, { status: 404 });
    }

    const interacao = await prisma.interacao.create({
      data: {
        clienteId: parsed.data.clienteId,
        imovelId: parsed.data.imovelId || null,
        tipoInteracao: parsed.data.tipoInteracao,
        titulo: parsed.data.titulo,
        descricao: parsed.data.descricao || null,
        usuarioId,
        dataInteracao: new Date(parsed.data.dataInteracao),
        proximoFollowUp: parsed.data.proximoFollowUp ? new Date(parsed.data.proximoFollowUp) : null,
      },
    });

    return NextResponse.json(interacao, { status: 201 });
  } catch (error) {
    console.error("[INTERACTIONS POST]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
