// ============================================
// AKITEM - VALIDAÇÃO FIEL DOS IDs
// Extrai e valida IDs de afiliado das 4 lojas
// ============================================

// Configuração das lojas e padrões de ID
const LOJAS_CONFIG = {
    shopee: {
        nome: 'Shopee',
        padrao: /af_id=([a-zA-Z0-9]+)/,
        padrao2: /af_cpid=([a-zA-Z0-9]+)/,
        urlTutorial: 'https://affiliate.shopee.com.br',
        cor: '#EE4D2D'
    },
    amazon: {
        nome: 'Amazon',
        padrao: /tag=([a-zA-Z0-9-]+)/,
        urlTutorial: 'https://associados.amazon.com.br',
        cor: '#FF9900'
    },
    magalu: {
        nome: 'Magalu',
        padrao: /magazinevoce\.com\.br\/([a-zA-Z0-9]+)/,
        padrao2: /affiliate=([a-zA-Z0-9]+)/,
        urlTutorial: 'https://www.magazinevoce.com.br',
        cor: '#0086FF'
    },
    mercadolivre: {
        nome: 'Mercado Livre',
        padrao: /matt_tool=([a-zA-Z0-9]+)/,
        padrao2: /MLB-([a-zA-Z0-9]+)/,
        urlTutorial: 'https://www.mercadolivre.com.br/afiliados',
        cor: '#FFE600'
    }
};

// Estado da validação
let estadoValidacao = {
    links: [],
    idsDetectados: {},
    lojaAtual: null,
    validacaoCompleta: false
};

// ============================================
// FUNÇÃO PRINCIPAL: DETECTAR ID DO LINK
// ============================================
function detectarID(link) {
    const linkLower = link.toLowerCase();
    
    // Detecta qual loja é
    let loja = null;
    if (linkLower.includes('shopee')) loja = 'shopee';
    else if (linkLower.includes('amazon')) loja = 'amazon';
    else if (linkLower.includes('magalu') || linkLower.includes('magazinevoce')) loja = 'magalu';
    else if (linkLower.includes('mercadolivre') || linkLower.includes('ml')) loja = 'mercadolivre';
    else return { erro: 'Loja não reconhecida. Use links da Shopee, Amazon, Magalu ou Mercado Livre.' };
    
    const config = LOJAS_CONFIG[loja];
    let id = null;
    
    // Tenta extrair ID com os padrões
    const match1 = link.match(config.padrao);
    if (match1) id = match1[1];
    
    if (!id && config.padrao2) {
        const match2 = link.match(config.padrao2);
        if (match2) id = match2[1];
    }
    
    if (!id) {
        return { 
            erro: `Não consegui extrair o ID da ${config.nome}. Verifique se o link é da sua conta de afiliado.`,
            loja: config.nome
        };
    }
    
    return {
        sucesso: true,
        loja: config.nome,
        lojaKey: loja,
        id: id,
        link: link
    };
}

// ============================================
// FUNÇÃO: VALIDAR MÚLTIPLOS LINKS
// ============================================
function validarLinks(links) {
    const resultados = [];
    const idsPorLoja = {};
    
    // Analisa cada link
    links.forEach((link, index) => {
        if (!link || link.trim() === '') {
            resultados.push({
                numero: index + 1,
                status: 'erro',
                mensagem: 'Link vazio'
            });
            return;
        }
        
        const resultado = detectarID(link);
        
        if (resultado.erro) {
            resultados.push({
                numero: index + 1,
                status: 'erro',
                mensagem: resultado.erro,
                loja: resultado.loja
            });
        } else {
            resultados.push({
                numero: index + 1,
                status: 'sucesso',
                loja: resultado.loja,
                id: resultado.id,
                link: link
            });
            
            // Agrupa IDs por loja
            if (!idsPorLoja[resultado.lojaKey]) {
                idsPorLoja[resultado.lojaKey] = [];
            }
            idsPorLoja[resultado.lojaKey].push(resultado.id);
        }
    });
    
    // Valida se os IDs da mesma loja são iguais
    const validacaoFinal = {};
    Object.keys(idsPorLoja).forEach(lojaKey => {
        const ids = idsPorLoja[lojaKey];
        const todosIguais = ids.every(id => id === ids[0]);
        
        validacaoFinal[lojaKey] = {
            loja: LOJAS_CONFIG[lojaKey].nome,
            ids: ids,
            idConfirmado: todosIguais ? ids[0] : null,
            validado: todosIguais && ids.length >= 2,
            quantidade: ids.length
        };
    });
    
    return {
        resultados: resultados,
        validacaoFinal: validacaoFinal,
        totalLinks: links.length,
        totalSucesso: resultados.filter(r => r.status === 'sucesso').length,
        totalErros: resultados.filter(r => r.status === 'erro').length
    };
}

