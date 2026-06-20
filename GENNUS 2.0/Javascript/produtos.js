<<<<<<< HEAD
/**
 * produtos.js — Lista de Produtos — Gennus
 * Dados simulados, filtros, busca, paginação, expand e modal.
 * Sem localStorage / backend.
 */

'use strict';

/* ================================================
   1. DADOS SIMULADOS
================================================ */
const CATEGORIAS = ['Eletrônicos','Vestuário','Alimentos','Cosméticos','Casa','Ferramentas','Esportes','Outros'];

const CAT_EMOJI = {
  'Eletrônicos': '📱', 'Vestuário': '👕', 'Alimentos': '🥗',
  'Cosméticos': '✨', 'Casa': '🏠', 'Ferramentas': '🔧',
  'Esportes': '⚽', 'Outros': '📦',
};

const CAT_COLORS = {
  'Eletrônicos': '#1e3a5f', 'Vestuário': '#3b1f5f', 'Alimentos': '#14401f',
  'Cosméticos': '#403014', 'Casa': '#3d2010', 'Ferramentas': '#3d1010',
  'Esportes': '#0f3d28', 'Outros': '#1a1a1a',
};

const UNIDADES = ['un','kg','g','l','m','cx','pc'];

const NOMES_PRODUTOS = [
  ['Smartphone Pro Max 256GB','Fone de Ouvido Bluetooth TWS','Carregador Turbo 65W','Cabo USB-C Trançado 2m','Mouse Sem Fio Ergonômico','Teclado Mecânico RGB','Hub USB-C 7 em 1','Webcam Full HD 1080p','SSD Externo 1TB','Smartwatch Fitness Pro'],
  ['Camiseta Básica Preta','Calça Jeans Slim Fit','Moletom Oversized','Tênis Running Lite','Jaqueta Corta-Vento','Meia Cano Alto Pack 3','Shorts Dry-Fit','Polo Masculina Listrada','Vestido Midi Floral','Regata Academia'],
  ['Whey Protein Chocolate 1kg','Barra de Proteína Morango','Aveia em Flocos 500g','Azeite Extra Virgem 500ml','Granola Sem Açúcar 400g','Pasta de Amendoim Integral','Café Especial Torrado 250g','Chá Verde Orgânico 30 saquinhos','Mix de Castanhas 200g','Mel Puro Silvestre 340g'],
  ['Sérum Vitamina C 30ml','Protetor Solar FPS50 120ml','Hidratante Facial Oil-Free','Shampoo Reconstrutor 300ml','Máscara Capilar Nutrição','Óleo de Argan Puro 60ml','Base Líquida Natural','Lip Balm FPS20 Pack 3','Esfoliante Corporal Lavanda','Perfume Floral 50ml'],
  ['Luminária LED de Mesa','Organizador de Mesa Bambu','Almofada Decorativa 45cm','Cesto de Vime Pequeno','Kit Porta-Retratos 3 peças','Vela Aromática Soja 180g','Tapete Antiderrapante','Porta-Chaves Parede','Espelho Redondo 40cm','Colcha Casal Matelassê'],
  ['Furadeira de Impacto 750W','Trena Digital 5m','Jogo de Chaves Phillips 8pç','Alicate Universal Isolado','Nível Digital 40cm','Serra Circular 185mm','Kit Brocas Concreto 6pç','Parafusadeira Bateria 12V','Lixa Elétrica Orbital','Caixa de Ferramentas 40cm'],
  ['Bola Oficial Futsal','Raquete Beach Tennis Fibra','Corda de Pular Speed','Luva Boxe Treino 12oz','Tapete Yoga Antiderrapante','Kettlebell Ferro 8kg','Mochila Esportiva 30L','Garrafa Térmica 750ml','Joelheira Compressão Par','Elástico Resistência Kit 5'],
  ['Caixa Arquivo Plástica','Caneta Gel 0.5mm Pack 10','Agenda Executiva Couro','Calculadora Científica','Pasta L Ofício Pack 50','Envelope Segurança Pack 25','Grampeador 26/6','Post-it Neon Pack 4','Molha-Dedo Glicerinado','Rolo Fita Crepe 50m'],
];

