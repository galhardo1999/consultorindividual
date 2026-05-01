"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { maskCurrency, parseCurrency, reaisParaInput } from "@/lib/utils";
import { buscarEnderecoPorCep } from "@/lib/viacep";
import { UploadImagens } from "@/components/UploadImagens";
import { criarImovel, atualizarImovel } from "../actions";
import { FinalidadeImovel, TipoImovel, StatusImovel, TopografiaTerreno, UrgenciaNegociacao } from "@prisma/client";

interface Proprietario {
  id: string;
  nomeCompleto: string;
}

interface NovoImovelFormProps {
  proprietarios: Proprietario[];
  imovel?: any;
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
  { value: "PREDIO_COMERCIAL", label: "Prédio Comercial" },
  { value: "AREA_RURAL", label: "Área Rural" },
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

const TOPOGRAPHY = [
  { value: "PLANO", label: "Plano" },
  { value: "ACLIVE", label: "Aclive" },
  { value: "DECLIVE", label: "Declive" },
  { value: "IRREGULAR", label: "Irregular" },
];

const URGENCY = [
  { value: "BAIXA", label: "Baixa" },
  { value: "MEDIA", label: "Média" },
  { value: "ALTA", label: "Alta" },
  { value: "URGENTE", label: "Urgente" },
];

const Section = ({ title, children, defaultOpen = true }: { title: string, children: React.ReactNode, defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="card mb-4" style={{ padding: 0 }}>
      <button 
        type="button" 
        className="w-full flex justify-between items-center p-4"
        onClick={() => setOpen(!open)}
      >
        <h2 className="section-titulo m-0">{title}</h2>
        {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      {open && <div className="p-4 pt-0 border-t" style={{ borderColor: 'var(--color-surface-800)' }}>{children}</div>}
    </div>
  );
};

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

    // Endereço
    cep: imovel?.cep || "",
    cidade: imovel?.cidade || "",
    bairro: imovel?.bairro || "",
    endereco: imovel?.endereco || "",
    numero: imovel?.numero || "",
    complemento: imovel?.complemento || "",

    // Valores Venda
    precoVenda: reaisParaInput(imovel?.precoVenda),
    aceitaFinanciamento: imovel?.aceitaFinanciamento || false,
    aceitaPermuta: imovel?.aceitaPermuta || false,
    aceitaProposta: imovel?.aceitaProposta ?? true,
    imovelQuitado: imovel?.imovelQuitado || false,
    saldoDevedor: reaisParaInput(imovel?.saldoDevedor),
    valorMinimoAceito: reaisParaInput(imovel?.valorMinimoAceito),

    // Valores Locação
    valorAluguel: reaisParaInput(imovel?.valorAluguel),
    valorCondominio: reaisParaInput(imovel?.valorCondominio),
    valorIptu: reaisParaInput(imovel?.valorIptu),
    valorSeguroIncendio: reaisParaInput(imovel?.valorSeguroIncendio),
    valorSeguroFianca: reaisParaInput(imovel?.valorSeguroFianca),
    valorCaucao: reaisParaInput(imovel?.valorCaucao),
    mesesCaucao: imovel?.mesesCaucao?.toString() || "",
    aceitaFiador: imovel?.aceitaFiador || false,
    aceitaSeguroFianca: imovel?.aceitaSeguroFianca || false,
    aceitaTituloCapitalizacao: imovel?.aceitaTituloCapitalizacao || false,
    aceitaCaucao: imovel?.aceitaCaucao || false,
    contratoMinimoMeses: imovel?.contratoMinimoMeses?.toString() || "",
    disponivelApartirDe: imovel?.disponivelApartirDe ? new Date(imovel.disponivelApartirDe).toISOString().split('T')[0] : "",

    // Valores Temporada
    valorTemporadaDiaria: reaisParaInput(imovel?.valorTemporadaDiaria),
    valorTemporadaSemanal: reaisParaInput(imovel?.valorTemporadaSemanal),
    valorTemporadaMensal: reaisParaInput(imovel?.valorTemporadaMensal),
    taxaLimpeza: reaisParaInput(imovel?.taxaLimpeza),
    taxaServico: reaisParaInput(imovel?.taxaServico),
    quantidadeMaxHospedes: imovel?.quantidadeMaxHospedes?.toString() || "",
    quantidadeMinDiarias: imovel?.quantidadeMinDiarias?.toString() || "",
    horarioCheckin: imovel?.horarioCheckin || "",
    horarioCheckout: imovel?.horarioCheckout || "",

    // Áreas e Cômodos Básicos
    areaUtil: imovel?.areaUtil?.toString() || "",
    areaTotal: imovel?.areaTotal?.toString() || "",
    quartos: imovel?.quartos?.toString() || "",
    suites: imovel?.suites?.toString() || "",
    banheiros: imovel?.banheiros?.toString() || "",
    vagasGaragem: imovel?.vagasGaragem?.toString() || "",
    mobiliado: imovel?.mobiliado || false,

    // Detalhes Apto/Studio
    andar: imovel?.andar?.toString() || "",
    numeroApartamento: imovel?.numeroApartamento || "",
    bloco: imovel?.bloco || "",
    elevador: imovel?.elevador || false,
    varandaGourmet: imovel?.varandaGourmet || false,

    // Detalhes Casa
    quintal: imovel?.quintal || false,
    piscina: imovel?.piscina || false,
    churrasqueira: imovel?.churrasqueira || false,
    areaGourmet: imovel?.areaGourmet || false,
    nomeCondominio: imovel?.nomeCondominio || "",

    // Terrenos
    frenteTerreno: imovel?.frenteTerreno?.toString() || "",
    fundoTerreno: imovel?.fundoTerreno?.toString() || "",
    ladoDireitoTerreno: imovel?.ladoDireitoTerreno?.toString() || "",
    ladoEsquerdoTerreno: imovel?.ladoEsquerdoTerreno?.toString() || "",
    topografia: imovel?.topografia || "",
    tipoSolo: imovel?.tipoSolo || "",
    murado: imovel?.murado || false,
    cercado: imovel?.cercado || false,
    zoneamento: imovel?.zoneamento || "",

    // Comercial
    peDireito: imovel?.peDireito?.toString() || "",
    quantidadeSalas: imovel?.quantidadeSalas?.toString() || "",
    recepcao: imovel?.recepcao || false,
    energiaTrifasica: imovel?.energiaTrifasica || false,
    doca: imovel?.doca || false,
    vitrine: imovel?.vitrine || false,

    // Rural
    areaHectares: imovel?.areaHectares?.toString() || "",
    areaAlqueires: imovel?.areaAlqueires?.toString() || "",
    casaSede: imovel?.casaSede || false,
    curral: imovel?.curral || false,
    pocoArtesiano: imovel?.pocoArtesiano || false,

    // Descrição e Divulgação
    descricao: imovel?.descricao || "",
    destaques: imovel?.destaques || "",
    tags: imovel?.tags || "",
    linkTourVirtual: imovel?.linkTourVirtual || "",
    linkVideo: imovel?.linkVideo || "",

    // Comercial e Estratégia
    exclusividade: imovel?.exclusividade || false,
    comissaoPercentual: imovel?.comissaoPercentual?.toString() || "",
    comissaoValorFixo: reaisParaInput(imovel?.comissaoValorFixo),
    urgenciaProprietario: imovel?.urgenciaProprietario || "",
    motivoVendaLocacao: imovel?.motivoVendaLocacao || "",
    pontosFortes: imovel?.pontosFortes || "",
    pontosAtencao: imovel?.pontosAtencao || "",

    // Documentação
    documentacaoRegularizada: imovel?.documentacaoRegularizada || false,
    possuiEscritura: imovel?.possuiEscritura || false,
    possuiMatricula: imovel?.possuiMatricula || false,
    possuiHabiteSe: imovel?.possuiHabiteSe || false,
    observacoesDocumentacao: imovel?.observacoesDocumentacao || "",

    // Chaves
    chaveDisponivel: imovel?.chaveDisponivel || false,
    localChave: imovel?.localChave || "",
    instrucoesVisita: imovel?.instrucoesVisita || "",
  });

  const update = (field: string, value: any) => {
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
      tags: form.tags,
      linkTourVirtual: form.linkTourVirtual,
      linkVideo: form.linkVideo,

      areaUtil: form.areaUtil ? parseFloat(form.areaUtil) : null,
      areaTotal: form.areaTotal ? parseFloat(form.areaTotal) : null,
      quartos: form.quartos ? parseInt(form.quartos) : null,
      suites: form.suites ? parseInt(form.suites) : null,
      banheiros: form.banheiros ? parseInt(form.banheiros) : null,
      vagasGaragem: form.vagasGaragem ? parseInt(form.vagasGaragem) : null,
      mobiliado: form.mobiliado,

      // Comercial
      exclusividade: form.exclusividade,
      comissaoPercentual: form.comissaoPercentual ? parseFloat(form.comissaoPercentual) : null,
      comissaoValorFixo: form.comissaoValorFixo ? parseCurrency(form.comissaoValorFixo) : null,
      urgenciaProprietario: form.urgenciaProprietario || null,
      motivoVendaLocacao: form.motivoVendaLocacao,
      pontosFortes: form.pontosFortes,
      pontosAtencao: form.pontosAtencao,

      // Doc e chaves
      documentacaoRegularizada: form.documentacaoRegularizada,
      possuiEscritura: form.possuiEscritura,
      possuiMatricula: form.possuiMatricula,
      possuiHabiteSe: form.possuiHabiteSe,
      observacoesDocumentacao: form.observacoesDocumentacao,
      chaveDisponivel: form.chaveDisponivel,
      localChave: form.localChave,
      instrucoesVisita: form.instrucoesVisita,
    };

    if (form.finalidade === "VENDA" || form.finalidade === "VENDA_LOCACAO") {
      dataToSend.precoVenda = form.precoVenda ? parseCurrency(form.precoVenda) : null;
      dataToSend.aceitaFinanciamento = form.aceitaFinanciamento;
      dataToSend.aceitaPermuta = form.aceitaPermuta;
      dataToSend.aceitaProposta = form.aceitaProposta;
      dataToSend.imovelQuitado = form.imovelQuitado;
      dataToSend.saldoDevedor = form.saldoDevedor ? parseCurrency(form.saldoDevedor) : null;
      dataToSend.valorMinimoAceito = form.valorMinimoAceito ? parseCurrency(form.valorMinimoAceito) : null;
    }

    if (form.finalidade === "LOCACAO" || form.finalidade === "VENDA_LOCACAO") {
      dataToSend.valorAluguel = form.valorAluguel ? parseCurrency(form.valorAluguel) : null;
      dataToSend.valorCondominio = form.valorCondominio ? parseCurrency(form.valorCondominio) : null;
      dataToSend.valorIptu = form.valorIptu ? parseCurrency(form.valorIptu) : null;
      dataToSend.valorSeguroIncendio = form.valorSeguroIncendio ? parseCurrency(form.valorSeguroIncendio) : null;
      dataToSend.valorSeguroFianca = form.valorSeguroFianca ? parseCurrency(form.valorSeguroFianca) : null;
      dataToSend.valorCaucao = form.valorCaucao ? parseCurrency(form.valorCaucao) : null;
      dataToSend.mesesCaucao = form.mesesCaucao ? parseInt(form.mesesCaucao) : null;
      dataToSend.aceitaFiador = form.aceitaFiador;
      dataToSend.aceitaSeguroFianca = form.aceitaSeguroFianca;
      dataToSend.aceitaTituloCapitalizacao = form.aceitaTituloCapitalizacao;
      dataToSend.aceitaCaucao = form.aceitaCaucao;
      dataToSend.contratoMinimoMeses = form.contratoMinimoMeses ? parseInt(form.contratoMinimoMeses) : null;
      dataToSend.disponivelApartirDe = form.disponivelApartirDe ? new Date(form.disponivelApartirDe) : null;
    }

    if (form.finalidade === "TEMPORADA") {
      dataToSend.valorTemporadaDiaria = form.valorTemporadaDiaria ? parseCurrency(form.valorTemporadaDiaria) : null;
      dataToSend.valorTemporadaSemanal = form.valorTemporadaSemanal ? parseCurrency(form.valorTemporadaSemanal) : null;
      dataToSend.valorTemporadaMensal = form.valorTemporadaMensal ? parseCurrency(form.valorTemporadaMensal) : null;
      dataToSend.taxaLimpeza = form.taxaLimpeza ? parseCurrency(form.taxaLimpeza) : null;
      dataToSend.taxaServico = form.taxaServico ? parseCurrency(form.taxaServico) : null;
      dataToSend.quantidadeMaxHospedes = form.quantidadeMaxHospedes ? parseInt(form.quantidadeMaxHospedes) : null;
      dataToSend.quantidadeMinDiarias = form.quantidadeMinDiarias ? parseInt(form.quantidadeMinDiarias) : null;
      dataToSend.horarioCheckin = form.horarioCheckin;
      dataToSend.horarioCheckout = form.horarioCheckout;
    }

    if (["APARTAMENTO", "COBERTURA", "KITNET", "STUDIO"].includes(form.tipoImovel)) {
      dataToSend.andar = form.andar ? parseInt(form.andar) : null;
      dataToSend.numeroApartamento = form.numeroApartamento;
      dataToSend.bloco = form.bloco;
      dataToSend.elevador = form.elevador;
      dataToSend.varandaGourmet = form.varandaGourmet;
    } else if (["CASA", "CASA_CONDOMINIO"].includes(form.tipoImovel)) {
      dataToSend.quintal = form.quintal;
      dataToSend.piscina = form.piscina;
      dataToSend.churrasqueira = form.churrasqueira;
      dataToSend.areaGourmet = form.areaGourmet;
      dataToSend.nomeCondominio = form.nomeCondominio;
    } else if (["TERRENO", "AREA_RURAL"].includes(form.tipoImovel)) {
      dataToSend.frenteTerreno = form.frenteTerreno ? parseFloat(form.frenteTerreno) : null;
      dataToSend.fundoTerreno = form.fundoTerreno ? parseFloat(form.fundoTerreno) : null;
      dataToSend.ladoDireitoTerreno = form.ladoDireitoTerreno ? parseFloat(form.ladoDireitoTerreno) : null;
      dataToSend.ladoEsquerdoTerreno = form.ladoEsquerdoTerreno ? parseFloat(form.ladoEsquerdoTerreno) : null;
      dataToSend.topografia = form.topografia || null;
      dataToSend.tipoSolo = form.tipoSolo;
      dataToSend.murado = form.murado;
      dataToSend.cercado = form.cercado;
      dataToSend.zoneamento = form.zoneamento;
    } else if (["SALA_COMERCIAL", "LOJA", "GALPAO", "PREDIO_COMERCIAL"].includes(form.tipoImovel)) {
      dataToSend.peDireito = form.peDireito ? parseFloat(form.peDireito) : null;
      dataToSend.quantidadeSalas = form.quantidadeSalas ? parseInt(form.quantidadeSalas) : null;
      dataToSend.recepcao = form.recepcao;
      dataToSend.energiaTrifasica = form.energiaTrifasica;
      dataToSend.doca = form.doca;
      dataToSend.vitrine = form.vitrine;
    }
    
    if (["CHACARA", "FAZENDA", "AREA_RURAL"].includes(form.tipoImovel)) {
        dataToSend.areaHectares = form.areaHectares ? parseFloat(form.areaHectares) : null;
        dataToSend.areaAlqueires = form.areaAlqueires ? parseFloat(form.areaAlqueires) : null;
        dataToSend.casaSede = form.casaSede;
        dataToSend.curral = form.curral;
        dataToSend.pocoArtesiano = form.pocoArtesiano;
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
  
  const isApto = ["APARTAMENTO", "COBERTURA", "KITNET", "STUDIO"].includes(form.tipoImovel);
  const isCasa = ["CASA", "CASA_CONDOMINIO"].includes(form.tipoImovel);
  const isTerreno = ["TERRENO", "AREA_RURAL"].includes(form.tipoImovel);
  const isComercial = ["SALA_COMERCIAL", "LOJA", "GALPAO", "PREDIO_COMERCIAL"].includes(form.tipoImovel);
  const isRural = ["CHACARA", "FAZENDA", "AREA_RURAL"].includes(form.tipoImovel);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Informações Básicas */}
      <Section title="Informações Básicas">
        <div className="form-group mb-4 mt-4">
          <label className="label">Título do Anúncio *</label>
          <input type="text" className="input" placeholder="Ex: Lindo apartamento..."
            value={form.titulo} onChange={(e) => update("titulo", e.target.value)} required />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      </Section>

      {/* Valores de Venda */}
      {showVenda && (
        <Section title="Valores para Venda">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label className="label">Preço de Venda *</label>
              <input type="text" className="input font-bold text-lg" placeholder="R$ 0,00" required
                value={form.precoVenda} onChange={(e) => update("precoVenda", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Valor Mínimo Aceito</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.valorMinimoAceito} onChange={(e) => update("valorMinimoAceito", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Saldo Devedor</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.saldoDevedor} onChange={(e) => update("saldoDevedor", maskCurrency(e.target.value))} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaFinanciamento} onChange={e => update("aceitaFinanciamento", e.target.checked)} /> Aceita Financiamento</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaPermuta} onChange={e => update("aceitaPermuta", e.target.checked)} /> Aceita Permuta</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaProposta} onChange={e => update("aceitaProposta", e.target.checked)} /> Aceita Proposta</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.imovelQuitado} onChange={e => update("imovelQuitado", e.target.checked)} /> Imóvel Quitado</label>
          </div>
        </Section>
      )}

      {/* Valores de Locação */}
      {showLocacao && (
        <Section title="Valores e Condições de Locação">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label className="label">Valor do Aluguel *</label>
              <input type="text" className="input font-bold text-lg" placeholder="R$ 0,00" required
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
            <div className="form-group">
              <label className="label">Seguro Incêndio (Mensal)</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.valorSeguroIncendio} onChange={(e) => update("valorSeguroIncendio", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Valor Caução</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.valorCaucao} onChange={(e) => update("valorCaucao", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Contrato Mínimo (meses)</label>
              <input type="number" className="input" placeholder="Ex: 12"
                value={form.contratoMinimoMeses} onChange={(e) => update("contratoMinimoMeses", e.target.value)} />
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaCaucao} onChange={e => update("aceitaCaucao", e.target.checked)} /> Aceita Caução</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaFiador} onChange={e => update("aceitaFiador", e.target.checked)} /> Aceita Fiador</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaSeguroFianca} onChange={e => update("aceitaSeguroFianca", e.target.checked)} /> Aceita Seguro Fiança</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.aceitaTituloCapitalizacao} onChange={e => update("aceitaTituloCapitalizacao", e.target.checked)} /> Aceita Título de Capitalização</label>
          </div>
        </Section>
      )}

      {/* Valores de Temporada */}
      {showTemporada && (
        <Section title="Valores para Temporada">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label className="label">Valor Diária *</label>
              <input type="text" className="input font-bold text-lg" placeholder="R$ 0,00" required
                value={form.valorTemporadaDiaria} onChange={(e) => update("valorTemporadaDiaria", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Valor Semanal</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.valorTemporadaSemanal} onChange={(e) => update("valorTemporadaSemanal", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Valor Mensal</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.valorTemporadaMensal} onChange={(e) => update("valorTemporadaMensal", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Taxa de Limpeza</label>
              <input type="text" className="input" placeholder="R$ 0,00"
                value={form.taxaLimpeza} onChange={(e) => update("taxaLimpeza", maskCurrency(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="label">Qtd. Máx Hóspedes</label>
              <input type="number" className="input" placeholder="Ex: 6"
                value={form.quantidadeMaxHospedes} onChange={(e) => update("quantidadeMaxHospedes", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Mín. Diárias</label>
              <input type="number" className="input" placeholder="Ex: 2"
                value={form.quantidadeMinDiarias} onChange={(e) => update("quantidadeMinDiarias", e.target.value)} />
            </div>
          </div>
        </Section>
      )}

      {/* Características Gerais */}
      <Section title="Características do Imóvel">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="form-group">
            <label className="label">Área Útil (m²)</label>
            <input type="number" className="input" value={form.areaUtil} onChange={(e) => update("areaUtil", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Área Total (m²)</label>
            <input type="number" className="input" value={form.areaTotal} onChange={(e) => update("areaTotal", e.target.value)} />
          </div>
          
          {(!isTerreno) && (
            <>
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
            </>
          )}
          <div className="form-group">
            <label className="label">Vagas Garagem</label>
            <input type="number" className="input" value={form.vagasGaragem} onChange={(e) => update("vagasGaragem", e.target.value)} />
          </div>
        </div>

        {/* Detalhes Específicos por Tipo */}
        {isApto && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50/5 rounded-md border border-gray-100/10">
            <div className="form-group">
              <label className="label">Andar</label>
              <input type="number" className="input" value={form.andar} onChange={(e) => update("andar", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Número Apt/Sala</label>
              <input type="text" className="input" value={form.numeroApartamento} onChange={(e) => update("numeroApartamento", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Bloco</label>
              <input type="text" className="input" value={form.bloco} onChange={(e) => update("bloco", e.target.value)} />
            </div>
            <div className="flex items-center gap-4 mt-6">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.elevador} onChange={(e) => update("elevador", e.target.checked)} /> Elevador</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.varandaGourmet} onChange={(e) => update("varandaGourmet", e.target.checked)} /> Varanda</label>
            </div>
          </div>
        )}

        {isCasa && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50/5 rounded-md border border-gray-100/10">
             <div className="form-group md:col-span-2">
              <label className="label">Nome Condomínio</label>
              <input type="text" className="input" value={form.nomeCondominio} onChange={(e) => update("nomeCondominio", e.target.value)} />
            </div>
            <div className="flex items-center gap-4 mt-6 md:col-span-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.quintal} onChange={(e) => update("quintal", e.target.checked)} /> Quintal</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.piscina} onChange={(e) => update("piscina", e.target.checked)} /> Piscina</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.churrasqueira} onChange={(e) => update("churrasqueira", e.target.checked)} /> Churrasqueira</label>
            </div>
          </div>
        )}

        {isTerreno && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50/5 rounded-md border border-gray-100/10">
            <div className="form-group">
              <label className="label">Frente (m)</label>
              <input type="number" className="input" value={form.frenteTerreno} onChange={(e) => update("frenteTerreno", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Fundo (m)</label>
              <input type="number" className="input" value={form.fundoTerreno} onChange={(e) => update("fundoTerreno", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Lado Dir. (m)</label>
              <input type="number" className="input" value={form.ladoDireitoTerreno} onChange={(e) => update("ladoDireitoTerreno", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Lado Esq. (m)</label>
              <input type="number" className="input" value={form.ladoEsquerdoTerreno} onChange={(e) => update("ladoEsquerdoTerreno", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Topografia</label>
              <select className="select" value={form.topografia} onChange={(e) => update("topografia", e.target.value)}>
                <option value="">Selecione...</option>
                {TOPOGRAPHY.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="label">Zoneamento</label>
              <input type="text" className="input" value={form.zoneamento} onChange={(e) => update("zoneamento", e.target.value)} />
            </div>
            <div className="flex items-center gap-4 mt-6 md:col-span-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.murado} onChange={(e) => update("murado", e.target.checked)} /> Murado</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.cercado} onChange={(e) => update("cercado", e.target.checked)} /> Cercado</label>
            </div>
          </div>
        )}

        {isComercial && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50/5 rounded-md border border-gray-100/10">
            <div className="form-group">
              <label className="label">Pé Direito (m)</label>
              <input type="number" className="input" value={form.peDireito} onChange={(e) => update("peDireito", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Qtd. Salas</label>
              <input type="number" className="input" value={form.quantidadeSalas} onChange={(e) => update("quantidadeSalas", e.target.value)} />
            </div>
            <div className="flex items-center flex-wrap gap-4 mt-6 md:col-span-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.recepcao} onChange={(e) => update("recepcao", e.target.checked)} /> Recepção</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.doca} onChange={(e) => update("doca", e.target.checked)} /> Doca</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.vitrine} onChange={(e) => update("vitrine", e.target.checked)} /> Vitrine</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.energiaTrifasica} onChange={(e) => update("energiaTrifasica", e.target.checked)} /> Energia Trifásica</label>
            </div>
           </div>
        )}

        {isRural && (
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 p-4 bg-gray-50/5 rounded-md border border-gray-100/10">
             <div className="form-group">
              <label className="label">Hectares</label>
              <input type="number" className="input" value={form.areaHectares} onChange={(e) => update("areaHectares", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Alqueires</label>
              <input type="number" className="input" value={form.areaAlqueires} onChange={(e) => update("areaAlqueires", e.target.value)} />
            </div>
            <div className="flex items-center flex-wrap gap-4 mt-6 md:col-span-2">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.casaSede} onChange={(e) => update("casaSede", e.target.checked)} /> Casa Sede</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.curral} onChange={(e) => update("curral", e.target.checked)} /> Curral</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.pocoArtesiano} onChange={(e) => update("pocoArtesiano", e.target.checked)} /> Poço Artesiano</label>
            </div>
           </div>
        )}
      </Section>

      {/* Localização */}
      <Section title="Localização" defaultOpen={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="form-group md:col-span-2">
            <label className="label">Endereço</label>
            <input type="text" className="input" value={form.endereco} onChange={(e) => update("endereco", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Número</label>
            <input type="text" className="input" value={form.numero} onChange={(e) => update("numero", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Fotos */}
      <Section title="Fotos do Imóvel">
        <div className="mt-4">
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
          <UploadImagens pasta={imovelId} onUpload={(urls) => setFotos(prev => [...prev, ...urls])} />
        </div>
      </Section>

      {/* Descrição e Divulgação */}
      <Section title="Descrição e Divulgação" defaultOpen={false}>
        <div className="form-group mt-4 mb-4">
          <label className="label">Descrição Completa</label>
          <textarea className="textarea h-32" value={form.descricao} onChange={(e) => update("descricao", e.target.value)} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="label">Destaques (separados por vírgula)</label>
            <input type="text" className="input" placeholder="Piscina, Academia, Varanda..." value={form.destaques} onChange={(e) => update("destaques", e.target.value)} />
          </div>
          <div className="form-group">
            <label className="label">Link Vídeo (YouTube/Vimeo)</label>
            <input type="url" className="input" value={form.linkVideo} onChange={(e) => update("linkVideo", e.target.value)} />
          </div>
        </div>
      </Section>

      {/* Estratégia Comercial */}
      <Section title="Estratégia e Captação" defaultOpen={false}>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="form-group">
              <label className="label">Comissão (%)</label>
              <input type="number" step="0.1" className="input" value={form.comissaoPercentual} onChange={(e) => update("comissaoPercentual", e.target.value)} />
            </div>
            <div className="form-group">
              <label className="label">Urgência</label>
              <select className="select" value={form.urgenciaProprietario} onChange={(e) => update("urgenciaProprietario", e.target.value)}>
                <option value="">Selecione...</option>
                {URGENCY.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
              </select>
            </div>
            <div className="form-group flex items-center pt-6">
               <label className="flex items-center gap-2"><input type="checkbox" checked={form.exclusividade} onChange={(e) => update("exclusividade", e.target.checked)} /> Contrato de Exclusividade</label>
            </div>
         </div>
      </Section>

      {/* Documentação */}
      <Section title="Documentação e Visitas" defaultOpen={false}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h3 className="font-semibold text-sm mb-3" style={{color: 'var(--color-surface-200)'}}>Situação Documental</h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.documentacaoRegularizada} onChange={(e) => update("documentacaoRegularizada", e.target.checked)} /> Documentação Regularizada</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.possuiEscritura} onChange={(e) => update("possuiEscritura", e.target.checked)} /> Possui Escritura</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.possuiMatricula} onChange={(e) => update("possuiMatricula", e.target.checked)} /> Possui Matrícula</label>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-sm mb-3" style={{color: 'var(--color-surface-200)'}}>Chaves e Visita</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.chaveDisponivel} onChange={(e) => update("chaveDisponivel", e.target.checked)} /> Chave Disponível</label>
                <div className="form-group">
                  <label className="label">Local da Chave</label>
                  <input type="text" className="input" placeholder="Ex: Portaria, Imobiliária parceira" value={form.localChave} onChange={(e) => update("localChave", e.target.value)} />
                </div>
              </div>
            </div>
         </div>
      </Section>

      {error && (
        <div className="p-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-md font-medium">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-3 sticky bottom-4 p-4 bg-gray-900 border border-gray-800 rounded-lg shadow-xl" style={{backgroundColor: 'var(--color-surface-900)', borderColor: 'var(--color-surface-700)'}}>
        <button type="button" onClick={() => router.back()} className="btn btn-secondary">Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {loading ? "Salvando..." : "Salvar Imóvel"}
        </button>
      </div>
    </form>
  );
};
