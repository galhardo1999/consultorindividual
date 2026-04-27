import { PrismaClient } from '@prisma/client'
import { fakerPT_BR as faker } from '@faker-js/faker'

const prisma = new PrismaClient()

async function main() {
  const email = 'teste1@gmail.com'

  const user = await prisma.usuario.findUnique({
    where: { email }
  })

  if (!user) {
    console.error(`Usuário com email ${email} não encontrado.`)
    return
  }

  console.log(`Usuário encontrado: ${user.nome} (${user.id})`)
  console.log('Iniciando geração de 10 proprietários, com 1 a 6 imóveis cada...')

  for (let i = 0; i < 10; i++) {
    const ownerName = faker.person.fullName()
    
    // Criar o proprietário
    const owner = await prisma.proprietario.create({
      data: {
        usuarioId: user.id,
        nomeCompleto: ownerName,
        email: faker.internet.email({ firstName: ownerName.split(' ')[0] }),
        telefone: faker.phone.number({ style: 'national' }),
        status: 'ATIVO',
        tipoPessoa: 'PESSOA_FISICA',
        cidade: faker.location.city(),
        estado: faker.location.state({ abbreviated: true }),
        endereco: faker.location.streetAddress(),
        bairro: faker.location.county(),
        cep: faker.location.zipCode()
      }
    })

    // Randomizar quantidade de imóveis de 1 a 6
    const numProperties = faker.number.int({ min: 1, max: 6 })
    console.log(`Criado proprietário ${i + 1}/10: ${owner.nomeCompleto} - Gerando ${numProperties} imóveis...`)

    // Tipos de imóvel possíveis
    const tiposImovel = ['APARTAMENTO', 'CASA', 'CASA_CONDOMINIO', 'TERRENO', 'SALA_COMERCIAL'] as const
    const finalidades = ['VENDA', 'LOCACAO'] as const

    for (let j = 0; j < numProperties; j++) {
      const tipo = faker.helpers.arrayElement(tiposImovel)
      const finalidade = faker.helpers.arrayElement(finalidades)
      const isLocacao = finalidade === 'LOCACAO'

      const precoBase = faker.number.int({ min: 150000, max: 3000000 })
      const preco = isLocacao ? faker.number.int({ min: 1500, max: 15000 }) : precoBase
      
      let titulo = ''
      if (tipo === 'APARTAMENTO') titulo = 'Lindo Apartamento'
      else if (tipo === 'CASA') titulo = 'Casa Espaçosa'
      else if (tipo === 'CASA_CONDOMINIO') titulo = 'Casa em Condomínio Fechado'
      else if (tipo === 'TERRENO') titulo = 'Ótimo Terreno'
      else titulo = 'Sala Comercial Bem Localizada'

      const bairro = faker.location.county()

      await prisma.imovel.create({
        data: {
          usuarioId: user.id,
          proprietarioId: owner.id,
          titulo: `${titulo} em ${bairro}`,
          descricao: faker.lorem.paragraph(),
          tipoImovel: tipo,
          finalidade: finalidade,
          preco: preco,
          valorCondominio: faker.helpers.maybe(() => faker.number.int({ min: 300, max: 2000 }), { probability: 0.7 }),
          valorIptu: faker.helpers.maybe(() => faker.number.int({ min: 100, max: 800 }), { probability: 0.7 }),
          cidade: faker.location.city(),
          bairro: bairro,
          cep: faker.location.zipCode(),
          endereco: faker.location.street(),
          numero: faker.location.buildingNumber(),
          areaUtil: faker.number.int({ min: 40, max: 500 }),
          quartos: tipo === 'TERRENO' || tipo === 'SALA_COMERCIAL' ? null : faker.number.int({ min: 1, max: 5 }),
          suites: tipo === 'TERRENO' || tipo === 'SALA_COMERCIAL' ? null : faker.number.int({ min: 0, max: 3 }),
          banheiros: tipo === 'TERRENO' ? null : faker.number.int({ min: 1, max: 5 }),
          vagasGaragem: tipo === 'TERRENO' ? null : faker.number.int({ min: 0, max: 4 }),
          status: 'DISPONIVEL'
        }
      })
    }
  }

  console.log('Todos os 10 proprietários e seus imóveis foram gerados com sucesso!')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