// ============================================
// FUNÇÃO: GERAR MENSAGEM DE RESULTADO
// ============================================
function gerarMensagemResultado(validacao) {
    const { validacaoFinal, totalLinks, totalSucesso, totalErros } = validacao;
    
    let mensagem = '';
    let tipo = '';
    
    if (totalErros > 0) {
        tipo = 'erro';
        mensagem = `⚠️ ${totalErros} link(s) com erro. Verifique se são links válidos de afiliado.`;
    } else if (totalSucesso < 2) {
        tipo = 'aviso';
        mensagem = `📋 Precisamos de pelo menos 2 links para validar com 100% de certeza. Você enviou ${totalLinks}.`;
    } else {
        // Verifica se todas as lojas foram validadas
        const lojasValidadas = Object.values(validacaoFinal).filter(v => v.validado);
        const lojasNaoValidadas = Object.values(validacaoFinal).filter(v => !v.validado);
        
        if (lojasValidadas.length > 0) {
            tipo = 'sucesso';
            mensagem = `✅ 100% DE CERTEZA! IDs validados:\n\n`;
            
            lojasValidadas.forEach(v => {
                mensagem += `• ${v.loja}: ${v.idConfirmado}\n`;
            });
            
            if (lojasNaoValidadas.length > 0) {
                mensagem += `\n⚠️ Estas lojas precisam de mais links:\n`;
                lojasNaoValidadas.forEach(v => {
                    mensagem += `• ${v.loja}: IDs diferentes (${v.ids.join(', ')})\n`;
                });
            }
        } else {
            tipo = 'aviso';
            mensagem = `⚠️ Os IDs não bateram. Para termos mais clareza em minha análise, peço que você gere mais 3 anúncios. Obrigado.`;
        }
    }
    
    return { tipo, mensagem, validacaoFinal };
}

// ============================================
// FUNÇÃO: INTEGRAR COM O FORMULÁRIO HTML
// ============================================
function inicializarValidacao() {
    const btnValidar = document.getElementById('btnValidar');
    const resultadoDiv = document.getElementById('resultadoValidacao');
    const idDetectado = document.getElementById('idDetectado');
    
    if (!btnValidar) return;
    
    btnValidar.addEventListener('click', function() {
        // Pega os links dos inputs
        const link1 = document.getElementById('link1')?.value?.trim();
        const link2 = document.getElementById('link2')?.value?.trim();
        const link3 = document.getElementById('link3')?.value?.trim();
        
        const links = [link1, link2, link3].filter(l => l && l !== '');
        
        if (links.length === 0) {
            alert('Por favor, cole pelo menos 1 link para começar.');
            return;
        }
        
        if (links.length < 2) {
            alert('Para validação 100% segura, precisamos de pelo menos 2 links. Cole mais um!');
            return;
        }
        
        // Mostra "processando"
        btnValidar.textContent = '⏳ Analisando...';
        btnValidar.disabled = true;
        
        // Simula um pequeno delay para UX (sensação de processamento)
        setTimeout(() => {
            // Valida os links
            const validacao = validarLinks(links);
            const resultado = gerarMensagemResultado(validacao);
            
            // Mostra o resultado
            if (resultado.tipo === 'sucesso') {
                resultadoDiv.classList.remove('hidden');
                
                // Pega o primeiro ID confirmado
                const primeiraLoja = Object.keys(resultado.validacaoFinal)[0];
                const idConfirmado = resultado.validacaoFinal[primeiraLoja].idConfirmado;
                
                idDetectado.textContent = idConfirmado;
                
                // Marca validação como completa (para esconder botão Plano B)
                if (typeof marcarValidacaoCompleta === 'function') {
                    marcarValidacaoCompleta();
                }
                
                // Rola até o resultado suavemente
                resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
                
            } else {
                alert(resultado.mensagem);
            }
            
            // Restaura o botão
            btnValidar.textContent = 'Validar Meus IDs →';
            btnValidar.disabled = false;
            
        }, 800);
    });
}

// ============================================
// INICIALIZA QUANDO A PÁGINA CARREGAR
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    inicializarValidacao();
    
    // Log no console para debug
    console.log('[AkiTem] Sistema de Validação Fiel carregado');
    console.log('[AkiTem] Lojas suportadas:', Object.keys(LOJAS_CONFIG).join(', '));
});

// Exporta funções para uso global (se necessário)
if (typeof window !== 'undefined') {
    window.AkiTemValidacao = {
        detectarID,
        validarLinks,
        gerarMensagemResultado,
        LOJAS_CONFIG
    };
}
