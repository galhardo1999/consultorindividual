import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Geocode helper ───────────────────────────────────────────────────────────

interface DadosGeocode {
  id: string;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade: string;
  estado?: string | null;
  cep?: string | null;
}

async function geocodeAddress(
  imovel: DadosGeocode
): Promise<{ lat: number; lng: number } | "NOT_FOUND" | null> {
  const headers = {
    "User-Agent": "PrimeRealtyCRM/1.0 (consultorindividual@prime.com)",
    "Accept-Language": "pt-BR,pt;q=0.9",
  };

  if (!imovel.endereco || imovel.endereco.trim() === "") {
    console.warn(`[Geocode] Endereço insuficiente para o imóvel ID: ${imovel.id}`);
    return "NOT_FOUND";
  }

  const genericTypes = [
    "city", "state", "country", "municipality",
    "administrative", "region", "postcode", "county",
  ];

  // 1ª tentativa: query estruturada do Nominatim (mais precisa, considera número)
  try {
    const params = new URLSearchParams({
      format: "json",
      addressdetails: "1",
      limit: "1",
      street: [imovel.numero, imovel.endereco].filter(Boolean).join(" "),
      city: imovel.cidade,
      country: "Brasil",
    });
    if (imovel.bairro) params.set("district", imovel.bairro);
    if (imovel.estado) params.set("state", imovel.estado);
    if (imovel.cep) params.set("postalcode", imovel.cep);

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params.toString()}`,
      { headers, signal: AbortSignal.timeout(6000) }
    );

    if (res.status === 429) {
      console.warn(`[Geocode] Rate limit atingido.`);
      return null;
    }

    const data = res.ok ? (await res.json()) as Array<{ lat: string; lon: string; addresstype?: string; type?: string; class?: string }> : [];

    if (data?.length > 0 && !genericTypes.includes(data[0].addresstype ?? data[0].type ?? data[0].class ?? "")) {
      console.info(`[Geocode] Localizado via query estruturada: ${imovel.endereco}, ${imovel.numero}`);
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.warn(`[Geocode] Falha na query estruturada, tentando fallback: ${imovel.id}`, err);
  }

  // 2ª tentativa: query livre com endereço completo
  const fullParts = [
    imovel.endereco,
    imovel.numero,
    imovel.bairro,
    imovel.cidade,
    imovel.estado,
    imovel.cep,
    "Brasil",
  ].filter(Boolean).join(", ");

  try {
    let res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullParts)}&limit=1`,
      { headers, signal: AbortSignal.timeout(6000) }
    );

    if (res.status === 429) return null;

    let data = res.ok ? (await res.json()) as Array<{ lat: string; lon: string; addresstype?: string; type?: string; class?: string }> : [];

    // 3ª tentativa: fallback sem bairro/CEP
    if (!data?.length) {
      const fallbackParts = [imovel.endereco, imovel.numero, imovel.cidade, "Brasil"].filter(Boolean).join(", ");
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackParts)}&limit=1`,
        { headers, signal: AbortSignal.timeout(6000) }
      );
      data = res.ok ? (await res.json()) as Array<{ lat: string; lon: string; addresstype?: string; type?: string; class?: string }> : [];
    }

    if (data?.length > 0) {
      const resultType = data[0].addresstype ?? data[0].type ?? data[0].class ?? "";
      if (genericTypes.includes(resultType)) {
        console.warn(`[Geocode] Retorno genérico ignorado (${resultType}) para: ${fullParts}`);
        return "NOT_FOUND";
      }
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    console.warn(`[Geocode] Endereço não localizado: ${fullParts}`);
    return "NOT_FOUND";
  } catch (error) {
    console.error(`[Geocode] Falha de rede/timeout para: ${fullParts}`, error);
    return null;
  }
}

// ─── GET — fast path: only already-geocoded properties ───────────────────────

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const [imoveisComCoords, pendingCount] = await Promise.all([
    prisma.imovel.findMany({
      where: {
        usuarioId: session?.user?.id || "",
        arquivadoEm: null,
        latitude: { not: null, gt: -90 }, // Ignora falhas (-999)
        longitude: { not: null },
      },
      select: {
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
      },
    }),
    prisma.imovel.count({
      where: {
        usuarioId: session?.user?.id || "",
        arquivadoEm: null,
        latitude: null,
      },
    }),
  ]);

  const imoveis = imoveisComCoords.map((i) => ({
    id: i.id,
    titulo: i.titulo,
    tipoImovel: i.tipoImovel,
    finalidade: i.finalidade,
    precoVenda: i.precoVenda,
    status: i.status,
    cidade: i.cidade,
    bairro: i.bairro,
    endereco: i.endereco,
    numero: i.numero,
    estado: i.estado,
    cep: i.cep,
    quartos: i.quartos,
    banheiros: i.banheiros,
    vagasGaragem: i.vagasGaragem,
    areaUtil: i.areaUtil,
    lat: i.latitude as number,
    lng: i.longitude as number,
    // Array de URLs de fotos ordenadas: capa primeiro, depois por ordem
    fotos: i.fotos.map((f) => f.url),
  }));

  return NextResponse.json({ imoveis, pendingGeocode: pendingCount });
}

// ─── POST — background geocoding (max 10 per call) ───────────────────────────

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const semCoords = await prisma.imovel.findMany({
    where: {
      usuarioId: session?.user?.id || "",
      arquivadoEm: null,
      latitude: null,
    },
    select: {
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
      fotos: {
        select: { url: true, isCapa: true, ordem: true },
        orderBy: [{ isCapa: "desc" }, { ordem: "asc" }],
      },
    },
    take: 10, // Respeita o rate-limit do Nominatim e timeout serverless
  });

  const geocoded = [];

  for (const imovel of semCoords) {
    // Nominatim policy: max 1 req/sec
    await new Promise((r) => setTimeout(r, 1100));

    const coords = await geocodeAddress(imovel);
    if (coords === null) continue; // Falha de rede temporária, mantém null para tentar novamente depois

    let finalLat = -999;
    let finalLng = -999;

    if (coords !== "NOT_FOUND") {
      finalLat = coords.lat;
      finalLng = coords.lng;
    }

    await prisma.imovel.update({
      where: { id: imovel.id },
      data: { latitude: finalLat, longitude: finalLng },
    });

    if (coords !== "NOT_FOUND") {
      geocoded.push({
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
        lat: coords.lat,
        lng: coords.lng,
        fotos: imovel.fotos.map((f) => f.url),
      });
    }
  }

  const remainingCount = await prisma.imovel.count({
    where: {
      usuarioId: session?.user?.id || "",
      arquivadoEm: null,
      latitude: null,
    },
  });

  return NextResponse.json({ imoveis: geocoded, remaining: remainingCount });
}
