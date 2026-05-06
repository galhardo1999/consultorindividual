"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Bath,
  BedDouble,
  Building2,
  Car,
  Home,
  Loader2,
  LocateFixed,
  MapPin,
  RefreshCw,
  Ruler,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { MapaImoveis, type ImovelMapa } from "@/components/MapaImoveis";
import { PROPERTY_TYPES, STATUSES, PURCHASE_GOALS } from "@/constants/options";

interface RespostaMapa {
  imoveis: ImovelMapa[];
  pendentesGeocodificacao: number;
}

interface RespostaGeocodificacao {
  imoveis: ImovelMapa[];
  restantes: number;
}

interface CoordenadasLocalizacao {
  latitude: number;
  longitude: number;
}

const opcoesStatus = [
  { valor: "TODOS", rotulo: "Todos" },
  { valor: "DISPONIVEL", rotulo: "Disponíveis" },
  { valor: "RESERVADO", rotulo: "Reservados" },
  { valor: "VENDIDO", rotulo: "Vendidos" },
  { valor: "LOCADO", rotulo: "Locados" },
];

const rotuloTipo: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  CASA_CONDOMINIO: "Casa em Condomínio",
  TERRENO: "Terreno",
  SALA_COMERCIAL: "Sala Comercial",
  LOJA: "Loja",
  GALPAO: "Galpão",
  CHACARA: "Chácara",
  FAZENDA: "Fazenda",
  AREA_RURAL: "Área rural",
  COBERTURA: "Cobertura",
  KITNET: "Kitnet",
  STUDIO: "Studio",
  PREDIO_COMERCIAL: "Prédio comercial",
  OUTRO: "Outro",
};

const rotuloFinalidade: Record<string, string> = {
  VENDA: "Venda",
  LOCACAO: "Locação",
  VENDA_LOCACAO: "Venda e locação",
};

const rotuloStatus: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  LOCADO: "Locado",
  INDISPONIVEL: "Indisponível",
  ARQUIVADO: "Arquivado",
};

const classeStatus: Record<string, string> = {
  DISPONIVEL: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  RESERVADO: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  VENDIDO: "border-red-500/30 bg-red-500/10 text-red-300",
  LOCADO: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  INDISPONIVEL: "border-surface-500 bg-surface-700 text-surface-200",
  ARQUIVADO: "border-surface-500 bg-surface-700 text-surface-200",
};

const ehObjeto = (valor: unknown): valor is Record<string, unknown> =>
  typeof valor === "object" && valor !== null;

const ehImovelMapa = (valor: unknown): valor is ImovelMapa => {
  if (!ehObjeto(valor)) return false;

  return (
    typeof valor.id === "string" &&
    typeof valor.titulo === "string" &&
    typeof valor.tipoImovel === "string" &&
    typeof valor.finalidade === "string" &&
    typeof valor.precoVenda === "number" &&
    typeof valor.status === "string" &&
    typeof valor.cidade === "string" &&
    typeof valor.latitude === "number" &&
    typeof valor.longitude === "number" &&
    Array.isArray(valor.fotos) &&
    valor.fotos.every((foto) => typeof foto === "string")
  );
};

const ehRespostaMapa = (valor: unknown): valor is RespostaMapa => {
  if (!ehObjeto(valor)) return false;
  return (
    Array.isArray(valor.imoveis) &&
    valor.imoveis.every(ehImovelMapa) &&
    typeof valor.pendentesGeocodificacao === "number"
  );
};

const ehRespostaGeocodificacao = (valor: unknown): valor is RespostaGeocodificacao => {
  if (!ehObjeto(valor)) return false;
  return (
    Array.isArray(valor.imoveis) &&
    valor.imoveis.every(ehImovelMapa) &&
    typeof valor.restantes === "number"
  );
};

const ehCoordenadasLocalizacao = (valor: unknown): valor is CoordenadasLocalizacao => {
  if (!ehObjeto(valor)) return false;
  return typeof valor.latitude === "number" && typeof valor.longitude === "number";
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);

