/**
 * AkiTem - Lógica de Produtos e Filtros
 * Carrega dados e gerencia a exibição na tela
 */

// Dados de Exemplo (Simulando uma API ou vindo do products.json)
const productsData = [
    {
        id: 1,
        title: "Smartphone Samsung Galaxy S23 Ultra 256GB 5G",
        platform: "ml",
        price: 4899.00,
        oldPrice: 6299.00,
        info: "Frete Grátis • Entrega em 24h"
    },
    {
        id: 2,
        title: "Fone de Ouvido Bluetooth JBL Tune 510BT",
        platform: "amazon",
        price: 249.90,
        oldPrice: 399.00,
        info: "Amazon Prime • Devolução grátis"
    },
    {
        id: 3,
        title: "Notebook Dell Inspiron 15 3000 i3 8GB",
        platform: "magalu",
        price: 2199.00,
        oldPrice: 2899.00,
        info: "Entrega Expressa • Cashback"
    },
    {
        id: 4,
        title: "Smartwatch Xiaomi Mi Band 7 Global",
        platform: "shopee",
        price: 189.90,
        oldPrice: 299.00,
        info: "Envio Local • Frete Grátis"
    },
    {
        id: 5,
        title: "Cadeira Gamer ThunderX3 Professional",
        platform: "ml",
        price: 1250.00,
        oldPrice: 1800.00,
        info: "12x Sem Juros • Garantia de 3 anos"
    },
    {
        id: 6,
        title: "Console PlayStation 5 Slim Digital Edition",
        platform: "amazon",
        price: 3499.00,
        oldPrice: 3999.00,
        info: "Disponível Agora • Amazon Prime"
    }
];

// Seletores do DOM
const grid = document.getElementById('productsGrid');
const platformFilter = document.getElementById('platform');
const searchFilter = document.getElementById('search');

/**
 * Formata número para moeda BRL
 * @param {number} value - Valor numérico
 * @returns {string} Valor formatado
 */
function formatPrice(value) {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/**
 * Renderiza os produtos na tela
 * @param {Array} products - Lista de produtos para exibir
 */
function renderProducts(products) {
    grid.innerHTML = ''; // Limpa a grid atual
    
    if (products.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px; font-size: 1.1rem;">Nenhum produto encontrado.</div>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        
        card.innerHTML = `
            <span class="badge ${product.platform}">${product.platform.toUpperCase()}</span>
            <div class="title">${product.title}</div>
            <div class="price-container">
                <span class="old-price">${formatPrice(product.oldPrice)}</span>
                <span class="price">${formatPrice(product.price)}</span>
            </div>
            <div class="info">${product.info}</div>
            <button class="btn-buy" onclick="alert('Indo para: ${product.title}')">Comprar Agora</button>
        `;
        
        grid.appendChild(card);
    });
}

/**
 * Filtra produtos por plataforma e busca
 * Acionado quando o usuário digita ou muda o select
 */
function filterProducts() {
    const platform = platformFilter.value;
    const search = searchFilter.value.toLowerCase().trim();

    const filtered = productsData.filter(product => {
        const matchesPlatform = platform === 'all' || product.platform === platform;
        const matchesSearch = product.title.toLowerCase().includes(search);
        return matchesPlatform && matchesSearch;
    });
