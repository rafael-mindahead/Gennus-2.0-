<<<<<<< HEAD
/**
 * top-itens.js — Top Itens — Gennus
 * Ranking de produtos mais e menos vendidos, por período.
 */

'use strict';

/* ================================================
   1. DADOS SIMULADOS — produtos por período
   un = unidades vendidas | rec = receita | est = estoque atual
================================================ */
const PRODUTOS = {
  '7d': [
    { nome: 'Camiseta Básica Preta',   cat: 'Vestuário',  un: 312, rec: 9360,  est: 84  },
    { nome: 'Tênis Runner Pro',        cat: 'Calçados',   un: 198, rec: 23760, est: 41  },
    { nome: 'Fone Bluetooth X2',       cat: 'Eletrônicos',un: 176, rec: 15840, est: 63  },
    { nome: 'Mochila Urban 20L',       cat: 'Acessórios', un: 154, rec: 11550, est: 29  },
    { nome: 'Garrafa Térmica 1L',      cat: 'Casa',        un: 140, rec: 4200,  est: 102 },
    { nome: 'Boné Aba Curva',          cat: 'Acessórios', un: 121, rec: 3630,  est: 77  },
    { nome: 'Jaqueta Corta-Vento',     cat: 'Vestuário',  un: 98,  rec: 11760, est: 18  },
    { nome: 'Relógio Digital Sport',   cat: 'Eletrônicos',un: 87,  rec: 8700,  est: 33  },
    { nome: 'Meia Cano Alto (kit 3)',  cat: 'Vestuário',  un: 72,  rec: 1440,  est: 145 },
    { nome: 'Óculos de Sol Polarizado',cat: 'Acessórios', un: 58,  rec: 5800,  est: 22  },
    { nome: 'Carteira Slim Couro',     cat: 'Acessórios', un: 41,  rec: 2460,  est: 55  },
    { nome: 'Caneca Térmica 400ml',    cat: 'Casa',        un: 33,  rec: 990,   est: 88  },
    { nome: 'Cinto de Couro Premium',  cat: 'Acessórios', un: 24,  rec: 1680,  est: 36  },
    { nome: 'Cantil Aço Inox',         cat: 'Casa',        un: 17,  rec: 850,   est: 64  },
    { nome: 'Touca de Lã',             cat: 'Vestuário',  un: 9,   rec: 270,   est: 51  },
  ],
};
// Gera 30d/90d/1y escalando o conjunto de 7d (mantém código enxuto, sem repetir dados)
const ESCALA = { '7d': 1, '30d': 4.3, '90d': 12.8, '1y': 51 };
['30d', '90d', '1y'].forEach(p => {
  PRODUTOS[p] = PRODUTOS['7d'].map(it => ({
    ...it,
    un:  Math.round(it.un  * ESCALA[p] * (0.9 + Math.random() * 0.2)),
    rec: Math.round(it.rec * ESCALA[p] * (0.9 + Math.random() * 0.2)),
  }));
});

const LABELS = { '7d': '7 dias', '30d': '30 dias', '90d': '3 meses', '1y': '1 ano' };

/* ================================================
   2. HELPERS
================================================ */
const fmtBRL = n => 'R$ ' + Math.round(n).toLocaleString('pt-BR');
const fmtUn  = n => Math.round(n).toLocaleString('pt-BR');

function classStatus(un, maxUn) {
  const pct = un / maxUn;
  if (pct >= 0.5) return 'alta';
  if (pct >= 0.15) return 'media';
  return 'baixa';
}

/* ================================================
   3. RENDER: KPIs
================================================ */
function renderKPIs(lista) {
  const totalUn  = lista.reduce((s, p) => s + p.un, 0);
  const ordenado = [...lista].sort((a, b) => b.un - a.un);
  const campeao  = ordenado[0];
  const parado   = ordenado[ordenado.length - 1];
  const giro     = totalUn / lista.length / 7; // unid./dia/SKU aprox.

  document.getElementById('kpi-unidades').textContent     = fmtUn(totalUn);
  document.getElementById('kpi-unidades-delta').textContent = '▲ +' + (8 + Math.round(Math.random() * 10)) + '% vs anterior';
  document.getElementById('kpi-unidades-delta').className   = 'kpi-delta pos';

  document.getElementById('kpi-campeao').textContent     = campeao.nome;
  document.getElementById('kpi-campeao-sub').textContent = fmtUn(campeao.un) + ' unidades vendidas';

  document.getElementById('kpi-parado').textContent     = parado.nome;
  document.getElementById('kpi-parado-sub').textContent = fmtUn(parado.un) + ' unidades — repor atenção';

  document.getElementById('kpi-giro').textContent = giro.toFixed(1);
}

