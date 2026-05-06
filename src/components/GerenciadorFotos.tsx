"use client";

import { useId, useRef, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { X, ImagePlus, Loader2 } from "lucide-react";

interface GerenciadorFotosProps {
  fotosIniciais: string[];
  pasta: string;
  onChange: (fotos: string[]) => void;
  maxFotos?: number;
}

// ─── Card arrastável ────────────────────────────────────────────────────────

const SortablePhoto = ({
  id,
  url,
  isCapa,
  onRemove,
}: {
  id: string;
  url: string;
  isCapa: boolean;
  onRemove: (id: string) => void;
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative group rounded-md overflow-hidden aspect-square bg-gray-100 border border-gray-200 cursor-grab active:cursor-grabbing"
    >
      <img
        src={url}
        alt="Foto"
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />

      {/* Botão de excluir — bloqueia o pointer para não ativar drag */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 p-1 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100 z-20"
      >
        <X size={14} />
      </button>

      {isCapa && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] text-center py-1 font-medium z-10 pointer-events-none">
          CAPA
        </div>
      )}
    </div>
  );
};

// ─── Componente principal ────────────────────────────────────────────────────

const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const TAMANHO_MAX_BYTES = 5 * 1024 * 1024;

const enviarImagem = async (arquivo: File, pasta: string) => {
  const formulario = new FormData();
  formulario.append("arquivo", arquivo);
  if (pasta) formulario.append("pasta", pasta);

  const resposta = await fetch("/api/storage/imagens", {
    method: "POST",
    body: formulario,
  });

  const dados = (await resposta.json()) as { url?: string; error?: string };
  if (!resposta.ok || !dados.url) {
    throw new Error(dados.error || "Erro ao enviar imagem");
  }

  return dados.url;
};

export function GerenciadorFotos({
  fotosIniciais,
  pasta,
  onChange,
  maxFotos = 20,
}: GerenciadorFotosProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fotos, setFotos] = useState<{ id: string; url: string }[]>(
    fotosIniciais.map((url) => ({ id: url, url }))
  );
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ── Reordenação ────────────────────────────────────────────────────────────

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setFotos((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        onChange(newItems.map((i) => i.url));
        return newItems;
      });
    }
  };

  // ── Remoção ────────────────────────────────────────────────────────────────

  const handleRemove = (idToRemove: string) => {
    setFotos((items) => {
      const newItems = items.filter((i) => i.id !== idToRemove);
      onChange(newItems.map((i) => i.url));
      return newItems;
    });
  };

  // ── Upload ─────────────────────────────────────────────────────────────────

  const handleSelectFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const vagas = maxFotos - fotos.length;
    const arquivos = Array.from(e.target.files)
      .slice(0, vagas)
      .filter((file) => {
        if (!TIPOS_PERMITIDOS.includes(file.type)) {
          alert(`Formato inválido: ${file.name}. Use JPG, PNG ou WEBP.`);
          return false;
        }
        if (file.size > TAMANHO_MAX_BYTES) {
          alert(`Arquivo muito grande: ${file.name}. Limite: 5MB.`);
          return false;
        }
        return true;
      });

    if (arquivos.length === 0) return;

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of arquivos) {
        const url = await enviarImagem(file, pasta);
        urls.push(url);
      }

      if (urls.length > 0) {
        setFotos((items) => {
          const newItems = [
            ...items,
            ...urls.map((url) => ({ id: url, url })),
          ];
          onChange(newItems.map((i) => i.url));
          return newItems;
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
      // Limpa o input para permitir re-selecionar os mesmos arquivos
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const podeAdicionar = fotos.length < maxFotos && !uploading;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div>
      {/* Input hidden — acionado pelo quadrado no grid */}
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleSelectFiles}
        disabled={!podeAdicionar}
      />

      {fotos.length > 0 && (
        <p
          className="text-sm font-medium mb-3"
          style={{ color: "var(--color-surface-400)" }}
        >
          Fotos ({fotos.length})
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fotos.map((f) => f.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {fotos.map((foto, index) => (
              <SortablePhoto
                key={foto.id}
                id={foto.id}
                url={foto.url}
                isCapa={index === 0}
                onRemove={handleRemove}
              />
            ))}

            {/* Quadrado de upload — aparece sempre após a última foto */}
            {podeAdicionar && (
              <label
                htmlFor={inputId}
                className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors hover:bg-gray-50"
                style={{ borderColor: "var(--color-surface-300)" }}
              >
                <ImagePlus
                  size={28}
                  style={{ color: "var(--color-surface-400)" }}
                />
                <span
                  className="text-xs text-center px-2 leading-tight"
                  style={{ color: "var(--color-surface-400)" }}
                >
                  Adicionar fotos

                  <p className="text-xs mt-1">PNG, JPG ou WEBP
                  </p>
                </span>
              </label>
            )}

            {/* Quadrado de loading durante upload */}
            {uploading && (
              <div
                className="aspect-square rounded-md border-2 border-dashed flex flex-col items-center justify-center gap-2"
                style={{ borderColor: "var(--color-surface-300)" }}
              >
                <Loader2
                  size={28}
                  className="animate-spin"
                  style={{ color: "var(--color-primary-500)" }}
                />
                <span
                  className="text-xs"
                  style={{ color: "var(--color-surface-400)" }}
                >
                  Enviando...
                </span>
              </div>
            )}
          </div>
        </SortableContext>
      </DndContext>

    </div>
  );
}
