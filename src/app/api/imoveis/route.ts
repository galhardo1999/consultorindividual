import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const tipoImovel = searchParams.get("tipoImovel") || undefined;
  const status = searchParams.get("status") || undefined;
  const cidade = searchParams.get("cidade") || undefined;
  const bairro = searchParams.get("bairro") || undefined;
  const finalidade = searchParams.get("finalidade") || undefined;
  
  const precoMinimo = searchParams.get("precoMinimo") ? parseFloat(searchParams.get("precoMinimo")!) : undefined;
  const precoMaximo = searchParams.get("precoMaximo") ? parseFloat(searchParams.get("precoMaximo")!) : undefined;
  
  const minQuartos = searchParams.get("minQuartos") ? parseInt(searchParams.get("minQuartos")!) : undefined;
  const minVagas = searchParams.get("minVagas") ? parseInt(searchParams.get("minVagas")!) : undefined;
  const minArea = searchParams.get("minArea") ? parseFloat(searchParams.get("minArea")!) : undefined;
  const maxArea = searchParams.get("maxArea") ? parseFloat(searchParams.get("maxArea")!) : undefined;
  
  const mobiliado = searchParams.get("mobiliado") === "true" ? true : undefined;
  const aceitaFinanciamento = searchParams.get("aceitaFinanciamento") === "true" ? true : undefined;
  const aceitaPermuta = searchParams.get("aceitaPermuta") === "true" ? true : undefined;
  const aceitaPets = searchParams.get("aceitaPets") === "true" ? true : undefined;
  const documentacaoRegularizada = searchParams.get("documentacaoRegularizada") === "true" ? true : undefined;

  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  // Montar condição de preço baseado na finalidade
  const priceFilter: any = {};
  if (precoMinimo !== undefined || precoMaximo !== undefined) {
      const condition: any = {};
      if (precoMinimo !== undefined) condition.gte = precoMinimo;
      if (precoMaximo !== undefined) condition.lte = precoMaximo;
      
      // Aplicar o filtro de preço de forma dinâmica dependendo da finalidade
      priceFilter.OR = [
         { precoVenda: condition },
         { valorAluguel: condition },
         { valorTemporadaDiaria: condition }
      ];
  }

  const where = {
    usuarioId: session?.user?.id || "",
    arquivadoEm: status === "ARQUIVADO" ? { not: null } : (status ? undefined : null),
    ...(search && {
      OR: [
        { titulo: { contains: search, mode: "insensitive" as const } },
        { bairro: { contains: search, mode: "insensitive" as const } },
        { cidade: { contains: search, mode: "insensitive" as const } },
        { codigoInterno: { contains: search, mode: "insensitive" as const } },
      ],
    }),
    ...(tipoImovel && { tipoImovel: tipoImovel as never }),
    ...(finalidade && { finalidade: finalidade as never }),
    ...(cidade && { cidade: { contains: cidade, mode: "insensitive" as const } }),
    ...(bairro && { bairro: { contains: bairro, mode: "insensitive" as const } }),
    ...(status && status !== "ARQUIVADO" && { status: status as never }),
    
    // Filtros adicionais
    ...(minQuartos && { quartos: { gte: minQuartos } }),
    ...(minVagas && { vagasGaragem: { gte: minVagas } }),
    ...(minArea && { areaUtil: { gte: minArea } }),
    ...(maxArea && { areaUtil: { lte: maxArea } }),
    ...(mobiliado && { mobiliado }),
    ...(aceitaFinanciamento && { aceitaFinanciamento }),
    ...(aceitaPermuta && { aceitaPermuta }),
    ...(aceitaPets && { aceitaPets }),
    ...(documentacaoRegularizada && { documentacaoRegularizada }),
    ...priceFilter,
  };

  try {
    const [imoveis, total] = await prisma.$transaction([
      prisma.imovel.findMany({
        where,
        include: {
          caracteristicas: true,
          _count: { select: { interesses: true } },
          proprietario: { select: { id: true, nomeCompleto: true } },
          fotos: { select: { url: true, isCapa: true } },
        },
        orderBy: { atualizadoEm: "desc" },
        skip,
        take: limit,
      }),
      prisma.imovel.count({ where }),
    ]);

    return NextResponse.json({ imoveis, total, page, limit });
  } catch (error) {
    console.error("[IMOVEIS GET]", error);
    return NextResponse.json({ error: "Erro interno", imoveis: [], total: 0 }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    
    // Validações básicas e manuais para manter flexibilidade do schema expandido
    if (!body.titulo || body.titulo.length < 2) {
      return NextResponse.json({ error: "Título inválido" }, { status: 400 });
    }
    if (!body.tipoImovel) {
      return NextResponse.json({ error: "Tipo de imóvel é obrigatório" }, { status: 400 });
    }
    if (!body.finalidade) {
      return NextResponse.json({ error: "Finalidade é obrigatória" }, { status: 400 });
    }
    if (!body.cidade || body.cidade.length < 2) {
      return NextResponse.json({ error: "Cidade inválida" }, { status: 400 });
    }

    // Validação condicional com base na finalidade
    if ((body.finalidade === "VENDA" || body.finalidade === "VENDA_LOCACAO") && !body.precoVenda) {
        return NextResponse.json({ error: "Preço de Venda é obrigatório para imóveis à venda" }, { status: 400 });
    }
    if ((body.finalidade === "LOCACAO" || body.finalidade === "VENDA_LOCACAO") && !body.valorAluguel) {
        return NextResponse.json({ error: "Valor do Aluguel é obrigatório para imóveis para locação" }, { status: 400 });
    }
    if (body.finalidade === "TEMPORADA" && !body.valorTemporadaDiaria) {
        return NextResponse.json({ error: "Valor da Diária é obrigatório para imóveis de temporada" }, { status: 400 });
    }

    // Se tipo for TERRENO, validar areaTotal
    if (["TERRENO", "AREA_RURAL"].includes(body.tipoImovel) && !body.areaTotal) {
        return NextResponse.json({ error: "Área Total é obrigatória para terrenos e áreas rurais" }, { status: 400 });
    }

    const { fotos, ...imovelData } = body;

    const imovel = await prisma.imovel.create({
      data: {
        ...imovelData,
        usuarioId: session?.user?.id || "",
        fotos: fotos && fotos.length > 0 ? {
          create: fotos.map((url: string, idx: number) => ({
            url,
            isCapa: idx === 0,
            ordem: idx
          }))
        } : undefined
      } as never,
    });

    return NextResponse.json(imovel, { status: 201 });
  } catch (error) {
    console.error("[PROPERTIES POST]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
