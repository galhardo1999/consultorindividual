"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { createRoot, type Root } from "react-dom/client";
import { Bath, BedDouble, Car, ExternalLink, Home, MapPin, Ruler } from "lucide-react";
import type { DivIcon, Map as LeafletMap, Marker } from "leaflet";

export interface ImovelMapa {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number;
  status: string;
  cidade: string;
  bairro: string | null;
  endereco: string | null;
  numero: string | null;
  estado: string | null;
  cep: string | null;
  quartos: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  latitude: number;
  longitude: number;
  fotos: string[];
}

interface CoordenadasMapa {
  latitude: number;
  longitude: number;
  zoom?: number;
}

interface MapaImoveisProps {
  imoveis: ImovelMapa[];
  imovelSelecionadoId: string | null;
  coordenadasBusca: CoordenadasMapa | null;
  onSelecionarImovel: (imovelId: string) => void;
}

interface MarcadorRenderizado {
  marcador: Marker;
  raiz: Root;
}

const desmontarRaizPopup = (raiz: Root) => {
  window.setTimeout(() => {
    raiz.unmount();
  }, 0);
};

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

const rotuloStatus: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  LOCADO: "Locado",
  INDISPONIVEL: "Indisponível",
  ARQUIVADO: "Arquivado",
};



const classeStatusPopup: Record<string, string> = {
  DISPONIVEL: "border-emerald-200 bg-emerald-50 text-emerald-700",
  RESERVADO: "border-amber-200 bg-amber-50 text-amber-700",
  VENDIDO: "border-red-200 bg-red-50 text-red-700",
  LOCADO: "border-sky-200 bg-sky-50 text-sky-700",
  INDISPONIVEL: "border-slate-200 bg-slate-50 text-slate-600",
  ARQUIVADO: "border-slate-200 bg-slate-50 text-slate-600",
};

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);

const montarEndereco = (imovel: ImovelMapa) => {
  const partes: string[] = [];
  if (imovel.endereco) partes.push(imovel.endereco);
  if (imovel.numero) partes.push(`Nº ${imovel.numero}`);
  if (imovel.bairro) partes.push(imovel.bairro);
  partes.push([imovel.cidade, imovel.estado].filter(Boolean).join(" - "));
  if (imovel.cep) partes.push(`CEP ${imovel.cep}`);
  return partes.filter(Boolean).join(", ");
};

const obterSiglaTipo = (tipoImovel: string) => {
  const rotulo = rotuloTipo[tipoImovel] ?? tipoImovel.replace(/_/g, " ");
  const palavras = rotulo.split(" ").filter(Boolean);
  return palavras
    .slice(0, 2)
    .map((palavra) => palavra[0])
    .join("")
    .toUpperCase();
};

const normalizarUrlImagem = (url: string) => {
  try {
    const endereco = new URL(url);
    return endereco.protocol === "https:" || endereco.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
};

const corPorStatus: Record<string, string> = {
  DISPONIVEL: "#22c55e",
  RESERVADO: "#f59e0b",
  VENDIDO: "#ef4444",
  LOCADO: "#3b82f6",
  INDISPONIVEL: "#6b7280",
  ARQUIVADO: "#6b7280",
};

const criarIconeMarcador = (L: typeof import("leaflet"), imovel: ImovelMapa): DivIcon => {
  const cor = corPorStatus[imovel.status] ?? "#6470f3";
  const sigla = obterSiglaTipo(imovel.tipoImovel);

  return L.divIcon({
    className: "",
    html: `
      <div style="
        width:40px;height:40px;
        background:${cor};
        border-radius:50% 50% 50% 0;
        transform:rotate(-45deg);
        border:3px solid white;
        box-shadow:0 3px 12px rgba(0,0,0,0.35);
        display:flex;align-items:center;justify-content:center;
      ">
        <span style="transform:rotate(45deg);font-size:11px;font-weight:900;color:white;line-height:1">${sigla}</span>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -38],
  });
};

const PopupImovel = ({ imovel }: { imovel: ImovelMapa }) => {
  const fotoPrincipal = imovel.fotos.map(normalizarUrlImagem).find((url) => url !== null);
  const endereco = montarEndereco(imovel);
  const classeStatus = classeStatusPopup[imovel.status] ?? "border-brand-200 bg-brand-50 text-brand-700";

  return (
    <article className="w-[280px] overflow-hidden rounded-lg bg-white text-slate-950">
      <div className="relative h-36 w-full overflow-hidden rounded-t-lg bg-slate-100">
        {fotoPrincipal ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={fotoPrincipal} alt={imovel.titulo} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
            <Home size={42} aria-hidden="true" />
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-full border px-2.5 py-1 text-[11px] font-bold ${classeStatus}`}>
          {rotuloStatus[imovel.status] ?? imovel.status}
        </span>
      </div>

      <div className="space-y-3 p-3">
        <div>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-slate-950">{imovel.titulo}</h3>
          <p className="mt-1 text-xs font-medium text-slate-500">{rotuloTipo[imovel.tipoImovel] ?? imovel.tipoImovel}</p>
        </div>

        <p className="flex gap-1.5 text-xs leading-relaxed text-slate-600">
          <MapPin size={14} className="mt-0.5 shrink-0 text-slate-400" aria-hidden="true" />
          <span>{endereco}</span>
        </p>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
          {imovel.quartos ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <BedDouble size={13} aria-hidden="true" />
              {imovel.quartos}
            </span>
          ) : null}
          {imovel.banheiros ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Bath size={13} aria-hidden="true" />
              {imovel.banheiros}
            </span>
          ) : null}
          {imovel.vagasGaragem ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Car size={13} aria-hidden="true" />
              {imovel.vagasGaragem}
            </span>
          ) : null}
          {imovel.areaUtil ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1">
              <Ruler size={13} aria-hidden="true" />
              {imovel.areaUtil} m²
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <strong className="text-base font-black text-slate-950">{formatarMoeda(imovel.precoVenda)}</strong>
          <a
            href={`/imoveis/${imovel.id}`}
            className="inline-flex h-9 items-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-bold text-white transition hover:bg-slate-800"
          >
            Ver
            <ExternalLink size={13} aria-hidden="true" />
          </a>
        </div>
      </div>
    </article>
  );
};

