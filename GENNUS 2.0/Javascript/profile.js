/* ================================================
   perfil.js — Meu Perfil — Gennus
================================================ */

/* ================================================
   FOTO DE PERFIL
================================================ */
const photoInput   = document.getElementById('profilePhoto');
const profilePhoto = document.querySelector('.profile-photo');
const DEFAULT_PHOTO = '../assets/img/default-user.png';

/* Clique no overlay ou no botão Alterar abre o file picker */
document.querySelector('.profile-photo-overlay')?.addEventListener('click', () => photoInput.click());
document.querySelector('.btn-photo-change')?.addEventListener('click', () => photoInput.click());

/* Preview ao selecionar arquivo */
photoInput?.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('error', 'Formato inválido', 'Use JPG, PNG ou WebP.');
    return;
  }

  if (file.size > 3 * 1024 * 1024) {
    showToast('error', 'Arquivo muito grande', 'Máximo permitido: 3 MB.');
    return;
  }

  const reader = new FileReader();
  reader.onload = ev => {
    profilePhoto.src = ev.target.result;
    profilePhoto.style.borderColor = 'var(--roxo-borda)';
  };
  reader.readAsDataURL(file);
});

/* Remover foto — volta para o avatar padrão */
document.querySelector('.btn-photo-remove')?.addEventListener('click', () => {
  profilePhoto.src = DEFAULT_PHOTO;
  profilePhoto.style.borderColor = '';
  photoInput.value = '';
});

/* ================================================
   MÁSCARA DE TELEFONE
   Ex: (41) 99999-9999
================================================ */
const telefoneInput = document.getElementById('telefone');

telefoneInput?.addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  if (v.length > 10) {
    v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
  } else if (v.length > 6) {
    v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
  } else if (v.length > 2) {
    v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
  } else {
    v = v.replace(/^(\d*)/, '($1');
  }
  e.target.value = v;
});

/* ================================================
   TOGGLE VISIBILIDADE DE SENHA
================================================ */
const SVG_EYE_OPEN = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;

