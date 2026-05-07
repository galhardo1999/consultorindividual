"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Users, Phone, Mail,
  X, MessageSquare
} from "lucide-react";
import {
  journeyStageLabel, journeyStageColor, urgencyLabel
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
const ESTADO_CIVIL = ["SOLTEIRO", "CASADO", "DIVORCIADO", "VIUVO", "UNIAO_ESTAVEL", "OUTRO"];
const OBJETIVO_COMPRA = ["MORADIA_PROPRIA", "INVESTIMENTO", "LOCACAO", "VERANEIO", "OUTRO"];
const FORMA_PAGAMENTO = ["FINANCIAMENTO", "PERMUTA", "VISTA", "MISTO", "A_DEFINIR"];
const ORIGEM_LEAD = ["INDICACAO", "PORTAL_IMOBILIARIO", "REDES_SOCIAIS", "WHATSAPP", "SITE_PROPRIO", "CAPTACAO_ATIVA", "EVENTO", "OUTRO"];

const initialFilters = {
  estagioJornada: "",
  nivelUrgencia: "",
  status: "",
  estadoCivil: "",
  temFilhos: "",
  budgetMaximoMin: "",
  budgetMaximoMax: "",
  objetivoCompra: "",
  formaPagamento: "",
  origemLead: "",
};

type ValorFiltro = (typeof initialFilters)[keyof typeof initialFilters];

export default function ClientesPage() {
  const [clientes, setClients] = useState<Cliente[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [tempFilters, setTempFilters] = useState(initialFilters);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", String(page));

      // Append all applied filters
      Object.entries(appliedFilters).forEach(([key, value]) => {
        if (value !== "" && value !== false) {
          params.set(key, String(value));
        }
      });

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
  }, [search, page, appliedFilters]);

  useEffect(() => {
    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [fetchClients]);

  const activeFiltersCount = Object.values(appliedFilters).filter(v => v !== "" && v !== false).length;
  const hasFilters = search !== "" || activeFiltersCount > 0;

  function handleOpenFilters() {
    setTempFilters(appliedFilters);
    setShowFilters(true);
  }

  function applyFilters() {
    setAppliedFilters(tempFilters);
    setPage(1);
    setShowFilters(false);
  }

  function clearAllFilters() {
    setAppliedFilters(initialFilters);
    setTempFilters(initialFilters);
    setSearch("");
    setPage(1);
    setShowFilters(false);
  }

  function updateTempFilter(key: keyof typeof initialFilters, value: ValorFiltro) {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  }

  // Format enum labels properly
  const formatLabel = (str: string) => {
    return str.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <div className="page relative">
      <div className="section-header mb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-50)]">
            Clientes
          </h1>
          <p className="text-[var(--color-surface-400)] text-sm mt-1">
            {total} cliente{total !== 1 ? "s" : ""} encontrado{total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/interacoes" className="btn btn-secondary">
            <MessageSquare size={16} />
            <span className="hidden sm:inline">Interações</span>
          </Link>
          <Link href="/clientes/novo" className="btn btn-primary" id="new-cliente-btn">
            <Plus size={16} />
            <span>Novo Cliente</span>
          </Link>
        </div>
      </div>

      {/* Search and filter actions */}
      <div className="card card-sm mb-5">
        <div className="flex gap-3 items-center flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
            <input
              type="text"
              className="input w-full !pl-10"
              placeholder="Buscar por nome, telefone, e-mail..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              id="cliente-search"
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
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
      </div>

      {/* Cliente list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card card-sm animate-pulse">
              <div className="h-5 bg-[var(--color-surface-700)] rounded w-2/5 mb-3" />
              <div className="h-3 bg-[var(--color-surface-800)] rounded w-3/5" />
            </div>
          ))}
        </div>
      ) : clientes.length === 0 ? (
        <div className="card p-10 flex flex-col items-center justify-center text-center border border-dashed border-[var(--color-surface-700)] bg-[var(--color-surface-800)]/50">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-800)] flex items-center justify-center mb-4 text-[var(--color-surface-400)]">
            <Users size={32} />
          </div>
          <h3 className="text-lg font-semibold text-[var(--color-surface-100)] mb-2">
            {hasFilters ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"}
          </h3>
          <p className="text-[var(--color-surface-400)] mb-6 max-w-md">
            {hasFilters
              ? "Sua busca ou filtros não retornaram resultados. Tente remover alguns filtros ou buscar por outros termos."
              : "Comece cadastrando seu primeiro cliente para gerenciar oportunidades e imóveis de interesse."}
          </p>
          {!hasFilters ? (
            <Link href="/clientes/novo" className="btn btn-primary">
              <Plus size={16} />
              Cadastrar primeiro cliente
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
                    <th className="p-4 font-medium">Nome do Cliente</th>
                    <th className="p-4 font-medium">Contato</th>
                    <th className="p-4 font-medium">Endereço</th>
                    <th className="p-4 font-medium text-center">Oportunidades</th>
                    <th className="p-4 font-medium text-center">Interesses</th>
                    <th className="p-4 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-surface-700)]">
                  {clientes.map(cliente => (
                    <tr key={cliente.id} className="hover:bg-[var(--color-surface-800)] transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-medium rounded-full text-sm">
                            {cliente.nomeCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                          </div>
                          <div>
                            <Link href={`/clientes/${cliente.id}`} className="font-medium text-[var(--color-surface-50)] group-hover:text-[var(--color-brand-400)] transition-colors">
                              {cliente.nomeCompleto}
                            </Link>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className={`badge ${journeyStageColor(cliente.estagioJornada)} text-[0.65rem] px-1.5 py-0.5`}>
                                {journeyStageLabel(cliente.estagioJornada)}
                              </span>
                              {cliente.nivelUrgencia === "ALTA" && (
                                <span className="badge badge-danger text-[0.65rem] px-1.5 py-0.5">Urgente</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-[var(--color-surface-500)]" />
                            {cliente.telefone}
                          </div>
                          {cliente.email && (
                            <div className="flex items-center gap-2">
                              <Mail size={14} className="text-[var(--color-surface-500)]" />
                              <span className="truncate max-w-[150px] lg:max-w-[200px]" title={cliente.email}>
                                {cliente.email}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-[var(--color-surface-300)]">
                        {cliente.cidadeAtual ? (
                          <span className="flex items-center gap-1.5">
                            <span className="text-[var(--color-surface-500)]">📍</span> {cliente.cidadeAtual}
                          </span>
                        ) : (
                          <span className="text-[var(--color-surface-600)]">Não informado</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface-800)] text-[var(--color-brand-400)] font-medium text-sm border border-[var(--color-surface-700)]" title="Oportunidades ativas">
                          {cliente.oportunidadesCount || 0}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-surface-800)] text-[var(--color-surface-200)] font-medium text-sm border border-[var(--color-surface-700)]" title="Imóveis de interesse">
                          {cliente._count.interesses}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <Link href={`/clientes/${cliente.id}`} className="btn btn-secondary btn-sm inline-flex opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100">
                          Ver detalhes
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Mobile Cards */}
              <div className="md:hidden flex flex-col divide-y divide-[var(--color-surface-700)]">
                {clientes.map(cliente => (
                  <Link key={cliente.id} href={`/clientes/${cliente.id}`} className="p-4 hover:bg-[var(--color-surface-800)] transition-colors block group">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[var(--color-surface-700)] text-[var(--color-surface-200)] font-medium rounded-full text-sm">
                        {cliente.nomeCompleto.split(" ").slice(0, 2).map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-[var(--color-surface-50)] truncate group-hover:text-[var(--color-brand-400)] transition-colors">
                          {cliente.nomeCompleto}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className={`badge ${journeyStageColor(cliente.estagioJornada)} text-[0.65rem] px-1.5 py-0.5`}>
                            {journeyStageLabel(cliente.estagioJornada)}
                          </span>
                          {cliente.nivelUrgencia === "ALTA" && (
                            <span className="badge badge-danger text-[0.65rem] px-1.5 py-0.5">Urgente</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm text-[var(--color-surface-300)] mb-5">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-[var(--color-surface-500)]" />
                        {cliente.telefone}
                      </div>
                      {cliente.cidadeAtual && (
                        <div className="flex items-center gap-2">
                          <span className="text-[var(--color-surface-500)]">📍</span>
                          {cliente.cidadeAtual}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Oportunidades</div>
                        <div className="font-semibold text-lg text-[var(--color-brand-400)]">{cliente.oportunidadesCount || 0}</div>
                      </div>
                      <div className="bg-[var(--color-surface-900)] p-3 rounded-md border border-[var(--color-surface-700)] flex flex-col items-center justify-center text-center">
                        <div className="text-[0.65rem] text-[var(--color-surface-400)] uppercase tracking-wider mb-1 font-medium">Interesses</div>
                        <div className="font-semibold text-lg text-[var(--color-surface-200)]">{cliente._count.interesses}</div>
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
                Mostrando página {page} de {Math.ceil(total / 20)}
              </span>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Anterior
                </button>
                <span className="text-[var(--color-surface-400)] text-sm sm:hidden">
                  {page} / {Math.ceil(total / 20)}
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  disabled={page >= Math.ceil(total / 20)}
                  onClick={() => setPage(p => p + 1)}
                >
                  Próxima
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Drawer Overlay */}
      {showFilters && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="relative w-full max-w-md h-full bg-[var(--color-surface-900)] border-l border-[var(--color-surface-700)] shadow-2xl flex flex-col transform transition-transform duration-300 translate-x-0">
            
            <div className="p-5 border-b border-[var(--color-surface-700)] flex items-center justify-between bg-[var(--color-surface-800)]">
              <div>
                <h2 className="text-lg font-bold text-[var(--color-surface-50)]">Filtros Avançados</h2>
                <p className="text-xs text-[var(--color-surface-400)]">Refine sua busca de clientes</p>
              </div>
              <button onClick={() => setShowFilters(false)} className="p-2 hover:bg-[var(--color-surface-700)] rounded-md text-[var(--color-surface-400)] hover:text-[var(--color-surface-50)] transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
              
              {/* Jornada e Status */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider">Jornada e Status</h3>
                
                <div className="form-row">
                  <div>
                    <label className="label">Estágio da Jornada</label>
                    <select className="select w-full" value={tempFilters.estagioJornada} onChange={(e) => updateTempFilter("estagioJornada", e.target.value)}>
                      <option value="">Todos</option>
                      {JOURNEY_STAGES.map((s) => <option key={s} value={s}>{journeyStageLabel(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Urgência</label>
                    <select className="select w-full" value={tempFilters.nivelUrgencia} onChange={(e) => updateTempFilter("nivelUrgencia", e.target.value)}>
                      <option value="">Todas</option>
                      {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{urgencyLabel(u)}</option>)}
                    </select>
                  </div>
                </div>

              </div>

              {/* Perfil do Cliente */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Perfil do Cliente</h3>
                
                <div className="form-row">
                  <div>
                    <label className="label">Estado Civil</label>
                    <select className="select w-full" value={tempFilters.estadoCivil} onChange={(e) => updateTempFilter("estadoCivil", e.target.value)}>
                      <option value="">Qualquer</option>
                      {ESTADO_CIVIL.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Tem Filhos?</label>
                    <select className="select w-full" value={tempFilters.temFilhos} onChange={(e) => updateTempFilter("temFilhos", e.target.value)}>
                      <option value="">Indiferente</option>
                      <option value="true">Sim</option>
                      <option value="false">Não</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Qualificação Financeira */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Qualificação Financeira</h3>

                <div>
                  <label className="label">Budget Máximo (Orçamento)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-full" placeholder="Mínimo" value={tempFilters.budgetMaximoMin} onChange={(e) => updateTempFilter("budgetMaximoMin", e.target.value)} />
                    <span className="text-[var(--color-surface-500)]">-</span>
                    <input type="number" className="input w-full" placeholder="Máximo" value={tempFilters.budgetMaximoMax} onChange={(e) => updateTempFilter("budgetMaximoMax", e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Intenção de Compra */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Intenção de Compra</h3>
                
                <div className="form-row">
                  <div>
                    <label className="label">Objetivo</label>
                    <select className="select w-full" value={tempFilters.objetivoCompra} onChange={(e) => updateTempFilter("objetivoCompra", e.target.value)}>
                      <option value="">Qualquer</option>
                      {OBJETIVO_COMPRA.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Forma Pgto.</label>
                    <select className="select w-full" value={tempFilters.formaPagamento} onChange={(e) => updateTempFilter("formaPagamento", e.target.value)}>
                      <option value="">Qualquer</option>
                      {FORMA_PAGAMENTO.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
                    </select>
                  </div>
                </div>

              </div>

              {/* Gestão Comercial */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Gestão Comercial</h3>

                <div>
                  <label className="label">Origem do Lead</label>
                  <select className="select w-full" value={tempFilters.origemLead} onChange={(e) => updateTempFilter("origemLead", e.target.value)}>
                    <option value="">Todas</option>
                    {ORIGEM_LEAD.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
                  </select>
                </div>

              </div>
              
              {/* Espaçador extra pro scroll não ficar colado no botão fixo */}
              <div className="h-6"></div>
            </div>

            {/* Footer Fixo */}
            <div className="p-4 border-t border-[var(--color-surface-700)] flex gap-3 bg-[var(--color-surface-800)]">
              <button 
                className="btn btn-ghost flex-1 justify-center text-[var(--color-surface-300)] hover:text-white" 
                onClick={() => { setTempFilters(initialFilters); }}
              >
                Limpar
              </button>
              <button 
                className="btn btn-primary flex-1 justify-center" 
                onClick={applyFilters}
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
