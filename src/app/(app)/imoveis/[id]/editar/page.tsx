"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { maskCurrency, parseCurrency } from "@/lib/utils";

const PROPERTY_TYPES = [
  { value: "APARTAMENTO", label: "Apartamento" },
  { value: "CASA", label: "Casa" },
  { value: "CASA_CONDOMINIO", label: "Casa em Condomínio" },
  { value: "TERRENO", label: "Terreno" },
  { value: "SALA_COMERCIAL", label: "Sala Comercial" },
  { value: "LOJA", label: "Loja" },
  { value: "GALPAO", label: "Galpão" },
  { value: "CHACARA", label: "Chácara" },
  { value: "FAZENDA", label: "Fazenda" },
  { value: "OUTRO", label: "Outro" },
];

const PURPOSES = [
  { value: "VENDA", label: "Venda" },
  { value: "LOCACAO", label: "Locação" },
  { value: "TEMPORADA", label: "Temporada" },
  { value: "PERMUTA", label: "Permuta" },
];

const STATUSES = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "VENDIDO", label: "Vendido" },
  { value: "LOCADO", label: "Locado" },
  { value: "INDISPONIVEL", label: "Indisponível" },
];

export default function EditarImovelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    titulo: "",
    tipoImovel: "APARTAMENTO",
    finalidade: "VENDA",
    preco: "",
    cidade: "",
    bairro: "",
    endereco: "",
    codigoInterno: "",
    descricao: "",
    quartos: "",
    suites: "",
    banheiros: "",
    vagasGaragem: "",
    areaUtil: "",
    valorCondominio: "",
    valorIptu: "",
    mobiliado: false,
    aceitaFinanciamento: false,
    aceitaPermuta: false,
    status: "DISPONIVEL",
    origemCaptacao: "",
    destaques: "",
  });

  useEffect(() => {
    fetch(`/api/imoveis/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          titulo: data.titulo || "",
          tipoImovel: data.tipoImovel || "APARTAMENTO",
          finalidade: data.finalidade || "VENDA",
          preco: maskCurrency(data.preco?.toString() || ""),
          cidade: data.cidade || "",
          bairro: data.bairro || "",
          endereco: data.endereco || "",
          codigoInterno: data.codigoInterno || "",
          descricao: data.descricao || "",
          quartos: data.quartos?.toString() || "",
          suites: data.suites?.toString() || "",
          banheiros: data.banheiros?.toString() || "",
          vagasGaragem: data.vagasGaragem?.toString() || "",
          areaUtil: data.areaUtil?.toString() || "",
          valorCondominio: maskCurrency(data.valorCondominio?.toString() || ""),
          valorIptu: maskCurrency(data.valorIptu?.toString() || ""),
          mobiliado: data.mobiliado || false,
          aceitaFinanciamento: data.aceitaFinanciamento || false,
          aceitaPermuta: data.aceitaPermuta || false,
          status: data.status || "DISPONIVEL",
          origemCaptacao: data.origemCaptacao || "",
          destaques: data.destaques || "",
        });
        setLoading(false);
      });
  }, [id]);

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      ...form,
      preco: parseCurrency(form.preco) || 0,
      quartos: form.quartos ? parseInt(form.quartos) : null,
      suites: form.suites ? parseInt(form.suites) : null,
      banheiros: form.banheiros ? parseInt(form.banheiros) : null,
      vagasGaragem: form.vagasGaragem ? parseInt(form.vagasGaragem) : null,
      areaUtil: form.areaUtil ? parseFloat(form.areaUtil) : null,
      valorCondominio: form.valorCondominio ? parseCurrency(form.valorCondominio) : null,
      valorIptu: form.valorIptu ? parseCurrency(form.valorIptu) : null,
    };

    const res = await fetch(`/api/imoveis/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      setSaving(false);
      setError("Erro ao atualizar imóvel.");
      return;
    }

    setSaving(false);
    router.push(`/imoveis/${id}`);
    router.refresh();
  }

  if (loading) return <div className="page"><div className="skeleton" style={{ height: "400px" }}/></div>;

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/imoveis/${id}`} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Editar Imóvel</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            {form.titulo}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Informações Básicas</h2>

          <div className="form-group">
            <label className="label">Título *</label>
            <input type="text" className="input" value={form.titulo} onChange={(e) => update("titulo", e.target.value)} required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Código Interno</label>
              <input type="text" className="input" value={form.codigoInterno} onChange={(e) => update("codigoInterno", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Origem / Captador</label>
              <input type="text" className="input" value={form.origemCaptacao} onChange={(e) => update("origemCaptacao", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Tipo *</label>
              <select className="select" value={form.tipoImovel} onChange={(e) => update("tipoImovel", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Finalidade *</label>
              <select className="select" value={form.finalidade} onChange={(e) => update("finalidade", e.target.value)}>
                {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Status</label>
              <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Localização</h2>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Cidade *</label>
              <input type="text" className="input" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label">Bairro</label>
              <input type="text" className="input" value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Endereço</label>
            <input type="text" className="input" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Valores</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label">Preço *</label>
              <input type="text" className="input" placeholder="R$ 0,00" value={form.preco} onChange={(e) => update("preco", maskCurrency(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="label">Condomínio</label>
              <input type="text" className="input" placeholder="R$ 0,00" value={form.valorCondominio} onChange={(e) => update("valorCondominio", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">IPTU (anual)</label>
              <input type="text" className="input" placeholder="R$ 0,00" value={form.valorIptu} onChange={(e) => update("valorIptu", maskCurrency(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Características</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label">Quartos</label>
              <input type="number" className="input" value={form.quartos} onChange={(e) => update("quartos", e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="label">Suítes</label>
              <input type="number" className="input" value={form.suites} onChange={(e) => update("suites", e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="label">Banheiros</label>
              <input type="number" className="input" value={form.banheiros} onChange={(e) => update("banheiros", e.target.value)} min="0" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label">Vagas</label>
              <input type="number" className="input" value={form.vagasGaragem} onChange={(e) => update("vagasGaragem", e.target.value)} min="0" />
            </div>
            <div className="form-group">
              <label className="label">Área (m²)</label>
              <input type="number" className="input" value={form.areaUtil} onChange={(e) => update("areaUtil", e.target.value)} min="0" />
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            {[
              { field: "mobiliado", label: "Mobiliado" },
              { field: "aceitaFinanciamento", label: "Aceita Financiamento" },
              { field: "aceitaPermuta", label: "Aceita Permuta" },
            ].map((item) => (
              <label key={item.field} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input type="checkbox" checked={form[item.field as keyof typeof form] as boolean} onChange={(e) => update(item.field, e.target.checked)} />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        <div className="card mb-5">
          <h2 className="section-titulo mb-4">Descrição e Diferenciais</h2>

          <div className="form-group">
            <label className="label">Descrição</label>
            <textarea className="textarea" value={form.descricao} onChange={(e) => update("descricao", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label">Diferenciais</label>
            <textarea className="textarea" style={{ minHeight: "80px" }} value={form.destaques} onChange={(e) => update("destaques", e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="toast toast-error mb-4" style={{ position: "static" }}>
            <span style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/imoveis/${id}`} className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
