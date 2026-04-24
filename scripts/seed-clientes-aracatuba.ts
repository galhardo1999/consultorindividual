import { PrismaClient, OrigemLead, EstagioJornada, TemperaturaLead, NivelUrgencia, StatusCliente, TipoImovel, CondicaoImovel } from "@prisma/client";
import { fakerPT_BR as faker } from "@faker-js/faker";

const prisma = new PrismaClient();

function generateCPF() {
  const n = () => Math.floor(Math.random() * 9);
  const n1 = n(), n2 = n(), n3 = n(), n4 = n(), n5 = n(), n6 = n(), n7 = n(), n8 = n(), n9 = n();
  let d1 = n9 * 2 + n8 * 3 + n7 * 4 + n6 * 5 + n5 * 6 + n4 * 7 + n3 * 8 + n2 * 9 + n1 * 10;
  d1 = 11 - (d1 % 11);
  if (d1 >= 10) d1 = 0;
  let d2 = d1 * 2 + n9 * 3 + n8 * 4 + n7 * 5 + n6 * 6 + n5 * 7 + n4 * 8 + n3 * 9 + n2 * 10 + n1 * 11;
  d2 = 11 - (d2 % 11);
  if (d2 >= 10) d2 = 0;
  return `${n1}${n2}${n3}.${n4}${n5}${n6}.${n7}${n8}${n9}-${d1}${d2}`;
}

async function main() {
  console.log("Iniciando seed de clientes em Araçatuba...");

  // Buscar um usuário para ser o responsável (corretor) pelos clientes
  const usuario = await prisma.usuario.findFirst();

  if (!usuario) {
    console.error("❌ Nenhum usuário encontrado no banco de dados. Cadastre-se na plataforma primeiro antes de rodar o seed.");
    return;
  }

  console.log(`👤 Vinculando clientes ao corretor: ${usuario.nome} (${usuario.id})`);

  const origens = Object.values(OrigemLead);
  const estagios = Object.values(EstagioJornada);
  const temperaturas = Object.values(TemperaturaLead);
  const niveisUrgencia = Object.values(NivelUrgencia);

  const clientesCriados = [];

  for (let i = 0; i < 50; i++) {
    const nome = faker.person.fullName();
    // Assegurar DDD 18 que é o da região de Araçatuba
    const telefoneAracatuba = `(18) 9${faker.string.numeric(4)}-${faker.string.numeric(4)}`;
    
    // Gerar um endereço fake em Araçatuba
    const bairro = faker.helpers.arrayElement(["Nova Iorque", "Vila Mendonça", "Planalto", "Ipanema", "Morada dos Nobres", "Jardim Paulista", "Concórdia", "Aeroporto", "Higienópolis", "Centro"]);
    const rua = faker.location.street();
    const numero = faker.location.buildingNumber();
    const cep = `160${faker.string.numeric(2)}-${faker.string.numeric(3)}`; // CEP base Araçatuba
    
    const enderecoCompleto = `${rua}, ${numero} - ${bairro}, Araçatuba - SP, ${cep}`;

    const clienteData = {
      usuarioId: usuario.id,
      nomeCompleto: nome,
      email: faker.internet.email({ firstName: nome.split(' ')[0], lastName: nome.split(' ').pop() }).toLowerCase(),
      telefone: telefoneAracatuba,
      whatsapp: faker.datatype.boolean() ? telefoneAracatuba : null,
      documento: generateCPF(),
      cidadeAtual: "Araçatuba",
      origemLead: faker.helpers.arrayElement(origens),
      estagioJornada: faker.helpers.arrayElement(estagios),
      temperaturaLead: faker.helpers.arrayElement(temperaturas),
      nivelUrgencia: faker.helpers.arrayElement(niveisUrgencia),
      // Maioria ativo
      status: faker.helpers.arrayElement([StatusCliente.ATIVO, StatusCliente.ATIVO, StatusCliente.ATIVO, StatusCliente.INATIVO]), 
      observacoes: `Cliente fictício gerado por script.\nEndereço: ${enderecoCompleto}`,
      criadoEm: faker.date.recent({ days: 90 }),
      preferencia: {
        create: {
          tipoImovel: faker.helpers.arrayElement(Object.values(TipoImovel)),
          precoMinimo: faker.number.int({ min: 100000, max: 300000 }),
          precoMaximo: faker.number.int({ min: 400000, max: 2000000 }),
          cidadeInteresse: "Araçatuba",
          bairrosInteresse: faker.helpers.arrayElements(["Nova Iorque", "Vila Mendonça", "Planalto", "Ipanema", "Morada dos Nobres", "Jardim Paulista", "Concórdia"], 2).join(", "),
          minQuartos: faker.number.int({ min: 1, max: 4 }),
          minBanheiros: faker.number.int({ min: 1, max: 3 }),
          minVagas: faker.number.int({ min: 1, max: 3 }),
          condicaoImovel: faker.helpers.arrayElement(Object.values(CondicaoImovel)),
          aceitaFinanciamento: faker.datatype.boolean(),
          condominioFechado: faker.datatype.boolean(),
        }
      }
    };

    const cliente = await prisma.cliente.create({
      data: clienteData
    });
    clientesCriados.push(cliente);
  }

  console.log(`✅ ${clientesCriados.length} clientes fictícios de Araçatuba foram criados com sucesso!`);
}

main()
  .catch((e) => {
    console.error("❌ Erro ao popular o banco de dados:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