/* ================================================
   2. GERADOR DETERMINÍSTICO
================================================ */
let _seed = 77;
function rand()         { _seed = (_seed * 1664525 + 1013904223) & 0xffffffff; return ((_seed >>> 0) / 0xffffffff); }
function randInt(a, b)  { return Math.floor(rand() * (b - a + 1)) + a; }
function pick(arr)      { return arr[randInt(0, arr.length - 1)]; }

/** Gera EAN-13 com dígito verificador correto */
function gerarEAN() {
  const digits = Array.from({length: 12}, () => randInt(0, 9));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join('');
}

/** Gera EAN-13 público (sem semente) para o formulário */
function gerarEANPublico() {
  const digits = Array.from({length: 12}, () => Math.floor(Math.random() * 10));
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const check = (10 - (sum % 10)) % 10;
  return [...digits, check].join('');
}

const DESCRICOES = {
  'Eletrônicos': ['Alta performance com processador de última geração e bateria de longa duração.','Compatível com todos os dispositivos modernos, design compacto e resistente.','Tecnologia avançada com conectividade estável e baixa latência.'],
  'Vestuário':   ['Tecido 100% algodão respirável, ideal para o dia a dia.','Corte moderno com acabamento premium e costuras reforçadas.','Material de alta qualidade com proteção UV e secagem rápida.'],
  'Alimentos':   ['Produto natural sem conservantes artificiais, rico em nutrientes essenciais.','Sabor autêntico com ingredientes selecionados e processo artesanal.','Alta concentração proteica, ideal para dieta e performance.'],
  'Cosméticos':  ['Fórmula dermatologicamente testada, livre de parabenos e sulfatos.','Ação prolongada com ingredientes naturais e vitaminas essenciais.','Resultado visível em 14 dias, clinicamente comprovado.'],
  'Casa':        ['Design minimalista que combina com qualquer decoração moderna.','Material durável com acabamento premium e fácil manutenção.','Dimensões versáteis para uso em diferentes ambientes.'],
  'Ferramentas': ['Construção robusta com aço inoxidável de alta resistência.','Motor potente com controle de velocidade e proteção térmica.','Ergonomia avançada que reduz o cansaço em uso prolongado.'],
  'Esportes':    ['Material profissional com tecnologia de absorção de impacto.','Design aerodinâmico para máxima performance e conforto.','Resistente à água e transpiração, ideal para treinos intensos.'],
  'Outros':      ['Produto versátil com múltiplas aplicações no dia a dia.','Qualidade garantida com material de primeira linha.','Ótimo custo-benefício para uso profissional e pessoal.'],
};

function gerarProdutos() {
  _seed = 77;
  const produtos = [];
  const agora = Date.now();

  CATEGORIAS.forEach((cat, catIdx) => {
    const nomes = NOMES_PRODUTOS[catIdx];
    nomes.forEach((nome, i) => {
      const id        = `PRD-${String(catIdx * 10 + i + 1).padStart(5,'0')}`;
      const custo     = randInt(20, 800);
      const markup    = 1 + rand() * 1.2 + 0.2; // markup 1.2x a 2.2x
      const venda     = Math.round(custo * markup);
      const margem    = (venda - custo) / venda;
      const estoqueMax= randInt(30, 200);
      const estoqueMin= randInt(5, 20);
      let   estoque   = randInt(0, estoqueMax);
      // força alguns casos críticos
      if (i === 0 && catIdx % 3 === 0) estoque = 0;
      if (i === 1 && catIdx % 2 === 0) estoque = randInt(1, estoqueMin - 1);

      const dias = randInt(10, 730);
      const dataCad = new Date(agora - dias * 86_400_000);
      const descricoes = DESCRICOES[cat];
      const descricao = pick(descricoes);

      let statusCalc;
      if (estoque === 0)                  statusCalc = 'esgotado';
      else if (estoque <= estoqueMin)     statusCalc = 'baixo-estoque';
      else                                statusCalc = 'ativo';

      // ~10% de produtos inativos
      if (rand() < 0.10) statusCalc = 'inativo';

      produtos.push({
        id, nome, categoria: cat, ean: gerarEAN(),
        descricao, custo, venda, margem,
        estoque, estoqueMin, estoqueMax,
        unidade: 'un', status: statusCalc,
        dataCad, obs: '',
      });
    });
  });

  return produtos;
}

/* ================================================
   3. ESTADO
================================================ */
const state = {
  todos:     [],
  filtrados: [],
  search:    '',
  status:    'todos',
  categoria: 'todos',
  ordem:     'nome-asc',
  pagina:    1,
  porPagina: 12,
  expandido: null,
};

