/* personalizar.js
   ════════════════════════════════════════════════════════
   MODO PROTÓTIPO (fase alfa) — sem backend, mesmo padrão
   usado em periodo-fechamento.js. A função api() no final
   deste arquivo simula o que o PHP devolveria; quando vocês
   integrarem de verdade, troquem só esse bloco.
   ════════════════════════════════════════════════════════ */

/* ================================================
   CATÁLOGO DE FUNCIONALIDADES OPCIONAIS
   "disponivel:false" = ainda não existe no sistema (Em breve).
   Dashboard, Vendas e Clientes NÃO entram aqui — são módulos
   essenciais, sempre visíveis em qualquer porte.
================================================ */
const FEATURES = [
  { key:'resumo',       nome:'Resumo do Período',          desc:'Painel com metas, canais de venda e insights automáticos.', disponivel:true  },
  { key:'relatorios',   nome:'Relatórios Avançados',        desc:'Exportação e análises detalhadas de vendas e financeiro.',   disponivel:true  },
  { key:'top_itens',    nome:'Análise de Top Itens',        desc:'Ranking de produtos mais e menos vendidos, com estoque.',    disponivel:true  },
  { key:'funcionarios', nome:'Gerenciamento de Funcionários', desc:'Cadastro de equipe, cargos e permissões de acesso.',       disponivel:false },
  { key:'ia_feedback',  nome:'Feedback com IA',             desc:'Sugestões automáticas com base nos seus dados de vendas.',   disponivel:false },
  { key:'multi_filial', nome:'Multi-filial',                desc:'Gerencie várias unidades a partir de uma única conta.',     disponivel:false },
];

const CORES = [
  { nome:'roxo',    hex:'#a855f7', escuro:'#7c3aed' },
  { nome:'azul',    hex:'#3b82f6', escuro:'#2563eb' },
  { nome:'verde',   hex:'#22c55e', escuro:'#16a34a' },
  { nome:'laranja', hex:'#fb923c', escuro:'#ea580c' },
  { nome:'rosa',    hex:'#ec4899', escuro:'#db2777' },
  { nome:'ciano',   hex:'#06b6d4', escuro:'#0891b2' },
];

/* ================================================
   ESTADO EM TELA (draft — só vira real ao Salvar)
================================================ */
let draft = {
  tema: 'dark',
  porte: 'pequeno',
  features: { resumo:false, relatorios:false, top_itens:false, funcionarios:false, ia_feedback:false, multi_filial:false },
  densidade: 'confortavel',
  reduzir_animacoes: false,
  cor_destaque: 'roxo',
  logo_url: null,
};

