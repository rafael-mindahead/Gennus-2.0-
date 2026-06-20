<<<<<<< HEAD
/**
 * venda.js — Gestão de Vendas — Gennus
 * Dados simulados, filtros, busca, paginação e linhas expansíveis.
 * Sem localStorage / backend.
 */

'use strict';

/* ================================================
   1. CONSTANTES DE DOMÍNIO
================================================ */
const NOMES = [
  'Ana Souza','Carlos Lima','Mariana Costa','Pedro Alves','Juliana Rocha',
  'Roberto Mendes','Fernanda Silva','Lucas Pereira','Camila Santos','Thiago Ferreira',
  'Beatriz Oliveira','Diego Martins','Larissa Nunes','Felipe Carvalho','Isabela Gomes',
  'Gustavo Ramos','Tatiana Melo','Rodrigo Freitas','Aline Barbosa','Mateus Ribeiro',
  'Priscila Teixeira','Leonardo Azevedo','Vanessa Pinto','André Correia','Natalia Fonseca',
  'Vitor Cardoso','Letícia Matos','Bruno Moreira','Raquel Monteiro','Claudio Vieira',
];

const PRODUTOS = [
  { nome: 'Produto Alpha',  preco: 349 },
  { nome: 'Produto Beta',   preco: 289 },
  { nome: 'Produto Gamma',  preco: 198 },
  { nome: 'Produto Delta',  preco: 427 },
  { nome: 'Produto Epsilon',preco: 156 },
  { nome: 'Produto Zeta',   preco: 512 },
  { nome: 'Produto Eta',    preco: 234 },
  { nome: 'Produto Theta',  preco: 88  },
];

const CANAIS = ['online','whatsapp','presencial','marketplace'];
const CANAL_LABELS = { online:'Loja Online', whatsapp:'WhatsApp', presencial:'Presencial', marketplace:'Marketplace' };

const STATUS = ['concluido','concluido','concluido','pendente','processando','cancelado'];
// concluido repetido 3x → ~50% das vendas concluídas

const PAGAMENTOS = ['Cartão de Crédito','Pix','Cartão de Débito','Boleto','Dinheiro'];

/* ================================================
   2. GERADOR DE VENDAS SIMULADAS
   Cria um array de N vendas com datas no intervalo [daysAgo, hoje].
================================================ */
let _seed = 42;
function rand() {
  /* LCG simples — determinístico por seed, não usa Math.random para repeatability */
  _seed = (_seed * 1664525 + 1013904223) & 0xffffffff;
  return ((_seed >>> 0) / 0xffffffff);
}
function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
function pick(arr) { return arr[randInt(0, arr.length - 1)]; }

function gerarVendas(count, daysAgo) {
  _seed = 42 + daysAgo; // seed diferente por período
  const agora  = Date.now();
  const inicio = agora - daysAgo * 86_400_000;
  const vendas = [];

  for (let i = 0; i < count; i++) {
    /* Itens do pedido: 1 a 3 produtos */
    const numItens  = randInt(1, 3);
    const itens     = [];
    let   total     = 0;
    const usados    = new Set();
    for (let j = 0; j < numItens; j++) {
      let prod;
      do { prod = pick(PRODUTOS); } while (usados.has(prod.nome));
      usados.add(prod.nome);
      const qtd  = randInt(1, 4);
      const sub  = prod.preco * qtd;
      itens.push({ nome: prod.nome, qtd, valor: sub });
      total += sub;
    }

    const ts     = inicio + rand() * (agora - inicio);
    const data   = new Date(ts);
    const canal  = pick(CANAIS);
    const status = pick(STATUS);
    const cliente= pick(NOMES);
    const email  = cliente.toLowerCase().replace(' ', '.') + '@email.com';

    vendas.push({
      id:        'GEN-' + String(10000 + i).padStart(5, '0'),
      cliente,
      email,
      canal,
      status,
      total,
      itens,
      pagamento: pick(PAGAMENTOS),
      data,
      timestamp: ts,
    });
  }

  /* Ordena por data decrescente */
  return vendas.sort((a, b) => b.timestamp - a.timestamp);
}