/* ================================================
   4. HELPERS
================================================ */
const fmtBRL  = n => 'R$ ' + Number(n).toLocaleString('pt-BR', {minimumFractionDigits:2, maximumFractionDigits:2});
const fmtPct  = n => (n * 100).toFixed(1).replace('.', ',') + '%';
const fmtData = d => d.toLocaleDateString('pt-BR', {day:'2-digit', month:'short', year:'numeric'});
const fmtNum  = n => Math.round(n).toLocaleString('pt-BR');

function countUp(el, target, fmt, dur = 600) {
  if (!el) return;
  const t0 = performance.now();
  const go = now => {
    const p = Math.min((now - t0) / dur, 1);
    el.textContent = fmt(target * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(go);
  };
  requestAnimationFrame(go);
}

function classMargem(m) {
  if (m >= 0.4) return 'margem-alta';
  if (m >= 0.2) return 'margem-media';
  return 'margem-baixa';
}

function classEstoque(p) {
  if (p.status === 'esgotado')      return 'estoque-zero';
  if (p.status === 'baixo-estoque') return 'estoque-warn';
  if (p.status === 'inativo')       return 'estoque-zero';
  return 'estoque-ok';
}

function estoqueBarPct(p) {
  if (p.estoqueMax === 0) return 0;
  return Math.min(p.estoque / p.estoqueMax, 1);
}

function estoqueBarColor(p) {
  if (p.status === 'esgotado')      return '#f87171';
  if (p.status === 'baixo-estoque') return '#fbbf24';
  return '#22c55e';
}

/* ================================================
   5. KPIs
================================================ */
function renderKPIs() {
  const todos   = state.todos;
  const ativos  = todos.filter(p => p.status !== 'inativo');
  const baixo   = todos.filter(p => p.status === 'baixo-estoque' || p.status === 'esgotado');
  const valorEst= todos.reduce((s, p) => s + p.custo * p.estoque, 0);
  const cats    = new Set(todos.map(p => p.categoria)).size;

  countUp(document.getElementById('kpi-total'),     todos.length,  n => fmtNum(Math.round(n)));
  countUp(document.getElementById('kpi-ativos'),    ativos.length, n => fmtNum(Math.round(n)));
  countUp(document.getElementById('kpi-baixo'),     baixo.length,  n => fmtNum(Math.round(n)));
  countUp(document.getElementById('kpi-valor'),     valorEst,      n => fmtBRL(n));
  countUp(document.getElementById('kpi-categorias'),cats,          n => fmtNum(Math.round(n)));

  const subAtivos = document.getElementById('kpi-ativos-sub');
  if (subAtivos) subAtivos.textContent = `${fmtPct(ativos.length / (todos.length || 1))} do catálogo`;

  // Pulsa o card de estoque baixo se tiver alertas
  const cardBaixo = document.querySelector('.kpi-baixo');
  if (cardBaixo) cardBaixo.classList.toggle('tem-alerta', baixo.length > 0);
}

/* ================================================
   6. CHIPS DE CATEGORIA NO TOPBAR
================================================ */
function renderCatChips() {
  const el = document.getElementById('cat-chips');
  if (!el) return;
  const contagem = {};
  state.filtrados.forEach(p => { contagem[p.categoria] = (contagem[p.categoria] || 0) + 1; });
  el.innerHTML = Object.entries(contagem)
    .sort((a,b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, n]) => `<span class="cat-chip">${CAT_EMOJI[cat]} ${cat} <strong>${n}</strong></span>`)
    .join('');
}

/* ================================================
   7. FILTROS + ORDENAÇÃO
================================================ */
function aplicarFiltros() {
  let r = [...state.todos];

  if (state.search) {
    const q = state.search.toLowerCase();
    r = r.filter(p =>
      p.nome.toLowerCase().includes(q)      ||
      p.id.toLowerCase().includes(q)        ||
      p.ean.includes(q)                     ||
      p.descricao.toLowerCase().includes(q) ||
      p.categoria.toLowerCase().includes(q)
    );
  }

  if (state.status !== 'todos')    r = r.filter(p => p.status === state.status);
  if (state.categoria !== 'todos') r = r.filter(p => p.categoria === state.categoria);

  const ord = state.ordem;
  r.sort((a, b) => {
    if (ord === 'nome-asc')      return a.nome.localeCompare(b.nome, 'pt-BR');
    if (ord === 'nome-desc')     return b.nome.localeCompare(a.nome, 'pt-BR');
    if (ord === 'preco-desc')    return b.venda - a.venda;
    if (ord === 'preco-asc')     return a.venda - b.venda;
    if (ord === 'estoque-asc')   return a.estoque - b.estoque;
    if (ord === 'estoque-desc')  return b.estoque - a.estoque;
    if (ord === 'recente')       return b.dataCad - a.dataCad;
    return 0;
  });

  state.filtrados = r;
  state.pagina    = 1;
}