const FEATURE_ICON = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`;

/* ================================================
   TEMA
================================================ */
document.querySelectorAll('.theme-option').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.theme-option').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    draft.tema = btn.dataset.theme;
    document.documentElement.setAttribute('data-theme', draft.tema);
  });
});

/* ================================================
   PORTE DO NEGÓCIO
================================================ */
const porteNotice = document.getElementById('porteNotice');

async function selecionarPorte(novoPorte) {
  // Rebaixar de médio pra pequeno com features ativas = ação sensível
  const temFeatureAtiva = Object.values(draft.features).some(Boolean);

  if (draft.porte === 'medio' && novoPorte === 'pequeno' && temFeatureAtiva) {
    const confirmado = await confirmModal({
      title: 'Mudar para modo Pequeno?',
      text: 'Isso vai ocultar as funcionalidades ativas no momento para todos os usuários do sistema. Você pode reverter a qualquer momento.',
      confirmLabel: 'Mudar mesmo assim',
      danger: true,
    });
    if (!confirmado) return;
  }

  draft.porte = novoPorte;

  document.querySelectorAll('#porteSegmented .segmented-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.porte === novoPorte);
  });

  porteNotice.innerHTML = novoPorte === 'pequeno'
    ? `<span class="notice-icon">ℹ️</span><span>No modo <strong>Pequeno</strong>, o sistema mostra só Dashboard, Vendas e Clientes — sem poluição visual. Mude para <strong>Médio</strong> para ativar funcionalidades individualmente.</span>`
    : `<span class="notice-icon">✅</span><span>Modo <strong>Médio</strong> ativo. Ative abaixo só as funcionalidades que sua equipe realmente usa.</span>`;

  renderFeatures();
}

document.querySelectorAll('#porteSegmented .segmented-btn:not(:disabled)').forEach(btn => {
  btn.addEventListener('click', () => selecionarPorte(btn.dataset.porte));
});

/* ================================================
   LISTA DE FUNCIONALIDADES
================================================ */
function renderFeatures() {
  const locked = draft.porte === 'pequeno';
  const list = document.getElementById('featureList');

  list.innerHTML = FEATURES.map(f => {
    const ativo = draft.features[f.key] && !locked;
    const indisponivel = !f.disponivel;
    return `
      <div class="feature-item ${locked || indisponivel ? 'locked' : ''}">
        <div class="feature-icon">${FEATURE_ICON}</div>
        <div class="feature-text">
          <strong>${f.nome} ${indisponivel ? '<span class="badge badge-muted">Em breve</span>' : ''}</strong>
          <span>${f.desc}</span>
        </div>
        <div class="toggle-switch ${ativo ? 'active' : ''}"
             data-feature="${f.key}"
             ${locked || indisponivel ? 'disabled' : ''}></div>
      </div>`;
  }).join('');

  // Liga clique nos toggles habilitados
  list.querySelectorAll('.toggle-switch:not([disabled])').forEach(el => {
    el.addEventListener('click', () => {
      const key = el.dataset.feature;
      draft.features[key] = !draft.features[key];
      el.classList.toggle('active', draft.features[key]);
    });
  });
}

/* ================================================
   DENSIDADE
================================================ */
document.querySelectorAll('#densidadeSegmented .segmented-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#densidadeSegmented .segmented-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    draft.densidade = btn.dataset.densidade;
  });
});

/* ================================================
   ACESSIBILIDADE — reduzir animações (efeito real e imediato)
================================================ */
const toggleReduzirAnim = document.querySelector('[data-toggle="reduzir-animacoes"]');
toggleReduzirAnim?.addEventListener('click', () => {
  draft.reduzir_animacoes = toggleReduzirAnim.classList.contains('active');
  document.documentElement.classList.toggle('reduce-motion', draft.reduzir_animacoes);
});

/* ================================================
   COR DE DESTAQUE
================================================ */
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function aplicarCor(cor) {
  const root = document.documentElement.style;
  root.setProperty('--roxo', cor.hex);
  root.setProperty('--roxo-escuro', cor.escuro);
  root.setProperty('--roxo-borda', hexToRgba(cor.hex, .25));
}

function renderSwatches() {
  const row = document.getElementById('swatchesRow');
  row.innerHTML = CORES.map(c => `
    <div class="swatch ${c.nome === draft.cor_destaque ? 'active' : ''}" style="background:${c.hex}" data-cor="${c.nome}" title="${c.nome}"></div>
  `).join('');

  row.querySelectorAll('.swatch').forEach(el => {
    el.addEventListener('click', () => {
      draft.cor_destaque = el.dataset.cor;
      row.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
      el.classList.add('active');
      aplicarCor(CORES.find(c => c.nome === draft.cor_destaque));
    });
  });
}

/* ================================================
   LOGO — preview local (upload real entra junto com o PHP)
================================================ */
const logoInput   = document.getElementById('logoInput');
const logoPreview = document.getElementById('logoPreview');

document.getElementById('btnLogoChange').addEventListener('click', () => logoInput.click());

logoInput.addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('error', 'Formato inválido', 'Use PNG, JPG ou SVG.'); return; }
  if (file.size > 2 * 1024 * 1024)    { showToast('error', 'Arquivo grande', 'Máximo: 2 MB.'); return; }

  draft.logo_url = URL.createObjectURL(file);
  logoPreview.src = draft.logo_url;
});

document.getElementById('btnLogoRemove').addEventListener('click', () => {
  draft.logo_url = null;
  logoPreview.src = '../assets/img/logo-placeholder.png';
  logoInput.value = '';
});

/* ================================================
   CARREGAR ESTADO SALVO
================================================ */
async function carregar() {
  const res = await api('/api/configuracoes/personalizar.php');
  if (!res.ok) { showToast('error', 'Erro ao carregar', res.message); return; }

  draft = structuredClone(res.data);

  // Tema
  document.querySelectorAll('.theme-option').forEach(b => b.classList.toggle('active', b.dataset.theme === draft.tema));
  document.documentElement.setAttribute('data-theme', draft.tema);

  // Porte
  document.querySelectorAll('#porteSegmented .segmented-btn').forEach(b => b.classList.toggle('active', b.dataset.porte === draft.porte));
  renderFeatures();

  // Densidade
  document.querySelectorAll('#densidadeSegmented .segmented-btn').forEach(b => b.classList.toggle('active', b.dataset.densidade === draft.densidade));

  // Acessibilidade
  toggleReduzirAnim?.classList.toggle('active', draft.reduzir_animacoes);
  document.documentElement.classList.toggle('reduce-motion', draft.reduzir_animacoes);

  // Cor + logo
  renderSwatches();
  aplicarCor(CORES.find(c => c.nome === draft.cor_destaque) ?? CORES[0]);
  if (draft.logo_url) logoPreview.src = draft.logo_url;
}

/* ================================================
   SALVAR / CANCELAR
================================================ */
document.getElementById('btnSalvar').addEventListener('click', async () => {
  const btn = document.getElementById('btnSalvar');
  btn.classList.add('loading');
  btn.textContent = 'Salvando…';

  const res = await api('/api/configuracoes/personalizar.php', {
    method: 'POST',
    body: draft, // mock aceita o objeto direto (ver api() abaixo)
  });

  btn.classList.remove('loading');
  btn.textContent = 'Salvar Alterações';

  if (res.ok) showToast('ok', 'Aparência salva', 'As alterações já estão visíveis no sistema.');
  else        showToast('error', 'Erro', res.message);
});

document.getElementById('btnCancelar').addEventListener('click', carregar);

/* ════════════════════════════════════════════════════════
   CAMADA MOCK — apaga este bloco quando integrar o PHP real
   (api/configuracoes/personalizar.php já existe pronto).
   ════════════════════════════════════════════════════════ */
let mockSavedState = structuredClone(draft);

function api(url, options = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (options.method !== 'POST') {
        resolve({ ok:true, message:'ok', data: structuredClone(mockSavedState) });
        return;
      }
      mockSavedState = structuredClone(options.body);
      resolve({ ok:true, message:'Salvo.', data:{} });
    }, 350);
  });
}

/* ── Init ── */
carregar();