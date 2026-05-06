import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NivelUrgencia, StatusCliente, StatusImovel } from "@prisma/client";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const usuarioId = session.user.id;
  const agora = new Date();
  const seteDiasAtras = new Date(agora.getTime() - 7 * 24 * 60 * 60 * 1000);
  const trintaDiasAtras = new Date(agora.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    const [
      totalActiveClients,
      totalActiveProperties,
      clientsByStage,
      recentProperties,
      pendingFollowUps,
      clientsWithoutRecentContact,
      urgentClients,
    ] = await Promise.all([
      prisma.cliente.count({ where: { usuarioId, arquivadoEm: null, status: StatusCliente.ATIVO } }),
      prisma.imovel.count({ where: { usuarioId, arquivadoEm: null, status: { not: StatusImovel.ARQUIVADO } } }),
      prisma.cliente.groupBy({
        by: ["estagioJornada"],
        where: { usuarioId, arquivadoEm: null },
        _count: true,
      }),
      prisma.imovel.findMany({
        where: { usuarioId, arquivadoEm: null, criadoEm: { gte: seteDiasAtras } },
        orderBy: { criadoEm: "desc" },
        take: 5,
      }),
      prisma.interacao.findMany({
        where: {
          usuarioId,
          proximoFollowUp: { lte: agora, not: null },
        },
        include: { cliente: true },
        orderBy: { proximoFollowUp: "asc" },
        take: 10,
      }),
      prisma.cliente.findMany({
        where: {
          usuarioId,
          arquivadoEm: null,
          status: StatusCliente.ATIVO,
          interacoes: {
            none: { dataInteracao: { gte: trintaDiasAtras } },
          },
        },
        orderBy: { atualizadoEm: "asc" },
        take: 10,
      }),
      prisma.cliente.findMany({
        where: { usuarioId, arquivadoEm: null, nivelUrgencia: NivelUrgencia.ALTA },
        orderBy: { atualizadoEm: "desc" },
        take: 5,
      }),
    ]);

    return NextResponse.json(
      {
        totalActiveClients,
        totalActiveProperties,
        clientsByStage,
        recentProperties,
        pendingFollowUps,
        clientsWithoutRecentContact,
        urgentClients,
      },
      {
        headers: {
          // Cache privado por 60s, aceita dados desatualizados por mais 120s enquanto revalida
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (erro) {
    console.error("[DASHBOARD GET]", erro);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
