"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { maskCurrency, parseCurrency } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { UploadImagens } from "@/components/UploadImagens";

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
  { value: "ARQUIVADO", label: "Arquivado" },
];

export default function EditarImovelPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [proprietarios, setProprietarios] = useState<{ id: string; nomeCompleto: string }[]>([]);
  const [fotosAdicionais, setFotosAdicionais] = useState<string[]>([]);
  const [fotosExistentes, setFotosExistentes] = useState<{ id: string; url: string; isCapa: boolean }[]>([]);
  
  const [form, setForm] = useState({
    titulo: "",
    tipoImovel: "APARTAMENTO",
    finalidade: "VENDA",
    preco: "",
    cidade: "",
    bairro: "",
    cep: "",
    endereco: "",
    numero: "",
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
    destaques: "",
    proprietarioId: "",
  });

  useEffect(() => {
    // Load proprietarios
    fetch("/api/proprietarios?limit=100")
      .then(res => res.json())
      .then(data => {
        if (data.proprietarios) setProprietarios(data.proprietarios);
      })
      .catch(console.error);

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
          cep: data.cep || "",
          endereco: data.endereco || "",
          numero: data.numero || "",
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
          destaques: data.destaques || "",
          proprietarioId: data.proprietarioId || "",
        });
        if (data.fotos) {
          setFotosExistentes(data.fotos);
        }
        setLoading(false);
      });
  }, [id]);

  function update(field: string, value: string | boolean) {
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
        }));
      }
    }
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
      proprietarioId: form.proprietarioId || null,
      fotos: fotosAdicionais.length > 0 ? fotosAdicionais : undefined,
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
        {/* Photos */}
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Fotos do Imóvel</h2>
          
          {fotosExistentes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-3" style={{ color: "var(--color-surface-400)" }}>
                Fotos Salvas ({fotosExistentes.length})
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {fotosExistentes.map((foto) => (
                  <div key={foto.id} className="relative group rounded-md overflow-hidden aspect-square bg-gray-100 border border-gray-200" style={{ borderColor: "var(--color-surface-700)" }}>
                    <img src={foto.url} alt="Foto salva" className="w-full h-full object-cover" />
                    {foto.isCapa && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-medium">
                        CAPA
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <h3 className="text-sm font-medium mb-3" style={{ color: "var(--color-surface-400)" }}>
            Adicionar Mais Fotos
          </h3>
          <UploadImagens pasta={id} onUpload={(urls) => setFotosAdicionais(prev => [...prev, ...urls])} />
        </div>

        {/* Basic info */}
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Informações Básicas</h2>

          <div className="form-group">
            <label className="label" htmlFor="titulo">Título *</label>
            <input id="titulo" type="text" className="input" placeholder="Ex: Apartamento 3 quartos no Centro"
              value={form.titulo} onChange={(e) => update("titulo", e.target.value)} required />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="codigoInterno">Código Interno</label>
            <input id="codigoInterno" type="text" className="input" placeholder="AP-001"
              value={form.codigoInterno} onChange={(e) => update("codigoInterno", e.target.value)} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="proprietarioId">Proprietário</label>
              <select id="proprietarioId" className="select" value={form.proprietarioId} onChange={(e) => update("proprietarioId", e.target.value)}>
                <option value="">Selecione um proprietário (opcional)</option>
                {proprietarios.map((p) => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="tipoImovel">Tipo *</label>
              <select id="tipoImovel" className="select" value={form.tipoImovel} onChange={(e) => update("tipoImovel", e.target.value)}>
                {PROPERTY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="finalidade">Finalidade *</label>
              <select id="finalidade" className="select" value={form.finalidade} onChange={(e) => update("finalidade", e.target.value)}>
                {PURPOSES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label" htmlFor="status">Status</label>
              <select id="status" className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
                {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Localização</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="cep">CEP</label>
              <input id="cep" type="text" className="input" placeholder="00000-000"
                value={form.cep} onChange={handleCepChange} maxLength={9} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="cidade">Cidade *</label>
              <input id="cidade" type="text" className="input" placeholder="São Paulo"
                value={form.cidade} onChange={(e) => update("cidade", e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="bairro">Bairro</label>
              <input id="bairro" type="text" className="input" placeholder="Centro"
                value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="endereco">Endereço</label>
              <input id="endereco" type="text" className="input" placeholder="Ex: Rua das Flores"
                value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
            </div>
            <div className="form-group" style={{ maxWidth: "160px" }}>
              <label className="label" htmlFor="numero">Número</label>
              <input id="numero" type="text" className="input" placeholder="Ex: 123, Apto 45"
                value={form.numero} onChange={(e) => update("numero", e.target.value)} />
            </div>
          </div>
        </div>

        {/* Price */}
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Valores</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="preco">Preço *</label>
              <input id="preco" type="text" className="input" placeholder="R$ 0,00"
                value={form.preco} onChange={(e) => update("preco", maskCurrency(e.target.value))} required />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="valorCondominio">Condomínio</label>
              <input id="valorCondominio" type="text" className="input" placeholder="R$ 0,00"
                value={form.valorCondominio} onChange={(e) => update("valorCondominio", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="valorIptu">IPTU (anual)</label>
              <input id="valorIptu" type="text" className="input" placeholder="R$ 0,00"
                value={form.valorIptu} onChange={(e) => update("valorIptu", maskCurrency(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-4">
          <h2 className="section-titulo mb-4">Características</h2>

          <div className="form-row-3">
            <div className="form-group">
              <label className="label" htmlFor="quartos">Quartos</label>
              <input id="quartos" type="number" className="input" placeholder="3" min="0"
                value={form.quartos} onChange={(e) => update("quartos", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="suites">Suítes</label>
              <input id="suites" type="number" className="input" placeholder="1" min="0"
                value={form.suites} onChange={(e) => update("suites", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="banheiros">Banheiros</label>
              <input id="banheiros" type="number" className="input" placeholder="2" min="0"
                value={form.banheiros} onChange={(e) => update("banheiros", e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="label" htmlFor="vagasGaragem">Vagas</label>
              <input id="vagasGaragem" type="number" className="input" placeholder="1" min="0"
                value={form.vagasGaragem} onChange={(e) => update("vagasGaragem", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label" htmlFor="areaUtil">Área (m²)</label>
              <input id="areaUtil" type="number" className="input" placeholder="85" min="0"
                value={form.areaUtil} onChange={(e) => update("areaUtil", e.target.value)} />
            </div>
          </div>

          <div className="flex gap-6 flex-wrap">
            {[
              { field: "mobiliado", label: "Mobiliado" },
              { field: "aceitaFinanciamento", label: "Aceita Financiamento" },
              { field: "aceitaPermuta", label: "Aceita Permuta" },
            ].map((item) => (
              <label key={item.field} className="flex items-center gap-2 cursor-pointer" style={{ fontSize: "0.875rem", color: "var(--color-surface-200)" }}>
                <input
                  type="checkbox"
                  checked={form[item.field as keyof typeof form] as boolean}
                  onChange={(e) => update(item.field, e.target.checked)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="card mb-5">
          <h2 className="section-titulo mb-4">Descrição e Diferenciais</h2>

          <div className="form-group">
            <label className="label" htmlFor="descricao">Descrição</label>
            <textarea id="descricao" className="textarea" placeholder="Descreva o imóvel..."
              value={form.descricao} onChange={(e) => update("descricao", e.target.value)} />
          </div>

          <div className="form-group">
            <label className="label" htmlFor="destaques">Diferenciais</label>
            <textarea id="destaques" className="textarea" style={{ minHeight: "80px" }}
              placeholder="Piscina, churrasqueira, varanda gourmet..."
              value={form.destaques} onChange={(e) => update("destaques", e.target.value)} />
          </div>
        </div>

        {error && (
          <div className="toast toast-error mb-4" style={{ position: "static", minWidth: "unset", animation: "none" }}>
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