const SVG_EYE_CLOSED = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>`;

document.querySelectorAll('.btn-toggle-pass').forEach(btn => {
  btn.innerHTML = SVG_EYE_OPEN;
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-password-wrap').querySelector('input');
    const isPass = input.type === 'password';
    input.type = isPass ? 'text' : 'password';
    btn.innerHTML = isPass ? SVG_EYE_CLOSED : SVG_EYE_OPEN;
  });
});

/* ================================================
   FORÇA DA SENHA
================================================ */
const novaSenhaInput  = document.getElementById('novaSenha');
const strengthWrap    = document.querySelector('.password-strength');
const strengthBarsEl  = document.querySelector('.strength-bars');
const strengthLabelEl = document.querySelector('.strength-label');

const STRENGTH_LABELS = ['', 'Fraca', 'Razoável', 'Boa', 'Forte'];

function calcStrength(pass) {
  if (!pass) return 0;
  let score = 0;
  if (pass.length >= 8)              score++;
  if (/[A-Z]/.test(pass))            score++;
  if (/[0-9]/.test(pass))            score++;
  if (/[^A-Za-z0-9]/.test(pass))    score++;
  return score;
}

novaSenhaInput?.addEventListener('input', e => {
  const val    = e.target.value;
  const score  = calcStrength(val);

  if (!val) {
    strengthWrap.classList.remove('strength-1','strength-2','strength-3','strength-4');
    strengthLabelEl.textContent = '';
    return;
  }

  strengthWrap.classList.remove('strength-1','strength-2','strength-3','strength-4');
  strengthWrap.classList.add(`strength-${score}`);
  strengthLabelEl.textContent = STRENGTH_LABELS[score];
});

/* ================================================
   VALIDAÇÃO
================================================ */
function validateEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function setFieldState(input, state, msg) {
  const group = input.closest('.form-group');
  const err   = group?.querySelector('.field-error');

  input.classList.remove('input-error', 'input-ok');
  if (err) { err.textContent = ''; err.classList.remove('visible'); }

  if (state === 'error') {
    input.classList.add('input-error');
    if (err && msg) { err.textContent = msg; err.classList.add('visible'); }
  } else if (state === 'ok') {
    input.classList.add('input-ok');
  }
}

function validateForm() {
  let valid = true;

  /* Nome */
  const nome = document.getElementById('nome');
  if (!nome.value.trim() || nome.value.trim().length < 3) {
    setFieldState(nome, 'error', 'Nome deve ter ao menos 3 caracteres.');
    valid = false;
  } else {
    setFieldState(nome, 'ok');
  }

  /* E-mail */
  const email = document.getElementById('email');
  if (!validateEmail(email.value.trim())) {
    setFieldState(email, 'error', 'Informe um e-mail válido.');
    valid = false;
  } else {
    setFieldState(email, 'ok');
  }

  /* Senhas (só valida se nova senha foi preenchida) */
  const senhaAtual    = document.getElementById('senhaAtual');
  const novaSenha     = document.getElementById('novaSenha');
  const confirmarSenha = document.getElementById('confirmarSenha');

  if (novaSenha.value || confirmarSenha.value) {
    if (!senhaAtual.value) {
      setFieldState(senhaAtual, 'error', 'Informe a senha atual.');
      valid = false;
    } else {
      setFieldState(senhaAtual, 'ok');
    }

    if (novaSenha.value.length < 8) {
      setFieldState(novaSenha, 'error', 'Mínimo de 8 caracteres.');
      valid = false;
    } else {
      setFieldState(novaSenha, 'ok');
    }

    if (novaSenha.value !== confirmarSenha.value) {
      setFieldState(confirmarSenha, 'error', 'As senhas não coincidem.');
      valid = false;
    } else if (confirmarSenha.value) {
      setFieldState(confirmarSenha, 'ok');
    }
  }

  return valid;
}

/* Validação em tempo real nos campos */
document.getElementById('nome')?.addEventListener('blur', e => {
  const v = e.target.value.trim();
  setFieldState(e.target, v.length >= 3 ? 'ok' : 'error', 'Nome deve ter ao menos 3 caracteres.');
});

document.getElementById('email')?.addEventListener('blur', e => {
  setFieldState(e.target, validateEmail(e.target.value) ? 'ok' : 'error', 'Informe um e-mail válido.');
});

document.getElementById('confirmarSenha')?.addEventListener('input', e => {
  const nova = document.getElementById('novaSenha').value;
  if (!e.target.value) return;
  setFieldState(e.target, e.target.value === nova ? 'ok' : 'error', 'As senhas não coincidem.');
});

/* ================================================
   SALVAR
================================================ */
const btnSave = document.querySelector('.btn-save');

btnSave?.addEventListener('click', () => {
  if (!validateForm()) {
    showToast('error', 'Verifique os campos', 'Corrija os erros antes de salvar.');
    return;
  }

  /* Simula envio ao servidor */
  btnSave.classList.add('loading');
  btnSave.textContent = 'Salvando…';

  setTimeout(() => {
    btnSave.classList.remove('loading');
    btnSave.textContent = 'Salvar Alterações';

    /* Limpa campos de senha após salvar */
    ['senhaAtual', 'novaSenha', 'confirmarSenha'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
        el.classList.remove('input-ok', 'input-error');
      }
    });

    if (strengthWrap) {
      strengthWrap.classList.remove('strength-1','strength-2','strength-3','strength-4');
      strengthLabelEl.textContent = '';
    }

    showToast('ok', 'Perfil atualizado', 'Suas alterações foram salvas com sucesso.');
  }, 1200);
});

/* ================================================
   CANCELAR
================================================ */
document.querySelector('.btn-cancel')?.addEventListener('click', () => {
  document.querySelectorAll('.form-group input').forEach(input => {
    input.classList.remove('input-ok', 'input-error');
  });

  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.classList.remove('visible');
  });

  if (strengthWrap) {
    strengthWrap.classList.remove('strength-1','strength-2','strength-3','strength-4');
    strengthLabelEl.textContent = '';
  }
});

/* ================================================
   TOAST
================================================ */
let toastTimer = null;

function showToast(type, title, subtitle) {
  /* Remove toast anterior se ainda existir */
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  clearTimeout(toastTimer);

  const icon = type === 'ok' ? '✅' : '❌';

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span class="toast-icon">${icon}</span>
    <div class="toast-text">
      <strong>${title}</strong>
      <span>${subtitle}</span>
    </div>`;

  document.body.appendChild(toast);

  toastTimer = setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, 3500);
}