"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Filter, Contact, Home, X, Mail, Phone, ChevronRight } from "lucide-react";
import { maskTelefone, formatDate } from "@/lib/utils";

interface Proprietario {
  id: string;
  nomeCompleto: string;
  email: string | null;
  telefone: string | null;
  whatsapp: string | null;
  cidade: string | null;
  estado: string | null;
  tipoPessoa: string;
  status: string;
  criadoEm: string;
  atualizadoEm: string;
  _count: { imoveis: number };
}

const STATUS_COLORS: Record<string, string> = {
  ATIVO: "badge-success",
  INATIVO: "badge-warning",
  ARQUIVADO: "badge-secondary",
};

const STATUS_LABELS: Record<string, string> = {
  ATIVO: "Ativo",
  INATIVO: "Inativo",
  ARQUIVADO: "Arquivado",
};

const TIPO_PESSOA_LABELS: Record<string, string> = {
  PESSOA_FISICA: "Pessoa Física",
  PESSOA_JURIDICA: "Pessoa Jurídica",
};

const initialFilters = {
  status: "",
  tipoPessoa: "",
  cidade: "",
  estado: "",
  comImoveis: false,
  criadoEmInicio: "",
  criadoEmFim: "",
};

export default function ProprietariosPage() {
  const [proprietarios, setProprietarios] = useState<Proprietario[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState("");
  const [pagina, setPagina] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const fetchProprietarios = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (busca) params.set("search", busca);
      params.set("page", String(pagina));
      Object.entries(appliedFilters).forEach(([chave, valor]) => {
        if (valor !== "" && valor !== false) params.set(chave, String(valor));
      });
      const res = await fetch(`/api/proprietarios?${params}`);
      if (!res.ok) throw new Error("Falha ao buscar proprietários");
      const data = await res.json();
      setProprietarios(data.proprietarios || []);
      setTotal(data.total || 0);
    } catch (erro) {
      console.error("Erro ao buscar proprietários:", erro);
      setProprietarios([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [busca, pagina, appliedFilters]);

  useEffect(() => {
    const t = setTimeout(fetchProprietarios, 300);
    return () => clearTimeout(t);
  }, [fetchProprietarios]);

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

  return (
    <div className="page relative">
      <div className="section-header mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">Proprietários</h1>
          <p className="text-[var(--color-surface-400)] text-sm mt-1">
            {total} proprietário{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/proprietarios/novo" className="btn btn-primary" id="new-proprietario-btn">
          <Plus size={16} /> <span>Novo Proprietário</span>
        </Link>
      </div>

      {/* Barra de busca e filtros */}
      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
            <input
              type="text"
              className="input w-full pl-10"
              placeholder="Buscar por nome, e-mail, cidade ou documento..."
              value={busca}
              onChange={(e) => { setBusca(e.target.value); setPagina(1); }}
              id="proprietario-search"
            />
          </div>
          <button
            className={`btn ${activeFiltersCount > 0 ? "btn-primary" : "btn-secondary"} btn-sm`}
            onClick={handleOpenFilters}
            id="filter-toggle"
          >
            <Filter size={14} />
            <span className="hidden sm:inline">Filtros Avançados</span>
            <span className="sm:hidden">Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="badge bg-white text-black text-[0.7rem] px-1.5 py-0.5 ml-1">
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

      {/* Lista de proprietários */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card card-sm animate-pulse">
              <div className="h-5 bg-[var(--color-surface-700)] rounded w-2/5 mb-3" />
              <div className="h-3 bg-[var(--color-surface-800)] rounded w-3/5" />
            </div>
          ))}
        </div>
      ) : proprietarios.length === 0 ? (
        <div className="card p-10 flex flex-col items-center justify-center text-center border border-dashed border-[var(--color-surface-700)] bg-[var(--color-surface-800)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center mb-4 text-[var(--color-surface-400)]">
            <Contact size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-surface-100)] mb-2">
            {hasFilters ? "Nenhum proprietário encontrado" : "Nenhum proprietário ainda"}
          </h3>
          <p className="text-[var(--color-surface-400)] mb-6 max-w-md">
            {hasFilters ? "Sua busca ou filtros não retornaram resultados. Tente remover alguns filtros ou buscar por outros termos." : "Comece cadastrando seu primeiro proprietário para vincular aos imóveis do sistema."}
          </p>
          {!hasFilters ? (
            <Link href="/proprietarios/novo" className="btn btn-primary">
              <Plus size={16} /> Cadastrar primeiro proprietário
            </Link>
          ) : (
            <button className="btn btn-secondary" onClick={clearAllFilters}>
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="card p-0 overflow-hidden border border-[var(--color-surface-700)]">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse hidden md:table">
                <thead>
                  <tr className="border-b border-[var(--color-surface-700)] bg-[var(--color-surface-800)]/80 text-[var(--color-surface-400)] text-sm">
                    <th className="p-4 font-medium">Nome do Proprietário</th>
                    <th className="p-4 font-medium">Contato</th>
                    <th className="p-4 font-medium">Localização</th>
                    <th className="p-4 font-medium text-center">Imóveis</th>
                    <th className="p-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-700)]">
                  {proprietarios.map(p => (
                    <tr key={p.id} className="hover:bg-[var(--color-surface-800)] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-medium rounded-full text-sm">
                            {p.nomeCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/proprietarios/${p.id}`} className="font-medium text-[var(--color-surface-50)] group-hover:text-[var(--color-brand-400)] transition-colors">
                              {p.nomeCompleto}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`badge ${STATUS_COLORS[p.status] || "badge-secondary"} text-[0.65rem] px-1.5 py-0.5`}>
                                {STATUS_LABELS[p.status] || p.status}
                              </span>
                              <span className="badge bg-[var(--color-surface-700)] text-[var(--color-surface-300)] text-[0.65rem] px-1.5 py-0.5">
                                {TIPO_PESSOA_LABELS[p.tipoPessoa] || p.tipoPessoa}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        <div className="flex flex-col gap-1.5">
                          {p.telefone ? (
                            <div className="flex items-center gap-2">
                              <Phone size={14} className="text-[var(--color-surface-500)]" />
                              {maskTelefone(p.telefone)}
                            </div>
                          ) : <span className="text-[var(--color-surface-600)]">Sem telefone</span>}
                          {p.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-[var(--color-surface-500)]" />
                              <span className="truncate max-w-[150px] lg:max-w-[200px]" title={p.email}>
                                {p.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        {p.cidade ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-[var(--color-surface-500)]">📍</span> {p.cidade}{p.estado ? `, ${p.estado}` : ""}
                          </span>
                        ) : (
                          <span className="text-[var(--color-surface-600)]">Não informado</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface-800)] text-[var(--color-brand-400)] font-medium text-sm border border-[var(--color-surface-700)]" title="Imóveis vinculados">
                          {p._count.imoveis}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/proprietarios/${p.id}`} className="btn btn-secondary btn-sm inline-flex opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col divide-y divide-[var(--color-surface-700)]">
                {proprietarios.map(p => (
                  <Link key={p.id} href={`/proprietarios/${p.id}`} className="p-4 hover:bg-[var(--color-surface-800)] transition-colors block group">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-medium rounded-full text-sm">
                        {p.nomeCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[var(--color-surface-50)] truncate group-hover:text-[var(--color-brand-400)] transition-colors">
                          {p.nomeCompleto}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`badge ${STATUS_COLORS[p.status] || "badge-secondary"} text-[0.65rem] px-1.5 py-0.5`}>
                            {STATUS_LABELS[p.status] || p.status}
                          </span>
                          <span className="badge bg-[var(--color-surface-700)] text-[var(--color-surface-300)] text-[0.65rem] px-1.5 py-0.5">
                            {TIPO_PESSOA_LABELS[p.tipoPessoa] || p.tipoPessoa}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-[var(--color-surface-300)] mb-5">
                      {p.telefone && (
                        <div className="flex items-center gap-2">
                          <Phone size={14} className="text-[var(--color-surface-500)]" />
                          {maskTelefone(p.telefone)}
                        </div>
                      )}
                      {p.cidade && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-surface-500)]">📍</span>
                          {p.cidade}{p.estado ? `, ${p.estado}` : ""}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                      <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Imóveis Vinculados</div>
                      <div className="font-semibold text-lg text-[var(--color-brand-400)] flex items-center justify-center gap-2">
                        <Home size={16} />
                        {p._count.imoveis}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex items-center justify-between mt-5 bg-[var(--color-surface-800)] border border-[var(--color-surface-700)] rounded-lg p-3">
              <span className="text-[var(--color-surface-400)] text-sm hidden sm:block">
                Mostrando página {pagina} de {Math.ceil(total / 20)}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagina === 1}
                  onClick={() => setPagina(p => p - 1)}
                >
                  Anterior
                </button>
                <span className="text-[var(--color-surface-400)] text-sm sm:hidden">
                  {pagina} / {Math.ceil(total / 20)}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={pagina >= Math.ceil(total / 20)}
                  onClick={() => setPagina(p => p + 1)}
                >
                  Próxima
                </button>
              </div>
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
                <p className="text-xs text-[var(--color-surface-400)]">Refine sua busca de proprietários</p>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-[var(--color-surface-700)] rounded-md text-[var(--color-surface-400)] hover:text-[var(--color-surface-50)] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">

              {/* Status e Tipo */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider">Status e Tipo</h3>
                <div className="form-row">
                  <div>
                    <label className="label">Status</label>
                    <select className="select w-full" value={tempFilters.status} onChange={(e) => updateTempFilter("status", e.target.value)}>
                      <option value="">Todos</option>
                      <option value="ATIVO">Ativo</option>
                      <option value="INATIVO">Inativo</option>
                      <option value="ARQUIVADO">Arquivado</option>
                    </select>
                  </div>
                  <div>
                    <label className="label">Tipo de Pessoa</label>
                    <select className="select w-full" value={tempFilters.tipoPessoa} onChange={(e) => updateTempFilter("tipoPessoa", e.target.value)}>
                      <option value="">Qualquer</option>
                      <option value="PESSOA_FISICA">Pessoa Física</option>
                      <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
                    </select>
                  </div>
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
                    <label className="label">Estado (UF)</label>
                    <input type="text" className="input w-full" placeholder="Ex: SP" maxLength={2} value={tempFilters.estado} onChange={(e) => updateTempFilter("estado", e.target.value.toUpperCase())} />
                  </div>
                </div>
              </div>

              {/* Portfólio */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Portfólio</h3>
                <label className="flex items-center gap-3 p-3 bg-[var(--color-surface-800)] rounded-md cursor-pointer border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)] transition-colors">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded"
                    checked={tempFilters.comImoveis}
                    onChange={(e) => updateTempFilter("comImoveis", e.target.checked)}
                  />
                  <span className="text-sm font-medium text-[var(--color-surface-100)]">Apenas com imóveis cadastrados</span>
                </label>
              </div>

              {/* Período de cadastro */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Período de Cadastro</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Criado Entre (Início)</label>
                    <input type="date" className="input w-full" value={tempFilters.criadoEmInicio} onChange={(e) => updateTempFilter("criadoEmInicio", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Criado Entre (Fim)</label>
                    <input type="date" className="input w-full" value={tempFilters.criadoEmFim} onChange={(e) => updateTempFilter("criadoEmFim", e.target.value)} />
                  </div>
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
