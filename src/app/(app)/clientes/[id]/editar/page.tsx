"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { maskTelefone, maskCPF } from "@/lib/utils";

import { 
  PROPERTY_TYPES, 
  LEAD_SOURCES, 
  JOURNEY_STAGES, 
  PURCHASE_GOALS, 
  PAYMENT_METHODS, 
  URGENCY_LEVELS, 
  CIVIL_STATUS, 
  PRAZO_COMPRA, 
  PRE_APROVACAO 
} from "@/constants/options";

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    // Jornada / Status
    estagioJornada: "NOVO_LEAD",
    objetivoCompra: "",
    formaPagamento: "",
    nivelUrgencia: "MEDIA",
    prazoCompra: "",
    budgetMaximo: "",
    preAprovacaoCredito: "NAO",
    proximoContato: "",
    observacoes: "",
    // Perfil de Busca
    tipoImovel: "",
    precoMinimo: "",
    precoMaximo: "",
    cidadeInteresse: "",
    bairrosInteresse: "",
    minQuartos: "",
    areaMinima: "",
    aceitaFinanciamento: false,
    aceitaPermuta: false,
    notasPessoais: "",
  });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/clientes/${id}`);
        if (!res.ok) throw new Error("Erro ao carregar dados do cliente");
        const data = await res.json();
        
        setForm({
          nomeCompleto: data.nomeCompleto || "",
          telefone: maskTelefone(data.telefone || ""),
          whatsapp: maskTelefone(data.whatsapp || ""),
          email: data.email || "",
          document: maskCPF(data.documento || ""),
          dataNascimento: data.dataNascimento ? new Date(data.dataNascimento).toISOString().split("T")[0] : "",
          estadoCivil: data.estadoCivil || "",
          temFilhos: data.temFilhos === true ? "true" : data.temFilhos === false ? "false" : "",
          profissao: data.profissao || "",
          rendaMensal: data.rendaMensal ? maskCurrencyValue(data.rendaMensal) : "",
          cidadeAtual: data.cidadeAtual || "",
          origemLead: data.origemLead || "INDICACAO",
          estagioJornada: data.estagioJornada || "NOVO_LEAD",
          objetivoCompra: data.objetivoCompra || "",
          formaPagamento: data.formaPagamento || "",
          nivelUrgencia: data.nivelUrgencia || "MEDIA",
          prazoCompra: data.prazoCompra || "",
          budgetMaximo: data.budgetMaximo ? maskCurrencyValue(data.budgetMaximo) : "",
          preAprovacaoCredito: data.preAprovacaoCredito || "NAO",
          proximoContato: data.proximoContato ? new Date(data.proximoContato).toISOString().slice(0, 16) : "",
          observacoes: data.observacoes || "",
          // Perfil
          tipoImovel: data.preferencia?.tipoImovel || "",
          precoMinimo: data.preferencia?.precoMinimo ? maskCurrencyValue(data.preferencia.precoMinimo) : "",
          precoMaximo: data.preferencia?.precoMaximo ? maskCurrencyValue(data.preferencia.precoMaximo) : "",
          cidadeInteresse: data.preferencia?.cidadeInteresse || "",
          bairrosInteresse: data.preferencia?.bairrosInteresse || "",
          minQuartos: data.preferencia?.minQuartos?.toString() || "",
          areaMinima: data.preferencia?.areaMinima?.toString() || "",
          aceitaFinanciamento: data.preferencia?.aceitaFinanciamento || false,
          aceitaPermuta: data.preferencia?.aceitaPermuta || false,
          notasPessoais: data.preferencia?.notasPessoais || "",
        });
      } catch (err) {
        setError("Erro ao carregar dados.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  function update(field: string, value: any) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function maskCurrencyValue(value: number) {
    return (value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  function validateBasicTab() {
    if (!form.nomeCompleto.trim() || !form.telefone.trim()) {
      setError("Preencha os campos obrigatórios (*) para continuar.");
      return false;
    }
    setError("");
    return true;
  }

  function nextStep() {
    if (activeTab === "basic") {
      if (validateBasicTab()) setActiveTab("journey");
    } else if (activeTab === "journey") {
      setActiveTab("profile");
    }
  }

  function prevStep() {
    if (activeTab === "profile") setActiveTab("journey");
    else if (activeTab === "journey") setActiveTab("basic");
  }

  function goToTab(tabId: "basic" | "journey" | "profile") {
    if (tabId === "basic") setActiveTab("basic");
    if (tabId === "journey") {
      if (activeTab === "profile" || validateBasicTab()) setActiveTab("journey");
    }
    if (tabId === "profile") {
      if (validateBasicTab()) setActiveTab("profile");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (activeTab !== "profile") {
      nextStep();
      return;
    }

    setError("");
    setSaving(true);

    const payload: Record<string, unknown> = {
      nomeCompleto: form.nomeCompleto,
      telefone: form.telefone,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      documento: form.document || null,
      dataNascimento: form.dataNascimento || null,
      estadoCivil: form.estadoCivil || null,
      temFilhos: form.temFilhos === "true" ? true : form.temFilhos === "false" ? false : null,
      profissao: form.profissao || null,
      rendaMensal: form.rendaMensal ? parseFloat(form.rendaMensal.replace(/\D/g, "")) / 100 : null,
      cidadeAtual: form.cidadeAtual || null,
      origemLead: form.origemLead || null,
      estagioJornada: form.estagioJornada || null,
      objetivoCompra: form.objetivoCompra || null,
      formaPagamento: form.formaPagamento || null,
      nivelUrgencia: form.nivelUrgencia || null,
      prazoCompra: form.prazoCompra || null,
      budgetMaximo: form.budgetMaximo ? parseFloat(form.budgetMaximo.replace(/\D/g, "")) / 100 : null,
      preAprovacaoCredito: form.preAprovacaoCredito || null,
      proximoContato: form.proximoContato || null,
      observacoes: form.observacoes || null,
      preferencia: {
        tipoImovel: form.tipoImovel || null,
        precoMinimo: form.precoMinimo ? parseFloat(form.precoMinimo.replace(/\D/g, "")) / 100 : null,
        precoMaximo: form.precoMaximo ? parseFloat(form.precoMaximo.replace(/\D/g, "")) / 100 : null,
        cidadeInteresse: form.cidadeInteresse || null,
        bairrosInteresse: form.bairrosInteresse || null,
        minQuartos: form.minQuartos ? parseInt(form.minQuartos) : null,
        areaMinima: form.areaMinima ? parseFloat(form.areaMinima) : null,
        aceitaFinanciamento: form.aceitaFinanciamento,
        aceitaPermuta: form.aceitaPermuta,
        notasPessoais: form.notasPessoais || null,
      }
    };

    const res = await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Erro ao atualizar cliente.");
      return;
    }

    router.push(`/clientes/${id}`);
    router.refresh();
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

  if (loading) return <div className="page"><div className="skeleton h-64 rounded-xl" /></div>;

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/clientes/${id}`} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>
            Editar Cliente
          </h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            {form.nomeCompleto}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-lg" style={{ background: "var(--color-surface-800)", display: "inline-flex" }}>
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => goToTab(tab.id)}
            className="btn"
            style={{
              background: activeTab === tab.id ? "var(--color-surface-600)" : "transparent",
              color: activeTab === tab.id ? "var(--color-surface-50)" : "var(--color-surface-400)",
              padding: "0.4rem 1rem",
              fontSize: "0.875rem",
            }}
          >
            <span className="flex items-center gap-2">
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: "20px",
                height: "20px",
                borderRadius: "50%",
                background: activeTab === tab.id ? "var(--color-brand-500)" : "var(--color-surface-600)",
                color: activeTab === tab.id ? "white" : "var(--color-surface-300)",
                fontSize: "0.7rem",
                fontWeight: "bold"
              }}>
                {index + 1}
              </span>
              {tab.label}
            </span>
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
            <h2 className="section-titulo mb-4">Perfil de Busca Ideal</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="label">Tipo de Imóvel</label>
                <select className="select" value={form.tipoImovel} onChange={(e) => update("tipoImovel", e.target.value)}>
                  <option value="">Indiferente</option>
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Cidade de Interesse</label>
                <input type="text" className="input" placeholder="Ex: São Paulo" value={form.cidadeInteresse} onChange={(e) => update("cidadeInteresse", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Preço Mínimo</label>
                <input type="text" className="input" placeholder="R$ 0,00" value={form.precoMinimo} onChange={(e) => update("precoMinimo", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="label">Preço Máximo</label>
                <input type="text" className="input" placeholder="R$ 0,00" value={form.precoMaximo} onChange={(e) => update("precoMaximo", maskCurrency(e.target.value))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Quartos (mín.)</label>
                <input type="number" className="input" value={form.minQuartos} onChange={(e) => update("minQuartos", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Área mín. (m²)</label>
                <input type="number" className="input" value={form.areaMinima} onChange={(e) => update("areaMinima", e.target.value)} />
              </div>
            </div>

            <div className="flex gap-6 flex-wrap mt-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input type="checkbox" checked={form.aceitaFinanciamento} onChange={(e) => update("aceitaFinanciamento", e.target.checked)} />
                Necessita Financiamento
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input type="checkbox" checked={form.aceitaPermuta} onChange={(e) => update("aceitaPermuta", e.target.checked)} />
                Possui Permuta
              </label>
            </div>

            <div className="form-group">
              <label className="label">Anotações do Perfil</label>
              <textarea className="textarea" placeholder="Busca imóvel perto de metrô, andar alto..." value={form.notasPessoais} onChange={(e) => update("notasPessoais", e.target.value)} />
            </div>
          </div>
        )}

        {error && (
          <div className="toast toast-error mt-4" style={{ position: "static", minWidth: "unset", animation: "none" }}>
            <span style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}

        <div className="flex justify-between items-center mt-6">
          <div>
            {activeTab === "basic" ? (
              <Link href={`/clientes/${id}`} className="btn btn-secondary">
                Cancelar
              </Link>
            ) : (
              <button type="button" onClick={prevStep} className="btn btn-secondary">
                ← Voltar
              </button>
            )}
          </div>
          
          <div>
            {activeTab !== "profile" ? (
              <button type="button" onClick={nextStep} className="btn btn-primary">
                Continuar →
              </button>
            ) : (
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
