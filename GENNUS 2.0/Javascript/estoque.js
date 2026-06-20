/**
 * estoque.js — Controle de Estoque — Gennus
 * Dados simulados. Sem localStorage / backend.
 */
'use strict';

/* ---------- dados base ---------- */
const CATS = ['Eletrônicos','Vestuário','Alimentos','Cosméticos','Casa','Ferramentas','Esportes','Outros'];
const EMOJI = {Eletrônicos:'📱',Vestuário:'👕',Alimentos:'🥗',Cosméticos:'✨',Casa:'🏠',Ferramentas:'🔧',Esportes:'⚽',Outros:'📦'};
const NOMES = {
  Eletrônicos:['Smartphone Pro Max','Fone Bluetooth TWS','Carregador Turbo 65W','Mouse Ergonômico','Teclado Mecânico RGB','SSD Externo 1TB','Smartwatch Fitness','Webcam Full HD'],
  Vestuário:['Camiseta Básica Preta','Calça Jeans Slim','Moletom Oversized','Tênis Running','Jaqueta Corta-Vento','Polo Listrada','Vestido Midi','Regata Academia'],
  Alimentos:['Whey Protein 1kg','Barra Proteína Morango','Aveia em Flocos','Azeite Extra Virgem','Granola Sem Açúcar','Café Especial 250g','Mix de Castanhas','Mel Puro Silvestre'],
  Cosméticos:['Sérum Vitamina C','Protetor Solar FPS50','Hidratante Facial','Shampoo Reconstrutor','Óleo de Argan','Base Líquida','Esfoliante Corporal','Perfume Floral'],
  Casa:['Luminária LED Mesa','Organizador Bambu','Almofada Decorativa','Cesto de Vime','Vela Aromática','Tapete Antiderrapante','Espelho Redondo','Colcha Matelassê'],
  Ferramentas:['Furadeira Impacto','Trena Digital','Jogo de Chaves','Alicate Universal','Serra Circular','Parafusadeira 12V','Lixa Elétrica','Caixa de Ferramentas'],
  Esportes:['Bola Futsal Oficial','Raquete Beach Tennis','Corda de Pular','Luva de Boxe','Tapete de Yoga','Kettlebell 8kg','Mochila Esportiva','Garrafa Térmica'],
  Outros:['Caixa Arquivo','Agenda Executiva','Calculadora Científica','Pasta L Ofício','Grampeador','Post-it Pack','Rolo Fita Crepe','Envelope Segurança'],
};

let _seed = 99;
const rand = () => { _seed = (_seed*1664525+1013904223)&0xffffffff; return (_seed>>>0)/0xffffffff; };
const randInt = (a,b) => Math.floor(rand()*(b-a+1))+a;

function gerarDados() {
  _seed = 99;
  const itens = [];
  CATS.forEach((cat, ci) => {
    NOMES[cat].forEach((nome, i) => {
      const estoqueMax = randInt(40, 220);
      const estoqueMin = randInt(8, 25);
      let estoque = randInt(0, estoqueMax);
      // garante variedade de situações
      const r = rand();
      if (r < 0.12) estoque = 0;
      else if (r < 0.25) estoque = randInt(1, estoqueMin - 1 || 1);
      const custo = randInt(20, 600);
      itens.push({
        id: `PRD-${String(ci*8+i+1).padStart(5,'0')}`,
        nome, categoria: cat,
        estoque, estoqueMin, estoqueMax, custo,
      });
    });
  });
  return itens;
}

/* ---------- status ---------- */
function calcStatus(p) {
  if (p.estoque === 0) return 'esgotado';
  if (p.estoque <= p.estoqueMin) return 'baixo';
  if (p.estoque / p.estoqueMax <= 0.5) return 'medio';
  return 'ok';
}
const STATUS_LABEL = {ok:'Estoque OK', medio:'Estoque Médio', baixo:'Estoque Baixo', esgotado:'Esgotado'};
const STATUS_COLOR = {ok:'#22c55e', medio:'#60a5fa', baixo:'#fbbf24', esgotado:'#f87171'};
const STATUS_ORDEM = {esgotado:0, baixo:1, medio:2, ok:3};

/* ---------- helpers ---------- */
const fmtBRL = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const fmtNum = n => Math.round(n).toLocaleString('pt-BR');
function countUp(el, target, fmt, dur=600) {
  if (!el) return;
  const t0 = performance.now();
  const go = now => { const p = Math.min((now-t0)/dur,1); el.textContent = fmt(target*(1-Math.pow(1-p,3))); if (p<1) requestAnimationFrame(go); };
  requestAnimationFrame(go);
}

/* ---------- estado ---------- */
const state = { todos: [], filtrados: [], search:'', status:'todos', ordem:'critico', pagina:1, porPagina:10 };

