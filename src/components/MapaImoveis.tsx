"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, Marker } from "leaflet";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MapImovel {
  id: string;
  titulo: string;
  tipoImovel: string;
  finalidade: string;
  preco: number;
  status: string;
  cidade: string;
  bairro: string | null;
  quartos: number | null;
  areaUtil: number | null;
  lat: number;
  lng: number;
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
            <span style="transform:rotate(45deg);font-size:14px">🏠</span>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36],
      });

      const popupHtml = `
        <div style="font-family:Inter,sans-serif;min-width:200px;max-width:260px;padding:4px">
          <div style="font-weight:700;font-size:14px;margin-bottom:6px;color:#0f172a;line-height:1.3">${imovel.titulo}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span style="background:${color}22;color:${color};font-size:11px;font-weight:600;padding:2px 8px;border-radius:999px;border:1px solid ${color}44">
              ${statusLabel[imovel.status] ?? imovel.status}
            </span>
            <span style="font-size:11px;color:#64748b">${tipoLabel[imovel.tipoImovel] ?? imovel.tipoImovel}</span>
          </div>
          <div style="font-size:13px;color:#64748b;margin-bottom:4px">
            📍 ${[imovel.bairro, imovel.cidade].filter(Boolean).join(", ")}
          </div>
          ${imovel.quartos ? `<div style="font-size:12px;color:#94a3b8;margin-bottom:4px">🛏 ${imovel.quartos} quarto${imovel.quartos > 1 ? "s" : ""}${imovel.areaUtil ? ` · ${imovel.areaUtil}m²` : ""}</div>` : ""}
          <div style="font-size:18px;font-weight:800;color:#4f46e5;margin-bottom:10px">
            ${formatCurrency(imovel.preco)}
          </div>
          <a href="/imoveis/${imovel.id}" style="
            display:block;text-align:center;background:#4f46e5;color:white;
            text-decoration:none;padding:7px 12px;border-radius:8px;
            font-size:12px;font-weight:600;transition:background 0.15s
          " onmouseover="this.style.background='#4338ca'" onmouseout="this.style.background='#4f46e5'">
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
