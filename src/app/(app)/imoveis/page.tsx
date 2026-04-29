"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Home, ChevronRight, ChevronLeft, Bed, Bath, Car, Maximize, X } from "lucide-react";
import { formatCurrency, propertyTypeLabel, propertyStatusLabel } from "@/lib/utils";

interface Imovel {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number | null;
  valorAluguel: number | null;
  valorTemporadaDiaria: number | null;
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
  fotos?: { url: string; isCapa: boolean }[];
}

const PROPERTY_TYPES = [
  "APARTAMENTO", "CASA", "CASA_CONDOMINIO", "TERRENO", "SALA_COMERCIAL", "LOJA", "GALPAO", "CHACARA", "FAZENDA", "COBERTURA", "KITNET", "STUDIO", "PREDIO_COMERCIAL", "AREA_RURAL", "OUTRO"
];

const PURPOSES = [
  { value: "VENDA", label: "Venda" },
  { value: "LOCACAO", label: "Locação" },
  { value: "VENDA_LOCACAO", label: "Venda e Locação" },
  { value: "TEMPORADA", label: "Temporada" },
];

const PROPERTY_STATUSES = ["DISPONIVEL", "RESERVADO", "VENDIDO", "LOCADO", "INDISPONIVEL"];

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
  INDISPONIVEL: "badge-secondary",
};

function formatPropertyPrice(imovel: Imovel) {
  if (imovel.finalidade === 'VENDA' && imovel.precoVenda) return formatCurrency(imovel.precoVenda);
  if (imovel.finalidade === 'LOCACAO' && imovel.valorAluguel) return `${formatCurrency(imovel.valorAluguel)}/mês`;
  if (imovel.finalidade === 'TEMPORADA' && imovel.valorTemporadaDiaria) return `${formatCurrency(imovel.valorTemporadaDiaria)}/dia`;
  if (imovel.finalidade === 'VENDA_LOCACAO') {
     const venda = imovel.precoVenda ? formatCurrency(imovel.precoVenda) : '';
     const locacao = imovel.valorAluguel ? `${formatCurrency(imovel.valorAluguel)}/mês` : '';
     if (venda && locacao) return `${venda} ou ${locacao}`;
     return venda || locacao || 'Sob consulta';
  }
  return 'Sob consulta';
}

function ImovelCard({ imovel }: { imovel: Imovel }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const fotos = imovel.fotos || [];

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fotos.length > 0) {
      setPhotoIndex((prev) => (prev + 1) % fotos.length);
    }
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (fotos.length > 0) {
      setPhotoIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
    }
  };

  return (
    <Link href={`/imoveis/${imovel.id}`} style={{ textDecoration: "none" }}>
      <div 
        className="card group" 
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
        {/* Carousel */}
        <div style={{ position: "relative", width: "100%", paddingTop: "65%", backgroundColor: "var(--color-surface-800)" }}>
          {fotos.length > 0 ? (
            <>
              <img 
                src={fotos[photoIndex].url} 
                alt={imovel.titulo} 
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} 
              />
              {fotos.length > 1 && (
                <>
                  <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                    <ChevronRight size={18} />
                  </button>
                  
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    {fotos.map((_, i) => (
                      <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIndex ? 'bg-white' : 'bg-white/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, var(--color-surface-800), var(--color-surface-900))", display: "flex", alignItems: "center", justifyContent: "center" }}>
               <Home size={40} style={{ color: "var(--color-surface-700)" }} />
            </div>
          )}
          {/* Status Badge */}
          <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", flexWrap: "wrap", zIndex: 20 }}>
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
            <span style={{ textTransform: "capitalize" }}>{propertyTypeLabel(imovel.tipoImovel).toLowerCase()}</span> para <span style={{ textTransform: "lowercase" }}>{PURPOSES.find(p => p.value === imovel.finalidade)?.label || imovel.finalidade}</span> {imovel.areaUtil ? `com ${imovel.areaUtil} m²` : ""}
          </p>

          {/* Price */}
          <div style={{ marginBottom: "0.5rem" }}>
            <span className="font-bold" style={{ color: "var(--color-surface-50)", fontSize: "1.3rem", letterSpacing: "-0.5px" }}>
              {formatPropertyPrice(imovel)}
            </span>
            {imovel.proprietario && (
              <div style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginTop: "4px" }}>
                <span style={{ color: "var(--color-brand-400)" }}>Proprietário:</span> {imovel.proprietario.nomeCompleto}
              </div>
            )}
          </div>
          
          {/* Additional Info (Cond/IPTU) */}
          {(imovel.finalidade !== 'TEMPORADA') && (
              <p style={{ fontSize: "0.85rem", color: "var(--color-surface-500)", marginBottom: "1.5rem" }}>
                {imovel.valorCondominio ? `Cond. ${formatCurrency(imovel.valorCondominio)}` : "Cond. não informado"} • {imovel.valorIptu ? `IPTU ${formatCurrency(imovel.valorIptu)}` : "IPTU não informado"}
              </p>
          )}

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
  );
}

export default function ImoveisPage() {
  const [imoveis, setProperties] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [tipoImovel, setPropertyType] = useState("");
  const [finalidade, setFinalidade] = useState("");
  const [status, setStatus] = useState("");
  const [cidade, setCity] = useState("");
  const [bairro, setBairro] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (tipoImovel) params.set("tipoImovel", tipoImovel);
    if (finalidade) params.set("finalidade", finalidade);
    if (status) params.set("status", status);
    if (cidade) params.set("cidade", cidade);
    if (bairro) params.set("bairro", bairro);
    params.set("page", String(page));

    try {
      const res = await fetch(`/api/imoveis?${params}`);
      if (!res.ok) {
        throw new Error("Failed to fetch properties");
      }
      const data = await res.json();
      setProperties(data.imoveis || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error("Error fetching properties:", error);
      setProperties([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, tipoImovel, finalidade, status, cidade, bairro, page]);

  useEffect(() => {
    const t = setTimeout(fetchProperties, 300);
    return () => clearTimeout(t);
  }, [fetchProperties]);

  function clearFilters() {
    setPropertyType("");
    setFinalidade("");
    setStatus("");
    setCity("");
    setBairro("");
    setSearch("");
    setPage(1);
  }

  const hasFilters = search || tipoImovel || finalidade || status || cidade || bairro;

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
              placeholder="Buscar por título, cidade, bairro, código..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="label">Finalidade</label>
                <select className="select" value={finalidade} onChange={(e) => { setFinalidade(e.target.value); setPage(1); }}>
                  <option value="">Todas</option>
                  {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
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
                <label className="label">Bairro</label>
                <input type="text" className="input" placeholder="Filtrar por bairro..." value={bairro}
                  onChange={(e) => { setBairro(e.target.value); setPage(1); }} />
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
              <ImovelCard key={imovel.id} imovel={imovel} />
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
