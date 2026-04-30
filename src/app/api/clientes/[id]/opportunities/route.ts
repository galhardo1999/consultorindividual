import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const usuarioId = session?.user?.id || "";

  try {
    const cliente = await prisma.cliente.findFirst({
      where: { id, usuarioId },
      include: {
        preferencia: true,
        interesses: {
          select: { imovelId: true },
        },
      },
    });

    if (!cliente) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 });
    }

    if (!cliente.preferencia) {
      return NextResponse.json({ opportunities: [] });
    }

    const { preferencia } = cliente;
    const existingInterestIds = cliente.interesses.map((i) => i.imovelId);

    // Constrói filtros apenas com os campos que o cliente preencheu
    const whereClause: Record<string, unknown> = {
      usuarioId,
      status: "DISPONIVEL",
      id: { notIn: existingInterestIds },
    };

    if (preferencia.tipoImovel) {
      whereClause.tipoImovel = preferencia.tipoImovel;
    }

    if (preferencia.cidadeInteresse) {
      whereClause.cidade = {
        contains: preferencia.cidadeInteresse,
        mode: "insensitive",
      };
    }

    if (preferencia.precoMinimo !== null || preferencia.precoMaximo !== null) {
      const priceFilter: Record<string, number> = {};
      if (preferencia.precoMinimo !== null) priceFilter.gte = preferencia.precoMinimo;
      if (preferencia.precoMaximo !== null) priceFilter.lte = preferencia.precoMaximo;
      whereClause.precoVenda = priceFilter;
    }

    if (preferencia.minQuartos !== null) {
      whereClause.quartos = { gte: preferencia.minQuartos };
    }

    if (preferencia.minBanheiros !== null) {
      whereClause.banheiros = { gte: preferencia.minBanheiros };
    }

    if (preferencia.minVagas !== null) {
      whereClause.vagasGaragem = { gte: preferencia.minVagas };
    }

    if (preferencia.areaMinima !== null || preferencia.areaMaxima !== null) {
      const areaFilter: Record<string, number> = {};
      if (preferencia.areaMinima !== null) areaFilter.gte = preferencia.areaMinima;
      if (preferencia.areaMaxima !== null) areaFilter.lte = preferencia.areaMaxima;
      whereClause.areaUtil = areaFilter;
    }

    const opportunities = await prisma.imovel.findMany({
      where: whereClause,
      take: 20,
      orderBy: { criadoEm: "desc" },
      select: {
        id: true,
        titulo: true,
        tipoImovel: true,
        precoVenda: true,
        cidade: true,
        bairro: true,
        quartos: true,
        banheiros: true,
        vagasGaragem: true,
        areaUtil: true,
        codigoInterno: true,
      },
    });

    return NextResponse.json({ opportunities });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("Error fetching opportunities:", message);
    return NextResponse.json(
      { error: "Erro ao buscar oportunidades", details: message },
      { status: 500 }
    );
  }
}