/* ---------- KPIs + distribuição ---------- */
function renderResumo() {
  const t = state.todos;
  const porStatus = { ok:0, medio:0, baixo:0, esgotado:0 };
  t.forEach(p => porStatus[calcStatus(p)]++);

  countUp(document.getElementById('kpi-total'), t.length, n=>fmtNum(n));
  countUp(document.getElementById('kpi-ok'), porStatus.ok, n=>fmtNum(n));
  countUp(document.getElementById('kpi-medio'), porStatus.medio, n=>fmtNum(n));
  countUp(document.getElementById('kpi-baixo'), porStatus.baixo, n=>fmtNum(n));
  countUp(document.getElementById('kpi-esgotado'), porStatus.esgotado, n=>fmtNum(n));

  document.getElementById('kpi-ok-sub').textContent = `${((porStatus.ok/(t.length||1))*100).toFixed(0)}% do catálogo`;
  document.querySelector('.kpi-baixo').classList.toggle('alerta', porStatus.baixo > 0);
  document.querySelector('.kpi-esgotado').classList.toggle('alerta', porStatus.esgotado > 0);

  /* barra de distribuição */
  const bar = document.getElementById('dist-bar');
  const leg = document.getElementById('dist-legend');
  if (bar && leg) {
    bar.innerHTML = ''; leg.innerHTML = '';
    ['ok','medio','baixo','esgotado'].forEach(s => {
      const pct = (porStatus[s] / (t.length || 1)) * 100;
      const seg = document.createElement('div');
      seg.className = 'dist-seg';
      seg.style.background = STATUS_COLOR[s];
      bar.appendChild(seg);
      requestAnimationFrame(() => requestAnimationFrame(() => { seg.style.width = pct + '%'; }));

      leg.innerHTML += `<span class="dist-leg-item"><span class="dist-leg-dot" style="background:${STATUS_COLOR[s]}"></span>${STATUS_LABEL[s]}: <span class="dist-leg-val">${porStatus[s]}</span> (${pct.toFixed(0)}%)</span>`;
    });
  }
}

/* ---------- filtros ---------- */
function aplicarFiltros() {
  let r = [...state.todos];
  if (state.search) {
    const q = state.search.toLowerCase();
    r = r.filter(p => p.nome.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.categoria.toLowerCase().includes(q));
  }
  if (state.status !== 'todos') r = r.filter(p => calcStatus(p) === state.status);

  r.sort((a,b) => {
    if (state.ordem === 'critico') return STATUS_ORDEM[calcStatus(a)] - STATUS_ORDEM[calcStatus(b)] || a.estoque - b.estoque;
    if (state.ordem === 'nome-asc') return a.nome.localeCompare(b.nome,'pt-BR');
    if (state.ordem === 'estoque-asc') return a.estoque - b.estoque;
    if (state.ordem === 'estoque-desc') return b.estoque - a.estoque;
    if (state.ordem === 'valor-desc') return (b.estoque*b.custo) - (a.estoque*a.custo);
    return 0;
  });

  state.filtrados = r;
  state.pagina = 1;
}