/* ================================================
   8. TABELA
================================================ */
function renderTabela() {
  const tbody   = document.getElementById('prd-tbody');
  const countEl = document.getElementById('table-count');
  const emptyEl = document.getElementById('empty-state');
  if (!tbody) return;

  const total  = state.filtrados.length;
  const inicio = (state.pagina - 1) * state.porPagina;
  const pagina = state.filtrados.slice(inicio, inicio + state.porPagina);

  if (countEl) countEl.textContent = `${total.toLocaleString('pt-BR')} produto${total !== 1 ? 's' : ''}`;
  if (emptyEl) emptyEl.style.display = total === 0 ? 'flex' : 'none';

  tbody.innerHTML = '';
  state.expandido = null;

  pagina.forEach((p, idx) => {
    const barPct   = (estoqueBarPct(p) * 100).toFixed(0);
    const barColor = estoqueBarColor(p);
    const margemCls= classMargem(p.margem);
    const estCls   = classEstoque(p);

    const statusLabel = {
      'ativo': 'Ativo', 'baixo-estoque': 'Estoque Baixo',
      'esgotado': 'Esgotado', 'inativo': 'Inativo',
    }[p.status];

    const tr = document.createElement('tr');
    tr.className  = 'prd-row';
    tr.dataset.id = p.id;
    tr.innerHTML = `
      <td>
        <div class="prd-cell">
          <div class="prd-icon" style="background:${CAT_COLORS[p.categoria]}">${CAT_EMOJI[p.categoria]}</div>
          <div class="prd-nome-wrap">
            <span class="prd-nome">${p.nome}</span>
            <span class="prd-id">${p.id}</span>
          </div>
        </div>
      </td>
      <td><span class="ean-code">${p.ean}</span></td>
      <td><span class="descricao-cell" title="${p.descricao}">${p.descricao}</span></td>
      <td><span class="cat-badge cat-${p.categoria.replace(/[^a-zA-Z]/g,'')}">${p.categoria}</span></td>
      <td class="prd-preco">${fmtBRL(p.venda)}</td>
      <td class="prd-margem ${margemCls}">${fmtPct(p.margem)}</td>
      <td>
        <div class="estoque-cell">
          <span class="estoque-val ${estCls}">${p.estoque} ${p.unidade}</span>
          <div class="estoque-mini-bar">
            <div class="estoque-mini-fill" style="width:${barPct}%;background:${barColor}"></div>
          </div>
        </div>
      </td>
      <td><span class="status-badge status-${p.status}">${statusLabel}</span></td>
      <td class="expand-arrow">▾</td>
    `;

    // Linha de detalhe
    const trD = document.createElement('tr');
    trD.className    = 'expand-row';
    trD.dataset.for  = p.id;
    const tdD = document.createElement('td');
    tdD.colSpan      = 9;
    const content    = document.createElement('div');
    content.className = 'expand-content';
    content.innerHTML = buildExpandContent(p);
    tdD.appendChild(content);
    trD.appendChild(tdD);

    // Animação de entrada
    tr.style.cssText = `opacity:0;transform:translateY(6px);transition:opacity .28s ease ${idx*30}ms,transform .28s ease ${idx*30}ms`;
    tbody.appendChild(tr);
    tbody.appendChild(trD);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      tr.style.opacity   = '1';
      tr.style.transform = 'translateY(0)';
    }));

    tr.addEventListener('click', () => toggleExpand(p.id, tr, content));
  });

  renderCatChips();
  renderPaginacao();
}

