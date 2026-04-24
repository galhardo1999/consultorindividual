import { PrismaClient, TipoImovel, FinalidadeImovel, StatusImovel } from "@prisma/client";

const prisma = new PrismaClient();

const bairros = [
  "Nova Iorque",
  "Concórdia",
  "Ipanema",
  "Planalto",
  "Centro",
  "Vila Mendonça",
  "Morada dos Nobres",
  "Vila Bandeirantes",
  "Jardim Sumaré",
  "Umuarama",
  "Jardim Nova York",
  "Vila Estádio",
  "Guanabara",
  "Jardim Alvorada",
  "Icaray",
  "Aeroporto",
  "Icaraí",
  "Vila Alba",
  "Nossa Senhora Aparecida",
  "Jardim Paulista",
];

const tipos = [
  TipoImovel.APARTAMENTO,
  TipoImovel.CASA,
  TipoImovel.CASA_CONDOMINIO,
  TipoImovel.SALA_COMERCIAL,
];

// Helper para gerar números aleatórios
function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Valores de locação entre R$ 700 e R$ 3500
function getRandomPreco() {
  // Preços em múltiplos de 50 para parecer mais realista
  const rawPrice = getRandomInt(700, 3500);
  return Math.round(rawPrice / 50) * 50;
}

async function main() {
  console.log("Iniciando seed de imóveis em Araçatuba...");

  // Pegar o primeiro usuário para atribuir os imóveis
  const usuario = await prisma.usuario.findFirst();

  if (!usuario) {
    console.error("Erro: Nenhum usuário encontrado no banco de dados.");
    console.error("Crie um usuário primeiro (fazendo login na aplicação).");
    process.exit(1);
  }

  console.log(`Usando usuário: ${usuario.nome} (${usuario.id})`);

  let count = 0;

  for (let i = 0; i < 30; i++) {
    const bairro = bairros[getRandomInt(0, bairros.length - 1)];
    const tipo = tipos[getRandomInt(0, tipos.length - 1)];
    const preco = getRandomPreco();
    
    // Gerar algumas características realistas
    const quartos = tipo === TipoImovel.SALA_COMERCIAL ? null : getRandomInt(1, 4);
    const banheiros = getRandomInt(1, 3);
    const vagasGaragem = getRandomInt(0, 3);
    const areaUtil = getRandomInt(30, 200);
    const valorCondominio = getRandomInt(0, 5) > 1 ? getRandomInt(100, 800) : null; // Algumas vezes null
    const valorIptu = getRandomInt(0, 5) > 2 ? getRandomInt(30, 250) : null;

    let titulo = "";
    if (tipo === TipoImovel.APARTAMENTO) {
      titulo = `Apartamento para locação no ${bairro}`;
    } else if (tipo === TipoImovel.CASA) {
      titulo = `Casa para locação no ${bairro}`;
    } else if (tipo === TipoImovel.CASA_CONDOMINIO) {
      titulo = `Casa em Condomínio no ${bairro}`;
    } else {
      titulo = `Sala Comercial para alugar - ${bairro}`;
    }

    try {
      await prisma.imovel.create({
        data: {
          usuarioId: usuario.id,
          titulo,
          tipoImovel: tipo,
          finalidade: FinalidadeImovel.LOCACAO, // Finalidade LOCACAO pois os preços são de 700 a 3500
          preco,
          cidade: "Araçatuba",
          bairro,
          endereco: `Rua Exemplo, ${getRandomInt(10, 2000)}, ${bairro}`,
          quartos,
          banheiros,
          vagasGaragem,
          areaUtil,
          valorCondominio,
          valorIptu,
          status: StatusImovel.DISPONIVEL,
          descricao: `Excelente oportunidade em Araçatuba! Imóvel muito bem localizado no bairro ${bairro}, pronto para receber você e sua família. Conta com ótimo acabamento e localização privilegiada.`,
          codigoInterno: `LOC-${getRandomInt(1000, 9999)}`,
        },
      });
      count++;
    } catch (e) {
      console.error(`Erro ao criar imóvel ${i}:`, e);
    }
  }

  console.log(`Sucesso! ${count} imóveis foram adicionados em Araçatuba.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
