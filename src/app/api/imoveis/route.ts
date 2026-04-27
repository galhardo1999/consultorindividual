import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const propertySchema = z.object({
  id: z.string().uuid().optional(),
  titulo: z.string().min(2),
  tipoImovel: z.string(),
  finalidade: z.string(),
  preco: z.number().positive(),
  cidade: z.string().min(2),
  bairro: z.string().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  codigoInterno: z.string().optional(),
  descricao: z.string().optional(),
  quartos: z.number().int().optional(),
  suites: z.number().int().optional(),
  banheiros: z.number().int().optional(),
  vagasGaragem: z.number().int().optional(),
  areaUtil: z.number().optional(),
  valorCondominio: z.number().optional(),
  valorIptu: z.number().optional(),
  mobiliado: z.boolean().optional(),
  aceitaFinanciamento: z.boolean().optional(),
  aceitaPermuta: z.boolean().optional(),
  status: z.string().optional(),
  destaques: z.string().optional(),
  proprietarioId: z.string().optional().nullable(),
  fotos: z.array(z.string()).optional(),
});

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") || "";
  const tipoImovel = searchParams.get("tipoImovel") || undefined;
  const status = searchParams.get("status") || undefined;
  const cidade = searchParams.get("cidade") || undefined;
  const precoMinimo = searchParams.get("precoMinimo") ? parseFloat(searchParams.get("precoMinimo")!) : undefined;
  const precoMaximo = searchParams.get("precoMaximo") ? parseFloat(searchParams.get("precoMaximo")!) : undefined;
  const minQuartos = searchParams.get("minQuartos") ? parseInt(searchParams.get("minQuartos")!) : undefined;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const skip = (page - 1) * limit;

  const where = {
    usuarioId: session.user.id,
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
    ...(cidade && { cidade: { contains: cidade, mode: "insensitive" as const } }),
    ...(status && status !== "ARQUIVADO" && { status: status as never }),
    ...(precoMinimo && { preco: { gte: precoMinimo } }),
    ...(precoMaximo && { preco: { lte: precoMaximo } }),
    ...(minQuartos && { quartos: { gte: minQuartos } }),
  };

  const [imoveis, total] = await Promise.all([
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
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await request.json();
    const parsed = propertySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten() }, { status: 400 });
    }

    const { fotos, ...imovelData } = parsed.data;

    const imovel = await prisma.imovel.create({
      data: {
        ...imovelData,
        usuarioId: session.user.id,
        fotos: fotos && fotos.length > 0 ? {
          create: fotos.map((url, idx) => ({
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