/* ================================================
   9. CONTEÚDO DO EXPAND
================================================ */
function buildExpandContent(p) {
  // Seção 1: Descrição + dados básicos
  const sec1 = `
    <div class="expand-section">
      <div class="expand-section-title">Descrição Completa</div>
      <p class="expand-descricao">${p.descricao}</p>
      <div class="expand-fields-grid">
        <div class="expand-field">
          <span class="expand-field-label">Unidade</span>
          <span class="expand-field-val">${p.unidade}</span>
        </div>
        <div class="expand-field">
          <span class="expand-field-label">Categoria</span>
          <span class="expand-field-val">${p.categoria}</span>
        </div>
        <div class="expand-field">
          <span class="expand-field-label">EAN / JAN</span>
          <span class="expand-field-val" style="font-family:monospace;letter-spacing:.06em">${p.ean}</span>
        </div>
        <div class="expand-field">
          <span class="expand-field-label">Cadastro</span>
          <span class="expand-field-val">${fmtData(p.dataCad)}</span>
        </div>
      </div>
    </div>
  `;

  // Seção 2: Financeiro + estoque
  const estoqueColor = estoqueBarColor(p);
  const estoqueAlerta = p.estoque <= p.estoqueMin && p.estoque > 0
    ? `<span style="color:var(--amarelo);font-size:.7rem">⚠ Abaixo do mínimo (${p.estoqueMin} ${p.unidade})</span>` : '';
  const sec2 = `
    <div class="expand-section">
      <div class="expand-section-title">Financeiro &amp; Estoque</div>
      <div class="expand-field">
        <span class="expand-field-label">Preço de Custo</span>
        <span class="expand-field-val">${fmtBRL(p.custo)}</span>
      </div>
      <div class="expand-field">
        <span class="expand-field-label">Preço de Venda</span>
        <span class="expand-field-val" style="color:var(--verde);font-weight:700">${fmtBRL(p.venda)}</span>
      </div>
      <div class="expand-field">
        <span class="expand-field-label">Margem Bruta</span>
        <span class="expand-field-val ${classMargem(p.margem)}">${fmtPct(p.margem)}</span>
      </div>
      <div class="expand-field">
        <span class="expand-field-label">Estoque Atual / Mínimo / Máx</span>
        <span class="expand-field-val">
          <strong style="color:${estoqueColor}">${p.estoque}</strong>
          / ${p.estoqueMin} / ${p.estoqueMax} ${p.unidade}
        </span>
        ${estoqueAlerta}
      </div>
      <div class="expand-field">
        <span class="expand-field-label">Valor em Estoque</span>
        <span class="expand-field-val" style="color:#60a5fa;font-weight:700">${fmtBRL(p.custo * p.estoque)}</span>
      </div>
    </div>
  `;

  // Seção 3: Ações
  const sec3 = `
    <div class="expand-section">
      <div class="expand-section-title">Ações</div>
      <div class="expand-actions">
        <button class="action-btn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Editar Produto
        </button>
        <button class="action-btn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Ver Vendas
        </button>
        <button class="action-btn" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Ajustar Estoque
        </button>
        <button class="action-btn danger" onclick="event.stopPropagation()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
          ${p.status === 'inativo' ? 'Reativar Produto' : 'Desativar Produto'}
        </button>
      </div>
    </div>
  `;

  return sec1 + sec2 + sec3;
}

/* ================================================
   10. EXPAND / RECOLHER
================================================ */
function toggleExpand(id, tr, content) {
  const aberto = state.expandido === id;

  if (state.expandido) {
    document.querySelector(`.prd-row[data-id="${state.expandido}"]`)?.classList.remove('active-row');
    document.querySelector(`.expand-row[data-for="${state.expandido}"] .expand-content`)?.classList.remove('open');
    state.expandido = null;
  }

  if (!aberto) {
    tr.classList.add('active-row');
    content.classList.add('open');
    state.expandido = id;
  }
}

/* ================================================
   11. PAGINAÇÃO
================================================ */
function renderPaginacao() {
  const total  = state.filtrados.length;
  const pages  = Math.ceil(total / state.porPagina);
  const atual  = state.pagina;

  const prev   = document.getElementById('pag-prev');
  const next   = document.getElementById('pag-next');
  const pEl    = document.getElementById('pag-pages');
  const pagEl  = document.getElementById('pagination');

  if (pagEl) pagEl.style.display = pages <= 1 ? 'none' : 'flex';
  if (prev)  prev.disabled = atual === 1;
  if (next)  next.disabled = atual === pages || pages === 0;
  if (!pEl)  return;

  pEl.innerHTML = '';
  let ini = Math.max(1, atual - 2);
  let fim = Math.min(pages, ini + 4);
  if (fim - ini < 4) ini = Math.max(1, fim - 4);

  for (let pg = ini; pg <= fim; pg++) {
    const btn = document.createElement('button');
    btn.className   = 'pag-num' + (pg === atual ? ' active' : '');
    btn.textContent = pg;
    btn.addEventListener('click', () => { state.pagina = pg; renderTabela(); });
    pEl.appendChild(btn);
  }
}

