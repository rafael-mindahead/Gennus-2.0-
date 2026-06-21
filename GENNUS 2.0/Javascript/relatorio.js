/**
 * relatorio.js — Relatório Técnico do Sistema — Gennus
 * Conteúdo gerado a partir de um array de módulos/páginas.
 * Sem localStorage / backend.
 */
'use strict';

/* ================================================
   1. STACK TÉCNICA
================================================ */
const STACK = [
  { nome: 'HTML5',          status: 'ativo' },
  { nome: 'CSS3',           status: 'ativo' },
  { nome: 'JavaScript (vanilla)', status: 'ativo' },
  { nome: 'Chart.js (CDN)', status: 'ativo' },
  { nome: 'PHP',            status: 'planejado' },
  { nome: 'MySQL',          status: 'planejado' },
];

/* ================================================
   2. MÓDULOS E PÁGINAS DO SISTEMA
   status: 'concluido' | 'parcial' | 'planejado'
================================================ */
const MODULOS = [
  {
    categoria: 'Dashboard',
    paginas: [
      {
        nome: 'Dashboard Principal', rota: 'dashboard.html', status: 'parcial',
        bullets: [
          'KPIs no topo: Receita do Mês, Despesas do Mês, Lucro Líquido e Número de Clientes.',
          'Resumo financeiro com saldo atual e crescimento percentual.',
          'Atividades recentes e alertas (queda de vendas, estoque baixo) — estrutura pronta, lógica de regras e dados reais aguardando integração com backend.',
        ],
      },
    ],
  },
  {
    categoria: 'Produtos',
    paginas: [
      {
        nome: 'Lista de Produtos', rota: 'produtos.html', status: 'concluido',
        bullets: [
          'Catálogo com nome, ID interno, código EAN-13 (dígito verificador calculado), categoria, preço e margem.',
          'KPIs: total de produtos, ativos, estoque baixo, valor total em estoque e categorias ativas.',
          'Busca, filtro por status/categoria e ordenação combináveis; linha expansível com detalhamento financeiro.',
          'Modal de cadastro com cálculo de margem em tempo real e gerador de EAN válido.',
        ],
      },
      {
        nome: 'Estoque', rota: 'estoque.html', status: 'concluido',
        bullets: [
          'Classificação automática por situação: OK, Médio, Baixo ou Esgotado, com base em limiares sobre estoque atual, mínimo e máximo.',
          'Barra de distribuição proporcional e painel de alertas com sugestão de reposição (estoqueMáximo − estoqueAtual).',
          'Ação "Repor" simula reabastecimento até a capacidade máxima.',
        ],
      },
    ],
  },
  {
    categoria: 'Vendas',
    paginas: [
      {
        nome: 'Resumo do Período', rota: 'resumo.html', status: 'concluido',
        bullets: [
          'Score do período (S a D) calculado a partir de meta atingida, crescimento de vendas e taxa de conversão.',
          'KPIs, metas com sub-metas, heatmap "Pulso do Período" e ranking de produtos.',
          'Insights gerados automaticamente por função JS que interpreta os dados do período selecionado.',
        ],
      },
      {
        nome: 'Renda Bruta / Líquida', rota: 'renda.html', status: 'concluido',
        bullets: [
          'Waterfall visual: receita bruta → impostos → custos operacionais → outras deduções → renda líquida.',
          'Indicadores de saúde financeira: margem líquida, eficiência operacional e carga tributária.',
        ],
      },
      {
        nome: 'Vendas', rota: 'venda.html', status: 'concluido',
        bullets: [
          'Tabela de pedidos com busca, filtro por status e canal, ordenação e paginação.',
          'Linha expansível com itens do pedido, forma de pagamento e timeline de status (recebido → entregue).',
        ],
      },
      {
        nome: 'Clientes', rota: 'clientes.html', status: 'concluido',
        bullets: [
          'Cadastro de Pessoa Física (CPF) e Pessoa Jurídica (CNPJ), com máscara de documento dinâmica.',
          'Tier de fidelidade calculado automaticamente: VIP, Fiel, Regular, Novo ou Inativo, com base em LTV, pedidos e recência.',
          'Modal de cadastro com toggle de tipo de pessoa que adapta labels e validações.',
        ],
      },
      {
        nome: 'Top Itens', rota: '—', status: 'planejado',
        bullets: ['Ranking detalhado de produtos por volume e receita, com filtro por categoria e comparação entre períodos.'],
      },
    ],
  },
  {
    categoria: 'Finanças',
    paginas: [
      { nome: 'Receita',     rota: 'receita.html', status: 'planejado', bullets: ['Detalhamento da receita por fonte/canal, com tendência histórica.'] },
      { nome: 'Despesas',    rota: 'despesas.html', status: 'planejado', bullets: ['Controle de despesas por categoria, com comparação de período e alertas de variação.'] },
      { nome: 'Lucro',       rota: 'lucro.html', status: 'planejado', bullets: ['Análise de lucro com margem consolidada e projeção simples.'] },
      { nome: 'IA Feedback', rota: '—', status: 'planejado', bullets: ['Painel de sugestões geradas por IA a partir dos dados de vendas e estoque.'] },
    ],
  },
  {
    categoria: 'Relatórios',
    paginas: [
      {
        nome: 'Gráficos', rota: 'charts.html', status: 'concluido',
        bullets: [
          '5 gráficos via Chart.js: Receita × Despesas, Lucro Acumulado, Vendas, Crescimento de Clientes e Top Produtos (donut).',
          'Filtro de período compartilhado entre todos os gráficos da página.',
        ],
      },
      {
        nome: 'Relatório', rota: 'relatorio.html', status: 'concluido',
        bullets: [
          'Esta página: documentação técnica resumida de todos os módulos do sistema, gerada a partir de um array de dados em JavaScript.',
          'Sem dependência de backend — conteúdo estático renderizado no carregamento.',
        ],
      },
    ],
  },
  {
    categoria: 'Configurações',
    paginas: [
      { nome: 'Período de Fechamento', rota: '—', status: 'planejado', bullets: ['Definição do ciclo de apuração financeira (mensal, quinzenal, etc.).'] },
      { nome: 'Personalizar',          rota: '—', status: 'planejado', bullets: ['Customização de tema, logo e preferências visuais do painel.'] },
      { nome: 'Dados da Empresa',      rota: '—', status: 'planejado', bullets: ['Cadastro de razão social, CNPJ, endereço fiscal e dados bancários da empresa.'] },
    ],
  },
];

