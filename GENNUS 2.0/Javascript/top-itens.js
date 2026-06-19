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