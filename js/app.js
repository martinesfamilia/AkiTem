// app.js - Sistema de "Plano B" com RetroGames

// Detecta quando a pessoa tenta sair da página
window.addEventListener('beforeunload', function(e) {
  // Só mostra o aviso se ela não tiver completado a validação
  if (!validacaoCompleta) {
    e.preventDefault();
    e.returnValue = 'Espera! Quer jogar de graça antes de ir?';
    return e.returnValue;
  }
});

// Função que aparece quando ela clica em "Não quero pagar"
function planoB() {
  const mensagem = confirm(
    'Tudo bem! Mas antes de ir...\n\n' +
    'Quer jogar de graça enquanto pensa?\n\n' +
    '🎮 RetroGames.onl - Jogos clássicos sem gastar nada!'
  );
  
  if (mensagem) {
    // Abre o RetroGames em nova aba
    window.open('https://www.retrogames.onl/', '_blank');
    
    // Registra no log que ela escolheu o Plano B
    console.log('[AkiTem] Usuário escolheu Plano B - RetroGames');
    
    // Opcional: mostra mensagem de despedida
    alert('Divirta-se! Quando quiser voltar, estamos aqui. 🧱');
  }
}

// Adiciona o botão "Não quero pagar" dinamicamente
function criarBotaoPlanoB() {
  const botao = document.createElement('button');
  botao.textContent = '🎮 Jogar de Grátis';
  botao.className = 'btn-plano-b';
  botao.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 12px 24px;
    background: #141414;
    border: 2px solid #00ff88;
    color: #00ff88;
    border-radius: 12px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 14px;
    cursor: pointer;
    z-index: 1000;
    transition: all 0.3s;
  `;
  
  botao.onmouseover = () => {
    botao.style.background = '#00ff88';
    botao.style.color = '#0a0a0a';
  };
  
  botao.onmouseout = () => {
    botao.style.background = '#141414';
    botao.style.color = '#00ff88';
  };
  
  botao.onclick = planoB;
  
  document.body.appendChild(botao);
}

// Ativa o botão quando a página carregar
document.addEventListener('DOMContentLoaded', criarBotaoPlanoB);

// Variável de controle (você seta isso quando a validação completar)
let validacaoCompleta = false;

// Exemplo: quando a validação dos 3 links terminar com sucesso
function marcarValidacaoCompleta() {
  validacaoCompleta = true;
  // Esconde o botão Plano B
  const botao = document.querySelector('.btn-plano-b');
  if (botao) botao.style.display = 'none';
}
