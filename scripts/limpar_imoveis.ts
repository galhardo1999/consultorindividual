import { PrismaClient } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";

const prisma = new PrismaClient();

async function main() {
  console.log("⚠️ Iniciando exclusão de TODOS os imóveis...");
  
  // Como as tabelas FotoImovel e Interesse têm onDelete: Cascade,
  // elas serão apagadas automaticamente pelo banco junto com os imóveis.
  const result = await prisma.imovel.deleteMany({});
  
  console.log(`✅ Sucesso: ${result.count} imóveis (e suas fotos/interesses vinculados) foram excluídos do banco de dados.`);
  
  // Limpar Supabase
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (supabaseUrl && supabaseKey) {
    console.log("🗑️ Apagando arquivos do Supabase Storage...");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: files, error: listError } = await supabase.storage.from("imoveis").list();
    
    if (listError) {
      console.error("❌ Erro ao listar arquivos do Supabase (Verifique suas permissões/Policies):", listError.message);
    } else if (files && files.length > 0) {
      const filesToRemove = files.map(x => x.name);
      const { error: removeError } = await supabase.storage.from("imoveis").remove(filesToRemove);
      
      if (removeError) {
        console.error("❌ Erro ao apagar arquivos do Supabase:", removeError.message);
      } else {
        console.log(`✅ Sucesso: ${filesToRemove.length} imagens apagadas do bucket 'imoveis'.`);
      }
    } else {
      console.log("ℹ️ Nenhum arquivo encontrado no bucket 'imoveis'.");
    }
  } else {
    console.log("⚠️ Credenciais do Supabase não encontradas no .env, ignorando limpeza de imagens.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Erro ao excluir imóveis:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
