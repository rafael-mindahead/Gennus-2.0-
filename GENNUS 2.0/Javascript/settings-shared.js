/* config-shared.js — funções reutilizadas em todas as páginas de Configurações
   Importe ANTES do JS específico de cada página. */

/* ================================================
   API — mesmo padrão usado no perfil.
   Sempre retorna { ok, message, data }
================================================ */
async function api(url, options = {}) {
  try {
    const res  = await fetch(url, options);
    const json = await res.json();
    return json;
  } catch {
    return { ok: false, message: 'Sem conexão com o servidor.', data: {} };
  }
}

/* ================================================
   TOAST
================================================ */
let toastTimer = null;

function showToast(type, title, subtitle) {
  document.querySelector('.toast')?.remove();
  clearTimeout(toastTimer);

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${type === 'ok' ? '✅' : '❌'}</span>
    <div class="toast-text"><strong>${title}</strong><span>${subtitle}</span></div>`;
  document.body.appendChild(toast);

  toastTimer = setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}

/* ================================================
   TOGGLE SWITCH
   Uso: <div class="toggle-switch" data-toggle="bloquear"></div>
   Clique alterna a classe "active". Leia o estado com:
   document.querySelector('[data-toggle="bloquear"]').classList.contains('active')
================================================ */
function initToggles() {
  document.querySelectorAll('.toggle-switch').forEach(el => {
    el.addEventListener('click', () => el.classList.toggle('active'));
  });
}

/* ================================================
   VALIDAÇÃO DE CAMPO
================================================ */
function setField(input, state, msg = '') {
  const err = input.closest('.form-group')?.querySelector('.field-error');
  input.classList.remove('input-error', 'input-ok');
  if (err) { err.textContent = ''; err.classList.remove('visible'); }
  if (state === 'error') { input.classList.add('input-error'); if (err && msg) { err.textContent = msg; err.classList.add('visible'); } }
  if (state === 'ok')    { input.classList.add('input-ok'); }
}

/* ================================================
   MODAL DE CONFIRMAÇÃO
   Uso: confirmModal({ title, text, confirmLabel }).then(confirmado => {...})
================================================ */
function confirmModal({ title, text, confirmLabel = 'Confirmar', danger = false }) {
  return new Promise(resolve => {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-card">
        <h3>${title}</h3>
        <p>${text}</p>
        <div class="modal-actions">
          <button type="button" class="btn-cancel" data-action="cancel">Cancelar</button>
          <button type="button" class="${danger ? 'btn-save' : 'btn-outline'}" data-action="confirm">${confirmLabel}</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);

    requestAnimationFrame(() => overlay.classList.add('visible'));

    function close(result) {
      overlay.classList.remove('visible');
      overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
      resolve(result);
    }

    overlay.querySelector('[data-action="confirm"]').addEventListener('click', () => close(true));
    overlay.querySelector('[data-action="cancel"]').addEventListener('click',  () => close(false));
    overlay.addEventListener('click', e => { if (e.target === overlay) close(false); });
  });
}

/* Inicializa toggles automaticamente quando o script carrega */
initToggles();