import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface DadosGeocodificacao {
  id: string;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade: string;
  estado?: string | null;
  cep?: string | null;
}

const selecaoImovelMapa = {
  id: true,
  titulo: true,
  tipoImovel: true,
  finalidade: true,
  precoVenda: true,
  status: true,
  cidade: true,
  bairro: true,
  endereco: true,
  numero: true,
  estado: true,
  cep: true,
  quartos: true,
  banheiros: true,
  vagasGaragem: true,
  areaUtil: true,
  latitude: true,
  longitude: true,
  fotos: {
    select: { url: true, isCapa: true, ordem: true },
    orderBy: [{ isCapa: "desc" }, { ordem: "asc" }],
  },
} satisfies Prisma.ImovelSelect;

type ImovelComFotosMapa = Prisma.ImovelGetPayload<{ select: typeof selecaoImovelMapa }>;

const esquemaGoogleGeocode = z.object({
  status: z.string(),
  results: z.array(
    z.object({
      geometry: z.object({
        location: z.object({
          lat: z.number(),
          lng: z.number(),
        }),
      }),
    })
  ),
});

const esquemaNominatim = z.array(
  z.object({
    lat: z.string(),
    lon: z.string(),
    addresstype: z.string().optional(),
    type: z.string().optional(),
    class: z.string().optional(),
  })
);

const esquemaBuscaLocalizacao = z.string().trim().min(2).max(120);

const tiposGenericos = new Set([
  "city",
  "state",
  "country",
  "municipality",
  "administrative",
  "region",
  "postcode",
  "county",
]);

const headersGeocodificacao = {
  "User-Agent": "PrimeRealtyCRM/1.0 (consultorindividual@prime.com)",
  "Accept-Language": "pt-BR,pt;q=0.9",
};

const coordenadaValida = (latitude: number | null, longitude: number | null) =>
  latitude !== null &&
  longitude !== null &&
  latitude > -90 &&
  latitude <= 90 &&
  longitude >= -180 &&
  longitude <= 180;

const criarImovelMapa = (imovel: ImovelComFotosMapa) => {
  if (!coordenadaValida(imovel.latitude, imovel.longitude)) return null;

  return {
    id: imovel.id,
    titulo: imovel.titulo,
    tipoImovel: imovel.tipoImovel,
    finalidade: imovel.finalidade,
    precoVenda: imovel.precoVenda,
    status: imovel.status,
    cidade: imovel.cidade,
    bairro: imovel.bairro,
    endereco: imovel.endereco,
    numero: imovel.numero,
    estado: imovel.estado,
    cep: imovel.cep,
    quartos: imovel.quartos,
    banheiros: imovel.banheiros,
    vagasGaragem: imovel.vagasGaragem,
    areaUtil: imovel.areaUtil,
    latitude: imovel.latitude,
    longitude: imovel.longitude,
    fotos: imovel.fotos.map((foto) => foto.url),
  };
};

const removerNulos = <T>(valor: T | null): valor is T => valor !== null;

const montarEnderecoCompleto = (imovel: DadosGeocodificacao) =>
  [imovel.endereco, imovel.numero, imovel.bairro, imovel.cidade, imovel.estado, "Brasil"]
    .filter(Boolean)
    .join(", ");

const buscarCoordenadasEndereco = async (
  imovel: DadosGeocodificacao
): Promise<{ latitude: number; longitude: number } | "NAO_ENCONTRADO" | null> => {
  if (!imovel.endereco || imovel.endereco.trim() === "") {
    console.warn(`[Geocodificação] Endereço insuficiente para o imóvel ID: ${imovel.id}`);
    return "NAO_ENCONTRADO";
  }

  const enderecoCompleto = montarEnderecoCompleto(imovel);
  const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (googleApiKey) {
    try {
      const resposta = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(enderecoCompleto)}&key=${googleApiKey}`,
        { signal: AbortSignal.timeout(6000) }
      );

      if (resposta.ok) {
        const corpo: unknown = await resposta.json();
        const dados = esquemaGoogleGeocode.safeParse(corpo);

        if (dados.success && dados.data.status === "OK" && dados.data.results[0]) {
          const localizacao = dados.data.results[0].geometry.location;
          return { latitude: localizacao.lat, longitude: localizacao.lng };
        }

        if (dados.success && dados.data.status !== "ZERO_RESULTS") {
          console.warn(`[Geocodificação Google] Status inesperado: ${dados.data.status}`);
        }
      }
    } catch (erro) {
      console.warn(`[Geocodificação Google] Falha ao buscar: ${enderecoCompleto}`, erro);
    }
  }

  const consultas = Array.from(
    new Set([
      enderecoCompleto,
      [imovel.endereco, imovel.bairro, imovel.cidade, imovel.estado, "Brasil"].filter(Boolean).join(", "),
      [imovel.endereco, imovel.cidade, imovel.estado, "Brasil"].filter(Boolean).join(", "),
    ])
  );

  for (const consulta of consultas) {
    try {
      const resposta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(consulta)}&limit=1`,
        { headers: headersGeocodificacao, signal: AbortSignal.timeout(6000) }
      );

      if (resposta.status === 429) {
        console.warn("[Geocodificação] Rate limit atingido.");
        return null;
      }

      if (!resposta.ok) continue;

      const corpo: unknown = await resposta.json();
      const dados = esquemaNominatim.safeParse(corpo);
      if (!dados.success || !dados.data[0]) continue;

      const resultado = dados.data[0];
      const tipoResultado = resultado.addresstype ?? resultado.type ?? resultado.class ?? "";
      const consultaFinal = consulta === consultas[consultas.length - 1];

      if (tiposGenericos.has(tipoResultado) && !consultaFinal) {
        continue;
      }

      return {
        latitude: Number.parseFloat(resultado.lat),
        longitude: Number.parseFloat(resultado.lon),
      };
    } catch (erro) {
      console.warn(`[Geocodificação] Falha ao buscar: ${consulta}`, erro);
    }
  }

  return "NAO_ENCONTRADO";
};

