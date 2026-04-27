"use client";

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
  valorCondominio?: number | null;
  valorIptu?: number | null;
  cidade: string;
  bairro: string | null;
  endereco?: string | null;
  quartos: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  status: string;
  codigoInterno: string | null;
  criadoEm: string;
  _count: { interesses: number };
  proprietario?: { id: string; nomeCompleto: string } | null;
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {imoveis.map((imovel) => (
              <Link key={imovel.id} href={`/imoveis/${imovel.id}`} style={{ textDecoration: "none" }}>
                <div 
                  className="card" 
                  style={{ 
                    padding: 0,
                    overflow: "hidden",
                    height: "100%", 
                    display: "flex", 
                    flexDirection: "column", 
                    border: "1px solid var(--color-surface-800)", 
                    borderRadius: "16px",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    backgroundColor: "var(--color-surface-900)"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Image Placeholder */}
                  <div style={{ position: "relative", width: "100%", paddingTop: "65%", backgroundColor: "var(--color-surface-800)" }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, var(--color-surface-800), var(--color-surface-900))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                       <Home size={40} style={{ color: "var(--color-surface-700)" }} />
                    </div>
                    {/* Status Badge */}
                    <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                       {imovel.codigoInterno && (
                         <span className="badge badge-secondary" style={{ fontSize: "0.75rem", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: "0.25rem 0.75rem" }}>
                           #{imovel.codigoInterno}
                         </span>
                       )}
                       <span className={`badge ${STATUS_COLORS[imovel.status] || "badge-secondary"}`} style={{ fontSize: "0.75rem", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: "0.25rem 0.75rem" }}>
                         {propertyStatusLabel(imovel.status)}
                       </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                    {/* Subtitle / Type */}
                    <p style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginBottom: "0.5rem", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      <span style={{ textTransform: "capitalize" }}>{propertyTypeLabel(imovel.tipoImovel).toLowerCase()}</span> para {imovel.finalidade === "LOCACAO" ? "alugar" : "comprar"} {imovel.areaUtil ? `com ${imovel.areaUtil} m²` : ""}
                    </p>

                    {/* Price */}
                    <div style={{ marginBottom: "0.5rem" }}>
                      <span className="font-bold" style={{ color: "var(--color-surface-50)", fontSize: "1.6rem", letterSpacing: "-0.5px" }}>
                        {formatCurrency(imovel.preco)}
                      </span>
                      {imovel.proprietario && (
                        <div style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginTop: "4px" }}>
                          <span style={{ color: "var(--color-brand-400)" }}>Proprietário:</span> {imovel.proprietario.nomeCompleto}
                        </div>
                      )}
                    </div>
                    
                    {/* Additional Info (Cond/IPTU) */}
                    <p style={{ fontSize: "0.85rem", color: "var(--color-surface-500)", marginBottom: "1.5rem" }}>
                      {imovel.valorCondominio ? `Cond. ${formatCurrency(imovel.valorCondominio)}` : "Cond. não informado"} • {imovel.valorIptu ? `IPTU ${formatCurrency(imovel.valorIptu)}` : "IPTU não informado"}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap items-center gap-4 mb-5" style={{ color: "var(--color-surface-300)", fontSize: "0.9rem", marginTop: "auto" }}>
                      {imovel.areaUtil != null && (
                        <span className="flex items-center gap-1.5" title="Área Útil">
                          <Maximize size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.areaUtil} m²
                        </span>
                      )}
                      {imovel.quartos != null && (
                        <span className="flex items-center gap-1.5" title="Quartos">
                          <Bed size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.quartos}
                        </span>
                      )}
                      {imovel.banheiros != null && (
                        <span className="flex items-center gap-1.5" title="Banheiros">
                          <Bath size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.banheiros}
                        </span>
                      )}
                      {imovel.vagasGaragem != null && (
                        <span className="flex items-center gap-1.5" title="Vagas">
                          <Car size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.vagasGaragem}
                        </span>
                      )}
                    </div>

                    {/* Location */}
                    <div style={{ marginTop: "auto", borderTop: "1px solid var(--color-surface-800)", paddingTop: "1.25rem" }}>
                       <p className="font-semibold" style={{ color: "var(--color-surface-100)", fontSize: "0.95rem", lineHeight: 1.2 }}>
                         {imovel.bairro ? `${imovel.bairro}, ` : ""}{imovel.cidade}
                       </p>
                       <p style={{ color: "var(--color-surface-500)", fontSize: "0.85rem", marginTop: "0.35rem", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                         {imovel.endereco || imovel.titulo}
                       </p>
                    </div>
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
