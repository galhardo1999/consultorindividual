"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Users, ChevronRight, Phone, Mail,
  Archive, X, Loader2, MessageSquare
} from "lucide-react";
import {
  journeyStageLabel, journeyStageColor, urgencyLabel, formatDate, leadSourceLabel
} from "@/lib/utils";

interface Cliente {
  id: string;
  nomeCompleto: string;
  telefone: string;
  email: string | null;
  cidadeAtual: string | null;
  origemLead: string;
  estagioJornada: string;
  nivelUrgencia: string;
  status: string;
  atualizadoEm: string;
  _count: { interacoes: number; interesses: number };
  oportunidadesCount: number;
}

const JOURNEY_STAGES = [
  "NOVO_LEAD", "EM_QUALIFICACAO", "BUSCANDO_OPCOES", "VISITANDO_IMOVEIS",
  "NEGOCIANDO", "PROPOSTA_ENVIADA", "FECHADO", "PERDIDO", "PAUSADO"
];

const URGENCY_LEVELS = ["ALTA", "MEDIA", "BAIXA", "SEM_URGENCIA"];

export default function ClientesPage() {
  const [clientes, setClients] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [estagioJornada, setJourneyStage] = useState("");
  const [nivelUrgencia, setUrgencyLevel] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (estagioJornada) params.set("estagioJornada", estagioJornada);
      if (nivelUrgencia) params.set("nivelUrgencia", nivelUrgencia);
      params.set("page", String(page));

      const res = await fetch(`/api/clientes?${params}`);
      if (!res.ok) throw new Error("Falha ao buscar clientes");
      const data = await res.json();
      setClients(data.clientes || []);
      setTotal(data.total || 0);
    } catch (erro) {
      console.error("Erro ao buscar clientes:", erro);
      setClients([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, estagioJornada, nivelUrgencia, page]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  function clearFilters() {
    setJourneyStage("");
    setUrgencyLevel("");
    setSearch("");
    setPage(1);
  }

  const hasFilters = search || estagioJornada || nivelUrgencia;

  return (
    <div className="page">
      <div className="section-header mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
            Clientes
          </h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
            {total} cliente{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/interacoes" className="btn btn-secondary">
            <MessageSquare size={16} />
            Interações
          </Link>
          <Link href="/clientes/novo" className="btn btn-primary" id="new-cliente-btn">
            <Plus size={16} />
            Novo Cliente
          </Link>
        </div>
      </div>

      {/* Search and filters */}
      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="search-bar" style={{ flex: 1, minWidth: "200px" }}>
            <Search size={16} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Buscar por nome, telefone, e-mail..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              id="cliente-search"
            />
          </div>

          <button
            className={`btn ${showFilters ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => setShowFilters(!showFilters)}
            id="filter-toggle"
          >
            <Filter size={14} />
            Filtros
            {hasFilters && (
              <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem" }}>
                {[estagioJornada, nivelUrgencia].filter(Boolean).length}
              </span>
            )}
          </button>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
              <X size={14} />
              Limpar
            </button>
          )}
        </div>

        {showFilters && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--color-surface-700)" }}>
            <div className="form-row">
              <div>
                <label className="label">Estágio da Jornada</label>
                <select className="select" value={estagioJornada} onChange={(e) => { setJourneyStage(e.target.value); setPage(1); }}>
                  <option value="">Todos os estágios</option>
                  {JOURNEY_STAGES.map((s) => (
                    <option key={s} value={s}>{journeyStageLabel(s)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Urgência</label>
                <select className="select" value={nivelUrgencia} onChange={(e) => { setUrgencyLevel(e.target.value); setPage(1); }}>
                  <option value="">Todas</option>
                  {URGENCY_LEVELS.map((u) => (
                    <option key={u} value={u}>{urgencyLabel(u)}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cliente list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card card-sm">
              <div className="skeleton" style={{ height: "20px", width: "40%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "14px", width: "60%" }} />
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Users size={48} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-surface-200)" }}>
              {hasFilters ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              {hasFilters
                ? "Tente ajustar os filtros de busca"
                : "Comece cadastrando seu primeiro cliente"}
            </p>
            {!hasFilters && (
              <Link href="/clientes/novo" className="btn btn-primary">
                <Plus size={16} />
                Cadastrar cliente
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
            {clientes.map((cliente) => (
              <Link key={cliente.id} href={`/clientes/${cliente.id}`} style={{ textDecoration: "none" }}>
                <div
                  className="card card-sm"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    cursor: "pointer",
                    padding: "1rem 1.25rem",
                  }}
                >
                  {/* Avatar */}
                  <div
                    className="avatar"
                    style={{ width: "42px", height: "42px", fontSize: "0.9rem", flexShrink: 0 }}
                  >
                    {cliente.nomeCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                  </div>

                  {/* Main info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-semibold text-sm" style={{ color: "var(--color-surface-50)" }}>
                        {cliente.nomeCompleto}
                      </span>
                      <span className={`badge ${journeyStageColor(cliente.estagioJornada)}`} style={{ fontSize: "0.7rem" }}>
                        {journeyStageLabel(cliente.estagioJornada)}
                      </span>
                      {cliente.nivelUrgencia === "ALTA" && (
                        <span className="badge badge-danger" style={{ fontSize: "0.7rem" }}>Urgente</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-wrap" style={{ color: "var(--color-surface-400)", fontSize: "0.8rem" }}>
                      <span className="flex items-center gap-1">
                        <Phone size={12} />
                        {cliente.telefone}
                      </span>
                      {cliente.email && (
                        <span className="flex items-center gap-1">
                          <Mail size={12} />
                          {cliente.email}
                        </span>
                      )}
                      {cliente.cidadeAtual && (
                        <span>📍 {cliente.cidadeAtual}</span>
                      )}
                    </div>
                  </div>

                  {/* Right info */}
                  <div className="flex items-center gap-4" style={{ flexShrink: 0 }}>
                    <div className="text-right hidden sm:block">
                      <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Interações</div>
                      <div className="font-semibold text-sm" style={{ color: "var(--color-surface-200)" }}>
                        {cliente._count.interacoes}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Oportunidades</div>
                      <div className="font-semibold text-sm" style={{ color: "var(--color-brand-400)" }}>
                        {cliente.oportunidadesCount || 0}
                      </div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Imóveis</div>
                      <div className="font-semibold text-sm" style={{ color: "var(--color-surface-200)" }}>
                        {cliente._count.interesses}
                      </div>
                    </div>
                    <div style={{ color: "var(--color-surface-400)", fontSize: "0.75rem" }} className="hidden md:block">
                      {formatDate(cliente.atualizadoEm)}
                    </div>
                    <ChevronRight size={16} style={{ color: "var(--color-surface-500)" }} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                className="btn btn-secondary btn-sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Anterior
              </button>
              <span style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
                Página {page} de {Math.ceil(total / 20)}
              </span>
              <button
                className="btn btn-secondary btn-sm"
                disabled={page >= Math.ceil(total / 20)}
                onClick={() => setPage(p => p + 1)}
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