const buscarLocalizacaoLivre = async (busca: string) => {
  const resposta = await fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${busca}, Brasil`)}&limit=1`,
    { headers: headersGeocodificacao, signal: AbortSignal.timeout(6000) }
  );

  if (!resposta.ok) return null;

  const corpo: unknown = await resposta.json();
  const dados = esquemaNominatim.safeParse(corpo);
  if (!dados.success || !dados.data[0]) return null;

  return {
    latitude: Number.parseFloat(dados.data[0].lat),
    longitude: Number.parseFloat(dados.data[0].lon),
  };
};

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const busca = request.nextUrl.searchParams.get("busca");

    if (busca !== null) {
      const buscaValidada = esquemaBuscaLocalizacao.safeParse(busca);
      if (!buscaValidada.success) {
        return NextResponse.json(
          { error: "Dados inválidos", details: buscaValidada.error.flatten() },
          { status: 400 }
        );
      }

      const coordenadas = await buscarLocalizacaoLivre(buscaValidada.data);
      if (!coordenadas) {
        return NextResponse.json({ error: "Localização não encontrada" }, { status: 404 });
      }

      return NextResponse.json(coordenadas);
    }

    const [imoveisComCoordenadas, pendentesGeocodificacao] = await prisma.$transaction([
      prisma.imovel.findMany({
        where: {
          usuarioId: session.user.id,
          arquivadoEm: null,
          latitude: { not: null, gt: -90, lte: 90 },
          longitude: { not: null, gte: -180, lte: 180 },
        },
        select: selecaoImovelMapa,
      }),
      prisma.imovel.count({
        where: {
          usuarioId: session.user.id,
          arquivadoEm: null,
          OR: [{ latitude: null }, { longitude: null }],
        },
      }),
    ]);

    const imoveis = imoveisComCoordenadas.map(criarImovelMapa).filter(removerNulos);

    return NextResponse.json({ imoveis, pendentesGeocodificacao });
  } catch (erro) {
    console.error("Erro ao carregar imóveis do mapa:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const imoveisSemCoordenadas = await prisma.imovel.findMany({
      where: {
        usuarioId: session.user.id,
        arquivadoEm: null,
        OR: [{ latitude: null }, { longitude: null }],
      },
      select: selecaoImovelMapa,
      take: 10,
    });

    const imoveisGeocodificados = [];
    const atualizacoesCoordenadas = [];

    for (const imovel of imoveisSemCoordenadas) {
      await new Promise((resolver) => setTimeout(resolver, 1100));

      const coordenadas = await buscarCoordenadasEndereco(imovel);
      if (coordenadas === null) continue;

      const latitude = coordenadas === "NAO_ENCONTRADO" ? -999 : coordenadas.latitude;
      const longitude = coordenadas === "NAO_ENCONTRADO" ? -999 : coordenadas.longitude;

      atualizacoesCoordenadas.push(prisma.imovel.updateMany({
        where: { id: imovel.id, usuarioId: session.user.id },
        data: { latitude, longitude },
      }));

      if (coordenadas !== "NAO_ENCONTRADO") {
        imoveisGeocodificados.push({
          id: imovel.id,
          titulo: imovel.titulo,
          tipoImovel: imovel.tipoImovel,
          finalidade: imovel.finalidade,
          precoVenda: imovel.precoVenda,
          status: imovel.status,
          cidade: imovel.cidade,
          bairro: imovel.bairro,
          endereco: imovel.endereco,
          numero: imovel.numero,
          estado: imovel.estado,
          cep: imovel.cep,
          quartos: imovel.quartos,
          banheiros: imovel.banheiros,
          vagasGaragem: imovel.vagasGaragem,
          areaUtil: imovel.areaUtil,
          latitude: coordenadas.latitude,
          longitude: coordenadas.longitude,
          fotos: imovel.fotos.map((foto) => foto.url),
        });
      }
    }

    if (atualizacoesCoordenadas.length > 0) {
      await prisma.$transaction(atualizacoesCoordenadas);
    }

    const restantes = await prisma.imovel.count({
      where: {
        usuarioId: session.user.id,
        arquivadoEm: null,
        OR: [{ latitude: null }, { longitude: null }],
      },
    });

    return NextResponse.json({ imoveis: imoveisGeocodificados, restantes });
  } catch (erro) {
    console.error("Erro ao geocodificar imóveis:", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
