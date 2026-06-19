/* ================================================
   REGISTER.JS
   Localização: /GENNUS 2.0/Javascript/register.js
 
   IMPORTANTE — como funciona a referência de arquivos no JS:
   getElementById, querySelector e afins NÃO usam caminhos de arquivo.
   Eles procuram elementos dentro do HTML que já está aberto no browser.
   O "endereço" de um elemento é o valor do seu atributo id="..." no HTML.
 
   Caminhos de pasta só importam em:
   - <link href="Css/register.css">       ← no HTML
   - <script src="Javascript/register.js"> ← no HTML
   - fetch('/api/endpoint')               ← quando chamar o backend
 
   Controla dois comportamentos:
   1. Toggle de visibilidade das senhas (ícone de olho)
   2. Modal de termos de uso (abrir, fechar, scroll, aceitar)
================================================ */
 
/* ================================================
   1. TOGGLE DE SENHA
   O input começa com type="password" (texto oculto).
   Ao clicar no olho, mudamos o type pra "text" (texto visível).
   É a única coisa que faz a senha aparecer — o browser
   esconde automaticamente qualquer input com type="password".
================================================ */
 
/* querySelectorAll retorna TODOS os .btn-eye da página.
   forEach percorre cada um e adiciona o evento de clique. */
document.querySelectorAll('.btn-eye').forEach(function(btn) {
 
  btn.addEventListener('click', function() {
 
    /* data-target="password" no HTML → btn.dataset.target = "password" no JS.
       O JS lê o atributo data-target pra saber qual input deve alternar. */
    var targetId = btn.dataset.target;
    var input    = document.getElementById(targetId);
    /* getElementById('password') busca o elemento com id="password" no HTML.
       Não tem nada a ver com o caminho da pasta — só o valor do id. */
 
    /* Verifica o estado atual e inverte */
    var isHidden = input.type === 'password';
    input.type   = isHidden ? 'text' : 'password';
 
    /* Troca qual SVG está visível:
       eye-off = olho riscado → senha oculta
       eye-on  = olho aberto  → senha visível */
    var eyeOff = btn.querySelector('.eye-off');
    var eyeOn  = btn.querySelector('.eye-on');
 
    eyeOff.style.display = isHidden ? 'none'  : 'block';
    eyeOn.style.display  = isHidden ? 'block' : 'none';
 
    /* Atualiza o aria-label pra leitores de tela */
    btn.setAttribute('aria-label', isHidden ? 'Ocultar senha' : 'Mostrar senha');
  });
 
});
 
/* ================================================
   2. MODAL DE TERMOS DE USO
 
   Fluxo:
   → Clicar em "Termos de uso"  = abre o modal
   → Rolar o conteúdo           = barra de progresso cresce
   → Chegar no fim              = botão "Aceitar" é habilitado
   → Clicar "Aceitar"           = fecha + marca o checkbox
   → Clicar "Recusar", X ou ESC = fecha sem marcar
   → Clicar fora do modal       = fecha sem marcar
================================================ */
 
/* Pegamos cada elemento pelo seu id — valor do atributo id="..." no HTML.
   Nenhum desses getElementById tem relação com caminho de pasta. */
var modal       = document.getElementById('terms-modal');
var openBtn     = document.getElementById('open-terms-btn');
var closeBtn    = document.getElementById('modal-close-btn');
var aceitarBtn  = document.getElementById('btn-aceitar');
var recusarBtn  = document.getElementById('btn-recusar');
var modalBody   = document.getElementById('modal-body');
var progressBar = document.getElementById('read-progress');
var readHint    = document.getElementById('read-hint');
 
/* CORREÇÃO: era getElementById('/GENNUS 2.0/use-terms') — errado.
   getElementById recebe o valor do id do HTML, não um caminho de arquivo.
   O checkbox tem id="use-terms" no register.html, então é só isso: */
var checkbox = document.getElementById('use-terms');
 
/* ---- ABRIR ---- */
openBtn.addEventListener('click', function() {
  modal.classList.add('modal-open');
  /* Adicionar .modal-open ativa as transições CSS:
     opacity 0→1 no overlay, translateY 12px→0 no modal-box */
 
  document.body.style.overflow = 'hidden';
  /* Trava o scroll da página atrás do modal.
     Sem isso, o usuário rolaria a página e o modal ao mesmo tempo. */
});
 
/* ---- FECHAR — função usada em vários lugares ---- */
function fecharModal() {
  modal.classList.remove('modal-open');
  document.body.style.overflow = ''; /* Restaura o scroll da página */
}
 
closeBtn.addEventListener('click', fecharModal);  /* Botão X */
recusarBtn.addEventListener('click', fecharModal); /* Botão "Recusar" */
 
/* Clicar no fundo escuro (overlay) fora do card também fecha */
modal.addEventListener('click', function(e) {
  /* e.target = elemento que recebeu o clique diretamente.
     Se foi o próprio overlay (não um filho), fecha o modal. */
  if (e.target === modal) {
    fecharModal();
  }
});
 
/* Tecla ESC fecha o modal — convenção universal de interfaces */
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape' && modal.classList.contains('modal-open')) {
    fecharModal();
  }
});
 
/* ---- PROGRESSO DE LEITURA ---- */
modalBody.addEventListener('scroll', function() {
  /* scrollTop    = pixels já rolados pelo usuário
     scrollHeight = altura total do conteúdo (visível + escondido)
     clientHeight = altura da janela de scroll visível
 
     Fórmula: scrollTop / (scrollHeight - clientHeight) * 100 = % lida
     Exemplo: rolou 300px, total 600px, janela 300px → 300/300 = 100% */
  var porcentagem = (modalBody.scrollTop / (modalBody.scrollHeight - modalBody.clientHeight)) * 100;
 
  /* Math.min e Math.max garantem que fique entre 0 e 100
     — sem isso poderia aparecer 101% em alguns browsers. */
  porcentagem = Math.min(100, Math.max(0, porcentagem));
 
  progressBar.style.width = porcentagem + '%';
 
  /* Nos últimos 5% do conteúdo, considera "lido" e habilita o botão */
  if (porcentagem >= 95) {
    aceitarBtn.disabled      = false;
    readHint.textContent     = '✓ Termos lidos';
    readHint.style.color     = 'var(--roxo)';
  }
});
 
/* ---- ACEITAR ---- */
aceitarBtn.addEventListener('click', function() {
  checkbox.checked = true;
  /* Marcar o checkbox via JS tem o mesmo efeito que o usuário clicar nele.
     O atributo required do formulário fica satisfeito. */
  fecharModal();
});