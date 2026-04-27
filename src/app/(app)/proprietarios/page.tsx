"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Contact, Home, X, Mail, Phone } from "lucide-react";
import { maskTelefone, formatDate } from "@/lib/utils";

interface Proprietario {
  id: string;
  nomeCompleto: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cidade: string | null;
  status: string;
  criadoEm: string;
  _count: { imoveis: number };
}

const STATUS_COLORS: Record<string, string> = {
  ATIVO: "badge-success",
  INATIVO: "badge-warning",
  ARQUIVADO: "badge-secondary",
};

export default function ProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProprietarios = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    params.set("page", String(page));

    const res = await fetch(`/api/proprietarios?${params}`);
    if (!res.ok) {
      console.error("Failed to fetch proprietarios", await res.text());
      setLoading(false);
      return;
    }
    const data = await res.json();
    setProprietarios(data.proprietarios || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, status, page]);

  useEffect(() => {
    const t = setTimeout(fetchProprietarios, 300);
    return () => clearTimeout(t);
  }, [fetchProprietarios]);

  function clearFilters() {
    setStatus("");
    setSearch("");
    setPage(1);
  }

  const hasFilters = search || status;

  return (
    <div className="page">
      <div className="section-header mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Proprietários</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
            {total} proprietário{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/proprietarios/novo" className="btn btn-primary" id="new-proprietario-btn">
          <Plus size={16} />
          Novo Proprietário
        </Link>
      </div>

      {/* Filters */}
      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="search-bar" style={{ flex: 1, minWidth: "200px" }}>
            <Search size={16} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Buscar por nome, email ou cidade..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button
            className={`btn ${showFilters ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            Filtros
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
                <label className="label">Status</label>
                <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <option value="">Todos</option>
                  <option value="ATIVO">Ativo</option>
                  <option value="INATIVO">Inativo</option>
                  <option value="ARQUIVADO">Arquivado</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Cidade</th>
                <th>Imóveis</th>
                <th>Data</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="skeleton" style={{ height: "20px", width: "150px" }} /></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "120px" }} /></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "100px" }} /></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "40px" }} /></td>
                    <td><div className="skeleton" style={{ height: "20px", width: "80px" }} /></td>
                    <td><div className="skeleton" style={{ height: "24px", width: "60px", borderRadius: "12px" }} /></td>
                  </tr>
                ))
              ) : proprietarios.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "3rem" }}>
                    <Contact size={48} style={{ margin: "0 auto 1rem", color: "var(--color-surface-600)" }} />
                    <p style={{ color: "var(--color-surface-300)" }}>
                      {hasFilters ? "Nenhum proprietário encontrado com os filtros atuais." : "Nenhum proprietário cadastrado."}
                    </p>
                  </td>
                </tr>
              ) : (
                proprietarios.map((p) => (
                  <tr key={p.id} className="clickable-row" onClick={() => window.location.href = `/proprietarios/${p.id}`}>
                    <td>
                      <div className="font-medium" style={{ color: "var(--color-surface-50)" }}>
                        {p.nomeCompleto}
                      </div>
                    </td>
                    <td>
                      <div className="flex flex-col gap-1">
                        {p.telefone && (
                          <span className="flex items-center gap-1.5 text-xs text-surface-300">
                            <Phone size={12} /> {maskTelefone(p.telefone)}
                          </span>
                        )}
                        {p.email && (
                          <span className="flex items-center gap-1.5 text-xs text-surface-300">
                            <Mail size={12} /> {p.email}
                          </span>
                        )}
                        {!p.telefone && !p.email && (
                          <span className="text-xs text-surface-500">Sem contato</span>
                        )}
                      </div>
                    </td>
                    <td style={{ color: "var(--color-surface-200)" }}>{p.cidade || "-"}</td>
                    <td>
                      <span className="badge badge-secondary">
                        <Home size={12} style={{ marginRight: "4px" }} />
                        {p._count.imoveis}
                      </span>
                    </td>
                    <td style={{ color: "var(--color-surface-400)" }}>{formatDate(p.criadoEm)}</td>
                    <td>
                      <span className={`badge ${STATUS_COLORS[p.status] || "badge-secondary"}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {!loading && total > 20 && (
        <div className="flex items-center justify-center gap-2 mt-5">
          <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Anterior
          </button>
          <span style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            Página {page} de {Math.ceil(total / 20)}
          </span>
          <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
