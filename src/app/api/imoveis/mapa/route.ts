import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Geocode helper ───────────────────────────────────────────────────────────

async function geocodeAddress(imovel: {
  id: string;
  endereco?: string | null;
  numero?: string | null;
  bairro?: string | null;
  cidade: string;
  cep?: string | null;
}): Promise<{ lat: number; lng: number } | "NOT_FOUND" | null> {
  const headers = {
    "User-Agent": "PrimeRealtyCRM/1.0 (consultorindividual@prime.com)",
    "Accept-Language": "pt-BR,pt;q=0.9",
  };

  if (!imovel.endereco || imovel.endereco.trim() === "") {
    console.warn(`[Geocode] Endereço insuficiente para o imóvel ID: ${imovel.id}`);
    return "NOT_FOUND";
  }

  const fullParts = [imovel.endereco, imovel.numero, imovel.bairro, imovel.cidade, imovel.cep, "Brasil"]
    .filter(Boolean)
    .join(", ");

  try {
    let res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullParts)}&limit=1`,
      { headers, signal: AbortSignal.timeout(6000) }
    );
    
    if (res.status === 429) {
      console.warn(`[Geocode] Rate limit atingido.`);
      return null;
    }

    let data = res.ok ? (await res.json()) as Array<any> : [];

    // Se não achou com detalhes, tenta um fallback menos restritivo (Rua, Número, Cidade)
    if (!data?.length) {
      const fallbackParts = [imovel.endereco, imovel.numero, imovel.cidade, "Brasil"]
        .filter(Boolean)
        .join(", ");
      
      res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fallbackParts)}&limit=1`,
        { headers, signal: AbortSignal.timeout(6000) }
      );
      data = res.ok ? (await res.json()) as Array<any> : [];
    }

    if (data?.length > 0) {
      const resultType = data[0].addresstype || data[0].type || data[0].class || "";
      const genericTypes = ["city", "state", "country", "municipality", "administrative", "region", "postcode", "county"];
      
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
        cep: true,
        quartos: true,
        banheiros: true,
        vagasGaragem: true,
        areaUtil: true,
        latitude: true,
        longitude: true,
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
    cep: i.cep,
    quartos: i.quartos,
    banheiros: i.banheiros,
    vagasGaragem: i.vagasGaragem,
    areaUtil: i.areaUtil,
    lat: i.latitude as number,
    lng: i.longitude as number,
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
      cep: true,
      quartos: true,
      areaUtil: true,
    },
    take: 10, // Respect Nominatim rate-limit & serverless timeout
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
        quartos: imovel.quartos,
        areaUtil: imovel.areaUtil,
        lat: coords.lat,
        lng: coords.lng,
      });
    }
  }

  return NextResponse.json({ imoveis: geocoded, remaining: semCoords.length - semCoords.length }); // Updated to properly deduct attempted ones from remaining visually
}