/* ---------- tabela ---------- */
function renderTabela() {
  const tbody = document.getElementById('est-tbody');
  const countEl = document.getElementById('table-count');
  const emptyEl = document.getElementById('empty-state');
  if (!tbody) return;

  const total = state.filtrados.length;
  const ini = (state.pagina-1)*state.porPagina;
  const pagina = state.filtrados.slice(ini, ini+state.porPagina);

  countEl.textContent = `${total.toLocaleString('pt-BR')} item${total!==1?'s':''}`;
  emptyEl.style.display = total === 0 ? 'flex' : 'none';
  tbody.innerHTML = '';

  pagina.forEach((p) => {
    const status = calcStatus(p);
    const pct = Math.min((p.estoque/p.estoqueMax)*100, 100);
    const minPct = Math.min((p.estoqueMin/p.estoqueMax)*100, 100);
    const valor = p.estoque * p.custo;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><div class="prd-cell"><div class="prd-icon" style="background:rgba(168,85,247,.08)">${EMOJI[p.categoria]}</div><div class="prd-nome-wrap"><span class="prd-nome">${p.nome}</span><span class="prd-id">${p.id}</span></div></div></td>
      <td><span class="cat-badge">${p.categoria}</span></td>
      <td><span class="estoque-num">${p.estoque}</span><span class="estoque-unidade">/ ${p.estoqueMax}</span></td>
      <td><div class="cap-cell"><span class="cap-pct" style="color:${STATUS_COLOR[status]}">${pct.toFixed(0)}%</span><div class="cap-bar"><div class="cap-fill" style="width:0%;background:${STATUS_COLOR[status]}"></div><div class="cap-min-mark" style="left:${minPct}%"></div></div></div></td>
      <td class="ta-r"><span class="status-badge status-${status}">${STATUS_LABEL[status]}</span></td>
      <td class="valor-estoque">${fmtBRL(valor)}</td>
      <td class="ta-r">${status==='ok' ? '<button class="btn-repor" disabled>Repor</button>' : `<button class="btn-repor" data-id="${p.id}">Repor</button>`}</td>
    `;
    tbody.appendChild(tr);

    const fill = tr.querySelector('.cap-fill');
    requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = pct + '%'; }));
  });

  tbody.querySelectorAll('.btn-repor[data-id]').forEach(btn => {
    btn.addEventListener('click', () => marcarReposto(btn.dataset.id, btn));
  });

  renderPaginacao();
}

function marcarReposto(id, btn) {
  const item = state.todos.find(p => p.id === id);
  if (!item) return;
  item.estoque = item.estoqueMax;
  btn.textContent = '✓ Reposto';
  btn.classList.add('done');
  btn.disabled = true;
  setTimeout(() => { renderResumo(); aplicarFiltros(); renderTabela(); renderAlertas(); }, 700);
}

/* ---------- paginação ---------- */
function renderPaginacao() {
  const total = state.filtrados.length;
  const pages = Math.ceil(total / state.porPagina);
  const atual = state.pagina;
  const prev = document.getElementById('pag-prev'), next = document.getElementById('pag-next');
  const pEl = document.getElementById('pag-pages'), pagEl = document.getElementById('pagination');

  pagEl.style.display = pages <= 1 ? 'none' : 'flex';
  prev.disabled = atual === 1;
  next.disabled = atual === pages || pages === 0;
  pEl.innerHTML = '';

  let ini = Math.max(1, atual-2), fim = Math.min(pages, ini+4);
  if (fim-ini < 4) ini = Math.max(1, fim-4);
  for (let pg = ini; pg <= fim; pg++) {
    const b = document.createElement('button');
    b.className = 'pag-num' + (pg===atual?' active':'');
    b.textContent = pg;
    b.addEventListener('click', () => { state.pagina = pg; renderTabela(); });
    pEl.appendChild(b);
  }
}

/* ---------- alertas de reposição ---------- */
function renderAlertas() {
  const list = document.getElementById('alertas-list');
  const count = document.getElementById('alertas-count');
  if (!list) return;

  const criticos = state.todos
    .filter(p => calcStatus(p) === 'baixo' || calcStatus(p) === 'esgotado')
    .sort((a,b) => STATUS_ORDEM[calcStatus(a)] - STATUS_ORDEM[calcStatus(b)] || a.estoque - b.estoque)
    .slice(0, 12);

  count.textContent = `${criticos.length} pendente${criticos.length!==1?'s':''}`;

  if (!criticos.length) {
    list.innerHTML = '<div class="alertas-empty">✓ Nenhum alerta — estoque sob controle.</div>';
    return;
  }

  list.innerHTML = criticos.map(p => {
    const status = calcStatus(p);
    const sugestao = p.estoqueMax - p.estoque;
    return `
      <div class="alerta-item">
        <div class="alerta-top">
          <div>
            <div class="alerta-nome">${EMOJI[p.categoria]} ${p.nome}</div>
            <div class="alerta-meta">${p.id} · atual: ${p.estoque} / mín: ${p.estoqueMin}</div>
          </div>
          <span class="status-badge status-${status}">${STATUS_LABEL[status]}</span>
        </div>
        <div class="alerta-sugestao">
          <span>Reposição sugerida</span>
          <strong>+${sugestao} un.</strong>
        </div>
      </div>`;
  }).join('');
}

/* ---------- eventos ---------- */
function initEventos() {
  const inp = document.getElementById('search-input'), clr = document.getElementById('search-clear');
  inp.addEventListener('input', () => {
    state.search = inp.value.trim();
    clr.style.display = state.search ? 'block' : 'none';
    aplicarFiltros(); renderTabela();
  });
  clr.addEventListener('click', () => { inp.value=''; state.search=''; clr.style.display='none'; inp.focus(); aplicarFiltros(); renderTabela(); });

  document.getElementById('status-pills').addEventListener('click', e => {
    const pill = e.target.closest('.pill'); if (!pill) return;
    document.querySelectorAll('#status-pills .pill').forEach(p=>p.classList.remove('active'));
    pill.classList.add('active');
    state.status = pill.dataset.status;
    aplicarFiltros(); renderTabela();
  });

  document.getElementById('select-ordem').addEventListener('change', e => { state.ordem = e.target.value; aplicarFiltros(); renderTabela(); });

  document.getElementById('pag-prev').addEventListener('click', () => { if (state.pagina>1) { state.pagina--; renderTabela(); } });
  document.getElementById('pag-next').addEventListener('click', () => { const max=Math.ceil(state.filtrados.length/state.porPagina); if (state.pagina<max) { state.pagina++; renderTabela(); } });

  document.getElementById('btn-export').addEventListener('click', () => {
    const btn = document.getElementById('btn-export'), orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Exportando…';
    btn.disabled = true;
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1600);
  });
}

/* ---------- init ---------- */
document.addEventListener('DOMContentLoaded', () => {
  state.todos = gerarDados();
  aplicarFiltros();
  renderResumo();
  renderTabela();
  renderAlertas();
  initEventos();
});