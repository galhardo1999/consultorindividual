"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Phone, Mail, MapPin, Calendar, Star, MessageSquare,
  Home, Plus, Trash2, Loader2, Clock, CheckCircle2, X, Save, Sparkles, TrendingUp, Bed,
  Activity, Target, AlertCircle, Bath, Car, Maximize, MessageCircle,
  CreditCard, DollarSign, Users, Wallet, Search
} from "lucide-react";
import {
  journeyStageLabel, journeyStageColor, formatDate,
  formatDateTime, leadSourceLabel, formatCurrency, propertyTypeLabel,
  interactionTypeLabel
} from "@/lib/utils";
import {
  PURCHASE_GOALS, PAYMENT_METHODS, CIVIL_STATUS, PRAZO_COMPRA, PRE_APROVACAO, URGENCY_LEVELS
} from "@/constants/options";

interface ClientDetail {
  id: string;
  nomeCompleto: string;
  telefone: string;
  whatsapp: string | null;
  email: string | null;
  documento: string | null;
  dataNascimento: string | null;
  estadoCivil: string | null;
  temFilhos: boolean | null;
  cidadeAtual: string | null;
  origemLead: string;
  status: string;
  estagioJornada: string;
  objetivoCompra: string | null;
  formaPagamento: string | null;
  nivelUrgencia: string;
  prazoCompra: string | null;
  budgetMaximo: number | null;
  preAprovacaoCredito: string | null;
  observacoes: string | null;
  criadoEm: string;
  atualizadoEm: string;
  preferencia: {
    tipoImovel: string | null;
    precoMinimo: number | null;
    precoMaximo: number | null;
    cidadeInteresse: string | null;
    bairrosInteresse: string | null;
    minQuartos: number | null;
    minBanheiros: number | null;
    minVagas: number | null;
    areaMinima: number | null;
    areaMaxima: number | null;
    aceitaFinanciamento: boolean | null;
    aceitaPermuta: boolean | null;
    notasPessoais: string | null;
  } | null;
  interacoes: {
    id: string;
    tipoInteracao: string;
    titulo: string;
    descricao: string | null;
    dataInteracao: string;
    proximoFollowUp: string | null;
    imovel: { id: string; titulo: string } | null;
  }[];
  interesses: {
    id: string;
    statusInteresse: string;
    ehFavorito: boolean;
    feedback: string | null;
    imovel: { id: string; titulo: string; tipoImovel: string; precoVenda: number; cidade: string; bairro: string | null };
  }[];
}

const INTERACTION_TYPES = [
  "LIGACAO", "MENSAGEM", "REUNIAO", "VISITA_AGENDADA", "VISITA_REALIZADA",
  "ENVIO_PROPOSTA", "RETORNO_CLIENTE", "ATUALIZACAO_PERFIL", "OBSERVACAO_INTERNA", "FOLLOW_UP"
];

const JOURNEY_STAGES = [
  "NOVO_LEAD", "EM_QUALIFICACAO", "BUSCANDO_OPCOES", "VISITANDO_IMOVEIS",
  "NEGOCIANDO", "PROPOSTA_ENVIADA", "FECHADO", "PERDIDO", "PAUSADO"
];

const interactionIcons: Record<string, React.ElementType> = {
  LIGACAO: Phone,
  MENSAGEM: MessageSquare,
  REUNIAO: Calendar,
  VISITA_AGENDADA: Calendar,
  VISITA_REALIZADA: CheckCircle2,
  FOLLOW_UP: Clock,
  ENVIO_PROPOSTA: Mail,
  DEFAULT: MessageSquare,
};

