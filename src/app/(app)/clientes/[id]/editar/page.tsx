"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { maskTelefone, maskCPF, maskCurrency, parseCurrency } from "@/lib/utils";

// Same constants as create page
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

const PROPERTY_TYPES = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "CASA_CONDOMINIO", label: "Casa em Condomínio" },
  { value: "TERRENO", label: "Terreno" },
  { value: "OUTRO", label: "Outro" },
];

export default function EditarClientePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const [prefForm, setPrefForm] = useState({
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
    fetch(`/api/clientes/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nomeCompleto: data.nomeCompleto || "",
          telefone: maskTelefone(data.telefone || ""),
          email: data.email || "",
          document: maskCPF(data.document || ""),
          cidadeAtual: data.cidadeAtual || "",
          origemLead: data.origemLead || "INDICACAO",
          estagioJornada: data.estagioJornada || "NOVO_LEAD",
          objetivoCompra: data.objetivoCompra || "",
          formaPagamento: data.formaPagamento || "",
          nivelUrgencia: data.nivelUrgencia || "MEDIA",
          observacoes: data.observacoes || "",
        });
        
        if (data.preferencia) {
          setPrefForm({
            tipoImovel: data.preferencia.tipoImovel || "",
            precoMinimo: maskCurrency(data.preferencia.precoMinimo?.toString() || ""),
            precoMaximo: maskCurrency(data.preferencia.precoMaximo?.toString() || ""),
            cidadeInteresse: data.preferencia.cidadeInteresse || "",
            bairrosInteresse: data.preferencia.bairrosInteresse || "",
            minQuartos: data.preferencia.minQuartos?.toString() || "",
            areaMinima: data.preferencia.areaMinima?.toString() || "",
            aceitaFinanciamento: data.preferencia.aceitaFinanciamento || false,
            aceitaPermuta: data.preferencia.aceitaPermuta || false,
            notasPessoais: data.preferencia.notasPessoais || "",
          });
        }
        setLoading(false);
      });
  }, [id]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function updatePref(field: string, value: string | boolean) {
    setPrefForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/clientes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setSaving(false);
      setError("Erro ao atualizar cliente.");
      return;
    }

    // Save preferences
    const prefPayload = {
      ...prefForm,
      precoMinimo: prefForm.precoMinimo ? parseCurrency(prefForm.precoMinimo) : null,
      precoMaximo: prefForm.precoMaximo ? parseCurrency(prefForm.precoMaximo) : null,
      minQuartos: prefForm.minQuartos ? parseInt(prefForm.minQuartos) : null,
      areaMinima: prefForm.areaMinima ? parseFloat(prefForm.areaMinima) : null,
      tipoImovel: prefForm.tipoImovel || null,
    };

    await fetch(`/api/clientes/${id}/preferences`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prefPayload),
    });

    setSaving(false);
    router.push(`/clientes/${id}`);
    router.refresh();
  }

  const tabs = [
    { id: "basic", label: "Dados Básicos" },
    { id: "profile", label: "Perfil de Busca" },
  ] as const;

  if (loading) return <div className="page"><div className="skeleton" style={{ height: "400px" }}/></div>;

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
                <label className="label">Nome Completo *</label>
                <input type="text" className="input" value={form.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="label">Telefone *</label>
                <input type="tel" className="input" value={form.telefone} onChange={(e) => update("telefone", maskTelefone(e.target.value))} required />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">E-mail</label>
                <input type="email" className="input" value={form.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Cidade Atual</label>
                <input type="text" className="input" value={form.cidadeAtual} onChange={(e) => update("cidadeAtual", e.target.value)} />
              </div>
            </div>

            <hr className="divider" />
            <h2 className="section-titulo mb-4">Jornada e Status</h2>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Estágio da Jornada</label>
                <select className="select" value={form.estagioJornada} onChange={(e) => update("estagioJornada", e.target.value)}>
                  {JOURNEY_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Urgência</label>
                <select className="select" value={form.nivelUrgencia} onChange={(e) => update("nivelUrgencia", e.target.value)}>
                  {URGENCY_LEVELS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="label">Observações</label>
              <textarea className="textarea" value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} />
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="card">
            <h2 className="section-titulo mb-4">Perfil de Busca Ideal</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label className="label">Tipo de Imóvel</label>
                <select className="select" value={prefForm.tipoImovel} onChange={(e) => updatePref("tipoImovel", e.target.value)}>
                  <option value="">Indiferente</option>
                  {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Cidade de Interesse</label>
                <input type="text" className="input" placeholder="Ex: São Paulo" value={prefForm.cidadeInteresse} onChange={(e) => updatePref("cidadeInteresse", e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Preço Mínimo</label>
                <input type="text" className="input" placeholder="R$ 0,00" value={prefForm.precoMinimo} onChange={(e) => updatePref("precoMinimo", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="label">Preço Máximo</label>
                <input type="text" className="input" placeholder="R$ 0,00" value={prefForm.precoMaximo} onChange={(e) => updatePref("precoMaximo", maskCurrency(e.target.value))} />
              </div>
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label className="label">Quartos (mín.)</label>
                <input type="number" className="input" value={prefForm.minQuartos} onChange={(e) => updatePref("minQuartos", e.target.value)} />
              </div>
              <div className="form-group">
                <label className="label">Área mín. (m²)</label>
                <input type="number" className="input" value={prefForm.areaMinima} onChange={(e) => updatePref("areaMinima", e.target.value)} />
              </div>
            </div>

            <div className="flex gap-6 flex-wrap mt-3 mb-5">
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input type="checkbox" checked={prefForm.aceitaFinanciamento} onChange={(e) => updatePref("aceitaFinanciamento", e.target.checked)} />
                Necessita Financiamento
              </label>
              <label className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input type="checkbox" checked={prefForm.aceitaPermuta} onChange={(e) => updatePref("aceitaPermuta", e.target.checked)} />
                Possui Permuta
              </label>
            </div>

            <div className="form-group">
              <label className="label">Anotações do Perfil</label>
              <textarea className="textarea" placeholder="Busca imóvel perto de metrô, andar alto..." value={prefForm.notasPessoais} onChange={(e) => updatePref("notasPessoais", e.target.value)} />
            </div>
          </div>
        )}

        {error && (
          <div className="toast toast-error mt-4" style={{ position: "static" }}>
            <span style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-5">
          <Link href={`/clientes/${id}`} className="btn btn-secondary">
            Cancelar
          </Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
