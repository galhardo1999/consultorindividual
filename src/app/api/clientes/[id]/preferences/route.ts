import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { CondicaoImovel, Prisma, TipoImovel } from "@prisma/client";

const preferenciaSchema = z.object({
  tipoImovel: z.enum(TipoImovel).nullable().optional(),
  precoMinimo: z.number().nullable().optional(),
  precoMaximo: z.number().nullable().optional(),
  cidadeInteresse: z.string().nullable().optional(),
  bairrosInteresse: z.string().nullable().optional(),
  minQuartos: z.number().int().nullable().optional(),
  minBanheiros: z.number().int().nullable().optional(),
  minVagas: z.number().int().nullable().optional(),
  areaMinima: z.number().nullable().optional(),
  areaMaxima: z.number().nullable().optional(),
  condicaoImovel: z.enum(CondicaoImovel).nullable().optional(),
  aceitaFinanciamento: z.boolean().nullable().optional(),
  aceitaPermuta: z.boolean().nullable().optional(),
  condominioFechado: z.boolean().nullable().optional(),
  caracteristicasPreferidas: z.string().nullable().optional(),
  restricoes: z.string().nullable().optional(),
  prazoMudanca: z.string().nullable().optional(),
  notasPessoais: z.string().nullable().optional(),
});

const normalizarTexto = (valor: string | null | undefined) => (valor === "" ? null : valor ?? null);

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
      where: { id, usuarioId: session.user.id },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    const dadosPreferencia: Omit<Prisma.PreferenciaClienteUncheckedCreateInput, "clienteId"> = {
      tipoImovel: parsed.data.tipoImovel ?? null,
      precoMinimo: parsed.data.precoMinimo ?? null,
      precoMaximo: parsed.data.precoMaximo ?? null,
      cidadeInteresse: normalizarTexto(parsed.data.cidadeInteresse),
      bairrosInteresse: normalizarTexto(parsed.data.bairrosInteresse),
      minQuartos: parsed.data.minQuartos ?? null,
      minBanheiros: parsed.data.minBanheiros ?? null,
      minVagas: parsed.data.minVagas ?? null,
      areaMinima: parsed.data.areaMinima ?? null,
      areaMaxima: parsed.data.areaMaxima ?? null,
      condicaoImovel: parsed.data.condicaoImovel ?? null,
      aceitaFinanciamento: parsed.data.aceitaFinanciamento ?? null,
      aceitaPermuta: parsed.data.aceitaPermuta ?? null,
      condominioFechado: parsed.data.condominioFechado ?? null,
      caracteristicasPreferidas: normalizarTexto(parsed.data.caracteristicasPreferidas),
      restricoes: normalizarTexto(parsed.data.restricoes),
      prazoMudanca: normalizarTexto(parsed.data.prazoMudanca),
      notasPessoais: normalizarTexto(parsed.data.notasPessoais),
    };

    const preferencia = await prisma.preferenciaCliente.upsert({
      where: { clienteId: id },
      update: dadosPreferencia,
      create: {
        clienteId: id,
        ...dadosPreferencia,
      },
    });

    return NextResponse.json(preferencia);
  } catch (error) {
    console.error("Error updating preferences:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
