// ============================================================================
// 🏡 SCRIPT DE BACKEND - CHÁ DE CASA NOVA (EMILY & GUSTAVO)
// ============================================================================
// Instruções:
// 1. Copie TODO este código.
// 2. Vá na sua Planilha Google > Extensões > Apps Script.
// 3. Apague qualquer código que estiver lá e cole este.
// 4. Salve o projeto.
// 5. Para limpar a planilha antiga e colocar os presentes novos:
//    - Selecione a função "RESETAR_E_POPULAR_PLANILHA" na barra superior.
//    - Clique em "Executar".
// 6. Para colocar o site no ar:
//    - Clique em "Implantar" > "Nova Implantação".
//    - Tipo: "App da Web".
//    - Descrição: "Versão 1".
//    - Executar como: "Eu".
//    - Quem pode acessar: "Qualquer pessoa" (IMPORTANTE).
//    - Copie a URL gerada e coloque no arquivo constants.ts do site.
// ============================================================================

const SHEET_NAME = "Presentes";

// Configuração dos Presentes Iniciais (Para a função de Reset)
// OBS: Imagens e Preços são estimativas iniciais para o site não ficar vazio.
// Você pode editar tudo depois pelo Painel Admin do site.
const INITIAL_DATA = [
  {
    category: "Cozinha",
    items: [
      { 
        name: "Jogo de Panelas Completo", 
        price: 289.90, 
        image: "https://down-br.img.susercontent.com/file/br-11134207-81z1k-milpmcfqw16pe7.webp", 
        link: "https://shopee.com.br/Jogo-de-Panelas-D'It%C3%A1lia-Teflon-10-Pe%C3%A7as-F%C3%A1cil-de-Limpar-e-N%C3%A3o-Gruda-Utens%C3%ADlios-e-Tampa-Vidro-i.328530918.13596339620?extraParams=%7B%22display_model_id%22%3A189170254733%2C%22model_selection_logic%22%3A3%7D&sp_atk=29606285-aea3-49de-8aaf-eace5063e3c6&xptdk=29606285-aea3-49de-8aaf-eace5063e3c6"
      },
      { name: "Panela de Pressão", price: 140.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Panela+Pressao", link: "" },
      { name: "Conjunto de Faca", price: 80.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Facas", link: "" },
      { name: "Porta Detergente + Esponja + Rodinho", price: 45.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Kit+Pia", link: "" },
      { name: "Lixeira de Pia", price: 35.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Lixeira+Pia", link: "" },
      { name: "Tábua de Cortar", price: 30.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Tabua", link: "" },
      { name: "Forma de Gelo", price: 15.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Forma+Gelo", link: "" },
      { name: "Conjunto de Talher", price: 100.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Talheres", link: "" },
      { name: "Conjunto de Pratos", price: 150.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Pratos", link: "" },
      { name: "Conjunto de Copos", price: 60.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Copos", link: "" },
      { name: "Forma (Assadeira)", price: 45.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Forma", link: "" },
      { name: "Jarra de Vidro", price: 35.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Jarra", link: "" },
      { name: "Potes de Mantimentos", price: 80.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Potes", link: "" },
      { name: "Triturador de Cebola", price: 25.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Triturador", link: "" },
      { name: "Utensílios para Servir", price: 50.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Utensilios", link: "" },
      { name: "Kit de Potes para Temperos", price: 40.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Temperos", link: "" },
      { name: "Panos de Prato (Kit)", price: 35.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Panos+Prato", link: "" },
      { name: "Escorredor de Macarrão", price: 30.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Escorredor", link: "" },
      { name: "Canecas (Jogo)", price: 50.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Canecas", link: "" }
    ]
  },
  {
    category: "Eletrodomésticos",
    items: [
      { name: "Batedeira", price: 190.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Batedeira", link: "" },
      { name: "Liquidificador", price: 130.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Liquidificador", link: "" }
    ]
  },
  {
    category: "Quarto",
    items: [
      { name: "Jogo de Lençol", price: 120.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Lencol", link: "" },
      { name: "Manta", price: 80.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Manta", link: "" },
      { name: "Jogo de Travesseiro + Capas", price: 90.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Travesseiros", link: "" },
      { name: "Cortina", price: 100.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Cortina", link: "" }
    ]
  },
  {
    category: "Banheiro",
    items: [
      { name: "Jogo de Toalha de Banho", price: 140.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Toalhas", link: "" },
      { name: "Jogo de Tapete", price: 60.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Tapete+Banheiro", link: "" },
      { name: "Escova Sanitária + Porta Sabonete", price: 45.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Kit+Banheiro", link: "" },
      { name: "Lixeira + Porta Sabonete Líquido", price: 55.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Lixeira+Banheiro", link: "" }
    ]
  },
  {
    category: "Lavanderia & Limpeza",
    items: [
      { name: "Cesto de Roupa Suja", price: 50.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Cesto+Roupa", link: "" },
      { name: "Balde", price: 15.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Balde", link: "" },
      { name: "Vassoura", price: 20.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Vassoura", link: "" },
      { name: "Rodo", price: 15.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Rodo", link: "" },
      { name: "Pá de Lixo", price: 10.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Pa+Lixo", link: "" },
      { name: "Varal Portátil ou Prendedores", price: 60.00, image: "https://placehold.co/400x400/F8F7F2/354F52?text=Varal", link: "" }
    ]
  }
];

// ============================================================================
// FUNÇÃO ESPECIAL: Executar manualmente para resetar a planilha
// ============================================================================
function RESETAR_E_POPULAR_PLANILHA() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  } else {
    sheet.clear(); // Limpa TUDO
  }

  // Cria Cabeçalho
  // Colunas: id, name, category, priceEstimate, imageUrl, shopeeUrl, status, reservedBy
  sheet.appendRow(["id", "name", "category", "priceEstimate", "imageUrl", "shopeeUrl", "status", "reservedBy"]);
  
  // Formata Cabeçalho
  sheet.getRange("A1:H1").setFontWeight("bold").setBackground("#354F52").setFontColor("white");

  var rows = [];
  var idCounter = 1;

  INITIAL_DATA.forEach(category => {
    category.items.forEach(item => {
      rows.push([
        idCounter.toString(),   // ID
        item.name,              // Nome
        category.category,      // Categoria
        item.price,             // Preço
        item.image || "https://placehold.co/400x400?text=Presente", // Imagem
        item.link || "",        // Link Shopee (Vazio se não tiver)
        "available",            // Status
        ""                      // Reservado Por
      ]);
      idCounter++;
    });
  });

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, 8).setValues(rows);
  }

  // Ajusta larguras
  sheet.setColumnWidth(2, 300); // Nome mais largo
  sheet.setColumnWidth(6, 200); // URL mais largo
}

// ============================================================================
// FUNÇÕES DA API (Não mexer muito)
// ============================================================================

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME);
    
    // Se a aba não existir, cria
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow(["id", "name", "category", "priceEstimate", "imageUrl", "shopeeUrl", "status", "reservedBy"]);
    }

    var method = e.postData ? "POST" : "GET";
    
    // --- LEITURA (GET) ---
    if (method === "GET") {
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var jsonData = [];

      for (var i = 1; i < data.length; i++) {
        var row = data[i];
        var obj = {};
        for (var j = 0; j < headers.length; j++) {
          obj[headers[j]] = row[j];
        }
        jsonData.push(obj);
      }
      
      return ContentService.createTextOutput(JSON.stringify(jsonData))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // --- ESCRITA (POST) ---
    if (method === "POST") {
      var params = JSON.parse(e.postData.contents);
      var action = params.action;
      var giftId = params.giftId;
      
      var data = sheet.getDataRange().getValues();
      var rowIndex = -1;

      // Procura o item pelo ID
      for (var i = 1; i < data.length; i++) {
        if (String(data[i][0]) === String(giftId)) {
          rowIndex = i + 1; // +1 porque array começa em 0 mas planilha linha 1 é header
          break;
        }
      }

      if (rowIndex !== -1) {
        // Ações de Reserva
        if (action === "claim") {
          // Coluna G (7) é Status, Coluna H (8) é ReservedBy
          sheet.getRange(rowIndex, 7).setValue("reserved");
          sheet.getRange(rowIndex, 8).setValue(params.guestName || "Anônimo");
        } 
        else if (action === "unclaim") {
          sheet.getRange(rowIndex, 7).setValue("available");
          sheet.getRange(rowIndex, 8).setValue("");
        }
        // Ação de Edição (Admin)
        else if (action === "edit") {
          // name(2), category(3), price(4), image(5), url(6)
          if(params.name) sheet.getRange(rowIndex, 2).setValue(params.name);
          if(params.category) sheet.getRange(rowIndex, 3).setValue(params.category);
          if(params.priceEstimate) sheet.getRange(rowIndex, 4).setValue(params.priceEstimate);
          if(params.imageUrl) sheet.getRange(rowIndex, 5).setValue(params.imageUrl);
          if(params.urls) sheet.getRange(rowIndex, 6).setValue(params.urls);
        }
      } else {
        return ContentService.createTextOutput(JSON.stringify({status: "error", message: "Item not found"})).setMimeType(ContentService.MimeType.JSON);
      }

      return ContentService.createTextOutput(JSON.stringify({status: "success"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", error: e.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}