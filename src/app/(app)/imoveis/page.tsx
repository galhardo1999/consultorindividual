"use cliente";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Home, ChevronRight, Bed, Bath, Car, Maximize, X } from "lucide-react";
import { formatCurrency, propertyTypeLabel, propertyStatusLabel } from "@/lib/utils";

interface Imovel {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  preco: number;
  cidade: string;
  bairro: string | null;
  quartos: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  status: string;
  codigoInterno: string | null;
  criadoEm: string;
  _count: { interesses: number };
}

const PROPERTY_TYPES = [
  "APARTAMENTO", "CASA", "CASA_CONDOMINIO", "TERRENO", "SALA_COMERCIAL", "LOJA", "GALPAO", "CHACARA", "FAZENDA", "OUTRO"
];

const PROPERTY_STATUSES = ["DISPONIVEL", "RESERVADO", "VENDIDO", "LOCADO", "INDISPONIVEL"];

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
  INDISPONIVEL: "badge-secondary",
};

export default function ImoveisPage() {
  const [imoveis, setProperties] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoImovel, setPropertyType] = useState("");
  const [status, setStatus] = useState("");
  const [cidade, setCity] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tipoImovel) params.set("tipoImovel", tipoImovel);
    if (status) params.set("status", status);
    if (cidade) params.set("cidade", cidade);
    params.set("page", String(page));

    const res = await fetch(`/api/imoveis?${params}`);
    const data = await res.json();
    setProperties(data.imoveis || []);
    setTotal(data.total || 0);
    setLoading(false);
  }, [search, tipoImovel, status, cidade, page]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  function clearFilters() {
    setPropertyType("");
    setStatus("");
    setCity("");
    setSearch("");
    setPage(1);
  }

  const hasFilters = search || tipoImovel || status || cidade;

  return (
    <div className="page">
      <div className="section-header mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Imóveis</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
            {total} imóvel{total !== 1 ? "is" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/imoveis/novo" className="btn btn-primary" id="new-imovel-btn">
          <Plus size={16} />
          Novo Imóvel
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
              placeholder="Buscar por título, bairro, cidade, código..."
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
                <label className="label">Tipo</label>
                <select className="select" value={tipoImovel} onChange={(e) => { setPropertyType(e.target.value); setPage(1); }}>
                  <option value="">Todos os tipos</option>
                  {PROPERTY_TYPES.map((t) => <option key={t} value={t}>{propertyTypeLabel(t)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Status</label>
                <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                  <option value="">Todos</option>
                  {PROPERTY_STATUSES.map((s) => <option key={s} value={s}>{propertyStatusLabel(s)}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Cidade</label>
                <input type="text" className="input" placeholder="Filtrar por cidade..." value={cidade}
                  onChange={(e) => { setCity(e.target.value); setPage(1); }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Imovel grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: "180px" }}>
              <div className="skeleton" style={{ height: "20px", width: "60%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "14px", width: "40%", marginBottom: "16px" }} />
              <div className="skeleton" style={{ height: "28px", width: "50%" }} />
            </div>
          ))}
        </div>
      ) : imoveis.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Home size={48} />
            <h3 className="text-lg font-semibold mb-2" style={{ color: "var(--color-surface-200)" }}>
              {hasFilters ? "Nenhum imóvel encontrado" : "Nenhum imóvel ainda"}
            </h3>
            <p style={{ marginBottom: "1.5rem" }}>
              {hasFilters ? "Ajuste os filtros de busca" : "Comece cadastrando seu primeiro imóvel"}
            </p>
            {!hasFilters && (
              <Link href="/imoveis/novo" className="btn btn-primary">
                <Plus size={16} />
                Cadastrar imóvel
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {imoveis.map((imovel) => (
              <Link key={imovel.id} href={`/imoveis/${imovel.id}`} style={{ textDecoration: "none" }}>
                <div className="card" style={{ cursor: "pointer", height: "100%" }}>
                  {/* Status bar */}
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      {imovel.codigoInterno && (
                        <div style={{ fontSize: "0.7rem", color: "var(--color-surface-500)", marginBottom: "4px" }}>
                          #{imovel.codigoInterno}
                        </div>
                      )}
                      <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                        {propertyTypeLabel(imovel.tipoImovel)}
                      </span>
                    </div>
                    <span className={`badge ${STATUS_COLORS[imovel.status] || "badge-secondary"}`} style={{ fontSize: "0.7rem" }}>
                      {propertyStatusLabel(imovel.status)}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold mb-1" style={{ color: "var(--color-surface-50)", lineHeight: 1.3 }}>
                    {imovel.titulo}
                  </h3>
                  <p style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginBottom: "1rem" }}>
                    📍 {imovel.cidade}{imovel.bairro && `, ${imovel.bairro}`}
                  </p>

                  {/* Features */}
                  <div className="flex gap-3 mb-3" style={{ color: "var(--color-surface-400)", fontSize: "0.8rem" }}>
                    {imovel.quartos != null && (
                      <span className="flex items-center gap-1">
                        <Bed size={13} /> {imovel.quartos} qts
                      </span>
                    )}
                    {imovel.banheiros != null && (
                      <span className="flex items-center gap-1">
                        <Bath size={13} /> {imovel.banheiros}
                      </span>
                    )}
                    {imovel.vagasGaragem != null && (
                      <span className="flex items-center gap-1">
                        <Car size={13} /> {imovel.vagasGaragem}
                      </span>
                    )}
                    {imovel.areaUtil != null && (
                      <span className="flex items-center gap-1">
                        <Maximize size={13} /> {imovel.areaUtil}m²
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg" style={{ color: "#22c55e" }}>
                      {formatCurrency(imovel.preco)}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-surface-500)" }}>
                      {imovel._count.interesses} interesse{imovel._count.interesses !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {total > 20 && (
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
        </>
      )}
    </div>
  );
}
