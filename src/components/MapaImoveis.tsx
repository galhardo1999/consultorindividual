"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapImovel {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  precoVenda: number;
  status: string;
  cidade: string;
  bairro: string | null;
  estado: string | null;
  endereco: string | null;
  numero: string | null;
  cep: string | null;
  quartos: number | null;
  banheiros: number | null;
  vagasGaragem: number | null;
  areaUtil: number | null;
  lat: number;
  lng: number;
  // URLs de todas as fotos do imóvel, ordenadas (capa primeiro)
  fotos: string[];
}

interface MapaImoveisProps {
  imoveis: MapImovel[];
  onSearchCoords?: (lat: number, lng: number) => void;
}

// ─── Label helpers ─────────────────────────────────────────────────────────────

const tipoLabel: Record<string, string> = {
  APARTAMENTO: "Apartamento",
  CASA: "Casa",
  CASA_CONDOMINIO: "Casa em Condomínio",
  TERRENO: "Terreno",
  SALA_COMERCIAL: "Sala Comercial",
  LOJA: "Loja",
  GALPAO: "Galpão",
  CHACARA: "Chácara",
  FAZENDA: "Fazenda",
  OUTRO: "Outro",
};

const tipoIcone: Record<string, string> = {
  CASA: "🏠",
  APARTAMENTO: "🏢",
  CASA_CONDOMINIO: "🏘️",
  TERRENO: "🏞️",
  SALA_COMERCIAL: "💼",
  LOJA: "🏪",
  GALPAO: "🏭",
  CHACARA: "🌳",
  FAZENDA: "🚜",
  AREA_RURAL: "🌾",
  COBERTURA: "🌇",
  KITNET: "🛋️",
  STUDIO: "🛋️",
  PREDIO_COMERCIAL: "🏙️",
  OUTRO: "📍",
};

const statusColor: Record<string, string> = {
  DISPONIVEL: "#22c55e",
  RESERVADO: "#f59e0b",
  VENDIDO: "#ef4444",
  LOCADO: "#3b82f6",
  INDISPONIVEL: "#6b7280",
  ARQUIVADO: "#6b7280",
};

const statusLabel: Record<string, string> = {
  DISPONIVEL: "Disponível",
  RESERVADO: "Reservado",
  VENDIDO: "Vendido",
  LOCADO: "Locado",
  INDISPONIVEL: "Indisponível",
  ARQUIVADO: "Arquivado",
};

