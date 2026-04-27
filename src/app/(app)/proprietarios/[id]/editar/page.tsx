"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { maskTelefone, maskCPF } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";

export default function EditarProprietarioPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [form, setForm] = useState({
    nomeCompleto: "",
    email: "",
    telefone: "",
    whatsapp: "",
    documento: "",
    tipoPessoa: "PESSOA_FISICA",
    cidade: "",
    estado: "",
    endereco: "",
    numero: "",
    bairro: "",
    cep: "",
    observacoes: "",
    status: "ATIVO",
  });

  useEffect(() => {
    fetch(`/api/proprietarios/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          nomeCompleto: data.nomeCompleto || "",
          email: data.email || "",
          telefone: data.telefone || "",
          whatsapp: data.whatsapp || "",
          documento: data.documento || "",
          tipoPessoa: data.tipoPessoa || "PESSOA_FISICA",
          cidade: data.cidade || "",
          estado: data.estado || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
          bairro: data.bairro || "",
          cep: data.cep || "",
          observacoes: data.observacoes || "",
          status: data.status || "ATIVO",
        });
        setLoading(false);
      });
  }, [id]);

  function update(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    let v = e.target.value.replace(/\D/g, "");
    if (v.length > 8) v = v.slice(0, 8);
    if (v.length > 5) v = `${v.slice(0, 5)}-${v.slice(5)}`;
    
    update("cep", v);
    
    if (v.replace(/\D/g, "").length === 8) {
      const data = await buscarEnderecoPorCep(v);
      if (data) {
        setForm((f) => ({
          ...f,
          endereco: data.logradouro || f.endereco,
          bairro: data.bairro || f.bairro,
          cidade: data.localidade || f.cidade,
          estado: data.uf || f.estado,
        }));
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch(`/api/proprietarios/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setSaving(false);
      setError("Erro ao atualizar proprietário.");
      return;
    }

    setSaving(false);
    router.push(`/proprietarios/${id}`);
    router.refresh();
  }

  if (loading) return <div className="page"><div className="skeleton" style={{ height: "400px" }}/></div>;

  return (
    <div className="page">
      <div className="flex items-center gap-3 mb-6">
        <Link href={`/proprietarios/${id}`} className="btn btn-ghost btn-icon">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-surface-50)" }}>Editar Proprietário</h1>
          <p style={{ color: "var(--color-surface-400)", fontSize: "0.875rem" }}>
            {form.nomeCompleto}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Informações Básicas</h2>

          <div className="form-group">
            <label className="label" htmlFor="nomeCompleto">Nome Completo *</label>
            <input id="nomeCompleto" type="text" className="input" placeholder="João da Silva"
              value={form.nomeCompleto} onChange={(e) => update("nomeCompleto", e.target.value)} required />
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="tipoPessoa">Tipo</label>
              <select id="tipoPessoa" className="select" value={form.tipoPessoa} onChange={(e) => update("tipoPessoa", e.target.value)}>
                <option value="PESSOA_FISICA">Pessoa Física</option>
                <option value="PESSOA_JURIDICA">Pessoa Jurídica</option>
              </select>
            </div>
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="label" htmlFor="documento">CPF / CNPJ</label>
              <input id="documento" type="text" className="input" placeholder="000.000.000-00"
                value={form.documento} onChange={(e) => update("documento", maskCPF(e.target.value))} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="email">E-mail</label>
              <input id="email" type="email" className="input" placeholder="joao@email.com"
                value={form.email} onChange={(e) => update("email", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="telefone">Telefone / WhatsApp</label>
              <input id="telefone" type="text" className="input" placeholder="(00) 00000-0000"
                value={form.telefone} onChange={(e) => update("telefone", maskTelefone(e.target.value))} />
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Endereço</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="cep">CEP</label>
              <input id="cep" type="text" className="input" placeholder="00000-000"
                value={form.cep} onChange={handleCepChange} maxLength={9} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="cidade">Cidade</label>
              <input id="cidade" type="text" className="input" placeholder="São Paulo"
                value={form.cidade} onChange={(e) => update("cidade", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="estado">Estado</label>
              <input id="estado" type="text" className="input" placeholder="SP" maxLength={2}
                value={form.estado} onChange={(e) => update("estado", e.target.value)} />
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group" style={{ gridColumn: "span 2" }}>
              <label className="label" htmlFor="endereco">Endereço</label>
              <input id="endereco" type="text" className="input" placeholder="Ex: Rua das Flores"
                value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="numero">Número</label>
              <input id="numero" type="text" className="input" placeholder="123"
                value={form.numero} onChange={(e) => update("numero", e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label className="label" htmlFor="bairro">Bairro</label>
            <input id="bairro" type="text" className="input" placeholder="Centro"
              value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
          </div>
        </div>

        <div className="card mb-5">
          <h2 className="section-titulo mb-4">Informações Adicionais</h2>
          <div className="form-group">
            <label className="label" htmlFor="observacoes">Observações</label>
            <textarea id="observacoes" className="textarea" placeholder="Informações adicionais sobre o proprietário..."
              value={form.observacoes} onChange={(e) => update("observacoes", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="status">Status</label>
            <select id="status" className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="toast toast-error mb-4" style={{ position: "static", minWidth: "unset", animation: "none" }}>
            <span style={{ color: "#f87171" }}>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Link href={`/proprietarios/${id}`} className="btn btn-secondary">Cancelar</Link>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
}
