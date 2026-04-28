"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { maskCurrency, parseCurrency } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { UploadImagens } from "@/components/UploadImagens";
import { criarImovel, atualizarImovel } from "../actions";
import { FinalidadeImovel, TipoImovel, StatusImovel } from "@prisma/client";

interface Proprietario {
  id: string;
  nomeCompleto: string;
}

interface NovoImovelFormProps {
  proprietarios: Proprietario[];
  imovel?: any; // The existing property data
}

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
  { value: "COBERTURA", label: "Cobertura" },
  { value: "KITNET", label: "Kitnet" },
  { value: "STUDIO", label: "Studio" },
  { value: "OUTRO", label: "Outro" },
];

const PURPOSES = [
  { value: "VENDA", label: "Venda" },
  { value: "LOCACAO", label: "Locação" },
  { value: "VENDA_LOCACAO", label: "Venda e Locação" },
  { value: "TEMPORADA", label: "Temporada" },
];

const STATUSES = [
  { value: "DISPONIVEL", label: "Disponível" },
  { value: "RESERVADO", label: "Reservado" },
  { value: "VENDIDO", label: "Vendido" },
  { value: "LOCADO", label: "Locado" },
  { value: "INDISPONIVEL", label: "Indisponível" },
];

export const NovoImovelForm = ({ proprietarios, imovel }: NovoImovelFormProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fotos, setFotos] = useState<string[]>([]);
  const [imovelId] = useState(() => imovel?.id || crypto.randomUUID());

  const [form, setForm] = useState({
    titulo: imovel?.titulo || "",
    tipoImovel: (imovel?.tipoImovel || "APARTAMENTO") as TipoImovel,
    finalidade: (imovel?.finalidade || "VENDA") as FinalidadeImovel,
    status: (imovel?.status || "DISPONIVEL") as StatusImovel,
    codigoInterno: imovel?.codigoInterno || "",
    proprietarioId: imovel?.proprietarioId || "",

    // Loc
    cep: imovel?.cep || "",
    cidade: imovel?.cidade || "",
    bairro: imovel?.bairro || "",
    endereco: imovel?.endereco || "",
    numero: imovel?.numero || "",
    complemento: imovel?.complemento || "",

    // Venda
    precoVenda: imovel?.precoVenda ? maskCurrency(imovel.precoVenda.toString()) : "",
    aceitaFinanciamento: imovel?.aceitaFinanciamento || false,
    aceitaPermuta: imovel?.aceitaPermuta || false,

    // Locacao
    valorAluguel: imovel?.valorAluguel ? maskCurrency(imovel.valorAluguel.toString()) : "",
    valorCondominio: imovel?.valorCondominio ? maskCurrency(imovel.valorCondominio.toString()) : "",
    valorIptu: imovel?.valorIptu ? maskCurrency(imovel.valorIptu.toString()) : "",
    aceitaCaucao: imovel?.aceitaCaucao || false,
    mesesCaucao: imovel?.mesesCaucao?.toString() || "",

    // Temporada
    valorTemporadaDiaria: imovel?.valorTemporadaDiaria ? maskCurrency(imovel.valorTemporadaDiaria.toString()) : "",
    taxaLimpeza: imovel?.taxaLimpeza ? maskCurrency(imovel.taxaLimpeza.toString()) : "",

    // Areas & Caracteristicas
    areaUtil: imovel?.areaUtil?.toString() || "",
    areaTotal: imovel?.areaTotal?.toString() || "",
    quartos: imovel?.quartos?.toString() || "",
    suites: imovel?.suites?.toString() || "",
    banheiros: imovel?.banheiros?.toString() || "",
    vagasGaragem: imovel?.vagasGaragem?.toString() || "",
    mobiliado: imovel?.mobiliado || false,

    // Detalhes extras dependendo do tipo
    andar: imovel?.andar?.toString() || "",
    elevador: imovel?.elevador || false,
    quintal: imovel?.quintal || false,
    piscina: imovel?.piscina || false,

    descricao: imovel?.descricao || "",
    destaques: imovel?.destaques || "",
  });

  const update = (field: string, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const dataToSend: any = {
      titulo: form.titulo,
      tipoImovel: form.tipoImovel,
      finalidade: form.finalidade,
      status: form.status,
      codigoInterno: form.codigoInterno || null,
      proprietarioId: form.proprietarioId || null,
      cep: form.cep,
      cidade: form.cidade,
      bairro: form.bairro,
      endereco: form.endereco,
      numero: form.numero,
      complemento: form.complemento,
      descricao: form.descricao,
      destaques: form.destaques,

      areaUtil: form.areaUtil ? parseFloat(form.areaUtil) : null,
      areaTotal: form.areaTotal ? parseFloat(form.areaTotal) : null,
      quartos: form.quartos ? parseInt(form.quartos) : null,
      suites: form.suites ? parseInt(form.suites) : null,
      banheiros: form.banheiros ? parseInt(form.banheiros) : null,
      vagasGaragem: form.vagasGaragem ? parseInt(form.vagasGaragem) : null,
      mobiliado: form.mobiliado,
    };

    if (form.finalidade === "VENDA" || form.finalidade === "VENDA_LOCACAO") {
      dataToSend.precoVenda = form.precoVenda ? parseCurrency(form.precoVenda) : null;
      dataToSend.aceitaFinanciamento = form.aceitaFinanciamento;
      dataToSend.aceitaPermuta = form.aceitaPermuta;
    }

    if (form.finalidade === "LOCACAO" || form.finalidade === "VENDA_LOCACAO") {
      dataToSend.valorAluguel = form.valorAluguel ? parseCurrency(form.valorAluguel) : null;
      dataToSend.valorCondominio = form.valorCondominio ? parseCurrency(form.valorCondominio) : null;
      dataToSend.valorIptu = form.valorIptu ? parseCurrency(form.valorIptu) : null;
      dataToSend.aceitaCaucao = form.aceitaCaucao;
      dataToSend.mesesCaucao = form.mesesCaucao ? parseInt(form.mesesCaucao) : null;
    }

    if (form.finalidade === "TEMPORADA") {
      dataToSend.valorTemporadaDiaria = form.valorTemporadaDiaria ? parseCurrency(form.valorTemporadaDiaria) : null;
      dataToSend.taxaLimpeza = form.taxaLimpeza ? parseCurrency(form.taxaLimpeza) : null;
    }

    if (["APARTAMENTO", "COBERTURA", "KITNET", "STUDIO"].includes(form.tipoImovel)) {
      dataToSend.andar = form.andar ? parseInt(form.andar) : null;
      dataToSend.elevador = form.elevador;
    }

    if (["CASA", "CASA_CONDOMINIO"].includes(form.tipoImovel)) {
      dataToSend.quintal = form.quintal;
      dataToSend.piscina = form.piscina;
    }

    if (fotos.length > 0) {
      dataToSend.fotos = fotos;
    }

    let res;
    if (imovel) {
      res = await atualizarImovel(imovel.id, dataToSend);
    } else {
      res = await criarImovel(dataToSend);
    }

    setLoading(false);

    if (!res.success) {
      setError(res.error || "Erro ao cadastrar imóvel.");
      return;
    }

    router.push(`/imoveis/${res.data?.id}`);
  };

  const showVenda = form.finalidade === "VENDA" || form.finalidade === "VENDA_LOCACAO";
  const showLocacao = form.finalidade === "LOCACAO" || form.finalidade === "VENDA_LOCACAO";
  const showTemporada = form.finalidade === "TEMPORADA";
  const isAptoOrSimilar = ["APARTAMENTO", "COBERTURA", "KITNET", "STUDIO"].includes(form.tipoImovel);
  const isCasaOrSimilar = ["CASA", "CASA_CONDOMINIO"].includes(form.tipoImovel);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Fotos */}
      <div className="card">
        <h2 className="section-titulo mb-4">Fotos do Imóvel</h2>
        {imovel?.fotos?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-3" style={{ color: "var(--color-surface-400)" }}>
              Fotos Salvas ({imovel.fotos.length})
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {imovel.fotos.map((foto: any) => (
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
          {imovel?.fotos?.length > 0 ? "Adicionar Mais Fotos" : "Fazer Upload das Fotos"}
        </h3>
        <UploadImagens pasta={imovelId} onUpload={(urls) => setFotos(prev => [...prev, ...urls])} />
      </div>

      {/* Informações Básicas */}
      <div className="card">
        <h2 className="section-titulo mb-4">Informações Básicas</h2>
        <div className="form-group mb-4">
          <label className="label">Título *</label>
          <input type="text" className="input" placeholder="Ex: Lindo apartamento..."
            value={form.titulo} onChange={(e) => update("titulo", e.target.value)} required />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="label">Tipo *</label>
            <select className="select" value={form.tipoImovel} onChange={(e) => update("tipoImovel", e.target.value)}>
              {PROPERTY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Finalidade *</label>
            <select className="select" value={form.finalidade} onChange={(e) => update("finalidade", e.target.value)}>
              {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="label">Status</label>
            <select className="select" value={form.status} onChange={(e) => update("status", e.target.value)}>
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row mt-4">
          <div className="form-group">
            <label className="label">Código Interno</label>
            <input type="text" className="input" placeholder="AP-001"
              value={form.codigoInterno} onChange={(e) => update("codigoInterno", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Proprietário</label>
            <select className="select" value={form.proprietarioId} onChange={(e) => update("proprietarioId", e.target.value)}>
              <option value="">Selecione um proprietário (opcional)</option>
              {proprietarios.map((p) => <option key={p.id} value={p.id}>{p.nomeCompleto}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Valores Dinâmicos */}
      <div className="card">
        <h2 className="section-titulo mb-4">Valores</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {showVenda && (
            <>
              <div className="form-group">
                <label className="label">Preço de Venda *</label>
                <input type="text" className="input" placeholder="R$ 0,00" required
                  value={form.precoVenda} onChange={(e) => update("precoVenda", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group flex items-center h-full pt-6 gap-2">
                <input type="checkbox" checked={form.aceitaFinanciamento} onChange={e => update("aceitaFinanciamento", e.target.checked)} />
                <label className="text-sm">Aceita Financiamento</label>
              </div>
              <div className="form-group flex items-center h-full pt-6 gap-2">
                <input type="checkbox" checked={form.aceitaPermuta} onChange={e => update("aceitaPermuta", e.target.checked)} />
                <label className="text-sm">Aceita Permuta</label>
              </div>
            </>
          )}

          {showLocacao && (
            <>
              <div className="form-group">
                <label className="label">Valor do Aluguel *</label>
                <input type="text" className="input" placeholder="R$ 0,00" required
                  value={form.valorAluguel} onChange={(e) => update("valorAluguel", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="label">Condomínio</label>
                <input type="text" className="input" placeholder="R$ 0,00"
                  value={form.valorCondominio} onChange={(e) => update("valorCondominio", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="label">IPTU Mensal</label>
                <input type="text" className="input" placeholder="R$ 0,00"
                  value={form.valorIptu} onChange={(e) => update("valorIptu", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group flex items-center h-full gap-2">
                <input type="checkbox" checked={form.aceitaCaucao} onChange={e => update("aceitaCaucao", e.target.checked)} />
                <label className="text-sm">Aceita Caução?</label>
              </div>
              {form.aceitaCaucao && (
                <div className="form-group">
                  <label className="label">Meses de Caução</label>
                  <input type="number" className="input" placeholder="Ex: 3"
                    value={form.mesesCaucao} onChange={(e) => update("mesesCaucao", e.target.value)} />
                </div>
              )}
            </>
          )}

          {showTemporada && (
            <>
              <div className="form-group">
                <label className="label">Valor Diária *</label>
                <input type="text" className="input" placeholder="R$ 0,00" required
                  value={form.valorTemporadaDiaria} onChange={(e) => update("valorTemporadaDiaria", maskCurrency(e.target.value))} />
              </div>
              <div className="form-group">
                <label className="label">Taxa de Limpeza</label>
                <input type="text" className="input" placeholder="R$ 0,00"
                  value={form.taxaLimpeza} onChange={(e) => update("taxaLimpeza", maskCurrency(e.target.value))} />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Características */}
      <div className="card">
        <h2 className="section-titulo mb-4">Características</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="form-group">
            <label className="label">Área Útil (m²)</label>
            <input type="number" className="input" value={form.areaUtil} onChange={(e) => update("areaUtil", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Área Total (m²)</label>
            <input type="number" className="input" value={form.areaTotal} onChange={(e) => update("areaTotal", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Quartos</label>
            <input type="number" className="input" value={form.quartos} onChange={(e) => update("quartos", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Suítes</label>
            <input type="number" className="input" value={form.suites} onChange={(e) => update("suites", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Banheiros</label>
            <input type="number" className="input" value={form.banheiros} onChange={(e) => update("banheiros", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Vagas</label>
            <input type="number" className="input" value={form.vagasGaragem} onChange={(e) => update("vagasGaragem", e.target.value)} />
          </div>
          {isAptoOrSimilar && (
            <div className="form-group">
              <label className="label">Andar</label>
              <input type="number" className="input" value={form.andar} onChange={(e) => update("andar", e.target.value)} />
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-4 mt-2">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.mobiliado} onChange={(e) => update("mobiliado", e.target.checked)} /> Mobiliado</label>
          {isAptoOrSimilar && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.elevador} onChange={(e) => update("elevador", e.target.checked)} /> Prédio com Elevador</label>}
          {isCasaOrSimilar && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.quintal} onChange={(e) => update("quintal", e.target.checked)} /> Quintal</label>}
          {isCasaOrSimilar && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.piscina} onChange={(e) => update("piscina", e.target.checked)} /> Piscina</label>}
        </div>
      </div>

      {/* Localização */}
      <div className="card">
        <h2 className="section-titulo mb-4">Localização</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="form-group">
            <label className="label">CEP</label>
            <input type="text" className="input" placeholder="00000-000" maxLength={9}
              value={form.cep} onChange={handleCepChange} />
          </div>
          <div className="form-group">
            <label className="label">Cidade *</label>
            <input type="text" className="input" value={form.cidade} onChange={(e) => update("cidade", e.target.value)} required />
          </div>
          <div className="form-group">
            <label className="label">Bairro</label>
            <input type="text" className="input" value={form.bairro} onChange={(e) => update("bairro", e.target.value)} />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="form-group md:col-span-2">
            <label className="label">Endereço</label>
            <input type="text" className="input" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Número</label>
            <input type="text" className="input" value={form.numero} onChange={(e) => update("numero", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Descrição */}
      <div className="card">
        <h2 className="section-titulo mb-4">Descrição</h2>
        <div className="form-group mb-4">
          <label className="label">Descrição Completa</label>
          <textarea className="textarea h-24" value={form.descricao} onChange={(e) => update("descricao", e.target.value)} />
        </div>
        <div className="form-group">
          <label className="label">Diferenciais (Separados por vírgula)</label>
          <input type="text" className="input" placeholder="Ex: Piscina, Churrasqueira..." value={form.destaques} onChange={(e) => update("destaques", e.target.value)} />
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Salvando..." : "Salvar Imóvel"}
        </button>
      </div>
    </form>
  );
};
