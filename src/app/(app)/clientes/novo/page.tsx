"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { maskTelefone, maskCPF } from "@/lib/utils";

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

const LEAD_TEMPERATURES = [
  { value: "QUENTE", label: "🔥 Quente" },
  { value: "MORNO", label: "🌤️ Morno" },
  { value: "FRIO", label: "❄️ Frio" },
];

const CIVIL_STATUS = [
  { value: "SOLTEIRO", label: "Solteiro(a)" },
  { value: "CASADO", label: "Casado(a)" },
  { value: "DIVORCIADO", label: "Divorciado(a)" },
  { value: "VIUVO", label: "Viúvo(a)" },
  { value: "UNIAO_ESTAVEL", label: "União Estável" },
  { value: "OUTRO", label: "Outro" },
];

const PRAZO_COMPRA = [
  { value: "ATE_30_DIAS", label: "Até 30 dias" },
  { value: "ATE_3_MESES", label: "Até 3 meses" },
  { value: "ATE_6_MESES", label: "Até 6 meses" },
  { value: "ATE_1_ANO", label: "Até 1 ano" },
  { value: "SEM_PRAZO", label: "Sem prazo definido" },
];

const PRE_APROVACAO = [
  { value: "SIM", label: "Sim" },
  { value: "NAO", label: "Não" },
  { value: "EM_ANALISE", label: "Em Análise" },
];

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"basic" | "journey" | "profile">("basic");
  const [form, setForm] = useState({
    // Dados Básicos
    nomeCompleto: "",
    telefone: "",
    whatsapp: "",
    email: "",
    document: "",
    dataNascimento: "",
    estadoCivil: "",
    temFilhos: "",
    profissao: "",
    rendaMensal: "",
    cidadeAtual: "",
    origemLead: "INDICACAO",
    responsavel: "",
    // Jornada / Status
    estagioJornada: "NOVO_LEAD",
    temperaturaLead: "MORNO",
    objetivoCompra: "",
    formaPagamento: "",
    nivelUrgencia: "MEDIA",
    prazoCompra: "",
    budgetMaximo: "",
    possuiImovelVender: "",
    preAprovacaoCredito: "NAO",
    proximoContato: "",
    observacoes: "",
  });

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const payload: Record<string, unknown> = {
      nomeCompleto: form.nomeCompleto,
      telefone: form.telefone,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      documento: form.document || undefined,
      dataNascimento: form.dataNascimento || undefined,
      estadoCivil: form.estadoCivil || undefined,
      temFilhos: form.temFilhos === "true" ? true : form.temFilhos === "false" ? false : undefined,
      profissao: form.profissao || undefined,
      rendaMensal: form.rendaMensal ? parseFloat(form.rendaMensal.replace(/\D/g, "")) / 100 : undefined,
      cidadeAtual: form.cidadeAtual || undefined,
      origemLead: form.origemLead || undefined,
      responsavel: form.responsavel || undefined,
      estagioJornada: form.estagioJornada || undefined,
      temperaturaLead: form.temperaturaLead || undefined,
      objetivoCompra: form.objetivoCompra || undefined,
      formaPagamento: form.formaPagamento || undefined,
      nivelUrgencia: form.nivelUrgencia || undefined,
      prazoCompra: form.prazoCompra || undefined,
      budgetMaximo: form.budgetMaximo ? parseFloat(form.budgetMaximo.replace(/\D/g, "")) / 100 : undefined,
      possuiImovelVender: form.possuiImovelVender === "true",
      preAprovacaoCredito: form.preAprovacaoCredito || undefined,
      proximoContato: form.proximoContato || undefined,
      observacoes: form.observacoes || undefined,
    };

    const res = await fetch("/api/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Erro ao cadastrar cliente.");
      return;
    }

    router.push(`/clientes/${data.id}`);
  }

  function maskCurrency(value: string) {
    const digits = value.replace(/\D/g, "");
    const num = parseInt(digits || "0");
    return (num / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  const tabs = [
    { id: "basic", label: "Dados Básicos" },
    { id: "journey", label: "Jornada/Status" },
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
        {/* ─── ABA: DADOS BÁSICOS ─── */}
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
                  onChange={(e) => update("telefone", maskTelefone(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="whatsapp">WhatsApp</label>
                <input
                  id="whatsapp"
                  type="tel"
                  className="input"
                  placeholder="(11) 99999-9999"
                  value={form.whatsapp}
                  onChange={(e) => update("whatsapp", maskTelefone(e.target.value))}
                />
              </div>
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="document">CPF</label>
                <input
                  id="document"
                  type="text"
                  className="input"
                  placeholder="000.000.000-00"
                  value={form.document}
                  onChange={(e) => update("document", maskCPF(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="dataNascimento">Data de Nascimento</label>
                <input
                  id="dataNascimento"
                  type="date"
                  className="input"
                  value={form.dataNascimento}
                  onChange={(e) => update("dataNascimento", e.target.value)}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="estadoCivil">Estado Civil</label>
                <select id="estadoCivil" className="select" value={form.estadoCivil} onChange={(e) => update("estadoCivil", e.target.value)}>
                  <option value="">Selecionar...</option>
                  {CIVIL_STATUS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="temFilhos">Tem Filhos?</label>
                <select id="temFilhos" className="select" value={form.temFilhos} onChange={(e) => update("temFilhos", e.target.value)}>
                  <option value="">Selecionar...</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="profissao">Profissão</label>
                <input
                  id="profissao"
                  type="text"
                  className="input"
                  placeholder="Ex: Engenheiro, Médico..."
                  value={form.profissao}
                  onChange={(e) => update("profissao", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="rendaMensal">Renda Mensal</label>
                <input
                  id="rendaMensal"
                  type="text"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.rendaMensal}
                  onChange={(e) => update("rendaMensal", maskCurrency(e.target.value))}
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

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="responsavel">Responsável / Corretor</label>
                <input
                  id="responsavel"
                  type="text"
                  className="input"
                  placeholder="Nome do corretor responsável"
                  value={form.responsavel}
                  onChange={(e) => update("responsavel", e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── ABA: JORNADA / STATUS ─── */}
        {activeTab === "journey" && (
          <div className="card">
            <h2 className="section-titulo mb-4">Jornada e Status</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="estagioJornada">Estágio da Jornada</label>
                <select id="estagioJornada" className="select" value={form.estagioJornada} onChange={(e) => update("estagioJornada", e.target.value)}>
                  {JOURNEY_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="temperaturaLead">Temperatura do Lead</label>
                <select id="temperaturaLead" className="select" value={form.temperaturaLead} onChange={(e) => update("temperaturaLead", e.target.value)}>
                  {LEAD_TEMPERATURES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="nivelUrgencia">Urgência</label>
                <select id="nivelUrgencia" className="select" value={form.nivelUrgencia} onChange={(e) => update("nivelUrgencia", e.target.value)}>
                  {URGENCY_LEVELS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="prazoCompra">Prazo para Compra</label>
                <select id="prazoCompra" className="select" value={form.prazoCompra} onChange={(e) => update("prazoCompra", e.target.value)}>
                  <option value="">Selecionar...</option>
                  {PRAZO_COMPRA.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
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

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="budgetMaximo">Budget / Valor Máximo</label>
                <input
                  id="budgetMaximo"
                  type="text"
                  className="input"
                  placeholder="R$ 0,00"
                  value={form.budgetMaximo}
                  onChange={(e) => update("budgetMaximo", maskCurrency(e.target.value))}
                />
              </div>
              <div className="form-group">
                <label className="label" htmlFor="preAprovacaoCredito">Pré-aprovação de Crédito</label>
                <select id="preAprovacaoCredito" className="select" value={form.preAprovacaoCredito} onChange={(e) => update("preAprovacaoCredito", e.target.value)}>
                  {PRE_APROVACAO.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label" htmlFor="possuiImovelVender">Possui Imóvel para Vender?</label>
                <select id="possuiImovelVender" className="select" value={form.possuiImovelVender} onChange={(e) => update("possuiImovelVender", e.target.value)}>
                  <option value="">Selecionar...</option>
                  <option value="true">Sim</option>
                  <option value="false">Não</option>
                </select>
              </div>
              <div className="form-group">
                <label className="label" htmlFor="proximoContato">Próximo Contato Agendado</label>
                <input
                  id="proximoContato"
                  type="datetime-local"
                  className="input"
                  value={form.proximoContato}
                  onChange={(e) => update("proximoContato", e.target.value)}
                />
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

        {/* ─── ABA: PERFIL DE BUSCA ─── */}
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
