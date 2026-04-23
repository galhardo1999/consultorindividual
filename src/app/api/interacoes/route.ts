import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const interactionSchema = z.object({
  clienteId: z.string(),
  imovelId: z.string().optional(),
  tipoInteracao: z.string(),
  titulo: z.string().min(2),
  descricao: z.string().optional(),
  dataInteracao: z.string(),
  proximoFollowUp: z.string().optional(),
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
    include: { cliente: true, imovel: true },
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

    const interacao = await prisma.interacao.create({
      data: {
        ...parsed.data,
        usuarioId: session.user.id,
        dataInteracao: new Date(parsed.data.dataInteracao),
        proximoFollowUp: parsed.data.proximoFollowUp ? new Date(parsed.data.proximoFollowUp) : undefined,
      } as never,
    });

    return NextResponse.json(interacao, { status: 201 });
  } catch (error) {
    console.error("[INTERACTIONS POST]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
