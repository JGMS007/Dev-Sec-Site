// Verifica se o usuário pediu, nas configurações do sistema, para reduzir animações.
// Vamos consultar essa variável em mais de um lugar do código abaixo.
const prefereMenosMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


// LÓGICA DO MENU ATIVO NO SCROLL (e da troca de logo clara/escura)
const secoes = document.querySelectorAll('.sessao');
const linksMenu = document.querySelectorAll('.nav-link');
const navbar = document.getElementById('navbar');

function atualizarNavbarConformeScroll() {
  let sessaoAtual = '';
  let temaAtual = 'escuro';

  secoes.forEach(secao => {
    const topoDaSecao = secao.offsetTop;
    if (pageYOffset >= topoDaSecao - (window.innerHeight / 3)) {
      sessaoAtual = secao.getAttribute('id');
      temaAtual = secao.dataset.tema || 'escuro';
    }
  });

  linksMenu.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href').includes(sessaoAtual)) {
      link.classList.add('active');
    }
  });

  // Troca a logo: em sessões de fundo claro, usamos a logo de letras escuras.
  navbar.classList.toggle('fundo-claro', temaAtual === 'claro');
}

window.addEventListener('scroll', atualizarNavbarConformeScroll);
atualizarNavbarConformeScroll(); // roda uma vez já no carregamento da página


// --- LÓGICA DO MENU HAMBÚRGUER (CELULAR) ---
const btnMenu = document.getElementById('btn-menu');
const listaMenu = document.getElementById('lista-menu');

btnMenu.addEventListener('click', () => {
  const estaAberto = listaMenu.classList.toggle('aberto');
  // aria-expanded avisa leitores de tela se o menu está aberto ou fechado
  btnMenu.setAttribute('aria-expanded', estaAberto ? 'true' : 'false');
});

// Fecha o menu automaticamente ao clicar em um link (comum em sites de uma página só)
linksMenu.forEach(link => {
  link.addEventListener('click', () => {
    listaMenu.classList.remove('aberto');
    btnMenu.setAttribute('aria-expanded', 'false');
  });
});


// --- LÓGICA DO CARROSSEL DE CARDS (AUTO-SCROLL E ARRASTE) ---
const slider = document.querySelector('.cards-container');
let isDown = false;
let startX;
let scrollLeft;
let autoScrollTimer;

function iniciarAutoScroll() {
  // Se a pessoa pediu menos movimento, não rodamos o carrossel sozinho.
  if (prefereMenosMovimento) return;

  autoScrollTimer = setInterval(() => {
    const cardWidth = slider.querySelector('.card').offsetWidth;
    const gap = parseInt(window.getComputedStyle(slider).gap) || 20;
    const scrollAmount = cardWidth + gap;

    if (slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 10) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, 3000);
}

function pararAutoScroll() {
  clearInterval(autoScrollTimer);
}

iniciarAutoScroll();

slider.addEventListener('mouseenter', pararAutoScroll);
slider.addEventListener('mouseleave', iniciarAutoScroll);

slider.addEventListener('touchstart', pararAutoScroll);
slider.addEventListener('touchend', iniciarAutoScroll);

slider.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - slider.offsetLeft;
  scrollLeft = slider.scrollLeft;
  slider.style.scrollSnapType = 'none';
  pararAutoScroll();
});

slider.addEventListener('mouseleave', () => {
  isDown = false;
  slider.style.scrollSnapType = 'x mandatory';
});

slider.addEventListener('mouseup', () => {
  isDown = false;
  slider.style.scrollSnapType = 'x mandatory';
});

slider.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - slider.offsetLeft;
  const walk = (x - startX) * 2;
  slider.scrollLeft = scrollLeft - walk;
});


// --- LÓGICA DO MODAL (POPUP) E WHATSAPP ---
const btnAbrirModal = document.getElementById('btn-abrir-form');
const modal = document.getElementById('modal-contato');
const btnFecharModal = document.querySelector('.fechar-modal');
const formWhats = document.getElementById('form-whatsapp');