function formatCurrency(v: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(v);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function MapaImoveis({ imoveis, onSearchCoords }: MapaImoveisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const leafletRef = useRef<typeof import("leaflet") | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // ── One-time map initialization ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // cancelled flag prevents async init from continuing after cleanup
    let cancelled = false;

    async function init() {
      const L = await import("leaflet");

      // After the async boundary: bail out if unmounted or already initialized
      if (cancelled || !containerRef.current || mapRef.current) return;

      // Fix default icon paths (broken in bundlers)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(containerRef.current, {
        center: [-15.7801, -47.9292],
        zoom: 5,
        zoomControl: true,
      });

      // Check again right after synchronous L.map call
      if (cancelled) {
        map.remove();
        return;
      }

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletRef.current = L;
      mapRef.current = map;
      setMapReady(true);
    }

    init().catch(console.error);

    return () => {
      cancelled = true;
      // Clear markers list so they are re-added on next mount
      markersRef.current = [];
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      leafletRef.current = null;
      setMapReady(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Markers: update whenever imoveis list or map readiness changes ────────
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    for (const imovel of imoveis) {
      const color = statusColor[imovel.status] ?? "#6470f3";

      const svgIcon = L.divIcon({
        className: "",
        html: `
          <div style="
            width:36px;height:36px;
            background:${color};
            border-radius:50% 50% 50% 0;
            transform:rotate(-45deg);
            border:3px solid white;
            box-shadow:0 3px 10px rgba(0,0,0,0.35);
            display:flex;align-items:center;justify-content:center;
          ">
            <span style="transform:rotate(45deg);font-size:14px">${tipoIcone[imovel.tipoImovel] ?? "📍"}</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const buildAddress = () => {
        const parts = [];
        if (imovel.endereco) parts.push(imovel.endereco);
        if (imovel.numero) parts.push(`Nº ${imovel.numero}`);
        if (imovel.bairro) parts.push(imovel.bairro);
        
        let cityPart = imovel.cidade;
        if (imovel.cep) cityPart += `, CEP ${imovel.cep}`;
        parts.push(cityPart);
        
        return parts.join(", ");
      };

      const formatPlural = (count: number | null, singular: string, plural: string) => {
        if (!count) return "";
        return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
      };

      const featuresHtml = [
        imovel.quartos ? `<span>🛏️ ${formatPlural(imovel.quartos, 'quarto', 'quartos')}</span>` : '',
        imovel.banheiros ? `<span>🚿 ${formatPlural(imovel.banheiros, 'banheiro', 'banheiros')}</span>` : '',
        imovel.vagasGaragem ? `<span>🚗 ${formatPlural(imovel.vagasGaragem, 'vaga', 'vagas')}</span>` : ''
      ].filter(Boolean).join('<span style="color:#cbd5e1;margin:0 6px">•</span>');

      // ── Carrossel de fotos ──────────────────────────────────────────────────
      // ID único por imóvel para isolar os event handlers de cada popup
      const carouselId = `car-${imovel.id.replace(/[^a-z0-9]/gi, "")}`;

      const buildCarouselHtml = (): string => {
        if (imovel.fotos.length === 0) {
          // Placeholder quando não há fotos
          return `
            <div style="width:100%;height:150px;background:#f1f5f9;border-radius:10px;
              margin-bottom:12px;display:flex;align-items:center;justify-content:center;
              border:1px solid #e2e8f0;">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="10" fill="#e2e8f0"/>
                <path d="M24 10L8 24h5v14h10V28h6v10h10V24h5L24 10z" fill="#94a3b8"/>
              </svg>
            </div>`;
        }

        if (imovel.fotos.length === 1) {
          // Sem carrossel para 1 foto
          return `
            <div style="width:100%;height:150px;border-radius:10px;margin-bottom:12px;
              overflow:hidden;border:1px solid #e2e8f0;">
              <img src="${imovel.fotos[0]}" alt="${imovel.titulo}"
                style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>`;
        }

        // Carrossel com múltiplas fotos
        const slides = imovel.fotos
          .map(
            (url, idx) => `
            <div style="flex:0 0 100%;height:150px;overflow:hidden;">
              <img src="${url}" alt="Foto ${idx + 1} de ${imovel.titulo}"
                loading="${idx === 0 ? "eager" : "lazy"}"
                style="width:100%;height:100%;object-fit:cover;display:block;" />
            </div>`
          )
          .join("");

        const dots = imovel.fotos
          .map(
            (_, idx) => `
            <span id="${carouselId}-dot-${idx}" style="
              width:6px;height:6px;border-radius:50%;cursor:pointer;
              background:${idx === 0 ? "#fff" : "rgba(255,255,255,0.45)"};
              transition:background 0.2s;display:inline-block;
            " onclick="(function(){
              var t=document.getElementById('${carouselId}-track');
              t.scrollTo({left:${idx}*t.offsetWidth,behavior:'smooth'});
            })()"></span>`
          )
          .join("");

        return `
          <div id="${carouselId}" style="position:relative;width:100%;height:150px;
            border-radius:10px;margin-bottom:12px;overflow:hidden;border:1px solid #e2e8f0;">

            <!-- Slides -->
            <div id="${carouselId}-track" style="
              display:flex;height:100%;overflow-x:scroll;
              scroll-snap-type:x mandatory;scrollbar-width:none;"
              onscroll="(function(el){
                var idx=Math.round(el.scrollLeft/el.offsetWidth);
                el.parentElement.querySelectorAll('[id^=\'${carouselId}-dot-\']').forEach(function(d,i){
                  d.style.background=i===idx?'#fff':'rgba(255,255,255,0.45)';
                });
                document.getElementById('${carouselId}-count').textContent=(idx+1)+'/'+${imovel.fotos.length};
              })(this)">
              ${slides}
            </div>

            <!-- Botão Anterior -->
            <button onclick="(function(){
              var t=document.getElementById('${carouselId}-track');
              t.scrollBy({left:-t.offsetWidth,behavior:'smooth'});
            })()" style="
              position:absolute;left:6px;top:50%;transform:translateY(-50%);
              width:26px;height:26px;border-radius:50%;border:none;
              background:rgba(0,0,0,0.45);color:#fff;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              font-size:14px;line-height:1;z-index:2;">&#8249;</button>

            <!-- Botão Próximo -->
            <button onclick="(function(){
              var t=document.getElementById('${carouselId}-track');
              t.scrollBy({left:t.offsetWidth,behavior:'smooth'});
            })()" style="
              position:absolute;right:6px;top:50%;transform:translateY(-50%);
              width:26px;height:26px;border-radius:50%;border:none;
              background:rgba(0,0,0,0.45);color:#fff;cursor:pointer;
              display:flex;align-items:center;justify-content:center;
              font-size:14px;line-height:1;z-index:2;">&#8250;</button>

            <!-- Contador -->
            <span id="${carouselId}-count" style="
              position:absolute;top:7px;right:8px;
              background:rgba(0,0,0,0.5);color:#fff;
              font-size:10px;font-weight:600;padding:2px 6px;
              border-radius:999px;z-index:2;
            ">1/${imovel.fotos.length}</span>

            <!-- Indicadores (pontos) -->
            <div style="
              position:absolute;bottom:7px;left:50%;transform:translateX(-50%);
              display:flex;gap:4px;z-index:2;">${dots}</div>
          </div>

          <style>#${carouselId}-track::-webkit-scrollbar{display:none;}
          #${carouselId}-track>div{scroll-snap-align:start;}</style>`;
      };

      const photoHtml = buildCarouselHtml();

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;width:240px;padding:4px">
          ${photoHtml}
          <div style="font-weight:700;font-size:15px;margin-bottom:6px;color:#0f172a;line-height:1.2">${imovel.titulo}</div>
          
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span style="background:${color}22;color:${color};font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;border:1px solid ${color}44">
              ${statusLabel[imovel.status] ?? imovel.status}
            </span>
            <span style="font-size:11px;color:#64748b;font-weight:500;">${tipoLabel[imovel.tipoImovel] ?? imovel.tipoImovel}</span>
          </div>
          
          <div style="font-size:12px;color:#64748b;margin-bottom:8px;line-height:1.4">
            📍 ${buildAddress()}
          </div>
          
          ${featuresHtml ? `<div style="display:flex;align-items:center;flex-wrap:wrap;font-size:11px;color:#475569;margin-bottom:10px;font-weight:500;">${featuresHtml}</div>` : ''}
          
          <div style="font-size:18px;font-weight:800;color:#000000;margin-bottom:12px;letter-spacing:-0.5px;">
            ${formatCurrency(imovel.precoVenda)}
          </div>
          
          <a href="/imoveis/${imovel.id}" style="
            display:block;text-align:center;background:#0f172a;color:white;
            text-decoration:none;padding:8px 12px;border-radius:8px;
            font-size:13px;font-weight:600;transition:background 0.15s
          " onmouseover="this.style.background='#1e293b'" onmouseout="this.style.background='#0f172a'">
            Ver detalhes
          </a>
        </div>
      `;

      const marker = L.marker([imovel.lat, imovel.lng], { icon: svgIcon })
        .bindPopup(popupHtml, { maxWidth: 280 })
        .addTo(map);

      markersRef.current.push(marker);
    }

    // Fit bounds when we have markers
    if (imoveis.length > 0) {
      const bounds = L.latLngBounds(imoveis.map((i) => [i.lat, i.lng]));
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    }

    // Expose fly-to for address search
    if (onSearchCoords) {
      (window as unknown as Record<string, unknown>).__mapFlyTo = (
        lat: number,
        lng: number
      ) => {
        map.flyTo([lat, lng], 13, { duration: 1.5 });
      };
    }
  }, [imoveis, mapReady, onSearchCoords]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}
    />
  );
}

// ─── Search hook ──────────────────────────────────────────────────────────────

export function useMapSearch() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  async function search(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError("");

    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query + ", Brasil")}&limit=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "pt-BR" },
      });
      const data = (await res.json()) as Array<{ lat: string; lon: string }>;

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        const flyTo = (window as unknown as Record<string, unknown>)
          .__mapFlyTo as ((lat: number, lng: number) => void) | undefined;
        flyTo?.(lat, lng);
      } else {
        setError("Cidade não encontrada. Tente outro nome.");
      }
    } catch {
      setError("Erro ao buscar cidade. Tente novamente.");
    } finally {
      setSearching(false);
    }
  }

  return { query, setQuery, searching, error, search };
}