/* ================================================
   12. MODAL NOVO PRODUTO
================================================ */
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const btnNovo = document.getElementById('btn-novo');
  const btnClose= document.getElementById('modal-close');
  const btnCanc = document.getElementById('btn-cancelar');
  const btnSalv = document.getElementById('btn-salvar');
  const btnEAN  = document.getElementById('btn-gerar-ean');

  const abrir = () => { overlay?.classList.add('open'); document.body.style.overflow = 'hidden'; };
  const fechar= () => { overlay?.classList.remove('open'); document.body.style.overflow = ''; limparForm(); };

  btnNovo?.addEventListener('click', abrir);
  btnClose?.addEventListener('click', fechar);
  btnCanc?.addEventListener('click', fechar);
  overlay?.addEventListener('click', e => { if (e.target === overlay) fechar(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });

  // Gerar EAN
  btnEAN?.addEventListener('click', () => {
    const input = document.getElementById('f-ean');
    if (input) {
      input.value = gerarEANPublico();
      input.classList.add('highlight');
      setTimeout(() => input.classList.remove('highlight'), 600);
    }
  });

  // Preview de margem ao digitar custo/venda
  ['f-custo', 'f-venda'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', atualizarMargem);
  });

  // Salvar
  btnSalv?.addEventListener('click', () => {
    if (!validarForm()) return;
    btnSalv.textContent = 'Salvando…';
    btnSalv.disabled    = true;
    setTimeout(() => {
      btnSalv.textContent = '✓ Salvo!';
      btnSalv.classList.add('saved');
      setTimeout(() => { fechar(); btnSalv.textContent = 'Salvar Produto'; btnSalv.disabled = false; btnSalv.classList.remove('saved'); }, 1000);
    }, 900);
  });

  // Máscara EAN — só dígitos
  document.getElementById('f-ean')?.addEventListener('input', e => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 13);
  });
}

function atualizarMargem() {
  const custo = parseFloat(document.getElementById('f-custo')?.value) || 0;
  const venda = parseFloat(document.getElementById('f-venda')?.value) || 0;
  const prev  = document.getElementById('margem-preview');
  const val   = document.getElementById('margem-preview-val');
  if (!prev || !val) return;

  if (custo > 0 && venda > 0) {
    prev.style.display = 'flex';
    const m = (venda - custo) / venda;
    val.textContent = fmtPct(m);
    val.className   = 'margem-preview-val ' + classMargem(m);
  } else {
    prev.style.display = 'none';
  }
}

function validarForm() {
  let ok = true;
  const obrigatorios = [
    { id:'f-nome',      label:'Nome do Produto' },
    { id:'f-categoria', label:'Categoria'       },
    { id:'f-descricao', label:'Descrição'       },
    { id:'f-custo',     label:'Preço de Custo'  },
    { id:'f-venda',     label:'Preço de Venda'  },
    { id:'f-estoque',   label:'Estoque'         },
  ];
  obrigatorios.forEach(({ id }) => {
    const el = document.getElementById(id);
    if (!el) return;
    const vazio = !el.value.trim();
    el.classList.toggle('error', vazio);
    if (vazio) ok = false;
  });
  return ok;
}

function limparForm() {
  ['f-nome','f-ean','f-categoria','f-descricao','f-custo','f-venda','f-estoque','f-estoque-min','f-unidade','f-status','f-obs']
    .forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.value = el.tagName === 'SELECT' ? el.options[0]?.value || '' : '';
      el.classList.remove('error');
    });
  const prev = document.getElementById('margem-preview');
  if (prev) prev.style.display = 'none';
}