export function MapaImoveis({
  imoveis,
  imovelSelecionadoId,
  coordenadasBusca,
  onSelecionarImovel,
}: MapaImoveisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const marcadoresRef = useRef<Map<string, MarcadorRenderizado>>(new Map());
  const [mapaPronto, setMapaPronto] = useState(false);

  const coordenadas = useMemo(
    () => imoveis.map((imovel) => [imovel.latitude, imovel.longitude] as [number, number]),
    [imoveis]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    let cancelado = false;
    const marcadores = marcadoresRef.current;

    const inicializarMapa = async () => {
      const L = await import("leaflet");
      if (cancelado || !containerRef.current || mapaRef.current) return;

      const mapa = L.map(containerRef.current, {
        center: [-15.7801, -47.9292],
        zoom: 5,
        zoomControl: false,
      });

      L.control.zoom({ position: "bottomright" }).addTo(mapa);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
        keepBuffer: 8,
      }).addTo(mapa);

      mapaRef.current = mapa;
      leafletRef.current = L;
      setMapaPronto(true);

      // Duplo rAF: garante que o browser pintou pelo menos um frame com
      // o CSS aplicado antes de recalcular as dimensões do container.
      // setTimeout(0) não é suficiente — o CSS pode ainda não estar pintado.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelado) mapa.invalidateSize();
        });
      });
    };

    inicializarMapa().catch((erro) => {
      console.error("Erro ao inicializar mapa:", erro);
    });

    return () => {
      cancelado = true;
      for (const { marcador, raiz } of marcadores.values()) {
        marcador.remove();
        desmontarRaizPopup(raiz);
      }
      marcadores.clear();
      mapaRef.current?.remove();
      mapaRef.current = null;
      leafletRef.current = null;
      setMapaPronto(false);
    };
  }, []);

  useEffect(() => {
    const mapa = mapaRef.current;
    const L = leafletRef.current;
    if (!mapaPronto || !mapa || !L) return;

    for (const { marcador, raiz } of marcadoresRef.current.values()) {
      marcador.remove();
      desmontarRaizPopup(raiz);
    }
    marcadoresRef.current.clear();

    for (const imovel of imoveis) {
      const elementoPopup = document.createElement("div");
      const raiz = createRoot(elementoPopup);
      raiz.render(<PopupImovel imovel={imovel} />);

      const marcador = L.marker([imovel.latitude, imovel.longitude], {
        icon: criarIconeMarcador(L, imovel),
        title: imovel.titulo,
      })
        .bindPopup(elementoPopup, {
          closeButton: true,
          maxWidth: 320,
          minWidth: 280,
          className: "prime-popup-imovel",
        })
        .on("click", () => onSelecionarImovel(imovel.id))
        .addTo(mapa);

      marcadoresRef.current.set(imovel.id, { marcador, raiz });
    }

    if (coordenadas.length > 0) {
      const limites = L.latLngBounds(coordenadas);
      mapa.fitBounds(limites, { padding: [56, 56], maxZoom: 14 });
    }
  }, [coordenadas, imoveis, mapaPronto, onSelecionarImovel]);

  useEffect(() => {
    const mapa = mapaRef.current;
    if (!mapaPronto || !mapa || !coordenadasBusca) return;

    mapa.setView([coordenadasBusca.latitude, coordenadasBusca.longitude], coordenadasBusca.zoom ?? 13, {
      animate: true,
      duration: 0.8,
    });
  }, [coordenadasBusca, mapaPronto]);

  useEffect(() => {
    const mapa = mapaRef.current;
    const marcadorSelecionado = imovelSelecionadoId ? marcadoresRef.current.get(imovelSelecionadoId) : null;
    if (!mapaPronto || !mapa || !marcadorSelecionado) return;

    const posicao = marcadorSelecionado.marcador.getLatLng();
    mapa.setView(posicao, Math.max(mapa.getZoom(), 15), { animate: true, duration: 0.6 });
    marcadorSelecionado.marcador.openPopup();
  }, [imovelSelecionadoId, mapaPronto]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
