import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session?.user?.id || "";
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalActiveClients,
    totalActiveProperties,
    clientsByStage,
    recentProperties,
    pendingFollowUps,
    clientsWithoutRecentContact,
    urgentClients,
  ] = await Promise.all([
    prisma.cliente.count({ where: { usuarioId, arquivadoEm: null, status: "ATIVO" as never } }),
    prisma.imovel.count({ where: { usuarioId, arquivadoEm: null, status: { not: "ARQUIVADO" as never } } }),
    prisma.cliente.groupBy({
      by: ["estagioJornada"],
      where: { usuarioId, arquivadoEm: null },
      _count: true,
    }),
    prisma.imovel.findMany({
      where: { usuarioId, arquivadoEm: null, criadoEm: { gte: sevenDaysAgo } },
      orderBy: { criadoEm: "desc" },
      take: 5,
    }),
    prisma.interacao.findMany({
      where: {
        usuarioId,
        proximoFollowUp: { lte: now, not: null },
      },
      include: { cliente: true },
      orderBy: { proximoFollowUp: "asc" },
      take: 10,
    }),
    prisma.cliente.findMany({
      where: {
        usuarioId,
        arquivadoEm: null,
        status: "ATIVO" as never,
        interacoes: {
          none: { dataInteracao: { gte: thirtyDaysAgo } },
        },
      },
      orderBy: { atualizadoEm: "asc" },
      take: 10,
    }),
    prisma.cliente.findMany({
      where: { usuarioId, arquivadoEm: null, nivelUrgencia: "ALTA" as never },
      orderBy: { atualizadoEm: "desc" },
      take: 5,
    }),
  ]);

  return NextResponse.json({
    totalActiveClients,
    totalActiveProperties,
    clientsByStage,
    recentProperties,
    pendingFollowUps,
    clientsWithoutRecentContact,
    urgentClients,
  });
}