/* ================================================
   13. EVENTOS
================================================ */
function initEventos() {

  /* Busca */
  const inp  = document.getElementById('search-input');
  const clr  = document.getElementById('search-clear');
  inp?.addEventListener('input', () => {
    state.search = inp.value.trim();
    if (clr) clr.style.display = state.search ? 'block' : 'none';
    aplicarFiltros(); renderTabela();
  });
  clr?.addEventListener('click', () => {
    inp.value = ''; state.search = '';
    clr.style.display = 'none'; inp.focus();
    aplicarFiltros(); renderTabela();
  });

  /* Pills de status */
  document.getElementById('status-pills')?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('#status-pills .pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.status = pill.dataset.status;
    aplicarFiltros(); renderTabela();
  });

  /* Categoria */
  document.getElementById('select-categoria')?.addEventListener('change', e => {
    state.categoria = e.target.value;
    aplicarFiltros(); renderTabela();
  });

  /* Ordem */
  document.getElementById('select-ordem')?.addEventListener('change', e => {
    state.ordem = e.target.value;
    aplicarFiltros(); renderTabela();
  });

  /* Paginação */
  document.getElementById('pag-prev')?.addEventListener('click', () => { if (state.pagina > 1) { state.pagina--; renderTabela(); } });
  document.getElementById('pag-next')?.addEventListener('click', () => {
    const max = Math.ceil(state.filtrados.length / state.porPagina);
    if (state.pagina < max) { state.pagina++; renderTabela(); }
  });

  /* Exportar (visual) */
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const btn  = document.getElementById('btn-export');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:spin .8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Exportando…';
    btn.disabled  = true;
    setTimeout(() => { btn.innerHTML = orig; btn.disabled = false; }, 1800);
  });
}

/* ================================================
   14. INIT
================================================ */
document.addEventListener('DOMContentLoaded', () => {
  state.todos = gerarProdutos();
  aplicarFiltros();
  renderKPIs();
  renderTabela();
  initModal();
  initEventos();
=======
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("produto-form");
    const listaHtml = document.getElementById("lista-produtos");
    let produtos = JSON.parse(localStorage.getItem("gennus_prods")) || [];

    function renderizar() {
        if (!listaHtml) return;
        listaHtml.innerHTML = "";
        produtos.forEach((p, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${p.nome}</td>
                <td>R$ ${parseFloat(p.custo).toFixed(2)}</td>
                <td>R$ ${parseFloat(p.preco).toFixed(2)}</td>
                <td>${p.estoque} ${p.unidade}</td>
                <td>${p.nomeMae  || "nao definido"} </td>
                <td>
                    <button onclick="editarProd(${i})" style="color:var(--roxo); background:none; border:none; cursor:pointer;">Editar</button>
                    <button onclick="excluirProd(${i})" style="color:var(--vermelho); background:none; border:none; cursor:pointer; margin-left:10px;">Excluir</button>
                </td>
            `;
            listaHtml.appendChild(tr);
        });
    }

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const id = document.getElementById("prod-id").value;
        const dados = {
            nome: document.getElementById("prod-nome").value,
            nomeMae: document.getElementById("nomeMae").value,
            categoria: document.getElementById("prod-categoria").value,
            unidade: document.getElementById("prod-unidade").value,
            custo: parseFloat(document.getElementById("prod-custo").value) || 0,
            preco: parseFloat(document.getElementById("prod-preco").value) || 0,
            estoque: parseFloat(document.getElementById("prod-estoque").value) || 0
        };

        if (id === "") produtos.push(dados);
        else { produtos[id] = dados; document.getElementById("prod-id").value = ""; }

        localStorage.setItem("gennus_prods", JSON.stringify(produtos));
        form.reset();
        renderizar();
        alert("Produto salvo!");
    });

    window.editarProd = (i) => {
        const p = produtos[i];
        document.getElementById("prod-id").value = i;
        document.getElementById("prod-nome").value = p.nome;
        document.getElementById("nomeMae").value || "";
        document.getElementById("prod-custo").value = p.custo;
        document.getElementById("prod-preco").value = p.preco;
        document.getElementById("prod-estoque").value = p.estoque;
        document.getElementById("prod-unidade").value = p.unidade;
    };

    window.excluirProd = (i) => {
        if(confirm("Excluir?")) {
            produtos.splice(i, 1);
            localStorage.setItem("gennus_prods", JSON.stringify(produtos));
            renderizar();
        }
    };

    renderizar();
>>>>>>> eecb125950e2eb0001bbbdf582cb1851bd5790a7
});