// Guarda qual elemento estava focado antes de abrir o modal, para devolver
// o foco a ele quando o modal fechar (importante para quem navega por teclado).
let elementoComFocoAnterior = null;

// Todos os elementos "focáveis" dentro do modal, usados para prender o Tab lá dentro.
function pegarElementosFocaveisDoModal() {
  return modal.querySelectorAll(
    'input, button, [href], select, textarea, [tabindex]:not([tabindex="-1"])'
  );
}

function abrirModal() {
  elementoComFocoAnterior = document.activeElement;

  modal.hidden = false;
  modal.style.display = 'flex';

  // Leva o foco para o primeiro campo do formulário
  const primeiroFocavel = pegarElementosFocaveisDoModal()[0];
  if (primeiroFocavel) primeiroFocavel.focus();

  document.addEventListener('keydown', gerenciarTecladoModal);
}

function fecharModal() {
  modal.style.display = 'none';
  modal.hidden = true;

  document.removeEventListener('keydown', gerenciarTecladoModal);

  // Devolve o foco para o botão que abriu o modal
  if (elementoComFocoAnterior) elementoComFocoAnterior.focus();
}

// Fecha com a tecla Esc e prende o Tab dentro do modal (focus trap)
function gerenciarTecladoModal(e) {
  if (e.key === 'Escape') {
    fecharModal();
    return;
  }

  if (e.key === 'Tab') {
    const focaveis = pegarElementosFocaveisDoModal();
    const primeiro = focaveis[0];
    const ultimo = focaveis[focaveis.length - 1];

    if (e.shiftKey && document.activeElement === primeiro) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && document.activeElement === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  }
}

btnAbrirModal.addEventListener('click', abrirModal);
btnFecharModal.addEventListener('click', fecharModal);

// Fecha o Popup se clicar fora da caixinha branca (no fundo escuro)
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    fecharModal();
  }
});

// Lógica de Enviar os Dados e abrir o WhatsApp
const btnEnviarForm = formWhats.querySelector('button[type="submit"]');

formWhats.addEventListener('submit', (e) => {
  e.preventDefault();

  // 1ª verificação: campo-armadilha (honeypot). Só um robô preencheria esse
  // campo, já que ele fica escondido da tela para pessoas de verdade.
  const campoArmadilha = document.getElementById('site-user').value;
  if (campoArmadilha !== '') {
    // Não avisamos o "robô" de que foi identificado — só resetamos e
    // encerramos a função como se nada tivesse acontecido.
    formWhats.reset();
    fecharModal();
    return;
  }

  const nome = document.getElementById('nome-user').value.trim();
  const email = document.getElementById('email-user').value.trim();
  const ddd = document.getElementById('ddd-user').value;
  const telefone = document.getElementById('telefone-user').value;

  if (nome === "") {
    alert("Por favor, digite um nome válido.");
    return;
  }

  const regexEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!regexEmail.test(email)) {
    alert("Por favor, digite um e-mail completo e válido (exemplo: seu-nome@email.com).");
    return;
  }

  const numeroWhatsApp = "5511957688888"; // WhatsApp do Samuel

  const mensagem = `Olá! Meu nome é ${nome}. 
Acabei de me cadastrar no site e gostaria de saber mais sobre os projetos!
  
Meus dados:
E-mail: ${email}
Telefone: (${ddd}) ${telefone}`;

  const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');

  // Trava o botão por 3 segundos para evitar clique duplo/nervoso abrindo
  // várias abas do WhatsApp seguidas.
  btnEnviarForm.disabled = true;
  btnEnviarForm.textContent = 'Enviando...';
  setTimeout(() => {
    btnEnviarForm.disabled = false;
    btnEnviarForm.textContent = 'Ir para o WhatsApp';
  }, 3000);

  formWhats.reset();
  fecharModal();
});


// --- RODAPÉ: ano atual automático ---
const spanAno = document.getElementById('ano-atual');
if (spanAno) {
  spanAno.textContent = new Date().getFullYear();
}
