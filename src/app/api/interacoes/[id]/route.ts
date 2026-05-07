import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { TipoInteracao } from "@prisma/client";

const interactionUpdateSchema = z.object({
  clienteId: z.string().min(1).optional(),
  imovelId: z.string().min(1).optional().nullable(),
  tipoInteracao: z.enum(TipoInteracao).optional(),
  titulo: z.string().min(2).optional(),
  descricao: z.string().optional().nullable(),
  dataInteracao: z.string().min(1).refine((valor) => !Number.isNaN(new Date(valor).getTime()), "Data inválida").optional(),
  proximoFollowUp: z.string().optional().nullable().refine(
    (valor) => !valor || !Number.isNaN(new Date(valor).getTime()),
    "Follow-up inválido"
  ),
});

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = interactionUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { id } = params;
    const usuarioId = session.user.id;

    const interacao = await prisma.interacao.findFirst({
      where: { id, usuarioId },
    });

    if (!interacao) {
      return NextResponse.json({ error: "Interação não encontrada" }, { status: 404 });
    }

    const data: any = { ...parsed.data };
    if (data.dataInteracao) data.dataInteracao = new Date(data.dataInteracao);
    if (data.proximoFollowUp !== undefined) data.proximoFollowUp = data.proximoFollowUp ? new Date(data.proximoFollowUp) : null;

    const updated = await prisma.interacao.update({
      where: { id, usuarioId },
      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[INTERACAO PATCH]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = params;
    const usuarioId = session.user.id;

    const interacao = await prisma.interacao.findFirst({
      where: { id, usuarioId },
    });

    if (!interacao) {
      return NextResponse.json({ error: "Interação não encontrada" }, { status: 404 });
    }

    await prisma.interacao.delete({
      where: { id, usuarioId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[INTERACAO DELETE]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