/* ================================================
   3. CONFIGURAÇÃO DOS PERÍODOS
================================================ */
const PERIODOS = {
  '7d':  { label: '7 dias',    dias: 7,   count: 48,  antCount: 38  },
  '30d': { label: '30 dias',   dias: 30,  count: 180, antCount: 148 },
  '90d': { label: '3 meses',   dias: 90,  count: 512, antCount: 430 },
  '1y':  { label: '1 ano',     dias: 365, count: 2210,antCount: 1890 },
};

/* ================================================
   4. ESTADO DA APLICAÇÃO
================================================ */
const state = {
  period:      '7d',
  todasVendas: [],
  filtradas:   [],
  search:      '',
  status:      'todos',
  canal:       'todos',
  sort:        { campo: 'data', dir: 'desc' },
  pagina:      1,
  porPagina:   10,
  expandido:   null,
};

/* ================================================
   5. HELPERS
================================================ */
const fmtBRL = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const fmtNum = n => Math.round(n).toLocaleString('pt-BR');
const fmtPct = n => (n * 100).toFixed(1).replace('.', ',') + '%';
const delta  = (a, b) => (a - b) / b;

function fmtData(d) {
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'2-digit' });
}
function fmtDataHora(d) {
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
    + ' · ' + d.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' });
}

