import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const preferenciaSchema = z.object({
  tipoImovel: z.string().nullable().optional(),
  precoMinimo: z.number().nullable().optional(),
  precoMaximo: z.number().nullable().optional(),
  cidadeInteresse: z.string().nullable().optional(),
  bairrosInteresse: z.string().nullable().optional(),
  minQuartos: z.number().int().nullable().optional(),
  minBanheiros: z.number().int().nullable().optional(),
  minVagas: z.number().int().nullable().optional(),
  areaMinima: z.number().nullable().optional(),
  areaMaxima: z.number().nullable().optional(),
  condicaoImovel: z.string().nullable().optional(),
  aceitaFinanciamento: z.boolean().nullable().optional(),
  aceitaPermuta: z.boolean().nullable().optional(),
  condominioFechado: z.boolean().nullable().optional(),
  caracteristicasPreferidas: z.string().nullable().optional(),
  restricoes: z.string().nullable().optional(),
  prazoMudanca: z.string().nullable().optional(),
  notasPessoais: z.string().nullable().optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const parsed = preferenciaSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const cliente = await prisma.cliente.findUnique({
      where: { id, usuarioId: session?.user?.id || "" },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    // Normalize: convert empty strings to null
    const data: Record<string, unknown> = { ...parsed.data };
    Object.keys(data).forEach((key) => {
      if (data[key] === "") data[key] = null;
    });

    const preferencia = await prisma.preferenciaCliente.upsert({
      where: { clienteId: id },
      update: data as any,
      create: {
        clienteId: id,
        ...(data as any),
      },
    });

    return NextResponse.json(preferencia);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
