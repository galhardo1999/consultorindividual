import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Geocode helper ───────────────────────────────────────────────────────────

async function geocodeAddress(imovel: {
  endereco?: string | null;
  bairro?: string | null;
  cidade: string;
}): Promise<{ lat: number; lng: number } | null> {
  const headers = {
    "User-Agent": "PrimeRealtyCRM/1.0 (consultorindividual@prime.com)",
    "Accept-Language": "pt-BR,pt;q=0.9",
  };

  const parts = [imovel.endereco, imovel.bairro, imovel.cidade, "Brasil"]
    .filter(Boolean)
    .join(", ");

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parts)}&limit=1`,
      { headers, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ lat: string; lon: string }>;

    if (data?.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }

    // Fallback: city only
    const cityRes = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(imovel.cidade + ", Brasil")}&limit=1`,
      { headers, signal: AbortSignal.timeout(6000) }
    );
    if (!cityRes.ok) return null;
    const cityData = (await cityRes.json()) as Array<{ lat: string; lon: string }>;
    if (!cityData?.length) return null;
    return { lat: parseFloat(cityData[0].lat), lng: parseFloat(cityData[0].lon) };
  } catch {
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
        usuarioId: session.user.id,
        arquivadoEm: null,
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        titulo: true,
        tipoImovel: true,
        finalidade: true,
        preco: true,
        status: true,
        cidade: true,
        bairro: true,
        quartos: true,
        areaUtil: true,
        latitude: true,
        longitude: true,
      },
    }),
    prisma.imovel.count({
      where: {
        usuarioId: session.user.id,
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
    preco: i.preco,
    status: i.status,
    cidade: i.cidade,
    bairro: i.bairro,
    quartos: i.quartos,
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
      usuarioId: session.user.id,
      arquivadoEm: null,
      latitude: null,
    },
    select: {
      id: true,
      titulo: true,
      tipoImovel: true,
      finalidade: true,
      preco: true,
      status: true,
      cidade: true,
      bairro: true,
      endereco: true,
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
    if (!coords) continue;

    await prisma.imovel.update({
      where: { id: imovel.id },
      data: { latitude: coords.lat, longitude: coords.lng },
    });

    geocoded.push({
      id: imovel.id,
      titulo: imovel.titulo,
      tipoImovel: imovel.tipoImovel,
      finalidade: imovel.finalidade,
      preco: imovel.preco,
      status: imovel.status,
      cidade: imovel.cidade,
      bairro: imovel.bairro,
      quartos: imovel.quartos,
      areaUtil: imovel.areaUtil,
      lat: coords.lat,
      lng: coords.lng,
    });
  }

  return NextResponse.json({ imoveis: geocoded, remaining: semCoords.length - geocoded.length });
}