function countUp(el, target, formatter, duration = 600) {
  if (!el) return;
  const start = performance.now();
  const step  = now => {
    const t = Math.min((now - start) / duration, 1);
    const e = 1 - Math.pow(1 - t, 3);
    el.textContent = formatter(target * e);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ================================================
   6. RENDERIZAÇÃO DE KPIs
================================================ */
function renderKPIs() {
  const d     = PERIODOS[state.period];
  const v     = state.todasVendas;
  const total = v.reduce((s, x) => s + x.total, 0);
  const ticket= v.length ? total / v.length : 0;
  const concl = v.filter(x => x.status === 'concluido').length;
  const canc  = v.filter(x => x.status === 'cancelado').length;

  /* Simula período anterior (ratio fixo por período) */
  const ratio = d.antCount / d.count;
  const antTotal  = total  * ratio * 0.88;
  const antPedidos= d.antCount;
  const antTicket = ticket * 0.93;

  countUp(document.getElementById('kpi-faturado'),  total,  fmtBRL);
  countUp(document.getElementById('kpi-pedidos'),   v.length, n => fmtNum(Math.round(n)));
  countUp(document.getElementById('kpi-ticket'),    ticket, fmtBRL);
  countUp(document.getElementById('kpi-concluidos'),concl / (v.length || 1),
    n => (n * 100).toFixed(1).replace('.', ',') + '%');
  countUp(document.getElementById('kpi-cancelados'), canc / (v.length || 1),
    n => (n * 100).toFixed(1).replace('.', ',') + '%');

  renderDelta('kpi-faturado-delta', delta(total,     antTotal));
  renderDelta('kpi-pedidos-delta',  delta(v.length,  antPedidos));
  renderDelta('kpi-ticket-delta',   delta(ticket,    antTicket));
}

function renderDelta(id, val) {
  const el = document.getElementById(id);
  if (!el) return;
  const pos = val >= 0;
  el.textContent = `${pos ? '+' : ''}${fmtPct(Math.abs(val))} vs. anterior`;
  el.className   = 'kpi-delta ' + (pos ? 'pos' : 'neg');
}

/* ================================================
   7. FILTRAGEM + ORDENAÇÃO
================================================ */
function aplicarFiltros() {
  let resultado = [...state.todasVendas];

  /* Busca */
  if (state.search) {
    const q = state.search.toLowerCase();
    resultado = resultado.filter(v =>
      v.id.toLowerCase().includes(q)         ||
      v.cliente.toLowerCase().includes(q)    ||
      v.email.toLowerCase().includes(q)      ||
      v.itens.some(it => it.nome.toLowerCase().includes(q))
    );
  }

  /* Status */
  if (state.status !== 'todos') {
    resultado = resultado.filter(v => v.status === state.status);
  }

  /* Canal */
  if (state.canal !== 'todos') {
    resultado = resultado.filter(v => v.canal === state.canal);
  }

  /* Ordenação */
  resultado.sort((a, b) => {
    let va, vb;
    if (state.sort.campo === 'data')  { va = a.timestamp; vb = b.timestamp; }
    if (state.sort.campo === 'valor') { va = a.total;     vb = b.total; }
    return state.sort.dir === 'desc' ? vb - va : va - vb;
  });

  state.filtradas = resultado;
  state.pagina    = 1;
}

/* ================================================
   8. RENDERIZAÇÃO DA TABELA
================================================ */
function renderTabela() {
  const tbody    = document.getElementById('venda-tbody');
  const countEl  = document.getElementById('table-count');
  const emptyEl  = document.getElementById('empty-state');
  if (!tbody) return;

  const total    = state.filtradas.length;
  const inicio   = (state.pagina - 1) * state.porPagina;
  const pagina   = state.filtradas.slice(inicio, inicio + state.porPagina);

  /* Contador */
  if (countEl) {
    countEl.textContent = total === 0
      ? 'Nenhum resultado'
      : `${total.toLocaleString('pt-BR')} pedido${total !== 1 ? 's' : ''}`;
  }

  /* Estado vazio */
  if (emptyEl) emptyEl.style.display = total === 0 ? 'flex' : 'none';

  /* Reseta expand se a linha não está mais na página */
  tbody.innerHTML = '';
  state.expandido = null;

  pagina.forEach((venda, idx) => {
    /* Linha principal */
    const tr = document.createElement('tr');
    tr.className = 'venda-row';
    tr.dataset.id = venda.id;

    const canalClass = 'canal-' + venda.canal;
    const statusClass = 'status-' + venda.status;
    const statusLabel = { concluido:'Concluído', pendente:'Pendente', processando:'Processando', cancelado:'Cancelado' }[venda.status];
    const produto1 = venda.itens[0].nome;
    const maisItens = venda.itens.length > 1 ? `<span class="produto-mais">+${venda.itens.length - 1}</span>` : '';

    tr.innerHTML = `
      <td><span class="pedido-num">${venda.id}</span></td>
      <td>
        <div class="cliente-nome">${venda.cliente}</div>
        <div class="cliente-email">${venda.email}</div>
      </td>
      <td><span class="produto-nome">${produto1}</span>${maisItens}</td>
      <td><span class="canal-badge ${canalClass}">${CANAL_LABELS[venda.canal]}</span></td>
      <td class="venda-valor">${fmtBRL(venda.total)}</td>
      <td style="text-align:right"><span class="status-badge ${statusClass}">${statusLabel}</span></td>
      <td class="venda-data">${fmtData(venda.data)}</td>
      <td class="expand-arrow">▾</td>
    `;

    /* Linha de detalhe (sempre criada, começa fechada) */
    const trDetail = document.createElement('tr');
    trDetail.className = 'expand-row';
    trDetail.dataset.for = venda.id;

    const tdDetail = document.createElement('td');
    tdDetail.colSpan = 8;

    const content = document.createElement('div');
    content.className = 'expand-content';
    content.innerHTML = buildExpandContent(venda);

    tdDetail.appendChild(content);
    trDetail.appendChild(tdDetail);

    /* Animação de entrada staggerada */
    tr.style.opacity   = '0';
    tr.style.transform = 'translateY(6px)';
    tr.style.transition = `opacity 0.28s ease ${idx * 35}ms, transform 0.28s ease ${idx * 35}ms`;

    tbody.appendChild(tr);
    tbody.appendChild(trDetail);

    requestAnimationFrame(() => requestAnimationFrame(() => {
      tr.style.opacity   = '1';
      tr.style.transform = 'translateY(0)';
    }));

    /* Evento de clique para expandir */
    tr.addEventListener('click', () => toggleExpand(venda.id, tr, content));
  });

  renderPaginacao();
}

/* ================================================
   9. CONTEÚDO DO EXPAND (HTML interno)
================================================ */
function buildExpandContent(venda) {
  /* Seção 1: Itens */
  const itensHTML = venda.itens.map(it => `
    <div class="expand-item">
      <span class="expand-item-nome">${it.nome}</span>
      <span class="expand-item-qtd">×${it.qtd}</span>
      <span class="expand-item-val">${fmtBRL(it.valor)}</span>
    </div>
  `).join('');

  /* Seção 2: Pagamento e canal */
  const infoHTML = `
    <div class="expand-info-row">
      <span class="expand-info-label">Forma de Pagamento</span>
      <span class="expand-info-val">${venda.pagamento}</span>
    </div>
    <div class="expand-info-row">
      <span class="expand-info-label">Canal de Origem</span>
      <span class="expand-info-val">${CANAL_LABELS[venda.canal]}</span>
    </div>
    <div class="expand-info-row">
      <span class="expand-info-label">Data e Hora</span>
      <span class="expand-info-val">${fmtDataHora(venda.data)}</span>
    </div>
    <div class="expand-info-row">
      <span class="expand-info-label">Total do Pedido</span>
      <span class="expand-info-val" style="color:var(--verde);font-weight:700">${fmtBRL(venda.total)}</span>
    </div>
  `;

  /* Seção 3: Timeline */
  const steps = buildTimeline(venda.status, venda.data);
  const timelineHTML = steps.map(s => `
    <div class="timeline-step">
      <div class="timeline-dot ${s.classe}"></div>
      <div class="timeline-text">
        <span class="timeline-label">${s.label}</span>
        <span class="timeline-date">${s.data}</span>
      </div>
    </div>
  `).join('');

  return `
    <div class="expand-section">
      <div class="expand-section-title">Itens do Pedido</div>
      <div class="expand-items">${itensHTML}</div>
    </div>
    <div class="expand-section">
      <div class="expand-section-title">Informações</div>
      ${infoHTML}
    </div>
    <div class="expand-section">
      <div class="expand-section-title">Histórico de Status</div>
      <div class="expand-timeline">${timelineHTML}</div>
    </div>
  `;
}

function buildTimeline(status, data) {
  const base = new Date(data);
  const add  = h => new Date(base.getTime() + h * 3_600_000);
  const fmt  = d => fmtDataHora(d);

  const todos = [
    { label: 'Pedido Recebido',   data: fmt(base),     classe: 'done' },
    { label: 'Pagamento Aprovado',data: fmt(add(0.5)),  classe: 'done' },
    { label: 'Em Separação',      data: fmt(add(2)),    classe: status === 'concluido' || status === 'processando' ? 'done' : 'pending' },
    { label: 'Enviado',           data: fmt(add(6)),    classe: status === 'concluido' ? 'done' : status === 'processando' ? 'current' : 'pending' },
    { label: 'Entregue',          data: fmt(add(24)),   classe: status === 'concluido' ? 'done' : 'pending' },
  ];

  if (status === 'cancelado') {
    return [
      { label: 'Pedido Recebido', data: fmt(base),     classe: 'done' },
      { label: 'Cancelado',       data: fmt(add(1)),   classe: 'done' },
    ];
  }

  if (status === 'pendente') {
    return [
      { label: 'Pedido Recebido',    data: fmt(base),   classe: 'done' },
      { label: 'Aguardando Pagamento',data: fmt(add(0.2)),classe: 'current' },
      { label: 'Em Separação',       data: '—',          classe: 'pending' },
      { label: 'Entregue',           data: '—',          classe: 'pending' },
    ];
  }

  return todos;
}

/* ================================================
   10. EXPANDIR / RECOLHER LINHA
================================================ */
function toggleExpand(id, tr, content) {
  const estaAberto = state.expandido === id;

  /* Fecha o que estava aberto */
  if (state.expandido) {
    const prevTr      = document.querySelector(`.venda-row[data-id="${state.expandido}"]`);
    const prevContent = document.querySelector(`.expand-row[data-for="${state.expandido}"] .expand-content`);
    if (prevTr)      prevTr.classList.remove('active-row');
    if (prevContent) prevContent.classList.remove('open');
    state.expandido = null;
  }

  /* Abre o novo (se não era o mesmo) */
  if (!estaAberto) {
    tr.classList.add('active-row');
    content.classList.add('open');
    state.expandido = id;
  }
}

/* ================================================
   11. PAGINAÇÃO
================================================ */
function renderPaginacao() {
  const total   = state.filtradas.length;
  const paginas = Math.ceil(total / state.porPagina);
  const atual   = state.pagina;

  const prev     = document.getElementById('pag-prev');
  const next     = document.getElementById('pag-next');
  const pagesEl  = document.getElementById('pag-pages');
  const pagEl    = document.getElementById('pagination');

  if (pagEl) pagEl.style.display = paginas <= 1 ? 'none' : 'flex';
  if (prev)  prev.disabled = atual === 1;
  if (next)  next.disabled = atual === paginas;
  if (!pagesEl) return;

  pagesEl.innerHTML = '';

  /* Janela de 5 páginas ao redor da atual */
  let ini = Math.max(1, atual - 2);
  let fim = Math.min(paginas, ini + 4);
  if (fim - ini < 4) ini = Math.max(1, fim - 4);

  for (let p = ini; p <= fim; p++) {
    const btn = document.createElement('button');
    btn.className  = 'pag-num' + (p === atual ? ' active' : '');
    btn.textContent = p;
    btn.addEventListener('click', () => { state.pagina = p; renderTabela(); });
    pagesEl.appendChild(btn);
  }
}

/* ================================================
   12. RENDER PRINCIPAL
================================================ */
function render(period) {
  state.period      = period;
  state.todasVendas = gerarVendas(PERIODOS[period].count, PERIODOS[period].dias);
  state.expandido   = null;
  aplicarFiltros();
  renderKPIs();
  renderTabela();
}

/* ================================================
   13. EVENTOS E INIT
================================================ */
function initEvents() {

  /* Filtro de período */
  document.getElementById('period-filter')?.addEventListener('click', e => {
    const btn = e.target.closest('.period-btn');
    if (!btn) return;
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const cards = document.querySelectorAll('.venda-table-card, .venda-kpis');
    cards.forEach(c => { c.style.transition = 'opacity 0.18s'; c.style.opacity = '0.35'; });
    setTimeout(() => {
      render(btn.dataset.period);
      cards.forEach(c => { c.style.opacity = '1'; });
    }, 180);
  });

  /* Pills de status */
  document.getElementById('status-pills')?.addEventListener('click', e => {
    const pill = e.target.closest('.pill');
    if (!pill) return;
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.status = pill.dataset.status;
    aplicarFiltros();
    renderTabela();
  });

  /* Select de canal */
  document.getElementById('select-canal')?.addEventListener('change', e => {
    state.canal = e.target.value;
    aplicarFiltros();
    renderTabela();
  });

  /* Busca */
  const searchInput = document.getElementById('search-input');
  const searchClear = document.getElementById('search-clear');

  searchInput?.addEventListener('input', () => {
    state.search = searchInput.value.trim();
    if (searchClear) searchClear.style.display = state.search ? 'block' : 'none';
    aplicarFiltros();
    renderTabela();
  });

  searchClear?.addEventListener('click', () => {
    searchInput.value = '';
    state.search = '';
    searchClear.style.display = 'none';
    searchInput.focus();
    aplicarFiltros();
    renderTabela();
  });

  /* Ordenação */
  document.getElementById('table-sort')?.addEventListener('click', e => {
    const btn = e.target.closest('.sort-btn');
    if (!btn) return;

    const campo = btn.dataset.sort;
    if (state.sort.campo === campo) {
      state.sort.dir = state.sort.dir === 'desc' ? 'asc' : 'desc';
    } else {
      state.sort.campo = campo;
      state.sort.dir   = 'desc';
    }

    document.querySelectorAll('.sort-btn').forEach(b => {
      b.classList.remove('active');
      b.querySelector('.sort-arrow').textContent = '↕';
    });
    btn.classList.add('active');
    btn.querySelector('.sort-arrow').textContent = state.sort.dir === 'desc' ? '↓' : '↑';

    aplicarFiltros();
    renderTabela();
  });

  /* Paginação */
  document.getElementById('pag-prev')?.addEventListener('click', () => {
    if (state.pagina > 1) { state.pagina--; renderTabela(); }
  });
  document.getElementById('pag-next')?.addEventListener('click', () => {
    const max = Math.ceil(state.filtradas.length / state.porPagina);
    if (state.pagina < max) { state.pagina++; renderTabela(); }
  });

  /* Exportar (visual) */
  document.getElementById('btn-export')?.addEventListener('click', () => {
    const btn = document.getElementById('btn-export');
    const orig = btn.innerHTML;
    btn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="animation:spin 0.8s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Exportando…';
    btn.disabled = true;
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.disabled  = false;
    }, 1800);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  render('7d');
  initEvents();
=======
document.addEventListener("DOMContentLoaded", () => {
    const formVenda = document.getElementById("venda-form");
    const selectProd = document.getElementById("venda-produto");
    const listaVendasHtml = document.getElementById("lista-vendas-dia");

    let produtos = JSON.parse(localStorage.getItem("gennus_prods")) || [];
    let vendas = JSON.parse(localStorage.getItem("gennus_vendas")) || [];

    function atualizarSelect() {
        if (!selectProd) return;
        selectProd.innerHTML = '<option value="">Selecione um produto</option>';
        produtos.forEach((p, index) => {
            if (p.estoque > 0) {
                selectProd.innerHTML += `<option value="${index}">${p.nome} (Disp: ${p.estoque} ${p.unidade})</option>`;
            }
        });
    }

    formVenda.addEventListener("submit", (e) => {
        e.preventDefault();
        const indexProd = selectProd.value;
        const qtdVendida = parseFloat(document.getElementById("venda-qtd").value);
        
        if (indexProd === "") return alert("Selecione um produto!");

        const produto = produtos[indexProd];

        if (qtdVendida > produto.estoque) {
            alert("Erro: Estoque insuficiente!");
            return;
        }

        // DESCONTO NO ESTOQUE
        produto.estoque = (parseFloat(produto.estoque) - qtdVendida).toFixed(2);
        
        // REGISTRO DA VENDA COM CUSTO PARA O DASHBOARD
        const novaVenda = {
            produto: produto.nome,
            qtd: qtdVendida,
            unidade: produto.unidade,
            valorTotal: (qtdVendida * parseFloat(produto.preco)),
            custoTotal: (qtdVendida * parseFloat(produto.custo || 0)), // AQUI ESTÁ A CORREÇÃO
            data: new Date().toLocaleString()
        };

        vendas.push(novaVenda);
        
        localStorage.setItem("gennus_prods", JSON.stringify(produtos));
        localStorage.setItem("gennus_vendas", JSON.stringify(vendas));

        alert("Venda realizada! O Dashboard foi atualizado.");
        location.reload(); 
    });

    function renderVendas() {
        if (!listaVendasHtml) return;
        listaVendasHtml.innerHTML = "";
        vendas.slice(-5).reverse().forEach(v => {
            listaVendasHtml.innerHTML += `
                <tr>
                    <td>${v.produto}</td>
                    <td>${v.qtd} ${v.unidade}</td>
                    <td>R$ ${v.valorTotal.toFixed(2)}</td>
                    <td>${v.data}</td>
                </tr>
            `;
        });
    }

    atualizarSelect();
    renderVendas();
>>>>>>> eecb125950e2eb0001bbbdf582cb1851bd5790a7
});