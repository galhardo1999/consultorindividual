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

const TIPOS_IMOVEL = [
  "APARTAMENTO", "CASA", "CASA_CONDOMINIO", "TERRENO", "SALA_COMERCIAL",
  "LOJA", "GALPAO", "CHACARA", "FAZENDA", "COBERTURA", "KITNET", "STUDIO",
  "PREDIO_COMERCIAL", "AREA_RURAL", "OUTRO",
];

const FINALIDADES = [
  { value: "VENDA", label: "Venda" },
  { value: "LOCACAO", label: "Locação" },
  { value: "VENDA_LOCACAO", label: "Venda e Locação" },
  { value: "TEMPORADA", label: "Temporada" },
];

const STATUS_IMOVEL = ["DISPONIVEL", "RESERVADO", "VENDIDO", "LOCADO", "INDISPONIVEL"];

const STATUS_COLORS: Record<string, string> = {
  DISPONIVEL: "badge-success",
  RESERVADO: "badge-warning",
  VENDIDO: "badge-danger",
  LOCADO: "badge-info",
  INDISPONIVEL: "badge-secondary",
};

const initialFilters = {
  finalidade: "",
  tipoImovel: "",
  status: "",
  cidade: "",
  bairro: "",
  precoMinimo: "",
  precoMaximo: "",
  minQuartos: "",
  minVagas: "",
  minArea: "",
  maxArea: "",
  mobiliado: false,
  aceitaFinanciamento: false,
  aceitaPermuta: false,
  aceitaPets: false,
  documentacaoRegularizada: false,
};

function formatPropertyPrice(imovel: Imovel) {
  if (imovel.finalidade === "VENDA" && imovel.precoVenda) return formatCurrency(imovel.precoVenda);
  if (imovel.finalidade === "LOCACAO" && imovel.valorAluguel) return `${formatCurrency(imovel.valorAluguel)}/mês`;
  if (imovel.finalidade === "TEMPORADA" && imovel.valorTemporadaDiaria) return `${formatCurrency(imovel.valorTemporadaDiaria)}/dia`;
  if (imovel.finalidade === "VENDA_LOCACAO") {
    const venda = imovel.precoVenda ? formatCurrency(imovel.precoVenda) : "";
    const locacao = imovel.valorAluguel ? `${formatCurrency(imovel.valorAluguel)}/mês` : "";
    if (venda && locacao) return `${venda} ou ${locacao}`;
    return venda || locacao || "Sob consulta";
  }
  return "Sob consulta";
}

