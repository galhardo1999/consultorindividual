"use cliente";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";

const LEAD_SOURCES = [
  { value: "INDICACAO", label: "Indicação" },
  { value: "PORTAL_IMOBILIARIO", label: "Portal Imobiliário" },
  { value: "REDES_SOCIAIS", label: "Redes Sociais" },
  { value: "WHATSAPP", label: "WhatsApp" },
  { value: "SITE_PROPRIO", label: "Site Próprio" },
  { value: "CAPTACAO_ATIVA", label: "Captação Ativa" },
  { value: "EVENTO", label: "Evento" },
  { value: "OUTRO", label: "Outro" },
];

const JOURNEY_STAGES = [
  { value: "NOVO_LEAD", label: "Novo Lead" },
  { value: "EM_QUALIFICACAO", label: "Em Qualificação" },
  { value: "BUSCANDO_OPCOES", label: "Buscando Opções" },
  { value: "VISITANDO_IMOVEIS", label: "Visitando Imóveis" },
  { value: "NEGOCIANDO", label: "Negociando" },
  { value: "PROPOSTA_ENVIADA", label: "Proposta Enviada" },
  { value: "FECHADO", label: "Fechado" },
  { value: "PERDIDO", label: "Perdido" },
  { value: "PAUSADO", label: "Pausado" },
];

const PURCHASE_GOALS = [
  { value: "MORADIA_PROPRIA", label: "Moradia Própria" },
  { value: "INVESTIMENTO", label: "Investimento" },
  { value: "LOCACAO", label: "Locação" },
  { value: "VERANEIO", label: "Veraneio" },
  { value: "OUTRO", label: "Outro" },
];

const PAYMENT_METHODS = [
  { value: "FINANCIAMENTO", label: "Financiamento" },
  { value: "PERMUTA", label: "Permuta" },
  { value: "VISTA", label: "À Vista" },
  { value: "MISTO", label: "Misto" },
  { value: "A_DEFINIR", label: "A Definir" },
];

const URGENCY_LEVELS = [
  { value: "ALTA", label: "Alta" },
  { value: "MEDIA", label: "Média" },
  { value: "BAIXA", label: "Baixa" },
  { value: "SEM_URGENCIA", label: "Sem Urgência" },
];

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "profile">("basic");
  const [form, setForm] = useState({
    nomeCompleto: "",
    telefone: "",
    email: "",
    document: "",
    cidadeAtual: "",
    origemLead: "INDICACAO",
    estagioJornada: "NOVO_LEAD",
    objetivoCompra: "",
    formaPagamento: "",
    nivelUrgencia: "MEDIA",
    observacoes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar cliente.");
      return;
    }

    router.push(`/clientes/${data.id}`);
  }

  const tabs = [
    { id: "basic", label: "Dados Básicos" },
    { id: "profile", label: "Perfil de Busca" },
  ] as const;

  return (
    <div className="page" style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/clientes" className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
            Novo Cliente
          </h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            Preencha as informações do novo cliente
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--color-surface-800)", display: "inline-flex" }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="btn"
            style={{
              background: activeTab === tab.id ? "var(--color-surface-600)" : "transparent",
              color: activeTab === tab.id ? "var(--color-surface-50)" : "var(--color-surface-400)",
              padding: "0.4rem 1rem",
              fontSize: "0.875rem",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === "basic" && (
          <div className="card">
            <h2 className="section-titulo mb-4">Informações de Contato</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="nomeCompleto">Nome Completo *</label>
                <input
                  id="nomeCompleto"
                  type="text"
                  className="input"
                  placeholder="Nome do cliente"
                  value={form.nomeCompleto}
                  onChange={(e) => update("nomeCompleto", e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="telefone">Telefone *</label>
                <input
                  id="telefone"
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                  value={form.telefone}
                  onChange={(e) => update("telefone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="email">E-mail</label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="email@exemplo.com"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="document">CPF</label>
                <input
                  id="document"
                  type="text"
                  className="input"
                  placeholder="000.000.000-00"
                  value={form.document}
                  onChange={(e) => update("document", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="cidadeAtual">Cidade Atual</label>
                <input
                  id="cidadeAtual"
                  type="text"
                  className="input"
                  placeholder="São Paulo"
                  value={form.cidadeAtual}
                  onChange={(e) => update("cidadeAtual", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="origemLead">Origem do Lead</label>
                <select id="origemLead" className="select" value={form.origemLead} onChange={(e) => update("origemLead", e.target.value)}>
                  {LEAD_SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
            </div>

            <hr className="divider" />
            <h2 className="section-titulo mb-4">Jornada e Status</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="estagioJornada">Estágio da Jornada</label>
                <select id="estagioJornada" className="select" value={form.estagioJornada} onChange={(e) => update("estagioJornada", e.target.value)}>
                  {JOURNEY_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="nivelUrgencia">Urgência</label>
                <select id="nivelUrgencia" className="select" value={form.nivelUrgencia} onChange={(e) => update("nivelUrgencia", e.target.value)}>
                  {URGENCY_LEVELS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="objetivoCompra">Objetivo da Compra</label>
                <select id="objetivoCompra" className="select" value={form.objetivoCompra} onChange={(e) => update("objetivoCompra", e.target.value)}>
                  <option value="">Selecionar...</option>
                  {PURCHASE_GOALS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="formaPagamento">Forma de Pagamento</label>
                <select id="formaPagamento" className="select" value={form.formaPagamento} onChange={(e) => update("formaPagamento", e.target.value)}>
                  <option value="">Selecionar...</option>
                  {PAYMENT_METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label" htmlFor="observacoes">Observações</label>
              <textarea
                id="observacoes"
                className="textarea"
                placeholder="Contexto inicial do atendimento, observações importantes..."
                value={form.observacoes}
                onChange={(e) => update("observacoes", e.target.value)}
              />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="card">
            <h2 className="section-titulo mb-4">Perfil de Busca</h2>
            <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem", marginBottom: "1.25rem" }}>
              Essas informações serão salvas após criar o cliente. Você poderá editá-las no perfil completo.
            </p>
            <div className="empty-state" style={{ padding: "2rem" }}>
              <p>Salve o cliente primeiro, depois preencha o perfil detalhado de busca no cadastro completo.</p>
            </div>
          </div>
        )}

        {error && (
          <div className="toast toast-error mt-4" style={{ position: "static", minWidth: "unset", animation: "none" }}>
            <span style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <Link href="/clientes" className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={loading} id="save-cliente-btn">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {loading ? "Salvando..." : "Salvar Cliente"}
          </button>
        </div>
      </form>
    </div>
  );
}
