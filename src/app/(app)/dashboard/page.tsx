"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Home,
  Clock,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  Calendar,
  Zap,
} from "lucide-react";
import { formatDate, formatCurrency, journeyStageLabel, journeyStageColor } from "@/lib/utils";

interface DashboardData {
  totalActiveClients: number;
  totalActiveProperties: number;
  clientsByStage: { estagioJornada: string; _count: number }[];
  recentProperties: { id: string; titulo: string; cidade: string; precoVenda: number; criadoEm: string }[];
  pendingFollowUps: { id: string; titulo: string; proximoFollowUp: string; cliente: { id: string; nomeCompleto: string } }[];
  clientsWithoutRecentContact: { id: string; nomeCompleto: string; telefone: string; atualizadoEm: string }[];
  urgentClients: { id: string; nomeCompleto: string; estagioJornada: string }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <div className="stats-grid mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card">
              <div className="skeleton" style={{ height: "16px", width: "60%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "36px", width: "40%" }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Clientes Ativos",
      value: data?.totalActiveClients ?? 0,
      icon: Users,
      color: "#6470f3",
      href: "/clientes",
    },
    {
      label: "Imóveis Ativos",
      value: data?.totalActiveProperties ?? 0,
      icon: Home,
      color: "#22c55e",
      href: "/imoveis",
    },
    {
      label: "Follow-ups Pendentes",
      value: data?.pendingFollowUps?.length ?? 0,
      icon: Clock,
      color: "#f59e0b",
      href: "/interacoes",
    },
    {
      label: "Urgência Alta",
      value: data?.urgentClients?.length ?? 0,
      icon: Zap,
      color: "#ef4444",
      href: "/clientes?urgency=ALTA",
    },
  ];

  return (
    <div className="page">
      {/* Page titulo */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
          Dashboard
        </h1>
        <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
          Visão geral da sua operação
        </p>
      </div>

      {/* Stats */}
      <div className="stats-grid mb-6">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
            <div className="stat-card" style={{ cursor: "pointer" }}>
              <div
                className="flex items-center justify-between mb-3"
              >
                <span style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", fontWeight: 500 }}>
                  {stat.label}
                </span>
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${stat.color}20` }}
                >
                  <stat.icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div className="text-3xl font-bold" style={{ color: "var(--color-surface-50)" }}>
                {stat.value}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Journey stages */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-titulo">
              <TrendingUp size={16} style={{ display: "inline", marginRight: "8px", color: "var(--color-brand-400)" }} />
              Clientes por Estágio
            </h2>
            <Link href="/clientes" className="btn btn-ghost btn-sm">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {data?.clientsByStage?.length === 0 ? (
              <div className="empty-state" style={{ padding: "1.5rem" }}>
                <p>Nenhum cliente cadastrado ainda</p>
              </div>
            ) : (
              data?.clientsByStage?.map((s) => (
                <div
                  key={s.estagioJornada}
                  className="flex items-center justify-between"
                  style={{ padding: "0.5rem 0.75rem", borderRadius: "8px", background: "var(--color-surface-900)" }}
                >
                  <span className={`badge ${journeyStageColor(s.estagioJornada)}`}>
                    {journeyStageLabel(s.estagioJornada)}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: "var(--color-surface-100)" }}>
                    {s._count}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Follow-ups */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-titulo">
              <Calendar size={16} style={{ display: "inline", marginRight: "8px", color: "#f59e0b" }} />
              Follow-ups Pendentes
            </h2>
          </div>
          {data?.pendingFollowUps?.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <p>Nenhum follow-up pendente 🎉</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {data?.pendingFollowUps?.map((fu) => (
                <Link key={fu.id} href={`/clientes/${fu.cliente.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "var(--color-surface-900)",
                      border: "1px solid var(--color-surface-700)",
                      transition: "border-color 0.15s",
                    }}
                  >
                    <div className="font-medium text-sm mb-1" style={{ color: "var(--color-surface-100)" }}>
                      {fu.cliente.nomeCompleto}
                    </div>
                    <div className="text-xs" style={{ color: "var(--color-surface-400)" }}>
                      {fu.titulo}
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs" style={{ color: "#f59e0b" }}>
                      <Calendar size={11} />
                      {formatDate(fu.proximoFollowUp)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Clients without recent contact */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-titulo">
              <AlertCircle size={16} style={{ display: "inline", marginRight: "8px", color: "#ef4444" }} />
              Sem Contato Recente
            </h2>
          </div>
          {data?.clientsWithoutRecentContact?.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <p>Todos os clientes estão sendo atendidos 🎉</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data?.clientsWithoutRecentContact?.map((c) => (
                <Link key={c.id} href={`/clientes/${c.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "0.625rem 0.75rem",
                      borderRadius: "8px",
                      background: "var(--color-surface-900)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--color-surface-100)" }}>
                        {c.nomeCompleto}
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-surface-400)" }}>
                        {c.telefone}
                      </div>
                    </div>
                    <ChevronRight size={14} style={{ color: "var(--color-surface-500)" }} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent imoveis */}
        <div className="card">
          <div className="section-header">
            <h2 className="section-titulo">
              <Home size={16} style={{ display: "inline", marginRight: "8px", color: "#22c55e" }} />
              Imóveis Recentes
            </h2>
            <Link href="/imoveis" className="btn btn-ghost btn-sm">
              Ver todos <ChevronRight size={14} />
            </Link>
          </div>
          {data?.recentProperties?.length === 0 ? (
            <div className="empty-state" style={{ padding: "1.5rem" }}>
              <p>Nenhum imóvel cadastrado ainda</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {data?.recentProperties?.map((p) => (
                <Link key={p.id} href={`/imoveis/${p.id}`} style={{ textDecoration: "none" }}>
                  <div
                    style={{
                      padding: "0.75rem",
                      borderRadius: "8px",
                      background: "var(--color-surface-900)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <div>
                      <div className="text-sm font-medium" style={{ color: "var(--color-surface-100)" }}>
                        {p.titulo}
                      </div>
                      <div className="text-xs" style={{ color: "var(--color-surface-400)" }}>
                        {p.cidade}
                      </div>
                    </div>
                    <div className="text-sm font-semibold" style={{ color: "#22c55e" }}>
                      {formatCurrency(p.precoVenda)}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