function ImovelCard({ imovel }: { imovel: Imovel }) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const fotos = imovel.fotos || [];

  const nextPhoto = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (fotos.length > 0) setPhotoIndex((prev) => (prev + 1) % fotos.length);
  };
  const prevPhoto = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (fotos.length > 0) setPhotoIndex((prev) => (prev - 1 + fotos.length) % fotos.length);
  };

  return (
    <Link href={`/imoveis/${imovel.id}`} style={{ textDecoration: "none" }}>
      <div
        className="card group"
        style={{ padding: 0, overflow: "hidden", height: "100%", display: "flex", flexDirection: "column", border: "1px solid var(--color-surface-800)", borderRadius: "16px", transition: "transform 0.2s, box-shadow 0.2s", cursor: "pointer", backgroundColor: "var(--color-surface-900)" }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.2)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
      >
        <div style={{ position: "relative", width: "100%", paddingTop: "65%", backgroundColor: "var(--color-surface-800)" }}>
          {fotos.length > 0 ? (
            <>
              <img src={fotos[photoIndex].url} alt={imovel.titulo} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
              {fotos.length > 1 && (
                <>
                  <button onClick={prevPhoto} className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"><ChevronLeft size={18} /></button>
                  <button onClick={nextPhoto} className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/70 transition-colors z-10 opacity-0 group-hover:opacity-100 backdrop-blur-sm"><ChevronRight size={18} /></button>
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/20 px-2 py-1 rounded-full backdrop-blur-sm">
                    {fotos.map((_, i) => (<div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === photoIndex ? "bg-white" : "bg-white/50"}`} />))}
                  </div>
                </>
              )}
            </>
          ) : (
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "linear-gradient(135deg, var(--color-surface-800), var(--color-surface-900))", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Home size={40} style={{ color: "var(--color-surface-700)" }} />
            </div>
          )}
          <div style={{ position: "absolute", top: "16px", left: "16px", display: "flex", gap: "8px", flexWrap: "wrap", zIndex: 20 }}>
            {imovel.codigoInterno && (<span className="badge badge-secondary" style={{ fontSize: "0.75rem", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: "0.25rem 0.75rem" }}>#{imovel.codigoInterno}</span>)}
            <span className={`badge ${STATUS_COLORS[imovel.status] || "badge-secondary"}`} style={{ fontSize: "0.75rem", fontWeight: 600, boxShadow: "0 2px 8px rgba(0,0,0,0.15)", padding: "0.25rem 0.75rem" }}>{propertyStatusLabel(imovel.status)}</span>
          </div>
        </div>

        <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginBottom: "0.25rem" }}>
            <span style={{ textTransform: "capitalize" }}>{propertyTypeLabel(imovel.tipoImovel).toLowerCase()}</span> para{" "}
            <span style={{ textTransform: "lowercase" }}>{FINALIDADES.find((p) => p.value === imovel.finalidade)?.label || imovel.finalidade}</span>
            {imovel.areaUtil ? ` com ${imovel.areaUtil} m²` : ""}
          </p>
          <h3 className="font-semibold" style={{ color: "var(--color-surface-50)", fontSize: "1.1rem", marginBottom: "0.75rem", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {imovel.titulo}
          </h3>
          <div style={{ marginBottom: "0.5rem" }}>
            <span className="font-bold" style={{ color: "var(--color-surface-50)", fontSize: "1.3rem", letterSpacing: "-0.5px" }}>{formatPropertyPrice(imovel)}</span>
            {imovel.proprietario && (<div style={{ color: "var(--color-surface-400)", fontSize: "0.8rem", marginTop: "4px" }}><span style={{ color: "var(--color-brand-400)" }}>Proprietário:</span> {imovel.proprietario.nomeCompleto}</div>)}
          </div>
          {imovel.finalidade !== "TEMPORADA" && (
            <p style={{ fontSize: "0.85rem", color: "var(--color-surface-500)", marginBottom: "1.5rem" }}>
              {imovel.valorCondominio ? `Cond. ${formatCurrency(imovel.valorCondominio)}` : "Cond. não informado"} • {imovel.valorIptu ? `IPTU ${formatCurrency(imovel.valorIptu)}` : "IPTU não informado"}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-4 mb-5" style={{ color: "var(--color-surface-300)", fontSize: "0.9rem", marginTop: "auto" }}>
            {imovel.areaUtil != null && (<span className="flex items-center gap-1.5"><Maximize size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.areaUtil} m²</span>)}
            {imovel.quartos != null && (<span className="flex items-center gap-1.5"><Bed size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.quartos}</span>)}
            {imovel.banheiros != null && (<span className="flex items-center gap-1.5"><Bath size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.banheiros}</span>)}
            {imovel.vagasGaragem != null && (<span className="flex items-center gap-1.5"><Car size={16} style={{ color: "var(--color-surface-500)" }} /> {imovel.vagasGaragem}</span>)}
          </div>
          <div style={{ marginTop: "auto", borderTop: "1px solid var(--color-surface-800)", paddingTop: "1.25rem" }}>
            <p className="font-semibold" style={{ color: "var(--color-surface-100)", fontSize: "0.95rem" }}>{imovel.bairro ? `${imovel.bairro}, ` : ""}{imovel.cidade}</p>
            <p style={{ color: "var(--color-surface-500)", fontSize: "0.85rem", marginTop: "0.35rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{imovel.endereco || "Endereço não informado"}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function ImoveisPage() {
  const [imoveis, setImoveis] = useState<Imovel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const fetchImoveis = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("search", busca);
      params.set("page", String(pagina));
      Object.entries(appliedFilters).forEach(([chave, valor]) => {
        if (valor !== "" && valor !== false) params.set(chave, String(valor));
      });
      const res = await fetch(`/api/imoveis?${params}`);
      if (!res.ok) throw new Error("Falha ao buscar imóveis");
      const data = await res.json();
      setImoveis(data.imoveis || []);
      setTotal(data.total || 0);
    } catch (erro) {
      console.error("Erro ao buscar imóveis:", erro);
      setImoveis([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [busca, pagina, appliedFilters]);

  useEffect(() => {
    const t = setTimeout(fetchImoveis, 300);
    return () => clearTimeout(t);
  }, [fetchImoveis]);

  const activeFiltersCount = Object.values(appliedFilters).filter((v) => v !== "" && v !== false).length;
  const hasFilters = busca !== "" || activeFiltersCount > 0;

  function handleOpenFilters() {
    setTempFilters(appliedFilters);
    setShowFilters(true);
  }

  function applyFilters() {
    setAppliedFilters(tempFilters);
    setPagina(1);
    setShowFilters(false);
  }

  function clearAllFilters() {
    setAppliedFilters(initialFilters);
    setTempFilters(initialFilters);
    setBusca("");
    setPagina(1);
    setShowFilters(false);
  }

  function updateTempFilter(chave: keyof typeof initialFilters, valor: string | boolean) {
    setTempFilters((prev) => ({ ...prev, [chave]: valor }));
  }

  const formatLabel = (str: string) =>
    str.split("_").map((w) => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");

  return (
    <div className="page relative">
      <div className="section-header mb-5">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Imóveis</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.9rem", marginTop: "4px" }}>
            {total} imóvel{total !== 1 ? "is" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/imoveis/novo" className="btn btn-primary" id="new-imovel-btn">
          <Plus size={16} /> Novo Imóvel
        </Link>
      </div>

      {/* Barra de busca e filtros */}
      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="search-bar" style={{ flex: 1, minWidth: "200px" }}>
            <Search size={16} />
            <input
              type="text"
              className="input"
              style={{ paddingLeft: "2.5rem" }}
              placeholder="Buscar por título, cidade, bairro, código..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              id="imovel-search"
            />
          </div>
          <button
            className={`btn ${activeFiltersCount > 0 ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={handleOpenFilters}
            id="filter-toggle"
          >
            <Filter size={14} />
            Filtros Avançados
            {activeFiltersCount > 0 && (
              <span className="badge badge-primary" style={{ fontSize: "0.7rem", padding: "0.1rem 0.4rem", backgroundColor: "white", color: "black" }}>
                {activeFiltersCount}
              </span>
            )}
          </button>
          {hasFilters && (
            <button className="btn btn-ghost btn-sm text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={clearAllFilters}>
              <X size={14} /> Limpar
            </button>
          )}
        </div>
      </div>

      {/* Grid de imóveis */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card" style={{ height: "340px" }}>
              <div className="skeleton" style={{ height: "180px", width: "100%", marginBottom: "16px", borderRadius: "8px" }} />
              <div className="skeleton" style={{ height: "20px", width: "60%", marginBottom: "8px" }} />
              <div className="skeleton" style={{ height: "14px", width: "40%" }} />
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
              {hasFilters ? "Tente ajustar os filtros de busca" : "Comece cadastrando seu primeiro imóvel"}
            </p>
            {!hasFilters && (
              <Link href="/imoveis/novo" className="btn btn-primary">
                <Plus size={16} /> Cadastrar imóvel
              </Link>
            )}
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
            {imoveis.map((imovel) => (<ImovelCard key={imovel.id} imovel={imovel} />))}
          </div>
          {total > 20 && (
            <div className="flex items-center justify-center gap-2 mt-5">
              <button className="btn btn-secondary btn-sm" disabled={pagina === 1} onClick={() => setPagina((p) => p - 1)}>Anterior</button>
              <span style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>Página {pagina} de {Math.ceil(total / 20)}</span>
              <button className="btn btn-secondary btn-sm" disabled={pagina >= Math.ceil(total / 20)} onClick={() => setPagina((p) => p + 1)}>Próxima</button>
            </div>
          )}
        </>
      )}

      {/* Drawer de filtros */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-md h-full bg-[var(--color-surface-900)] border-l border-[var(--color-surface-700)] shadow-2xl flex flex-col">
            <div className="p-5 border-b border-[var(--color-surface-700)] flex items-center justify-between bg-[var(--color-surface-800)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-surface-50)]">Filtros Avançados</h2>
                <p className="text-xs text-[var(--color-surface-400)]">Refine sua busca de imóveis</p>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-[var(--color-surface-700)] rounded-md text-[var(--color-surface-400)] hover:text-[var(--color-surface-50)] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

              {/* Classificação */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider">Classificação</h3>
                <div className="form-row">
                  <div>
                    <label className="label">Finalidade</label>
                    <select className="select w-full" value={tempFilters.finalidade} onChange={(e) => updateTempFilter("finalidade", e.target.value)}>
                      <option value="">Todas</option>
                      {FINALIDADES.map((f) => (<option key={f.value} value={f.value}>{f.label}</option>))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Status</label>
                    <select className="select w-full" value={tempFilters.status} onChange={(e) => updateTempFilter("status", e.target.value)}>
                      <option value="">Todos</option>
                      {STATUS_IMOVEL.map((s) => (<option key={s} value={s}>{formatLabel(s)}</option>))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label">Tipo de Imóvel</label>
                  <select className="select w-full" value={tempFilters.tipoImovel} onChange={(e) => updateTempFilter("tipoImovel", e.target.value)}>
                    <option value="">Todos os tipos</option>
                    {TIPOS_IMOVEL.map((t) => (<option key={t} value={t}>{propertyTypeLabel(t)}</option>))}
                  </select>
                </div>
              </div>

              {/* Localização */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Localização</h3>
                <div className="form-row">
                  <div>
                    <label className="label">Cidade</label>
                    <input type="text" className="input w-full" placeholder="Ex: São Paulo" value={tempFilters.cidade} onChange={(e) => updateTempFilter("cidade", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Bairro</label>
                    <input type="text" className="input w-full" placeholder="Ex: Moema" value={tempFilters.bairro} onChange={(e) => updateTempFilter("bairro", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Valores */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Valores</h3>
                <div>
                  <label className="label">Faixa de Preço (R$)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-full" placeholder="Mínimo" value={tempFilters.precoMinimo} onChange={(e) => updateTempFilter("precoMinimo", e.target.value)} />
                    <span className="text-[var(--color-surface-500)]">–</span>
                    <input type="number" className="input w-full" placeholder="Máximo" value={tempFilters.precoMaximo} onChange={(e) => updateTempFilter("precoMaximo", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Características */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Características</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="label">Quartos (mín.)</label>
                    <input type="number" className="input w-full" placeholder="0" min={0} value={tempFilters.minQuartos} onChange={(e) => updateTempFilter("minQuartos", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Vagas (mín.)</label>
                    <input type="number" className="input w-full" placeholder="0" min={0} value={tempFilters.minVagas} onChange={(e) => updateTempFilter("minVagas", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Área mín. (m²)</label>
                    <input type="number" className="input w-full" placeholder="0" min={0} value={tempFilters.minArea} onChange={(e) => updateTempFilter("minArea", e.target.value)} />
                  </div>
                </div>

                {/* Checkboxes */}
                <div className="space-y-2">
                  {[
                    { chave: "mobiliado" as const, label: "Mobiliado" },
                    { chave: "aceitaFinanciamento" as const, label: "Aceita Financiamento" },
                    { chave: "aceitaPermuta" as const, label: "Aceita Permuta" },
                    { chave: "aceitaPets" as const, label: "Aceita Pets" },
                    { chave: "documentacaoRegularizada" as const, label: "Documentação Regularizada" },
                  ].map(({ chave, label }) => (
                    <label key={chave} className="flex items-center gap-3 p-3 bg-[var(--color-surface-800)] rounded-md cursor-pointer border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)] transition-colors">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded"
                        checked={tempFilters[chave] as boolean}
                        onChange={(e) => updateTempFilter(chave, e.target.checked)}
                      />
                      <span className="text-sm font-medium text-[var(--color-surface-100)]">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-6" />
            </div>

            <div className="p-4 border-t border-[var(--color-surface-700)] flex gap-3 bg-[var(--color-surface-800)]">
              <button className="btn btn-ghost flex-1 justify-center text-[var(--color-surface-300)] hover:text-white" onClick={() => setTempFilters(initialFilters)}>
                Limpar
              </button>
              <button className="btn btn-primary flex-1 justify-center" onClick={applyFilters}>
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
