"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Edit2, Phone, Mail, MapPin, Calendar, Star, MessageSquare,
  Home, Plus, Archive, Loader2, Clock, CheckCircle2, X, Save, Sparkles, TrendingUp, Bed, Ruler
} from "lucide-react";
import {
  journeyStageLabel, journeyStageColor, urgencyLabel, formatDate,
  formatDateTime, leadSourceLabel, formatCurrency, propertyTypeLabel,
  interactionTypeLabel
} from "@/lib/utils";

interface ClientDetail {
  id: string;
  nomeCompleto: string;
  telefone: string;
  email: string | null;
  document: string | null;
  cidadeAtual: string | null;
  origemLead: string;
  status: string;
  estagioJornada: string;
  objetivoCompra: string | null;
  formaPagamento: string | null;
  nivelUrgencia: string;
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
    imovel: { id: string; titulo: string; tipoImovel: string; preco: number; cidade: string; bairro: string | null };
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

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [cliente, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"timeline" | "imoveis" | "oportunidades" | "perfil">("timeline");
  const [opportunities, setOpportunities] = useState<{
    id: string;
    titulo: string;
    tipoImovel: string;
    preco: number;
    cidade: string;
    bairro: string | null;
    quartos: number | null;
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
  const [imoveis, setProperties] = useState<{id: string, titulo: string, codigoInterno: string | null}[]>([]);
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

  async function archiveClient() {
    if (!confirm("Deseja arquivar este cliente?")) return;
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
    await fetch(`/api/clientes/${id}/interesses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imovelId: selectedPropertyId, statusInteresse }),
    });
    setSaving(false);
    setShowInterestModal(false);
    setSelectedPropertyId("");
    await loadClient();
  }

  if (loading) {
    return (
      <div className="page">
        <div className="skeleton" style={{ height: "200px", borderRadius: "12px" }} />
      </div>
    );
  }

  if (!cliente) return null;

  const tabs = [
    { id: "timeline", label: `Timeline (${cliente.interacoes.length})` },
    { id: "imoveis", label: `Imóveis (${cliente.interesses.length})` },
    { id: "oportunidades", label: `Oportunidades` },
    { id: "perfil", label: "Perfil de Busca" },
  ] as const;

  async function loadOpportunities() {
    setLoadingOpportunities(true);
    const res = await fetch(`/api/clientes/${id}/opportunities`);
    if (res.ok) {
      const data = await res.json();
      setOpportunities(data.opportunities || []);
    }
    setLoadingOpportunities(false);
  }

  return (
    <div className="page" style={{ maxWidth: "900px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <Link href="/clientes" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div style={{ flex: 1 }}>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
              {cliente.nomeCompleto}
            </h1>
            <span className={`badge ${journeyStageColor(cliente.estagioJornada)}`}>
              {journeyStageLabel(cliente.estagioJornada)}
            </span>
            {cliente.nivelUrgencia === "ALTA" && (
              <span className="badge badge-danger">Urgente</span>
            )}
          </div>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.85rem", marginTop: "4px" }}>
            Cadastrado em {formatDate(cliente.criadoEm)} · {leadSourceLabel(cliente.origemLead)}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/clientes/${id}/editar`} className="btn btn-secondary btn-sm">
            <Edit2 size={14} />
            Editar
          </Link>
          <button className="btn btn-danger btn-sm" onClick={archiveClient}>
            <Archive size={14} />
            Arquivar
          </button>
        </div>
      </div>

      {/* Contact card */}
      <div className="card mb-5">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(100,112,243,0.15)" }}>
              <Phone size={18} style={{ color: "var(--color-brand-400)" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Telefone</div>
              <div className="font-medium" style={{ color: "var(--color-surface-100)" }}>{cliente.telefone}</div>
            </div>
          </div>
          {cliente.email && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
                <Mail size={18} style={{ color: "#22c55e" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>E-mail</div>
                <div className="font-medium" style={{ color: "var(--color-surface-100)", wordBreak: "break-all" }}>{cliente.email}</div>
              </div>
            </div>
          )}
          {cliente.cidadeAtual && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)" }}>
                <MapPin size={18} style={{ color: "#f59e0b" }} />
              </div>
              <div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Cidade Atual</div>
                <div className="font-medium" style={{ color: "var(--color-surface-100)" }}>{cliente.cidadeAtual}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(239,68,68,0.15)" }}>
              <Clock size={18} style={{ color: "#ef4444" }} />
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)" }}>Urgência</div>
              <div className="font-medium" style={{ color: "var(--color-surface-100)" }}>{urgencyLabel(cliente.nivelUrgencia)}</div>
            </div>
          </div>
        </div>

        {/* Journey stage selector */}
        <div className="mt-4 pt-4" style={{ borderTop: "1px solid var(--color-surface-700)" }}>
          <div className="flex items-center justify-between mb-3">
            <span style={{ fontSize: "0.8rem", color: "var(--color-surface-400)", fontWeight: 500 }}>ESTÁGIO DA JORNADA</span>
            <button className="btn btn-ghost btn-sm" onClick={() => setEditingStage(!editingStage)}>
              {editingStage ? <X size={14} /> : <Edit2 size={14} />}
            </button>
          </div>
          {editingStage ? (
            <div className="chip-group">
              {JOURNEY_STAGES.map((s) => (
                <button
                  key={s}
                  className={`chip ${cliente.estagioJornada === s ? "selected" : ""}`}
                  onClick={() => updateStage(s)}
                  disabled={saving}
                >
                  {journeyStageLabel(s)}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {JOURNEY_STAGES.map((s, i) => (
                <div
                  key={s}
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                    background: cliente.estagioJornada === s ? "rgba(100,112,243,0.2)" : "var(--color-surface-900)",
                    color: cliente.estagioJornada === s ? "var(--color-brand-300)" : "var(--color-surface-500)",
                    border: `1px solid ${cliente.estagioJornada === s ? "var(--color-brand-600)" : "var(--color-surface-700)"}`,
                  }}
                >
                  {i + 1}. {journeyStageLabel(s)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {cliente.observacoes && (
        <div className="card mb-5" style={{ borderLeft: "3px solid var(--color-brand-600)" }}>
          <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "0.5rem", fontWeight: 500 }}>OBSERVAÇÕES</div>
          <p style={{ color: "var(--color-surface-200)", lineHeight: 1.6, fontSize: "0.9rem" }}>{cliente.observacoes}</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--color-surface-800)", display: "inline-flex" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === "oportunidades" && opportunities.length === 0) {
                loadOpportunities();
              }
            }}
            className="btn"
            style={{
              background: activeTab === tab.id ? "var(--color-surface-600)" : "transparent",
              color: activeTab === tab.id ? (tab.id === "oportunidades" ? "#a78bfa" : "var(--color-surface-50)") : "var(--color-surface-400)",
              padding: "0.4rem 1rem",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            {tab.id === "oportunidades" && <Sparkles size={13} />}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Timeline */}
      {activeTab === "timeline" && (
        <div>
          <div className="section-header">
            <h2 className="section-titulo">Histórico de Interações</h2>
            <button className="btn btn-primary btn-sm" onClick={() => setShowInteractionModal(true)}>
              <Plus size={14} />
              Registrar Interação
            </button>
          </div>

          {cliente.interacoes.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <MessageSquare size={40} />
                <p>Nenhuma interação registrada ainda</p>
                <button className="btn btn-primary mt-3" onClick={() => setShowInteractionModal(true)}>
                  <Plus size={14} />
                  Registrar primeira interação
                </button>
              </div>
            </div>
          ) : (
            <div style={{ position: "relative" }}>
              {cliente.interacoes.map((interacao, i) => {
                const Icon = interactionIcons[interacao.tipoInteracao] || interactionIcons.DEFAULT;
                return (
                  <div key={interacao.id} className="timeline-item mb-4">
                    {i < cliente.interacoes.length - 1 && <div className="timeline-line" />}
                    <div className="timeline-dot">
                      <Icon size={16} style={{ color: "var(--color-brand-400)" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="card card-sm">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div>
                            <span className="badge badge-secondary" style={{ fontSize: "0.7rem", marginBottom: "0.25rem" }}>
                              {interactionTypeLabel(interacao.tipoInteracao)}
                            </span>
                            <div className="font-medium text-sm" style={{ color: "var(--color-surface-100)" }}>
                              {interacao.titulo}
                            </div>
                          </div>
                          <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", flexShrink: 0 }}>
                            {formatDateTime(interacao.dataInteracao)}
                          </div>
                        </div>
                        {interacao.descricao && (
                          <p style={{ color: "var(--color-surface-300)", fontSize: "0.85rem", lineHeight: 1.5 }}>
                            {interacao.descricao}
                          </p>
                        )}
                        {interacao.proximoFollowUp && (
                          <div className="flex items-center gap-1 mt-2" style={{ color: "#f59e0b", fontSize: "0.8rem" }}>
                            <Clock size={12} />
                            Follow-up: {formatDate(interacao.proximoFollowUp)}
                          </div>
                        )}
                        {interacao.imovel && (
                          <Link href={`/imoveis/${interacao.imovel.id}`} style={{ textDecoration: "none" }}>
                            <div className="flex items-center gap-1 mt-2" style={{ color: "var(--color-brand-400)", fontSize: "0.8rem" }}>
                              <Home size={12} />
                              {interacao.imovel.titulo}
                            </div>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Interests (Properties) */}
      {activeTab === "imoveis" && (
        <div>
          <div className="section-header">
            <h2 className="section-titulo">Imóveis de Interesse</h2>
            <button onClick={() => setShowInterestModal(true)} className="btn btn-primary btn-sm">
              <Plus size={14} />
              Vincular Imóvel
            </button>
          </div>

          {cliente.interesses.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Home size={40} />
                <p>Nenhum imóvel vinculado ainda</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {cliente.interesses.map((interesse) => (
                <div key={interesse.id} className="card card-sm" style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2 mb-1">
                      <Link href={`/imoveis/${interesse.imovel.id}`} style={{ textDecoration: "none", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-surface-50)" }}>
                        {interesse.imovel.titulo}
                      </Link>
                      {interesse.ehFavorito && <Star size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />}
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "var(--color-surface-400)" }}>
                      {propertyTypeLabel(interesse.imovel.tipoImovel)} · {interesse.imovel.cidade}
                      {interesse.imovel.bairro && ` · ${interesse.imovel.bairro}`}
                    </div>
                    {interesse.feedback && (
                      <p style={{ fontSize: "0.8rem", color: "var(--color-surface-300)", marginTop: "0.5rem" }}>
                        💬 {interesse.feedback}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold" style={{ color: "#22c55e" }}>
                      {formatCurrency(interesse.imovel.preco)}
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: "0.7rem" }}>
                      {interesse.statusInteresse}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Opportunities */}
      {activeTab === "oportunidades" && (
        <div>
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <div>
              <h2 className="section-titulo">Oportunidades</h2>
              <p style={{ fontSize: "0.8rem", color: "var(--color-surface-400)", marginTop: "2px" }}>
                Imóveis disponíveis que combinam com o perfil de busca deste cliente
              </p>
            </div>
            <button onClick={loadOpportunities} className="btn btn-secondary btn-sm" disabled={loadingOpportunities}>
              {loadingOpportunities ? <Loader2 size={14} className="animate-spin" /> : <TrendingUp size={14} />}
              Atualizar
            </button>
          </div>

          {!cliente.preferencia ? (
            <div className="card">
              <div className="empty-state">
                <Sparkles size={40} />
                <p style={{ fontWeight: 600 }}>Perfil de busca não preenchido</p>
                <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Preencha o Perfil de Busca do cliente para ver as oportunidades mais adequadas.</p>
                <Link href={`/clientes/${id}/editar`} className="btn btn-primary mt-3">
                  <Plus size={14} />
                  Preencher perfil
                </Link>
              </div>
            </div>
          ) : loadingOpportunities ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[1,2,3].map(i => (
                <div key={i} className="skeleton" style={{ height: "88px", borderRadius: "12px" }} />
              ))}
            </div>
          ) : opportunities.length === 0 ? (
            <div className="card">
              <div className="empty-state">
                <Home size={40} />
                <p style={{ fontWeight: 600 }}>Nenhuma oportunidade encontrada</p>
                <p style={{ fontSize: "0.85rem", marginTop: "4px" }}>Não há imóveis disponíveis que correspondam aos critérios de busca agora.</p>
              </div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {opportunities.map((prop) => (
                <div key={prop.id} className="card card-sm"
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    borderLeft: "3px solid #7c3aed",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "10px",
                      background: "rgba(139,92,246,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Home size={20} style={{ color: "#a78bfa" }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Link
                      href={`/imoveis/${prop.id}`}
                      style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--color-surface-50)", textDecoration: "none" }}
                    >
                      {prop.codigoInterno && (
                        <span style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginRight: "0.5rem" }}>[{prop.codigoInterno}]</span>
                      )}
                      {prop.titulo}
                    </Link>
                    <div style={{ display: "flex", gap: "1rem", marginTop: "4px", flexWrap: "wrap" }}>
                      <span style={{ fontSize: "0.78rem", color: "var(--color-surface-400)" }}>
                        <MapPin size={11} style={{ display: "inline", marginRight: "2px" }} />
                        {prop.cidade}{prop.bairro && ` · ${prop.bairro}`}
                      </span>
                      {prop.quartos && (
                        <span style={{ fontSize: "0.78rem", color: "var(--color-surface-400)" }}>
                          <Bed size={11} style={{ display: "inline", marginRight: "2px" }} />
                          {prop.quartos} qts
                        </span>
                      )}
                      {prop.areaUtil && (
                        <span style={{ fontSize: "0.78rem", color: "var(--color-surface-400)" }}>
                          <Ruler size={11} style={{ display: "inline", marginRight: "2px" }} />
                          {prop.areaUtil}m²
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontWeight: 700, color: "#22c55e", fontSize: "0.9rem" }}>
                      {formatCurrency(prop.preco)}
                    </div>
                    <span className="badge badge-secondary" style={{ fontSize: "0.7rem", marginTop: "4px" }}>
                      {propertyTypeLabel(prop.tipoImovel)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Preference profile */}
      {activeTab === "perfil" && (
        <div className="card">
          <div className="section-header">
            <h2 className="section-titulo">Perfil de Busca</h2>
            <Link href={`/clientes/${id}/editar`} className="btn btn-secondary btn-sm">
              <Edit2 size={14} />
              Editar
            </Link>
          </div>
          {!cliente.preferencia ? (
            <div className="empty-state">
              <p>Perfil de busca não preenchido ainda</p>
              <Link href={`/clientes/${id}/editar`} className="btn btn-primary mt-3">
                <Plus size={14} />
                Preencher perfil
              </Link>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
              {cliente.preferencia.tipoImovel && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Tipo de Imóvel</div>
                  <div style={{ color: "var(--color-surface-100)" }}>{propertyTypeLabel(cliente.preferencia.tipoImovel)}</div>
                </div>
              )}
              {(cliente.preferencia.precoMinimo || cliente.preferencia.precoMaximo) && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Faixa de Preço</div>
                  <div style={{ color: "var(--color-surface-100)" }}>
                    {cliente.preferencia.precoMinimo ? formatCurrency(cliente.preferencia.precoMinimo) : "–"}
                    {" até "}
                    {cliente.preferencia.precoMaximo ? formatCurrency(cliente.preferencia.precoMaximo) : "–"}
                  </div>
                </div>
              )}
              {cliente.preferencia.cidadeInteresse && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Cidade de Interesse</div>
                  <div style={{ color: "var(--color-surface-100)" }}>{cliente.preferencia.cidadeInteresse}</div>
                </div>
              )}
              {cliente.preferencia.minQuartos && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Quartos (mín.)</div>
                  <div style={{ color: "var(--color-surface-100)" }}>{cliente.preferencia.minQuartos}</div>
                </div>
              )}
              {cliente.preferencia.areaMinima && (
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Área Mínima</div>
                  <div style={{ color: "var(--color-surface-100)" }}>{cliente.preferencia.areaMinima}m²</div>
                </div>
              )}
              {cliente.preferencia.notasPessoais && (
                 <div style={{ gridColumn: "1 / -1" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-surface-400)", marginBottom: "4px" }}>Notas Pessoais</div>
                  <div style={{ color: "var(--color-surface-100)", lineHeight: 1.5 }}>{cliente.preferencia.notasPessoais}</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Add Interacao Modal */}
      {showInteractionModal && (
        <div className="modal-overlay" onClick={() => setShowInteractionModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold" style={{ color: "var(--color-surface-50)" }}>Registrar Interação</h3>
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

      {/* Add Interest Modal */}
      {showInterestModal && (
        <div className="modal-overlay" onClick={() => setShowInterestModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-semibold" style={{ color: "var(--color-surface-50)" }}>Vincular Imóvel</h3>
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
