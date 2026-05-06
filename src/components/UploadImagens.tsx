"use client";

import { useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";

interface UploadImagensProps {
  onUpload: (urls: string[]) => void;
  maxFiles?: number;
  pasta?: string;
}

export function UploadImagens({ onUpload, maxFiles = 10, pasta }: UploadImagensProps) {
  const [uploading, setUploading] = useState(false);
  const [fotos, setFotos] = useState<{ file: File; preview: string }[]>([]);

  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  const TAMANHO_MAX_MB = 5;
  const TAMANHO_MAX_BYTES = TAMANHO_MAX_MB * 1024 * 1024;

  async function enviarImagem(arquivo: File) {
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
  }

  async function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files) return;

    const arquivosBrutos = Array.from(e.target.files).slice(0, maxFiles - fotos.length);
    if (arquivosBrutos.length === 0) return;

    const arquivosValidos = arquivosBrutos.filter((file) => {
      if (!TIPOS_PERMITIDOS.includes(file.type)) {
        alert(`Formato inválido: ${file.name}. Use JPG, PNG, WEBP ou GIF.`);
        return false;
      }
      if (file.size > TAMANHO_MAX_BYTES) {
        alert(`Arquivo muito grande: ${file.name}. O limite é ${TAMANHO_MAX_MB}MB.`);
        return false;
      }
      return true;
    });

    const selectedFiles = arquivosValidos;
    if (selectedFiles.length === 0) return;

    const newFotos = selectedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));

    setFotos(prev => [...prev, ...newFotos]);

    setUploading(true);
    try {
      const urls: string[] = [];
      for (const { file } of newFotos) {
        urls.push(await enviarImagem(file));
      }
      
      onUpload(urls);
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  }

  function removeFoto(index: number) {
    // Note: isso não deleta do Supabase, apenas remove do preview atual
    setFotos(prev => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="w-full">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors" style={{ borderColor: "var(--color-surface-200)" }}>
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          id="file-upload" 
          onChange={handleSelectFiles}
          disabled={uploading || fotos.length >= maxFiles}
        />
        <label htmlFor="file-upload" className="w-full flex flex-col items-center cursor-pointer">
          {uploading ? (
            <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-3" style={{ color: "var(--color-primary-500)" }} />
          ) : (
            <UploadCloud className="h-10 w-10 text-gray-400 mb-3" style={{ color: "var(--color-surface-400)" }} />
          )}
          <p className="text-sm font-medium" style={{ color: "var(--color-surface-50)" }}>
            {uploading ? "Fazendo upload..." : "Clique para selecionar fotos"}
          </p>
          <p className="text-xs mt-1" style={{ color: "var(--color-surface-400)" }}>
            PNG, JPG ou WEBP (Máx. {maxFiles} fotos)
          </p>
        </label>
      </div>

      {fotos.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {fotos.map((foto, index) => (
            <div key={index} className="relative group rounded-md overflow-hidden aspect-square bg-gray-100">
              <img src={foto.preview} alt="Preview" className="w-full h-full object-cover" />
              {!uploading && (
                <button 
                  type="button"
                  onClick={() => removeFoto(index)}
                  className="absolute top-1 right-1 bg-black/50 hover:bg-red-500 p-1 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