const montarEndereco = (imovel: ImovelMapa) => {
  const partes = [
    imovel.endereco,
    imovel.numero ? `Nº ${imovel.numero}` : null,
    imovel.bairro,
    [imovel.cidade, imovel.estado].filter(Boolean).join(" - "),
  ];

  return partes.filter(Boolean).join(", ");
};

const obterFinalidades = (imoveis: ImovelMapa[]) => {
  const finalidades = new Set(imoveis.map((imovel) => imovel.finalidade).filter(Boolean));
  return Array.from(finalidades).sort((a, b) => a.localeCompare(b, "pt-BR"));
};



const ItemImovel = ({
  imovel,
  selecionado,
  onSelecionar,
}: {
  imovel: ImovelMapa;
  selecionado: boolean;
  onSelecionar: (imovelId: string) => void;
}) => {
  const fotoPrincipal = imovel.fotos[0] ?? null;
  const classe = classeStatus[imovel.status] ?? "border-brand-500/30 bg-brand-500/10 text-brand-200";

  return (
    <button
      id={`item-imovel-${imovel.id}`}
      type="button"
      onClick={() => onSelecionar(imovel.id)}
      className={`w-full rounded-lg border p-3 text-left transition ${selecionado
        ? "border-brand-400 bg-brand-500/15 shadow-lg shadow-brand-950/20"
        : "border-surface-700 bg-surface-900/70 hover:border-surface-500 hover:bg-surface-800/80"
        }`}
    >
      <div className="flex gap-3">
        <div className="h-20 w-24 shrink-0 overflow-hidden rounded-md bg-surface-800">
          {fotoPrincipal ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fotoPrincipal} alt={imovel.titulo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-surface-400">
              <Home size={26} aria-hidden="true" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-surface-50">{imovel.titulo}</h3>
            <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-bold ${classe}`}>
              {rotuloStatus[imovel.status] ?? imovel.status}
            </span>
          </div>

          <p className="mt-1 truncate text-xs font-medium text-surface-300">
            {rotuloTipo[imovel.tipoImovel] ?? imovel.tipoImovel}
          </p>

          <p className="mt-1 flex gap-1 text-xs text-surface-400">
            <MapPin size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="line-clamp-2">{montarEndereco(imovel)}</span>
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-surface-300">
            {imovel.quartos ? (
              <span className="inline-flex items-center gap-1">
                <BedDouble size={12} aria-hidden="true" />
                {imovel.quartos}
              </span>
            ) : null}
            {imovel.banheiros ? (
              <span className="inline-flex items-center gap-1">
                <Bath size={12} aria-hidden="true" />
                {imovel.banheiros}
              </span>
            ) : null}
            {imovel.vagasGaragem ? (
              <span className="inline-flex items-center gap-1">
                <Car size={12} aria-hidden="true" />
                {imovel.vagasGaragem}
              </span>
            ) : null}
            {imovel.areaUtil ? (
              <span className="inline-flex items-center gap-1">
                <Ruler size={12} aria-hidden="true" />
                {imovel.areaUtil} m²
              </span>
            ) : null}
          </div>

          <strong className="mt-2 block text-sm font-black text-surface-50">{formatarMoeda(imovel.precoVenda)}</strong>
        </div>
      </div>
    </button>
  );
};

export default function MapaPage() {
  const [imoveis, setImoveis] = useState<ImovelMapa[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erroCarregamento, setErroCarregamento] = useState("");
  const [geocodificando, setGeocodificando] = useState(false);
  const [pendentesGeocodificacao, setPendentesGeocodificacao] = useState(0);
  const [buscaLocalizacao, setBuscaLocalizacao] = useState("");
  const [buscandoLocalizacao, setBuscandoLocalizacao] = useState(false);
  const [erroBuscaLocalizacao, setErroBuscaLocalizacao] = useState("");
  const [statusSelecionado, setStatusSelecionado] = useState("TODOS");
  const [finalidadeSelecionada, setFinalidadeSelecionada] = useState("TODAS");
  const [tipoSelecionado, setTipoSelecionado] = useState("TODOS");
  const [imovelSelecionadoId, setImovelSelecionadoId] = useState<string | null>(null);
  const [coordenadasBusca, setCoordenadasBusca] = useState<{
    latitude: number;
    longitude: number;
    zoom: number;
  } | null>(null);
  const geocodificacaoEmAndamentoRef = useRef(false);
  const temporizadorGeocodificacaoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const carregarImoveis = useCallback(async () => {
    setErroCarregamento("");

    try {
      const resposta = await fetch("/api/imoveis/mapa");
      if (!resposta.ok) throw new Error("Falha ao carregar imóveis no mapa");

      const dados: unknown = await resposta.json();
      if (!ehRespostaMapa(dados)) throw new Error("Resposta inválida da API de mapa");

      setImoveis(dados.imoveis);
      setPendentesGeocodificacao(dados.pendentesGeocodificacao);
    } catch (erro) {
      console.error(erro);
      setErroCarregamento("Não foi possível carregar os imóveis do mapa.");
    } finally {
      setCarregando(false);
    }
  }, [imovelSelecionadoId]);

  const executarGeocodificacao = useCallback(async () => {
    if (geocodificacaoEmAndamentoRef.current || pendentesGeocodificacao <= 0) return;

    geocodificacaoEmAndamentoRef.current = true;
    setGeocodificando(true);

    try {
      const resposta = await fetch("/api/imoveis/mapa", { method: "POST" });
      if (!resposta.ok) throw new Error("Falha ao geocodificar imóveis");

      const dados: unknown = await resposta.json();
      if (!ehRespostaGeocodificacao(dados)) throw new Error("Resposta inválida da geocodificação");

      if (dados.imoveis.length > 0) {
        setImoveis((atuais) => {
          const idsAtuais = new Set(atuais.map((imovel) => imovel.id));
          const novos = dados.imoveis.filter((imovel) => !idsAtuais.has(imovel.id));
          return [...atuais, ...novos];
        });
      }

      setPendentesGeocodificacao(dados.restantes);

      if (dados.restantes > 0) {
        temporizadorGeocodificacaoRef.current = setTimeout(() => {
          geocodificacaoEmAndamentoRef.current = false;
          executarGeocodificacao();
        }, 2500);
      } else {
        geocodificacaoEmAndamentoRef.current = false;
        setGeocodificando(false);
      }
    } catch (erro) {
      console.error(erro);
      geocodificacaoEmAndamentoRef.current = false;
      setGeocodificando(false);
      temporizadorGeocodificacaoRef.current = setTimeout(() => {
        executarGeocodificacao();
      }, 10000);
    }
  }, [pendentesGeocodificacao]);

  useEffect(() => {
    carregarImoveis().catch((erro) => {
      console.error(erro);
    });
  }, [carregarImoveis]);

  useEffect(() => {
    if (!carregando && pendentesGeocodificacao > 0) {
      executarGeocodificacao().catch((erro) => {
        console.error(erro);
      });
    }
  }, [carregando, executarGeocodificacao, pendentesGeocodificacao]);

  useEffect(
    () => () => {
      if (temporizadorGeocodificacaoRef.current) {
        clearTimeout(temporizadorGeocodificacaoRef.current);
      }
    },
    []
  );

  // Removemos as lógicas baseadas nas listas dinâmicas, pois agora o usuário quer 
  // as opções diretamente das constantes do options.ts

  const imoveisFiltrados = useMemo(() => {
    return imoveis.filter((imovel) => {
      const statusConfere = statusSelecionado === "TODOS" || imovel.status === statusSelecionado;
      const finalidadeConfere =
        finalidadeSelecionada === "TODAS" || imovel.finalidade === finalidadeSelecionada;
      const tipoConfere = tipoSelecionado === "TODOS" || imovel.tipoImovel === tipoSelecionado;

      return statusConfere && finalidadeConfere && tipoConfere;
    });
  }, [finalidadeSelecionada, imoveis, statusSelecionado, tipoSelecionado]);

  const imovelSelecionado = useMemo(
    () => imoveisFiltrados.find((imovel) => imovel.id === imovelSelecionadoId) ?? null,
    [imovelSelecionadoId, imoveisFiltrados]
  );


  const buscarLocalizacao = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    const termo = buscaLocalizacao.trim();
    if (!termo) return;

    setBuscandoLocalizacao(true);
    setErroBuscaLocalizacao("");

    try {
      const resposta = await fetch(`/api/imoveis/mapa?busca=${encodeURIComponent(termo)}`);

      const dados: unknown = await resposta.json();
      if (resposta.status === 404) {
        setErroBuscaLocalizacao("Localização não encontrada.");
        return;
      }

      if (!resposta.ok || !ehCoordenadasLocalizacao(dados)) {
        throw new Error("Falha ao buscar localização");
      }

      setCoordenadasBusca({
        latitude: dados.latitude,
        longitude: dados.longitude,
        zoom: 13,
      });
    } catch (erro) {
      console.error(erro);
      setErroBuscaLocalizacao("Erro ao buscar localização.");
    } finally {
      setBuscandoLocalizacao(false);
    }
  };

  const selecionarImovel = useCallback((imovelId: string) => {
    setImovelSelecionadoId(atual => atual === imovelId ? null : imovelId);
  }, []);

  const limparFiltros = () => {
    setStatusSelecionado("TODOS");
    setFinalidadeSelecionada("TODAS");
    setTipoSelecionado("TODOS");
  };

  useEffect(() => {
    if (imovelSelecionadoId) {
      const elemento = document.getElementById(`item-imovel-${imovelSelecionadoId}`);
      if (elemento) {
        elemento.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [imovelSelecionadoId]);

  return (
    <div className="relative h-screen overflow-hidden bg-surface-950">
      <MapaImoveis
        imoveis={imoveisFiltrados}
        imovelSelecionadoId={imovelSelecionado?.id ?? null}
        coordenadasBusca={coordenadasBusca}
        onSelecionarImovel={selecionarImovel}
      />

      <aside className="absolute inset-x-3 bottom-3 z-[800] max-h-[58vh] overflow-hidden rounded-lg border border-surface-700 bg-surface-950/95 shadow-2xl backdrop-blur-xl lg:inset-y-4 lg:right-4 lg:left-auto lg:max-h-none lg:w-[460px]">
        <div className="flex h-full min-h-0 flex-col">
          <div className="border-b border-surface-700 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/10 px-2.5 py-1 text-xs font-bold text-brand-200">
                  <MapPin size={13} aria-hidden="true" />
                  Mapa de imóveis
                </div>
                <h1 className="mt-3 text-xl font-black tracking-normal text-surface-50">Localização da carteira</h1>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCarregando(true);
                  carregarImoveis().catch((erro) => console.error(erro));
                }}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-surface-700 bg-surface-900 text-surface-200 transition hover:border-surface-500 hover:bg-surface-800"
                title="Atualizar imóveis"
              >
                <RefreshCw size={16} className={carregando ? "animate-spin" : ""} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={buscarLocalizacao} className="mt-4">
              <div className="flex gap-2">
                <div className="relative min-w-0 flex-1">
                  <Search
                    size={16}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-surface-400"
                    aria-hidden="true"
                  />
                  <input
                    value={buscaLocalizacao}
                    onChange={(evento) => setBuscaLocalizacao(evento.target.value)}
                    placeholder="Buscar cidade, bairro ou endereço"
                    className="h-10 w-full rounded-lg border border-surface-700 bg-surface-900 pl-9 pr-9 text-sm text-surface-50 outline-none transition placeholder:text-surface-500 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                  />
                  {buscaLocalizacao ? (
                    <button
                      type="button"
                      onClick={() => setBuscaLocalizacao("")}
                      className="absolute right-2 top-1/2 inline-flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-surface-400 transition hover:bg-surface-800 hover:text-surface-100"
                      title="Limpar busca"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  ) : null}
                </div>

                <button
                  type="submit"
                  disabled={buscandoLocalizacao || !buscaLocalizacao.trim()}
                  className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                  title="Centralizar no mapa"
                >
                  {buscandoLocalizacao ? (
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                  ) : (
                    <LocateFixed size={16} aria-hidden="true" />
                  )}
                </button>
              </div>

              {erroBuscaLocalizacao ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-red-300">
                  <AlertCircle size={13} aria-hidden="true" />
                  {erroBuscaLocalizacao}
                </p>
              ) : null}
            </form>
          </div>

          <div className="border-b border-surface-700 p-4">
            <div className="space-y-3">
              <div>
                <div className="mb-2 flex items-center justify-between gap-2">
                  <label className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-surface-400">
                    <SlidersHorizontal size={13} aria-hidden="true" />
                    Filtros
                  </label>
                  <button
                    type="button"
                    onClick={limparFiltros}
                    className="text-xs font-bold text-brand-300 transition hover:text-brand-200"
                  >
                    Limpar
                  </button>
                </div>

                <div className="flex gap-2 overflow-x-auto pr-2 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <button
                    type="button"
                    onClick={() => setStatusSelecionado("TODOS")}
                    className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${statusSelecionado === "TODOS"
                      ? "border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-900/50"
                      : "border-surface-700 bg-surface-900 text-surface-300 hover:border-surface-500 hover:text-surface-50"
                      }`}
                  >
                    Todos
                  </button>
                  {STATUSES.map((opcao) => (
                    <button
                      key={opcao.value}
                      type="button"
                      onClick={() => setStatusSelecionado(opcao.value)}
                      className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${statusSelecionado === opcao.value
                        ? "border-brand-500 bg-brand-600 text-white shadow-sm shadow-brand-900/50"
                        : "border-surface-700 bg-surface-900 text-surface-300 hover:border-surface-500 hover:text-surface-50"
                        }`}
                    >
                      {opcao.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={finalidadeSelecionada}
                  onChange={(evento) => setFinalidadeSelecionada(evento.target.value)}
                  className="h-10 rounded-lg border border-surface-700 bg-surface-900 px-3 text-sm text-surface-50 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="TODAS">Todos objetivos</option>
                  {PURCHASE_GOALS.map((goal) => (
                    <option key={goal.value} value={goal.value}>
                      {goal.label}
                    </option>
                  ))}
                </select>

                <select
                  value={tipoSelecionado}
                  onChange={(evento) => setTipoSelecionado(evento.target.value)}
                  className="h-10 rounded-lg border border-surface-700 bg-surface-900 px-3 text-sm text-surface-50 outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                >
                  <option value="TODOS">Todos os tipos</option>
                  {PROPERTY_TYPES.map((tipo) => (
                    <option key={tipo.value} value={tipo.value}>
                      {tipo.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4">
            {carregando ? (
              <div className="space-y-3">
                {[0, 1, 2].map((indice) => (
                  <div key={indice} className="h-28 animate-pulse rounded-lg border border-surface-700 bg-surface-900" />
                ))}
              </div>
            ) : erroCarregamento ? (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
                <div className="flex items-center gap-2 font-bold">
                  <AlertCircle size={16} aria-hidden="true" />
                  {erroCarregamento}
                </div>
              </div>
            ) : imoveisFiltrados.length === 0 ? (
              <div className="rounded-lg border border-surface-700 bg-surface-900 p-5 text-center">
                <Building2 size={30} className="mx-auto text-surface-500" aria-hidden="true" />
                <h2 className="mt-3 text-sm font-bold text-surface-100">Nenhum imóvel encontrado</h2>
                <p className="mt-1 text-xs leading-relaxed text-surface-400">
                  Ajuste os filtros ou aguarde a localização dos imóveis com endereço cadastrado.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {imoveisFiltrados.map((imovel) => (
                  <ItemImovel
                    key={imovel.id}
                    imovel={imovel}
                    selecionado={imovel.id === imovelSelecionado?.id}
                    onSelecionar={selecionarImovel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {geocodificando ? (
        <div className="absolute right-4 top-4 z-[700] hidden rounded-lg border border-amber-500/25 bg-surface-950/90 px-3 py-2 text-sm font-semibold text-amber-200 shadow-xl backdrop-blur-lg lg:flex lg:items-center lg:gap-2">
          <Loader2 size={15} className="animate-spin" aria-hidden="true" />
          Localizando {pendentesGeocodificacao} imóvel{pendentesGeocodificacao === 1 ? "" : "s"}
        </div>
      ) : null}
    </div>
  );
}
