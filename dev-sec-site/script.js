// LÓGICA DO MENU ATIVO NO SCROLL
const secoes = document.querySelectorAll('.sessao');
const linksMenu = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  let sessaoAtual = '';

  secoes.forEach(secao => {
    const topoDaSecao = secao.offsetTop;
    // Quando a sessão chega a 1/3 do topo da tela, consideramos ela ativa
    if (pageYOffset >= topoDaSecao - (window.innerHeight / 3)) {
      sessaoAtual = secao.getAttribute('id');
    }
  });

  linksMenu.forEach(link => {
    link.classList.remove('active');
    // Se o link tiver o nome da sessão atual no href, ele ganha a cor de destaque
    if (link.getAttribute('href').includes(sessaoAtual)) {
      link.classList.add('active');
    }
  });
});


// --- LÓGICA DO CARROSSEL DE CARDS (AUTO-SCROLL E ARRASTE) ---
const slider = document.querySelector('.cards-container');
let isDown = false;
let startX;
let scrollLeft;
let autoScrollTimer; // Variável que vai guardar o nosso cronômetro

// 1. Função que faz o carrossel rodar sozinho
function iniciarAutoScroll() {
  // Configura um intervalo para rodar a cada 3000 milissegundos (3 segundos)
  autoScrollTimer = setInterval(() => {
    // Calcula a largura do card + o espaço entre eles
    const cardWidth = slider.querySelector('.card').offsetWidth;
    const gap = parseInt(window.getComputedStyle(slider).gap) || 20;
    const scrollAmount = cardWidth + gap;

    // Verifica se chegou no final do carrossel (usamos -10 de margem de segurança)
    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
      // Se chegou no fim, volta para o primeiro card suavemente
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      // Se não, rola para o lado e mostra o próximo card
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 3000); // Você pode alterar este número para deixar mais rápido ou mais devagar
}

// 2. Função que pausa o carrossel
function pararAutoScroll() {
  clearInterval(autoScrollTimer);
}

// Inicia o carrossel automático assim que a página carregar
iniciarAutoScroll();

// 3. Pausar e retomar com o Mouse ou Toque (Celular)
slider.addEventListener('mouseenter', pararAutoScroll); // Pausa quando põe o mouse em cima
slider.addEventListener('mouseleave', iniciarAutoScroll); // Retoma quando tira o mouse

slider.addEventListener('touchstart', pararAutoScroll); // Pausa quando toca na tela do celular
slider.addEventListener('touchend', iniciarAutoScroll); // Retoma quando tira o dedo da tela

// 4. Lógica de Arrastar com o Mouse no Computador (Mantida)
slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
  slider.style.scrollSnapType = 'none'; // Desliga o "imã" para arrastar livremente
  pararAutoScroll(); // Pausa o automático por precaução
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.style.scrollSnapType = 'x mandatory'; // Religa o "imã" se o mouse sair
});

slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.style.scrollSnapType = 'x mandatory'; // Religa o "imã" ao soltar o clique
});

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2; // O número 2 é a velocidade do arraste manual
  slider.scrollLeft = scrollLeft - walk;
});

// --- LÓGICA DO MODAL (POPUP) E WHATSAPP ---
const btnAbrirModal = document.getElementById('btn-abrir-form');
const modal = document.getElementById('modal-contato');
const btnFecharModal = document.querySelector('.fechar-modal');
const formWhats = document.getElementById('form-whatsapp');

// 1. Faz o Popup aparecer ao clicar no botão "Saber Mais"
btnAbrirModal.addEventListener('click', () => {
  modal.style.display = 'flex';
});

// 2. Fecha o Popup ao clicar no "X"
btnFecharModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

// 3. Fecha o Popup se clicar fora da caixinha branca (no fundo escuro)
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

// 4. Lógica de Enviar os Dados e abrir o WhatsApp
formWhats.addEventListener('submit', (e) => {
  e.preventDefault(); 

  // Pega os dados e garante que o trim() limpe espaços ocultos
  const nome = document.getElementById('nome-user').value.trim();
  const email = document.getElementById('email-user').value.trim();
  const ddd = document.getElementById('ddd-user').value;
  const telefone = document.getElementById('telefone-user').value;
  
  // 1ª Trava: Validação do Nome
  if (nome === "") {
    alert("Por favor, digite um nome válido.");
    return; // Para a execução
  }

  // 2ª Trava: Validação do E-mail (Exige o formato correto como .com ou .com.br)
  // Essa fórmula checa se tem texto, seguido de @, seguido de texto, seguido de ponto (.) e de 2 a 6 letras no final
  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!regexEmail.test(email)) {
    alert("Por favor, digite um e-mail completo e válido (exemplo: seu-nome@email.com).");
    return; // Para a execução
  }

  // ATENÇÃO: SEU NÚMERO AQUI (DDI + DDD + Número)
  const numeroWhatsApp = "5511999999999"; 
  
  // Monta a mensagem
  const mensagem = `Olá! Meu nome é ${nome}. 
Acabei de me cadastrar no site e gostaria de saber mais sobre os projetos!
  
Meus dados:
E-mail: ${email}
Telefone: (${ddd}) ${telefone}`;
  
  // Cria o link oficial e abre o WhatsApp
  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  
  // Limpa o formulário e fecha o Popup
  formWhats.reset();
  modal.style.display = 'none';
});