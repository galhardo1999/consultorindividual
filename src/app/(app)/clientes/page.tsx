"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Plus, Search, Filter, Users, ChevronRight, Phone, Mail,
  X, MessageSquare
} from "lucide-react";
import {
  journeyStageLabel, journeyStageColor, urgencyLabel, formatDate
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
const PRE_APROVACAO = ["SIM", "NAO", "EM_ANALISE"];
const OBJETIVO_COMPRA = ["MORADIA_PROPRIA", "INVESTIMENTO", "LOCACAO", "VERANEIO", "OUTRO"];
const FORMA_PAGAMENTO = ["FINANCIAMENTO", "PERMUTA", "VISTA", "MISTO", "A_DEFINIR"];
const ORIGEM_LEAD = ["INDICACAO", "PORTAL_IMOBILIARIO", "REDES_SOCIAIS", "WHATSAPP", "SITE_PROPRIO", "CAPTACAO_ATIVA", "EVENTO", "OUTRO"];

const initialFilters = {
  estagioJornada: "",
  nivelUrgencia: "",
  status: "",
  estadoCivil: "",
  temFilhos: "",
  profissao: "",
  rendaMensalMin: "",
  rendaMensalMax: "",
  budgetMaximoMin: "",
  budgetMaximoMax: "",
  preAprovacaoCredito: "",
  objetivoCompra: "",
  formaPagamento: "",
  prazoCompra: "",
  origemLead: "",
  proximoContatoAtrasado: false,
  criadoEmInicio: "",
  criadoEmFim: "",
  atualizadoEmInicio: "",
  atualizadoEmFim: "",
};

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

  function updateTempFilter(key: keyof typeof initialFilters, value: any) {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  }

  // Format enum labels properly
  const formatLabel = (str: string) => {
    return str.split("_").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ");
  };

  return (
    <div className="page relative">
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

      {/* Search and filter actions */}
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
              <X size={14} />
              Limpar
            </button>
          )}
        </div>
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
                  className="card card-sm hover:bg-[var(--color-surface-800)] transition-colors"
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
                      {cliente.status === "ARQUIVADO" && (
                        <span className="badge" style={{ fontSize: "0.7rem", backgroundColor: "var(--color-surface-700)", color: "var(--color-surface-300)" }}>Arquivado</span>
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

                <div>
                  <label className="label">Status</label>
                  <select className="select w-full" value={tempFilters.status} onChange={(e) => updateTempFilter("status", e.target.value)}>
                    <option value="">Ativos (padrão)</option>
                    <option value="ARQUIVADO">Arquivados</option>
                  </select>
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

                <div>
                  <label className="label">Profissão</label>
                  <input type="text" className="input w-full" placeholder="Ex: Médico, Engenheiro..." value={tempFilters.profissao} onChange={(e) => updateTempFilter("profissao", e.target.value)} />
                </div>
              </div>

              {/* Qualificação Financeira */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-[var(--color-brand-400)] uppercase tracking-wider pt-2 border-t border-[var(--color-surface-800)]">Qualificação Financeira</h3>
                
                <div>
                  <label className="label">Renda Mensal</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-full" placeholder="Mínimo" value={tempFilters.rendaMensalMin} onChange={(e) => updateTempFilter("rendaMensalMin", e.target.value)} />
                    <span className="text-[var(--color-surface-500)]">-</span>
                    <input type="number" className="input w-full" placeholder="Máximo" value={tempFilters.rendaMensalMax} onChange={(e) => updateTempFilter("rendaMensalMax", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">Budget Máximo (Orçamento)</label>
                  <div className="flex items-center gap-2">
                    <input type="number" className="input w-full" placeholder="Mínimo" value={tempFilters.budgetMaximoMin} onChange={(e) => updateTempFilter("budgetMaximoMin", e.target.value)} />
                    <span className="text-[var(--color-surface-500)]">-</span>
                    <input type="number" className="input w-full" placeholder="Máximo" value={tempFilters.budgetMaximoMax} onChange={(e) => updateTempFilter("budgetMaximoMax", e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className="label">Pré-aprovação de Crédito</label>
                  <select className="select w-full" value={tempFilters.preAprovacaoCredito} onChange={(e) => updateTempFilter("preAprovacaoCredito", e.target.value)}>
                    <option value="">Qualquer</option>
                    {PRE_APROVACAO.map((s) => <option key={s} value={s}>{formatLabel(s)}</option>)}
                  </select>
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

                <div>
                  <label className="label">Prazo de Compra Estimado</label>
                  <input type="text" className="input w-full" placeholder="Ex: 3 meses, Imediato..." value={tempFilters.prazoCompra} onChange={(e) => updateTempFilter("prazoCompra", e.target.value)} />
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

                <label className="flex items-center gap-3 p-3 bg-[var(--color-surface-800)] rounded-md cursor-pointer border border-[var(--color-surface-700)] hover:border-[var(--color-surface-600)] transition-colors">
                  <input 
                    type="checkbox" 
                    className="h-4 w-4 rounded border-[var(--color-surface-500)] text-[var(--color-brand-500)] focus:ring-[var(--color-brand-500)] bg-[var(--color-surface-900)]" 
                    checked={tempFilters.proximoContatoAtrasado}
                    onChange={(e) => updateTempFilter("proximoContatoAtrasado", e.target.checked)}
                  />
                  <span className="text-sm font-medium text-[var(--color-surface-100)]">Apenas contatos atrasados</span>
                </label>

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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Atualizado Entre (Início)</label>
                    <input type="date" className="input w-full" value={tempFilters.atualizadoEmInicio} onChange={(e) => updateTempFilter("atualizadoEmInicio", e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Atualizado Entre (Fim)</label>
                    <input type="date" className="input w-full" value={tempFilters.atualizadoEmFim} onChange={(e) => updateTempFilter("atualizadoEmFim", e.target.value)} />
                  </div>
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