function labelDe(lista: { value: string; label: string }[], valor: string | null | undefined) {
  if (!valor) return null;
  return lista.find((i) => i.value === valor)?.label ?? valor;
}

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "imoveis" | "oportunidades">("timeline");
  const [opportunities, setOpportunities] = useState<{
    id: string;
    titulo: string;
    tipoImovel: string;
    precoVenda: number;
    cidade: string;
    bairro: string | null;
    quartos: number | null;
    banheiros: number | null;
    vagasGaragem: number | null;
    areaUtil: number | null;
    codigoInterno: string | null;
  }[]>([]);
  const [loadingOpportunities, setLoadingOpportunities] = useState(false);
  const [showInteractionModal, setShowInteractionModal] = useState(false);
  const [editingStage, setEditingStage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newInteraction, setNewInteraction] = useState({
    tipoInteracao: "LIGACAO",
    titulo: "",
    descricao: "",
    dataInteracao: new Date().toISOString().slice(0, 16),
    proximoFollowUp: "",
  });

  const [showInterestModal, setShowInterestModal] = useState(false);
  const [imoveis, setProperties] = useState<{ id: string, titulo: string, codigoInterno: string | null }[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("");
  const [statusInteresse, setInterestStatus] = useState("INTERESSADO");

  async function loadClient() {
    const res = await fetch(`/api/clientes/${id}`);
    if (!res.ok) { router.push("/clientes"); return; }
    const data = await res.json();
    setClient(data);
    setLoading(false);
  }

  useEffect(() => { loadClient(); }, [id]);

  async function updateStage(estagioJornada: string) {
    setSaving(true);
    await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estagioJornada }),
    });
    setEditingStage(false);
    setSaving(false);
    await loadClient();
  }

  async function addInteraction() {
    setSaving(true);
    await fetch("/api/interacoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newInteraction, clienteId: id }),
    });
    setSaving(false);
    setShowInteractionModal(false);
    setNewInteraction({
      tipoInteracao: "LIGACAO",
      titulo: "",
      descricao: "",
      dataInteracao: new Date().toISOString().slice(0, 16),
      proximoFollowUp: "",
    });
    await loadClient();
  }

  async function deleteClient() {
    if (!confirm("Tem certeza que deseja excluir este cliente permanentemente? Esta ação não pode ser desfeita.")) return;
    await fetch(`/api/clientes/${id}`, { method: "DELETE" });
    router.push("/clientes");
  }

  useEffect(() => {
    if (showInterestModal && imoveis.length === 0) {
      fetch("/api/imoveis")
        .then((r) => r.json())
        .then((d) => setProperties(d.imoveis || []));
    }
  }, [showInterestModal, imoveis.length]);

  async function addInterest() {
    if (!selectedPropertyId) return;
    setSaving(true);
    await fetch(`/api/clientes/${id}/interests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imovelId: selectedPropertyId, statusInteresse }),
    });
    setSaving(false);
    setShowInterestModal(false);
    setSelectedPropertyId("");
    await loadClient();
  }

  async function loadOpportunities() {
    setLoadingOpportunities(true);
    const res = await fetch(`/api/clientes/${id}/opportunities`);
    if (res.ok) {
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    }
    setLoadingOpportunities(false);
  }

  if (loading) {
    return (
      <div className="page flex justify-center items-center h-64">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!cliente) return null;

  const tabs = [
    { id: "timeline", label: `Timeline (${cliente.interacoes.length})` },
    { id: "imoveis", label: `Imóveis (${cliente.interesses.length})` },
    { id: "oportunidades", label: `Oportunidades` },
  ] as const;

  const initials = cliente.nomeCompleto.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  const isLocacao = cliente.objetivoCompra === "LOCACAO";

  return (
    <div className="page">
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/clientes" className="btn btn-ghost btn-icon">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="text-2xl font-bold text-surface-50">Detalhes do Cliente</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/clientes/${id}/editar`} className="btn btn-secondary">
            <Edit2 size={16} />
            <span className="hidden sm:inline">Editar Cliente</span>
          </Link>
          <button className="btn btn-danger" onClick={deleteClient}>
            <Trash2 size={16} />
            <span className="hidden sm:inline">Excluir</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* ── Left Column ── */}
        <div className="lg:col-span-5 flex flex-col gap-5">

          {/* ─ Card: Perfil Principal ─ */}
          <div className="card flex flex-col items-center text-center p-6 border-t-4" style={{ borderTopColor: "var(--color-brand-500)" }}>
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold mb-3 bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-lg">
              {initials}
            </div>
            <h2 className="text-xl font-bold text-surface-50 mb-2">{cliente.nomeCompleto}</h2>

            <div className="flex flex-wrap justify-center gap-2 mb-3">
              <span className={`badge ${journeyStageColor(cliente.estagioJornada)}`}>
                {journeyStageLabel(cliente.estagioJornada)}
              </span>
              {cliente.nivelUrgencia === "ALTA" && (
                <span className="badge badge-danger">Urgente</span>
              )}
              {cliente.objetivoCompra && (
                <span className="badge badge-secondary text-[10px]">
                  {labelDe(PURCHASE_GOALS, cliente.objetivoCompra)}
                </span>
              )}
            </div>

            <p className="text-xs text-surface-400 mb-5 bg-surface-900 px-3 py-1.5 rounded-full border border-surface-700">
              Cadastrado em {formatDate(cliente.criadoEm)} · {leadSourceLabel(cliente.origemLead)}
            </p>

            {/* Contatos e dados pessoais */}
            <div className="w-full flex flex-col gap-2 text-left border-t border-surface-700 pt-4">
              <InfoRow icon={<Phone size={13} />} cor="text-brand-400" label="Telefone" valor={cliente.telefone} />

              {cliente.whatsapp && cliente.whatsapp !== cliente.telefone && (
                <InfoRow icon={<MessageCircle size={13} />} cor="text-green-400" label="WhatsApp" valor={cliente.whatsapp} />
              )}

              {cliente.email && (
                <InfoRow icon={<Mail size={13} />} cor="text-sky-400" label="E-mail" valor={cliente.email} />
              )}

              {cliente.documento && (
                <InfoRow icon={<CreditCard size={13} />} cor="text-violet-400" label="CPF" valor={cliente.documento} />
              )}

              {cliente.cidadeAtual && (
                <InfoRow icon={<MapPin size={13} />} cor="text-amber-400" label="Cidade Atual" valor={cliente.cidadeAtual} />
              )}

              {cliente.dataNascimento && (
                <InfoRow icon={<Calendar size={13} />} cor="text-rose-400" label="Nascimento" valor={formatDate(cliente.dataNascimento)} />
              )}

              {cliente.estadoCivil && (
                <InfoRow
                  icon={<Users size={13} />}
                  cor="text-teal-400"
                  label="Estado Civil"
                  valor={[
                    labelDe(CIVIL_STATUS, cliente.estadoCivil),
                    cliente.temFilhos === true ? "com filhos" : cliente.temFilhos === false ? "sem filhos" : null,
                  ].filter(Boolean).join(" · ")}
                />
              )}
            </div>
          </div>

          {/* ─ Card: Perfil de Busca ─ */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider flex items-center gap-2">
                <Search size={14} className="text-brand-400" />
                Perfil de Busca
              </h3>
              <Link href={`/clientes/${id}/editar`} className="btn btn-ghost btn-icon w-8 h-8 rounded-full">
                <Edit2 size={13} />
              </Link>
            </div>

            <div className="flex flex-col gap-5">
              {/* Seção: Qualificação */}
              <div>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Wallet size={10} /> Qualificação
                </p>
                <div className="rounded-lg border border-surface-700/60 bg-surface-900/50 overflow-hidden">
                  {cliente.objetivoCompra && (
                    <QualRowBordered label="Objetivo" valor={labelDe(PURCHASE_GOALS, cliente.objetivoCompra) ?? ""} />
                  )}
                  {cliente.budgetMaximo && (
                    <QualRowBordered
                      label={isLocacao ? "Aluguel máx." : "Budget máx."}
                      valor={formatCurrency(cliente.budgetMaximo)}
                      destaque
                    />
                  )}
                  {cliente.formaPagamento && (
                    <QualRowBordered label="Pagamento" valor={labelDe(PAYMENT_METHODS, cliente.formaPagamento) ?? ""} />
                  )}
                  {cliente.prazoCompra && (
                    <QualRowBordered label="Prazo" valor={labelDe(PRAZO_COMPRA, cliente.prazoCompra) ?? ""} />
                  )}
                  {cliente.preAprovacaoCredito && (
                    <QualRowBordered
                      label="Pré-aprovação"
                      valor={labelDe(PRE_APROVACAO, cliente.preAprovacaoCredito) ?? ""}
                      badge={cliente.preAprovacaoCredito === "SIM" ? "success" : undefined}
                    />
                  )}
                  {cliente.nivelUrgencia && (
                    <QualRowBordered
                      label="Urgência"
                      valor={labelDe(URGENCY_LEVELS, cliente.nivelUrgencia) ?? ""}
                      badge={cliente.nivelUrgencia === "ALTA" ? "danger" : cliente.nivelUrgencia === "MEDIA" ? "warning" : undefined}
                      last
                    />
                  )}
                </div>
              </div>

              {/* Seção: Preferências do Imóvel */}
              <div>
                <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Home size={10} /> Preferências do Imóvel
                </p>
                {!cliente.preferencia ? (
                  <p className="text-xs text-surface-500 text-center py-4 rounded-lg border border-surface-700/60 bg-surface-900/50">
                    Detalhes do perfil não preenchidos
                  </p>
                ) : (
                  <div className="rounded-lg border border-surface-700/60 bg-surface-900/50 overflow-hidden">
                    {cliente.preferencia.tipoImovel && (
                      <PrefRowBordered icon={<Home size={12} />} label="Tipo" valor={propertyTypeLabel(cliente.preferencia.tipoImovel)} />
                    )}
                    {(cliente.preferencia.precoMinimo || cliente.preferencia.precoMaximo) && (
                      <PrefRowBordered
                        icon={<DollarSign size={12} />}
                        label={isLocacao ? "Aluguel" : "Preço"}
                        valor={[
                          cliente.preferencia.precoMinimo ? formatCurrency(cliente.preferencia.precoMinimo) : "0",
                          cliente.preferencia.precoMaximo ? formatCurrency(cliente.preferencia.precoMaximo) : "Ilimitado",
                        ].join(" → ")}
                      />
                    )}
                    {cliente.preferencia.cidadeInteresse && (
                      <PrefRowBordered icon={<MapPin size={12} />} label="Cidade" valor={cliente.preferencia.cidadeInteresse} />
                    )}
                    {cliente.preferencia.bairrosInteresse && (
                      <PrefRowBordered icon={<MapPin size={12} />} label="Bairros" valor={cliente.preferencia.bairrosInteresse} />
                    )}
                    {(cliente.preferencia.minQuartos || cliente.preferencia.minBanheiros || cliente.preferencia.minVagas) && (
                      <PrefRowBordered
                        icon={<Bed size={12} />}
                        label="Cômodos"
                        valor={[
                          cliente.preferencia.minQuartos ? `${cliente.preferencia.minQuartos}+ qts` : null,
                          cliente.preferencia.minBanheiros ? `${cliente.preferencia.minBanheiros}+ ban` : null,
                          cliente.preferencia.minVagas ? `${cliente.preferencia.minVagas}+ vag` : null,
                        ].filter(Boolean).join(" · ")}
                      />
                    )}
                    {(cliente.preferencia.areaMinima || cliente.preferencia.areaMaxima) && (
                      <PrefRowBordered
                        icon={<Maximize size={12} />}
                        label="Área"
                        valor={[
                          cliente.preferencia.areaMinima ? `${cliente.preferencia.areaMinima}m²` : null,
                          cliente.preferencia.areaMaxima ? `${cliente.preferencia.areaMaxima}m²` : null,
                        ].filter(Boolean).join(" → ")}
                      />
                    )}
                    {(cliente.preferencia.aceitaFinanciamento || cliente.preferencia.aceitaPermuta) && (
                      <div className="flex gap-2 px-3 py-2.5 flex-wrap">
                        {cliente.preferencia.aceitaFinanciamento && (
                          <span className="badge badge-success text-[10px]">Aceita Financiamento</span>
                        )}
                        {cliente.preferencia.aceitaPermuta && (
                          <span className="badge badge-warning text-[10px]">Aceita Permuta</span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notas pessoais */}
              {cliente.preferencia?.notasPessoais && (
                <div className="bg-surface-900/60 rounded-lg p-3 border border-surface-700/50">
                  <p className="text-[10px] font-bold text-surface-500 uppercase tracking-widest mb-1.5">Notas</p>
                  <p className="text-xs text-surface-300 leading-relaxed italic">"{cliente.preferencia.notasPessoais}"</p>
                </div>
              )}
            </div>
          </div>

          {/* ─ Card: Estágio da Jornada ─ */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-surface-200 flex items-center gap-2">
                <Activity size={16} className="text-brand-400" />
                ESTÁGIO DA JORNADA
              </h3>
              <button className="btn btn-ghost btn-sm btn-icon" onClick={() => setEditingStage(!editingStage)}>
                {editingStage ? <X size={14} /> : <Edit2 size={14} />}
              </button>
            </div>

            {editingStage ? (
              <div className="flex flex-col gap-2">
                {JOURNEY_STAGES.map((s) => (
                  <button
                    key={s}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-medium border transition-all ${cliente.estagioJornada === s
                        ? "bg-brand-500/10 border-brand-500 text-brand-300"
                        : "bg-surface-900 border-surface-700 text-surface-300 hover:border-surface-500"
                      }`}
                    onClick={() => updateStage(s)}
                    disabled={saving}
                  >
                    {journeyStageLabel(s)}
                  </button>
                ))}
              </div>
            ) : (
              <div className="relative pl-4 border-l-2 border-surface-700 pb-2 ml-2 mt-2">
                {JOURNEY_STAGES.map((s, i) => {
                  const currentIndex = JOURNEY_STAGES.indexOf(cliente.estagioJornada);
                  const isPast = i < currentIndex;
                  const isCurrent = i === currentIndex;

                  if (!isPast && !isCurrent && i !== currentIndex + 1) return null;

                  return (
                    <div key={s} className="relative mb-4 last:mb-0">
                      <div className={`absolute -left-[21px] w-3 h-3 rounded-full border-2 ${isCurrent ? "bg-brand-500 border-brand-500 shadow-[0_0_10px_rgba(100,112,243,0.5)]" :
                          isPast ? "bg-brand-400 border-brand-400" :
                            "bg-surface-900 border-surface-600"
                        }`} />
                      <div className={`text-sm ${isCurrent ? "text-brand-300 font-semibold" : isPast ? "text-surface-300" : "text-surface-500"}`}>
                        {journeyStageLabel(s)}
                        {isCurrent && <span className="ml-2 text-xs font-normal text-surface-400">(Atual)</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─ Card: Observações ─ */}
          {cliente.observacoes && (
            <div className="card bg-surface-800/50 border-l-4 border-l-amber-500">
              <h3 className="text-xs font-semibold text-surface-400 mb-2 uppercase tracking-wider">Observações</h3>
              <p className="text-sm text-surface-200 leading-relaxed whitespace-pre-wrap">{cliente.observacoes}</p>
            </div>
          )}
        </div>

        {/* ── Right Column — Tabs ── */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Tabs Nav */}
          <div className="bg-surface-800 border border-surface-700 rounded-xl p-1.5 flex flex-wrap gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === "oportunidades" && opportunities.length === 0) {
                    loadOpportunities();
                  }
                }}
                className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                    ? tab.id === "oportunidades"
                      ? "bg-purple-500/15 text-purple-400 shadow-sm"
                      : "bg-surface-700 text-surface-50 shadow-sm"
                    : "text-surface-400 hover:text-surface-200 hover:bg-surface-700/50"
                  }`}
              >
                {tab.id === "oportunidades" && <Sparkles size={14} className={activeTab === tab.id ? "text-purple-400" : "text-surface-500"} />}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1">

            {/* Timeline */}
            {activeTab === "timeline" && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                    <Clock size={18} className="text-brand-400" /> Histórico de Interações
                  </h2>
                  <button className="btn btn-primary btn-sm" onClick={() => setShowInteractionModal(true)}>
                    <Plus size={14} /> Registrar
                  </button>
                </div>

                {cliente.interacoes.length === 0 ? (
                  <div className="card flex flex-col items-center justify-center py-12 text-center border-dashed border-2 border-surface-700 bg-surface-900/50">
                    <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                      <MessageSquare size={24} className="text-surface-400" />
                    </div>
                    <p className="text-surface-100 font-medium mb-1">Nenhuma interação registrada</p>
                    <p className="text-sm text-surface-400 max-w-sm mb-6">Mantenha o histórico atualizado para um melhor acompanhamento deste cliente.</p>
                    <button className="btn btn-primary" onClick={() => setShowInteractionModal(true)}>
                      <Plus size={16} /> Registrar primeira interação
                    </button>
                  </div>
                ) : (
                  <div className="relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-surface-700 before:to-transparent">
                    {cliente.interacoes.map((interacao) => {
                      const Icon = interactionIcons[interacao.tipoInteracao] || interactionIcons.DEFAULT;
                      return (
                        <div key={interacao.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active mb-8">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-surface-950 bg-surface-800 text-brand-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
                            <Icon size={16} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] card p-4 hover:border-brand-500/50 transition-colors">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <span className="inline-block px-2 py-0.5 rounded text-[0.65rem] font-bold uppercase tracking-wider bg-surface-900 text-surface-300 border border-surface-700 mb-2">
                                  {interactionTypeLabel(interacao.tipoInteracao)}
                                </span>
                                <h4 className="text-sm font-semibold text-surface-100">{interacao.titulo}</h4>
                              </div>
                              <time className="text-xs text-surface-400 whitespace-nowrap">{formatDateTime(interacao.dataInteracao)}</time>
                            </div>
                            {interacao.descricao && (
                              <p className="text-sm text-surface-300 mt-2 bg-surface-900/50 p-3 rounded-lg border border-surface-700/50">
                                {interacao.descricao}
                              </p>
                            )}
                            {(interacao.proximoFollowUp || interacao.imovel) && (
                              <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-surface-700/50">
                                {interacao.proximoFollowUp && (
                                  <div className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-md">
                                    <AlertCircle size={12} />
                                    Follow-up: {formatDate(interacao.proximoFollowUp)}
                                  </div>
                                )}
                                {interacao.imovel && (
                                  <Link href={`/imoveis/${interacao.imovel.id}`} className="flex items-center gap-1.5 text-xs text-brand-400 bg-brand-400/10 px-2 py-1 rounded-md hover:bg-brand-400/20 transition-colors">
                                    <Home size={12} />
                                    {interacao.imovel.titulo}
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Imóveis */}
            {activeTab === "imoveis" && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-surface-50 flex items-center gap-2">
                    <Home size={18} className="text-brand-400" /> Imóveis de Interesse
                  </h2>
                  <button onClick={() => setShowInterestModal(true)} className="btn btn-primary btn-sm">
                    <Plus size={14} /> Vincular Imóvel
                  </button>
                </div>

                {cliente.interesses.length === 0 ? (
                  <div className="card flex flex-col items-center justify-center py-12 text-center border-dashed border-2 border-surface-700 bg-surface-900/50">
                    <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                      <Home size={24} className="text-surface-400" />
                    </div>
                    <p className="text-surface-100 font-medium mb-1">Nenhum imóvel vinculado</p>
                    <p className="text-sm text-surface-400 max-w-sm mb-6">Vincule imóveis que este cliente demonstrou interesse ou visitou.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {cliente.interesses.map((interesse) => (
                      <div key={interesse.id} className="card p-4 flex flex-col sm:flex-row gap-4 sm:items-center hover:border-surface-500 transition-all">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Link href={`/imoveis/${interesse.imovel.id}`} className="font-semibold text-surface-50 hover:text-brand-400 transition-colors">
                              {interesse.imovel.titulo}
                            </Link>
                            {interesse.ehFavorito && <Star size={14} className="text-amber-400 fill-amber-400" />}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-surface-400">
                            <span className="flex items-center gap-1"><Home size={12} /> {propertyTypeLabel(interesse.imovel.tipoImovel)}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1"><MapPin size={12} /> {interesse.imovel.cidade}{interesse.imovel.bairro && `, ${interesse.imovel.bairro}`}</span>
                          </div>
                          {interesse.feedback && (
                            <p className="text-sm text-surface-300 mt-3 bg-surface-900 p-2.5 rounded-lg border border-surface-700/50 italic flex gap-2">
                              <span className="text-xl leading-none opacity-50">"</span>
                              {interesse.feedback}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 border-t sm:border-t-0 sm:border-l border-surface-700 pt-3 sm:pt-0 sm:pl-4 min-w-[120px]">
                          <div className="font-bold text-green-400 text-lg">
                            {formatCurrency(interesse.imovel.precoVenda)}
                          </div>
                          <span className="badge badge-secondary text-[10px]">
                            {interesse.statusInteresse}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Oportunidades */}
            {activeTab === "oportunidades" && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-purple-400 flex items-center gap-2">
                      <Sparkles size={18} /> Oportunidades (Match)
                    </h2>
                    <p className="text-xs text-surface-400 mt-1">Imóveis no sistema que combinam com o perfil de busca</p>
                  </div>
                  <button onClick={loadOpportunities} className="btn btn-secondary btn-sm" disabled={loadingOpportunities}>
                    {loadingOpportunities ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
                    <span className="hidden sm:inline">Atualizar</span>
                  </button>
                </div>

                {!cliente.preferencia ? (
                  <div className="card flex flex-col items-center justify-center py-12 text-center border-dashed border-2 border-surface-700 bg-surface-900/50">
                    <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center mb-4">
                      <Target size={24} className="text-surface-400" />
                    </div>
                    <p className="text-surface-100 font-medium mb-1">Perfil de busca incompleto</p>
                    <p className="text-sm text-surface-400 max-w-sm mb-6">Preencha os critérios de busca para que o sistema encontre imóveis compatíveis.</p>
                    <Link href={`/clientes/${id}/editar`} className="btn btn-primary">
                      <Edit2 size={16} /> Preencher perfil
                    </Link>
                  </div>
                ) : loadingOpportunities ? (
                  <div className="flex flex-col gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="skeleton rounded-2xl" style={{ height: "160px" }} />
                    ))}
                  </div>
                ) : opportunities.length === 0 ? (
                  <div className="card py-12 text-center border-dashed border-2 border-surface-700 bg-surface-900/50">
                    <p className="text-surface-200 font-medium">Nenhuma oportunidade encontrada no momento.</p>
                    <p className="text-sm text-surface-400 mt-1">Ajuste o perfil de busca do cliente para ampliar os resultados.</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-0" style={{ borderRadius: "16px", overflow: "hidden", border: "1px solid var(--color-surface-700)" }}>
                    {opportunities.map((prop, idx) => (
                      <div
                        key={prop.id}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0,
                          backgroundColor: "var(--color-surface-900)",
                          borderBottom: idx < opportunities.length - 1 ? "1px solid var(--color-surface-800)" : "none",
                          transition: "background 0.15s",
                          padding: "1.25rem",
                          alignItems: "flex-start",
                        }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = "var(--color-surface-800)")}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = "var(--color-surface-900)")}
                      >
                        <Link href={`/imoveis/${prop.id}`} style={{ flexShrink: 0, textDecoration: "none" }}>
                          <div style={{
                            width: "140px",
                            height: "110px",
                            borderRadius: "10px",
                            overflow: "hidden",
                            background: "linear-gradient(135deg, var(--color-surface-700), var(--color-surface-800))",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}>
                            <Home size={32} style={{ color: "var(--color-surface-600)" }} />
                          </div>
                        </Link>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <Link href={`/imoveis/${prop.id}`} style={{ textDecoration: "none" }}>
                            <h3 style={{
                              fontWeight: 700,
                              fontSize: "1rem",
                              color: "var(--color-surface-50)",
                              lineHeight: 1.3,
                              marginBottom: "0.5rem",
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}>
                              {prop.titulo}
                            </h3>
                          </Link>

                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.65rem", color: "var(--color-surface-400)", fontSize: "0.8rem" }}>
                            {prop.quartos != null && (
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Bed size={13} /> {prop.quartos}
                              </span>
                            )}
                            {prop.areaUtil != null && (
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Maximize size={13} /> {prop.areaUtil}m²
                              </span>
                            )}
                            {prop.vagasGaragem != null && (
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Car size={13} /> {prop.vagasGaragem}
                              </span>
                            )}
                            {prop.banheiros != null && (
                              <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                                <Bath size={13} /> {prop.banheiros}
                              </span>
                            )}
                          </div>

                          <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "var(--color-surface-50)", letterSpacing: "-0.5px", marginBottom: "0.5rem" }}>
                            {formatCurrency(prop.precoVenda)}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "0.8rem", color: "var(--color-surface-400)", display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              <MapPin size={12} />
                              {prop.cidade}{prop.bairro ? `, ${prop.bairro}` : ""}
                            </span>

                            <button
                              onClick={() => {
                                const msg = encodeURIComponent(`Olá! Tenho interesse no imóvel: ${prop.titulo} — ${formatCurrency(prop.precoVenda)}`);
                                window.open(`https://wa.me/?text=${msg}`, "_blank");
                              }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                padding: "0.4rem 1rem",
                                borderRadius: "999px",
                                border: "1.5px solid #f97316",
                                background: "transparent",
                                color: "#f97316",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                transition: "background 0.15s, color 0.15s",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "#f97316";
                                (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                              }}
                              onMouseLeave={e => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#f97316";
                              }}
                            >
                              <MessageCircle size={14} />
                              Chat
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modais ── */}
      {showInteractionModal && (
        <div className="modal-overlay" onClick={() => setShowInteractionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-surface-50">Registrar Interação</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInteractionModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row mb-3">
                <div className="form-group">
                  <label className="label">Tipo de Interação</label>
                  <select className="select" value={newInteraction.tipoInteracao}
                    onChange={(e) => setNewInteraction(i => ({ ...i, tipoInteracao: e.target.value }))}>
                    {INTERACTION_TYPES.map((t) => (
                      <option key={t} value={t}>{interactionTypeLabel(t)}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Data e Hora</label>
                  <input type="datetime-local" className="input" value={newInteraction.dataInteracao}
                    onChange={(e) => setNewInteraction(i => ({ ...i, dataInteracao: e.target.value }))} />
                </div>
              </div>

              <div className="form-group">
                <label className="label">Título *</label>
                <input type="text" className="input" placeholder="Ex: Ligação inicial, Visita ao Apt 302..." value={newInteraction.titulo}
                  onChange={(e) => setNewInteraction(i => ({ ...i, titulo: e.target.value }))} required />
              </div>

              <div className="form-group">
                <label className="label">Descrição</label>
                <textarea className="textarea" placeholder="Detalhes da interação..." value={newInteraction.descricao}
                  onChange={(e) => setNewInteraction(i => ({ ...i, descricao: e.target.value }))} />
              </div>

              <div className="form-group">
                <label className="label">Próximo Follow-up</label>
                <input type="datetime-local" className="input" value={newInteraction.proximoFollowUp}
                  onChange={(e) => setNewInteraction(i => ({ ...i, proximoFollowUp: e.target.value }))} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowInteractionModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addInteraction} disabled={saving || !newInteraction.titulo}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {showInterestModal && (
        <div className="modal-overlay" onClick={() => setShowInterestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold text-surface-50">Vincular Imóvel</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowInterestModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="label">Selecione o Imóvel</label>
                <select className="select" value={selectedPropertyId} onChange={(e) => setSelectedPropertyId(e.target.value)}>
                  <option value="">Selecione um imóvel...</option>
                  {imoveis.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.codigoInterno ? `[${p.codigoInterno}] ` : ""}{p.titulo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group mt-3">
                <label className="label">Status de Interesse</label>
                <select className="select" value={statusInteresse} onChange={(e) => setInterestStatus(e.target.value)}>
                  {["INTERESSADO", "APRESENTADO", "VISITADO", "FAVORITO", "REJEITADO", "EM_NEGOCIACAO"].map(s => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowInterestModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={addInterest} disabled={saving || !selectedPropertyId}>
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Vincular
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sub-componentes internos ── */

function InfoRow({ icon, cor, label, valor }: {
  icon: React.ReactNode;
  cor: string;
  label: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-700/50 transition-colors">
      <div className={`w-7 h-7 rounded-lg bg-surface-900 border border-surface-700 flex items-center justify-center shrink-0 ${cor}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-surface-500 font-medium uppercase tracking-wider">{label}</div>
        <div className="text-sm text-surface-100 font-medium truncate">{valor}</div>
      </div>
    </div>
  );
}

function QualRowBordered({ label, valor, destaque, badge, last }: {
  label: string;
  valor: string;
  destaque?: boolean;
  badge?: "success" | "warning" | "danger";
  last?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-3 py-2.5 ${!last ? "border-b border-surface-700/40" : ""}`}>
      <span className="text-xs text-surface-500 shrink-0">{label}</span>
      {badge ? (
        <span className={`badge badge-${badge} text-[10px]`}>{valor}</span>
      ) : (
        <span className={`text-xs font-medium text-right ${destaque ? "text-green-400" : "text-surface-200"}`}>{valor}</span>
      )}
    </div>
  );
}

function PrefRowBordered({ icon, label, valor }: {
  icon: React.ReactNode;
  label: string;
  valor: string;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 border-b border-surface-700/40 last:border-0">
      <span className="text-surface-500 shrink-0">{icon}</span>
      <span className="text-[10px] text-surface-500 uppercase tracking-wider shrink-0">{label}</span>
      <span className="text-xs text-surface-200 text-right flex-1 truncate">{valor}</span>
    </div>
  );
}