/* ================================================
   3. HELPERS
================================================ */
const STATUS_LABEL = { concluido: 'Concluído', parcial: 'Parcial', planejado: 'Planejado' };
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-');

function countUp(el, target, fmt, dur = 600) {
  if (!el) return;
  const t0 = performance.now();
  const go = now => { const p = Math.min((now - t0) / dur, 1); el.textContent = fmt(Math.round(target * (1 - Math.pow(1 - p, 3)))); if (p < 1) requestAnimationFrame(go); };
  requestAnimationFrame(go);
}

/* ================================================
   4. RENDER: STACK
================================================ */
function renderStack() {
  const el = document.getElementById('stack-chips');
  if (!el) return;
  el.innerHTML = STACK.map(s => `
    <span class="stack-chip ${s.status}">
      <span class="stack-chip-dot" style="background:${s.status === 'ativo' ? '#22c55e' : '#60a5fa'}"></span>
      ${s.nome}
    </span>
  `).join('');
}

/* ================================================
   5. RENDER: KPIs DE COBERTURA
================================================ */
function renderKPIs() {
  const todas = MODULOS.flatMap(m => m.paginas);
  const porStatus = { concluido: 0, parcial: 0, planejado: 0 };
  todas.forEach(p => porStatus[p.status]++);

  countUp(document.getElementById('kpi-total'), todas.length, n => n);
  countUp(document.getElementById('kpi-concluido'), porStatus.concluido, n => n);
  countUp(document.getElementById('kpi-parcial'), porStatus.parcial, n => n);
  countUp(document.getElementById('kpi-planejado'), porStatus.planejado, n => n);

  const pct = ((porStatus.concluido / (todas.length || 1)) * 100).toFixed(0);
  document.getElementById('kpi-concluido-sub').textContent = `${pct}% do sistema mapeado`;
}

/* ================================================
   6. RENDER: TOC + CONTEÚDO
================================================ */
function renderConteudo() {
  const tocList = document.getElementById('rel-toc-list');
  const content = document.getElementById('rel-content');
  if (!tocList || !content) return;

  tocList.innerHTML = '';
  content.innerHTML = '';

  MODULOS.forEach((mod, idx) => {
    const id = slug(mod.categoria);

    /* link do índice */
    const link = document.createElement('a');
    link.href = `#${id}`;
    link.className = 'rel-toc-link' + (idx === 0 ? ' active' : '');
    link.innerHTML = `<span>${mod.categoria}</span><span class="rel-toc-count">${mod.paginas.length}</span>`;
    tocList.appendChild(link);

    /* seção de conteúdo */
    const section = document.createElement('section');
    section.className = 'rel-section';
    section.id = id;
    section.style.animationDelay = `${0.05 + idx * 0.04}s`;

    const cards = mod.paginas.map(p => `
      <div class="pagina-card">
        <div class="pagina-card-top">
          <div>
            <div class="pagina-nome">${p.nome}</div>
            <span class="pagina-rota">${p.rota}</span>
          </div>
          <span class="status-badge status-${p.status}">${STATUS_LABEL[p.status]}</span>
        </div>
        <div class="pagina-bullets">
          ${p.bullets.map(b => `<div class="pagina-bullet">${b}</div>`).join('')}
        </div>
      </div>
    `).join('');

    section.innerHTML = `
      <div class="rel-section-header">
        <span class="rel-section-titulo">${mod.categoria}</span>
        <span class="rel-section-count">${mod.paginas.length} página${mod.paginas.length !== 1 ? 's' : ''}</span>
      </div>
      <div class="pagina-grid">${cards}</div>
    `;
    content.appendChild(section);
  });
}

/* ================================================
   7. SCROLL-SPY DO ÍNDICE
================================================ */
function initScrollSpy() {
  const links = Array.from(document.querySelectorAll('.rel-toc-link'));
  const sections = MODULOS.map(m => document.getElementById(slug(m.categoria)));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const idx = sections.indexOf(entry.target);
      if (idx === -1) return;
      links.forEach(l => l.classList.remove('active'));
      links[idx]?.classList.add('active');
    });
  }, { rootMargin: '-10% 0px -70% 0px' });

  sections.forEach(s => s && observer.observe(s));

  /* clique no índice rola suavemente */
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      document.querySelector(link.getAttribute('href'))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

/* ================================================
   8. EVENTOS
================================================ */
function initEventos() {
  document.getElementById('btn-print')?.addEventListener('click', () => window.print());

  const updated = document.getElementById('rel-updated');
  if (updated) {
    const agora = new Date();
    updated.textContent = `Atualizado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  }
}

/* ================================================
   9. INIT
================================================ */
document.addEventListener('DOMContentLoaded', () => {
  renderStack();
  renderKPIs();
  renderConteudo();
  initScrollSpy();
  initEventos();
});