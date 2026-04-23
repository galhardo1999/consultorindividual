import fs from 'fs';
import path from 'path';

const translations = {
  // Models
  "Client": "Cliente",
  "clients": "clientes",
  "client": "cliente",
  
  "ClientPreference": "PreferenciaCliente",
  "preference": "preferencia",
  
  "Property": "Imovel",
  "properties": "imoveis",
  "property": "imovel",
  
  "PropertyFeature": "CaracteristicaImovel",
  "features": "caracteristicas",
  
  "ClientPropertyInterest": "InteresseClienteImovel",
  "interests": "interesses",
  "interest": "interesse",
  
  "Interaction": "Interacao",
  "interactions": "interacoes",
  "interaction": "interacao",
  
  "Tag": "Etiqueta",
  "tags": "etiquetas",
  
  "ClientTag": "EtiquetaCliente",
  "clientTags": "etiquetasCliente",
  
  "User": "Usuario",
  "user": "usuario",
  "users": "usuarios",

  // Fields
  "userId": "usuarioId",
  "clientId": "clienteId",
  "propertyId": "imovelId",
  
  "fullName": "nomeCompleto",
  "currentCity": "cidadeAtual",
  "leadSource": "origemLead",
  "journeyStage": "estagioJornada",
  "purchaseGoal": "objetivoCompra",
  "paymentMethod": "formaPagamento",
  "urgencyLevel": "nivelUrgencia",
  "notes": "observacoes",
  "archivedAt": "arquivadoEm",
  "createdAt": "criadoEm",
  "updatedAt": "atualizadoEm",
  
  "propertyType": "tipoImovel",
  "minPrice": "precoMinimo",
  "maxPrice": "precoMaximo",
  "cityInterest": "cidadeInteresse",
  "neighborhoodsInterest": "bairrosInteresse",
  "minBedrooms": "minQuartos",
  "minBathrooms": "minBanheiros",
  "minParkingSpots": "minVagas",
  "minArea": "areaMinima",
  "maxArea": "areaMaxima",
  "propertyCondition": "condicaoImovel",
  "acceptsFinancing": "aceitaFinanciamento",
  "acceptsExchange": "aceitaPermuta",
  "gatedCommunity": "condominioFechado",
  "preferredFeatures": "caracteristicasPreferidas",
  "restrictions": "restricoes",
  "moveInTimeline": "prazoMudanca",
  "personalNotes": "notasPessoais",
  
  "internalCode": "codigoInterno",
  "title": "titulo",
  "description": "descricao",
  "purpose": "finalidade",
  "price": "preco",
  "condoFee": "valorCondominio",
  "iptu": "valorIptu",
  "city": "cidade",
  "neighborhood": "bairro",
  "addressLine": "endereco",
  "bedrooms": "quartos",
  "suites": "suites",
  "bathrooms": "banheiros",
  "parkingSpots": "vagasGaragem",
  "area": "areaUtil",
  "furnished": "mobiliado",
  "source": "origemCaptacao",
  "highlights": "destaques",
  
  "featureType": "tipoCaracteristica",
  "featureValue": "valorCaracteristica",
  
  "interestStatus": "statusInteresse",
  "priorityLevel": "nivelPrioridade",
  "isFavorite": "ehFavorito",
  "presentedAt": "apresentadoEm",
  "rejectionReason": "motivoRejeicao",
  
  "interactionType": "tipoInteracao",
  "interactionDate": "dataInteracao",
  "nextFollowUpAt": "proximoFollowUp",
  
  "name": "nome",
  "passwordHash": "senhaHash",
  "phone": "telefone",
  "active": "ativo"
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (stat.isFile() && (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx'))) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;
      
      // Sort keys by length descending to prevent partial replacements (e.g. replacing 'client' inside 'clientId')
      const keys = Object.keys(translations).sort((a, b) => b.length - a.length);
      
      for (const key of keys) {
        // Regex to replace whole words, considering JS variable names
        const regex = new RegExp(`\\b${key}\\b`, 'g');
        content = content.replace(regex, translations[key]);
      }
      
      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory('./src');
console.log('Done refactoring src!');