/* ================================================
   4. RENDER: RANKINGS (top 8 / bottom 8)
================================================ */
function renderRanking(containerId, lista, max) {
  const ol = document.getElementById(containerId);
  ol.innerHTML = '';
  lista.forEach((p, i) => {
    const pct = (p.un / max * 100).toFixed(1);
    const li  = document.createElement('li');
    li.className = 'rank-item';
    li.innerHTML = `
      <span class="rank-pos">${i + 1}</span>
      <div class="rank-info">
        <span class="rank-nome">${p.nome}</span>
        <div class="rank-track"><div class="rank-bar" style="width:${pct}%;animation-delay:${i * 0.04}s"></div></div>
      </div>
      <div class="rank-vals">
        <span class="rank-qtd">${fmtUn(p.un)} un</span>
        <span class="rank-rec">${fmtBRL(p.rec)}</span>
      </div>
    `;
    ol.appendChild(li);
  });
}

/* ================================================
   5. RENDER: TABELA COMPLETA
================================================ */
function renderTabela(lista) {
  const maxUn = Math.max(...lista.map(p => p.un));
  const tbody = document.getElementById('ti-tbody');
  tbody.innerHTML = '';

  [...lista].sort((a, b) => b.un - a.un).forEach((p, i) => {
    const status = classStatus(p.un, maxUn);
    const label  = status === 'alta' ? 'Alta saída' : status === 'media' ? 'Regular' : 'Baixa saída';
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.nome}</td>
      <td>${p.cat}</td>
      <td>${fmtUn(p.un)}</td>
      <td>${fmtBRL(p.rec)}</td>
      <td>${p.est}</td>
      <td><span class="status-tag ${status}">${label}</span></td>
    `;
    tr.style.cssText = `opacity:0;transform:translateY(6px);transition:opacity .3s ease ${i * 25}ms,transform .3s ease ${i * 25}ms`;
    tbody.appendChild(tr);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      tr.style.opacity = '1';
      tr.style.transform = 'translateY(0)';
    }));
  });
}

/* ================================================
   6. RENDER PRINCIPAL
================================================ */
function render(period) {
  const lista = PRODUTOS[period];
  const ordenado = [...lista].sort((a, b) => b.un - a.un);
  const maxUn = ordenado[0].un;

  renderKPIs(lista);
  renderRanking('rank-top', ordenado.slice(0, 8), maxUn);
  renderRanking('rank-bottom', ordenado.slice(-8).reverse(), maxUn);
  renderTabela(lista);
}

/* ================================================
   7. FILTRO DE PERÍODO
================================================ */
document.getElementById('period-filter').addEventListener('click', e => {
  const btn = e.target.closest('.period-btn');
  if (!btn) return;
  document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.ti-card, .ti-kpis');
  cards.forEach(c => { c.style.transition = 'opacity .18s ease'; c.style.opacity = '0.4'; });
  setTimeout(() => {
    render(btn.dataset.period);
    cards.forEach(c => c.style.opacity = '1');
  }, 180);
});

/* ================================================
   8. INIT
================================================ */
document.addEventListener('DOMContentLoaded', () => render('7d'));
=======
/* ================================================
   top-itens.js — Top Itens — Gennus
================================================ */

/* ================================================
   DADOS MOCK
================================================ */
const produtos = [
  { id:1,  nome:"Tênis Runner Pro",     cat:"Calçados",    emoji:"👟", vendas:847, receita:84623, var:+28, estoque:12,  status:"out"  },
  { id:2,  nome:"Mochila Urbana XL",    cat:"Acessórios",  emoji:"🎒", vendas:634, receita:47550, var:+14, estoque:38,  status:"low"  },
  { id:3,  nome:"Camiseta Basic (M)",   cat:"Vestuário",   emoji:"👕", vendas:598, receita:17940, var:+67, estoque:74,  status:"low"  },
  { id:4,  nome:"Palmilha Gel Pro",     cat:"Calçados",    emoji:"🦶", vendas:512, receita:32256, var:+9,  estoque:210, status:"ok"   },
  { id:5,  nome:"Boné Aba Reta",        cat:"Acessórios",  emoji:"🧢", vendas:476, receita:14280, var:-3,  estoque:183, status:"ok"   },
  { id:6,  nome:"Shorts Run (P)",       cat:"Vestuário",   emoji:"🩳", vendas:423, receita:21150, var:+22, estoque:95,  status:"ok"   },
  { id:7,  nome:"Bota Trail",           cat:"Calçados",    emoji:"🥾", vendas:318, receita:38160, var:-11, estoque:0,   status:"out"  },
  { id:8,  nome:"Meia Compressão",      cat:"Acessórios",  emoji:"🧦", vendas:291, receita:5820,  var:+5,  estoque:640, status:"ok"   },
  { id:9,  nome:"Jaqueta Corta Vento",  cat:"Vestuário",   emoji:"🧥", vendas:247, receita:49400, var:-8,  estoque:57,  status:"ok"   },
  { id:10, nome:"Garrafa Inox 750ml",   cat:"Acessórios",  emoji:"🍶", vendas:234, receita:14040, var:+1,  estoque:312, status:"ok"   },
  { id:11, nome:"Legging Feminina",     cat:"Vestuário",   emoji:"👖", vendas:198, receita:17820, var:-4,  estoque:88,  status:"ok"   },
  { id:12, nome:"Tênis Casual Slim",    cat:"Calçados",    emoji:"👞", vendas:145, receita:15950, var:-18, estoque:124, status:"ok"   },
  { id:13, nome:"Toalha Microfibra",    cat:"Acessórios",  emoji:"🏳️", vendas:87,  receita:3045,  var:-22, estoque:450, status:"ok"   },
  { id:14, nome:"Cinto Elástico",       cat:"Acessórios",  emoji:"🔗", vendas:42,  receita:2100,  var:-35, estoque:230, status:"ok"   },
  { id:15, nome:"Bolsa Couro V2",       cat:"Acessórios",  emoji:"👜", vendas:3,   receita:1197,  var:-72, estoque:142, status:"ok"   },
];

/* Multiplicadores por período */
const periodos = {
  "7d":  [1.0, 0.24, 0.22, 0.19, 0.18, 0.16, 0.12, 0.11, 0.09, 0.09, 0.07, 0.05, 0.03, 0.015, 0.001],
  "30d": [1.0, 0.75, 0.71, 0.60, 0.56, 0.50, 0.38, 0.34, 0.29, 0.28, 0.23, 0.17, 0.10, 0.05,  0.003],
  "90d": [1.0, 0.88, 0.85, 0.72, 0.68, 0.60, 0.46, 0.41, 0.35, 0.33, 0.28, 0.20, 0.12, 0.07,  0.005],
  "12m": [1.0, 0.92, 0.90, 0.78, 0.73, 0.65, 0.52, 0.47, 0.41, 0.38, 0.32, 0.24, 0.14, 0.09,  0.007],
};

/* ================================================
   ESTADO
================================================ */
let currentPeriod = "30d";
let currentTab    = "top";   // "top" | "bot"
let currentView   = "todos"; // "todos" | "top" | "baixo"
let sortCol       = "vendas";
let sortDir       = -1;      // -1 desc, 1 asc
let searchQ       = "";

/* ================================================
   CHART.JS — Barras horizontais
================================================ */
let chartInstance = null;

function getChartData(tab, period) {
  const factor = periodos[period];
  const base = produtos.map((p, i) => ({
    ...p,
    vendasPeriod: Math.round(p.vendas * factor[i])
  }));

  if (tab === "top") {
    return [...base].sort((a, b) => b.vendasPeriod - a.vendasPeriod).slice(0, 10);
  }
  return [...base].sort((a, b) => a.vendasPeriod - b.vendasPeriod).slice(0, 10);
}

function buildChart(tab, period) {
  const data   = getChartData(tab, period);
  const labels = data.map(p => p.nome.length > 18 ? p.nome.slice(0, 17) + '…' : p.nome);
  const values = data.map(p => p.vendasPeriod);
  const isTop  = tab === "top";

  const colors = isTop
    ? values.map((_, i) => i === 0 ? 'rgba(168,85,247,0.9)' : `rgba(168,85,247,${0.55 - i * 0.04})`)
    : values.map((_, i) => i === 0 ? 'rgba(248,113,113,0.9)' : `rgba(248,113,113,${0.55 + i * 0.04})`);

  const hoverColors = isTop
    ? values.map(() => 'rgba(168,85,247,1)')
    : values.map(() => 'rgba(248,113,113,1)');

  const cfg = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: hoverColors,
      }]
    },
    options: {
      indexAxis: 'y',
      animation: { duration: 550, easing: 'easeOutQuart' },
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#111117',
          borderColor: 'rgba(255,255,255,0.07)',
          borderWidth: 1,
          titleColor: '#e2e8f0',
          bodyColor: '#6b7280',
          titleFont: { family: 'Space Grotesk', weight: '600', size: 12 },
          bodyFont:  { family: 'Space Grotesk', size: 11 },
          callbacks: {
            label: ctx => ` ${ctx.parsed.x.toLocaleString('pt-BR')} unidades`,
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: {
            color: '#444',
            font: { family: 'Space Grotesk', size: 10 },
            callback: v => v >= 1000 ? (v / 1000).toFixed(1) + 'k' : v,
          },
          border: { display: false },
        },
        y: {
          grid: { display: false },
          ticks: {
            color: '#6b7280',
            font: { family: 'Space Grotesk', size: 11, weight: '500' },
          },
          border: { display: false },
        }
      }
    }
  };

  if (chartInstance) {
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = values;
    chartInstance.data.datasets[0].backgroundColor = colors;
    chartInstance.data.datasets[0].hoverBackgroundColor = hoverColors;
    chartInstance.update('active');
  } else {
    chartInstance = new Chart(document.getElementById('barChart'), cfg);
  }
}

/* ================================================
   RANKING LATERAL
================================================ */
function buildRanking(tab, period) {
  const data  = getChartData(tab, period);
  const isTop = tab === "top";
  const top5  = isTop
    ? data.slice(0, 5)
    : [...data].sort((a, b) => a.vendasPeriod - b.vendasPeriod).slice(0, 5);

  const maxV = Math.max(...top5.map(p => p.vendasPeriod));

  document.getElementById('rankTitle').textContent = isTop ? "Mais vendidos"      : "Menor giro";
  document.getElementById('rankSub').textContent   = isTop ? "Top 5 em unidades"  : "Piores 5 em unidades";
  document.getElementById('rankBadge').textContent = isTop ? "↑ Alta"             : "↓ Baixo";
  document.getElementById('rankBadge').className   = 'g-badge ' + (isTop ? 'badge-ok' : 'badge-critico');

  const ul = document.getElementById('rankingList');
  ul.innerHTML = top5.map((p, i) => {
    const pct     = maxV > 0 ? Math.round(p.vendasPeriod / maxV * 100) : 0;
    const idx     = produtos.findIndex(x => x.id === p.id);
    const receita = 'R$ ' + (p.receita * periodos[period][idx]).toLocaleString('pt-BR', { maximumFractionDigits: 0 });
    return `
      <li class="ranking-item ${!isTop ? 'danger' : ''}">
        <span class="ranking-pos">${i + 1}</span>
        <div class="ranking-info">
          <span class="ranking-nome">${p.nome}</span>
          <div class="ranking-bar-track">
            <div class="ranking-bar ${isTop ? 'bar-top' : 'bar-bot'}" style="width:${pct}%"></div>
          </div>
        </div>
        <div class="ranking-vals">
          <span class="ranking-valor">${p.vendasPeriod.toLocaleString('pt-BR')} un.</span>
          <span class="ranking-qtd">${receita}</span>
        </div>
      </li>`;
  }).join('');
}

/* ================================================
   TABELA
================================================ */
function statusChip(status, estoque) {
  if (status === "out") return `<span class="status-chip chip-out"><span class="chip-dot"></span>Sem estoque</span>`;
  if (status === "low") return `<span class="status-chip chip-low"><span class="chip-dot"></span>Baixo</span>`;
  return `<span class="status-chip chip-ok"><span class="chip-dot"></span>OK (${estoque})</span>`;
}

function varCell(v) {
  const w = Math.min(Math.abs(v), 100);
  if (v > 0) return `<div class="mini-bar-wrap"><div class="mini-track"><div class="mini-fill fill-up"   style="width:${w}%"></div></div><span class="mini-pct up">+${v}%</span></div>`;
  if (v < 0) return `<div class="mini-bar-wrap"><div class="mini-track"><div class="mini-fill fill-down" style="width:${w}%"></div></div><span class="mini-pct down">${v}%</span></div>`;
  return `<div class="mini-bar-wrap"><div class="mini-track"><div class="mini-fill fill-neu" style="width:5%"></div></div><span class="mini-pct neu">0%</span></div>`;
}

function buildTable() {
  let data = [...produtos];

  if (currentView === "top")   data = data.filter(p => p.vendas >= 200);
  if (currentView === "baixo") data = data.filter(p => p.vendas < 100);

  if (searchQ) {
    const q = searchQ.toLowerCase();
    data = data.filter(p => p.nome.toLowerCase().includes(q) || p.cat.toLowerCase().includes(q));
  }

  data.sort((a, b) => {
    const key = sortCol === 'variacao' ? 'var' : sortCol;
    const va  = a[key];
    const vb  = b[key];
    if (typeof va === 'string') return sortDir * va.localeCompare(vb);
    return sortDir * (vb - va);
  });

  document.getElementById('tableCount').textContent = data.length;

  const maxV  = Math.max(...data.map(p => p.vendas));
  const tbody = document.getElementById('tableBody');

  tbody.innerHTML = data.map(p => {
    const barW   = maxV > 0 ? Math.round(p.vendas / maxV * 100) : 0;
    const rec    = 'R$ ' + p.receita.toLocaleString('pt-BR', { minimumFractionDigits: 0 });
    const iconBg = p.status === 'out'
      ? 'rgba(248,113,113,0.08)'
      : p.status === 'low'
        ? 'rgba(251,191,36,0.08)'
        : 'rgba(168,85,247,0.08)';

    return `
      <tr>
        <td>
          <div class="prod-cell">
            <div class="prod-icon" style="background:${iconBg}">${p.emoji}</div>
            <div>
              <div class="prod-name">${p.nome}</div>
              <div class="prod-sku">SKU-${String(p.id).padStart(4, '0')}</div>
            </div>
          </div>
        </td>
        <td style="color:var(--texto-muted)">${p.cat}</td>
        <td>
          <div class="mini-bar-wrap">
            <div class="mini-track" style="min-width:60px">
              <div class="mini-fill fill-up" style="width:${barW}%"></div>
            </div>
            <span style="font-size:0.82rem;font-weight:600;color:var(--texto)">${p.vendas.toLocaleString('pt-BR')}</span>
          </div>
        </td>
        <td style="color:var(--verde);font-weight:600">${rec}</td>
        <td>${varCell(p.var)}</td>
        <td>${statusChip(p.status, p.estoque)}</td>
      </tr>`;
  }).join('');
}

/* ================================================
   EVENT LISTENERS
================================================ */

/* Período */
document.querySelectorAll('.period-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentPeriod = btn.dataset.period;
    buildChart(currentTab, currentPeriod);
    buildRanking(currentTab, currentPeriod);
  });
});

/* Chart tabs */
document.querySelectorAll('#chartTabs .tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#chartTabs .tab-btn').forEach(b => b.classList.remove('active-top', 'active-bot'));
    currentTab = btn.dataset.tab;
    btn.classList.add(currentTab === 'top' ? 'active-top' : 'active-bot');
    buildChart(currentTab, currentPeriod);
    buildRanking(currentTab, currentPeriod);
  });
});

/* Toggle tabela */
document.querySelectorAll('.toggle-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentView = btn.dataset.view;
    buildTable();
  });
});

/* Ordenação de colunas */
document.querySelectorAll('.g-table th').forEach(th => {
  th.addEventListener('click', () => {
    const col = th.dataset.col;
    if (!col) return;
    if (sortCol === col) { sortDir *= -1; }
    else { sortCol = col; sortDir = -1; }
    document.querySelectorAll('.g-table th').forEach(h => {
      h.classList.remove('sorted');
      const icon = h.querySelector('.sort-icon');
      if (icon) icon.textContent = '↕';
    });
    th.classList.add('sorted');
    const icon = th.querySelector('.sort-icon');
    if (icon) icon.textContent = sortDir === -1 ? '↓' : '↑';
    buildTable();
  });
});

/* Busca */
document.getElementById('searchInput').addEventListener('input', e => {
  searchQ = e.target.value.trim();
  buildTable();
});

/* ================================================
   INIT
================================================ */
buildChart(currentTab, currentPeriod);
buildRanking(currentTab, currentPeriod);
buildTable();
>>>>>>> eecb125950e2eb0001bbbdf582cb1851bd5790a7
