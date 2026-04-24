"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Search, Loader2, MapPin, Building2, AlertCircle, X } from "lucide-react";
import { MapaImoveis, useMapSearch, type MapImovel } from "@/components/MapaImoveis";

export default function MapaPage() {
  const [imoveis, setImoveis] = useState<MapImovel[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isBackgroundGeocoding, setIsBackgroundGeocoding] = useState(false);
  const [pendingGeocodeCount, setPendingGeocodeCount] = useState(0);
  const { query, setQuery, searching, error: searchError, search } = useMapSearch();
  const geocodingRef = useRef(false);

  // Load initially mapped properties fast
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/imoveis/mapa");
        const data = (await res.json()) as { imoveis: MapImovel[]; pendingGeocode: number };
        setImoveis(data.imoveis ?? []);
        if (data.pendingGeocode && data.pendingGeocode > 0) {
          setPendingGeocodeCount(data.pendingGeocode);
        }
      } catch (error) {
        console.error("Error loading initial map data:", error);
      } finally {
        setLoadingInitial(false);
      }
    }
    load();
  }, []);

  // Background geocoding logic
  const performBackgroundGeocoding = useCallback(async () => {
    if (geocodingRef.current || pendingGeocodeCount <= 0) return;
    
    geocodingRef.current = true;
    setIsBackgroundGeocoding(true);

    try {
      const res = await fetch("/api/imoveis/mapa", {
        method: "POST",
      });
      
      if (!res.ok) throw new Error("Geocoding API failed");
      
      const data = (await res.json()) as { imoveis: MapImovel[]; remaining: number };
      
      if (data.imoveis && data.imoveis.length > 0) {
        setImoveis((prev) => {
          // Merge avoiding duplicates by ID
          const existingIds = new Set(prev.map(i => i.id));
          const newImoveis = data.imoveis.filter(i => !existingIds.has(i.id));
          return [...prev, ...newImoveis];
        });
      }

      setPendingGeocodeCount(data.remaining || 0);

      // If there are still remaining properties to geocode, wait 2s and trigger again
      if (data.remaining > 0) {
        setTimeout(() => {
          geocodingRef.current = false;
          performBackgroundGeocoding();
        }, 2000);
      } else {
        geocodingRef.current = false;
        setIsBackgroundGeocoding(false);
      }
      
    } catch (error) {
      console.error("Background geocoding error:", error);
      geocodingRef.current = false;
      setIsBackgroundGeocoding(false);
      
      // Retry logic on error
      setTimeout(() => {
        performBackgroundGeocoding();
      }, 10000); // Retry in 10s if it fails
    }
  }, [pendingGeocodeCount]);

  // Trigger background geocoding once initial load is done and there are pending items
  useEffect(() => {
    if (!loadingInitial && pendingGeocodeCount > 0 && !geocodingRef.current) {
      performBackgroundGeocoding();
    }
  }, [loadingInitial, pendingGeocodeCount, performBackgroundGeocoding]);


  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* ── Search Bar ─────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          top: "16px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          width: "min(460px, calc(100vw - 2rem))",
        }}
      >
        <form
          onSubmit={search}
          style={{
            display: "flex",
            alignItems: "center",
            background: "var(--color-surface-900)",
            border: "1px solid var(--color-surface-700)",
            borderRadius: "12px",
            padding: "6px 6px 6px 14px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.3)",
            gap: "8px",
          }}
        >
          <Search size={18} style={{ color: "var(--color-surface-400)", flexShrink: 0 }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar cidade..."
            style={{
              flex: 1,
              background: "none",
              border: "none",
              outline: "none",
              color: "var(--color-surface-50)",
              fontSize: "14px",
              fontFamily: "inherit",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--color-surface-400)",
                padding: "2px",
                display: "flex",
              }}
            >
              <X size={16} />
            </button>
          )}
          <button
            type="submit"
            disabled={searching || !query.trim()}
            style={{
              background: "linear-gradient(135deg, #5158e8, #6470f3)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: !query.trim() ? 0.5 : 1,
              transition: "opacity 0.15s",
              flexShrink: 0,
            }}
          >
            {searching ? <Loader2 size={14} className="animate-spin" /> : null}
            Buscar
          </button>
        </form>

        {/* Search error */}
        {searchError && (
          <div
            style={{
              marginTop: "8px",
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "8px",
              padding: "8px 12px",
              fontSize: "13px",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <AlertCircle size={14} />
            {searchError}
          </div>
        )}
      </div>

      {/* ── Stats badge ─────────────────────────────────── */}
      {!loadingInitial && (
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            left: "16px",
            zIndex: 1000,
            background: "var(--color-surface-900)",
            border: "1px solid var(--color-surface-700)",
            borderRadius: "10px",
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "13px",
          }}
        >
          <div
            style={{
              width: "32px",
              height: "32px",
              background: "rgba(100,112,243,0.15)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Building2 size={16} style={{ color: "#6470f3" }} />
          </div>
          <div>
            <div style={{ fontWeight: 600, color: "var(--color-surface-50)" }}>
              {imoveis.length} imóvel{imoveis.length !== 1 ? "is" : ""} no mapa
            </div>
            {isBackgroundGeocoding ? (
               <div style={{ fontSize: "11px", color: "var(--color-surface-400)", display: "flex", alignItems: "center", gap: "4px" }}>
                 <Loader2 size={10} className="animate-spin" /> Processando mais {pendingGeocodeCount}...
               </div>
            ) : (
              <div style={{ fontSize: "11px", color: "var(--color-surface-400)" }}>
                Clique em um marcador para ver detalhes
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Loading overlay ──────────────────────────────── */}
      {loadingInitial && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2000,
            background: "var(--color-surface-950)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              background: "linear-gradient(135deg, #5158e8, #6470f3)",
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(100,112,243,0.4)",
            }}
          >
            <MapPin size={28} color="white" />
          </div>
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: "18px",
                color: "var(--color-surface-50)",
                marginBottom: "4px",
              }}
            >
              Carregando mapa
            </div>
            <div style={{ color: "var(--color-surface-400)", fontSize: "13px" }}>
              Buscando imóveis com localização...
            </div>
          </div>
          <Loader2 size={20} style={{ color: "#6470f3" }} className="animate-spin" />
        </div>
      )}

      {/* ── Map ─────────────────────────────────────────── */}
      {!loadingInitial && (
        <>
           {imoveis.length === 0 && !isBackgroundGeocoding && (
             <div
               style={{
                 position: "absolute",
                 top: "50%",
                 left: "50%",
                 transform: "translate(-50%, -50%)",
                 zIndex: 1000,
                 background: "var(--color-surface-900)",
                 border: "1px solid var(--color-surface-700)",
                 borderRadius: "12px",
                 padding: "24px",
                 textAlign: "center",
                 boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
                 maxWidth: "320px"
               }}
             >
               <MapPin size={32} style={{ color: "var(--color-surface-500)", margin: "0 auto 12px" }} />
               <h3 style={{ color: "var(--color-surface-50)", fontSize: "16px", fontWeight: 600, marginBottom: "8px" }}>
                 Nenhum imóvel no mapa
               </h3>
               <p style={{ color: "var(--color-surface-400)", fontSize: "13px", lineHeight: "1.5" }}>
                 Você ainda não possui imóveis com endereço cadastrado ou não foi possível localizá-los no mapa.
               </p>
             </div>
           )}
           <MapaImoveis imoveis={imoveis} onSearchCoords={() => {}} />
        </>
      )}
    </div>
  );
}
