/* periodo-fechamento.js
   ════════════════════════════════════════════════════════
   MODO PROTÓTIPO (fase alfa) — sem backend.
   Os dados vivem só em memória (variável mockDB), então
   resetam ao recarregar a página — isso é esperado, é só
   uma referência visual pro time.

   Quando integrar o PHP de verdade: troque a função `api()`
   no fim deste arquivo pela versão real que já existe em
   api/configuracoes/fechamento.php — o resto do código
   (carregar, renderHistorico, eventos dos botões) NÃO PRECISA
   MUDAR, porque todos chamam api() do mesmo jeito.
   ════════════════════════════════════════════════════════ */

const MESES = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];

function nomeMes(mesRef) {
  const [ano, mes] = mesRef.split('-');
  return `${MESES[parseInt(mes, 10) - 1]} ${ano}`;
}

/* "YYYY-MM-01" de N meses atrás a partir de hoje */
function mesRefOffset(offset) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - offset);
  return d.toISOString().slice(0, 8) + '01';
}

/* ================================================
   "BANCO DE DADOS" EM MEMÓRIA
   Mesmo formato que o PHP devolveria em GET.
================================================ */
const mockDB = {
  dia_fechamento: 5,
  mes_fiscal: 1,
  bloquear_lancamentos: true,
  historico: [
    { mes_referencia: mesRefOffset(0), status: 'aberto',  fechado_em: null },
    { mes_referencia: mesRefOffset(1), status: 'fechado', fechado_em: mesRefOffset(0) + 'T09:14:00' },
    { mes_referencia: mesRefOffset(2), status: 'fechado', fechado_em: mesRefOffset(1) + 'T10:02:00' },
    { mes_referencia: mesRefOffset(3), status: 'fechado', fechado_em: mesRefOffset(2) + 'T08:47:00' },
  ],
};

/* ================================================
   POPULAR SELECT "Dia do fechamento" (1 a 28)
================================================ */
function popularDias() {
  const select = document.getElementById('diaFechamento');
  for (let d = 1; d <= 28; d++) {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = `Dia ${d}`;
    select.appendChild(opt);
  }
}

/* ================================================
   RENDERIZA HISTÓRICO
================================================ */
function renderHistorico(lista) {
  const ul = document.getElementById('historyList');

  if (!lista.length) {
    ul.innerHTML = `<li class="history-item"><span class="history-data">Nenhum fechamento registrado ainda.</span></li>`;
    return;
  }

  ul.innerHTML = lista.map(item => {
    const fechado = item.status === 'fechado';
    return `
      <li class="history-item">
        <span class="history-mes">${nomeMes(item.mes_referencia)}</span>
        <div class="history-meta">
          ${fechado
            ? `<span class="history-data">Fechado em ${formatarData(item.fechado_em)}</span>
               <span class="badge badge-muted">Fechado</span>
               <button type="button" class="btn-reabrir" data-mes="${item.mes_referencia}">Reabrir</button>`
            : `<span class="badge badge-ok">Aberto</span>`
          }
        </div>
      </li>`;
  }).join('');

  ul.querySelectorAll('.btn-reabrir').forEach(btn => {
    btn.addEventListener('click', () => reabrirPeriodo(btn.dataset.mes));
  });
}

function formatarData(iso) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('pt-BR');
}

/* ================================================
   CARREGAR DADOS NA TELA
================================================ */
async function carregar() {
  const res = await api('/api/configuracoes/fechamento.php');

  if (!res.ok) { showToast('error', 'Erro ao carregar', res.message); return; }

  const d = res.data;

  document.getElementById('diaFechamento').value = d.dia_fechamento;
  document.getElementById('mesFiscal').value      = d.mes_fiscal;
  document.querySelector('[data-toggle="bloquear"]').classList.toggle('active', !!d.bloquear_lancamentos);

  document.getElementById('mesAtual').textContent = nomeMes(d.periodo_atual.mes_referencia);

  const badge = document.getElementById('statusBadge');
  const aberto = d.periodo_atual.status === 'aberto';
  badge.textContent = aberto ? 'Aberto' : 'Fechado';
  badge.className   = 'badge ' + (aberto ? 'badge-ok' : 'badge-muted');
  document.getElementById('btnFecharPeriodo').style.display = aberto ? '' : 'none';

  renderHistorico(d.historico);
}

/* ================================================
   SALVAR CONFIGURAÇÕES
================================================ */
document.getElementById('btnSalvar').addEventListener('click', async () => {
  const btn = document.getElementById('btnSalvar');
  btn.classList.add('loading');
  btn.textContent = 'Salvando…';

  const res = await api('/api/configuracoes/fechamento.php', {
    method: 'POST',
    body: new URLSearchParams({
      acao: 'salvar_config',
      dia_fechamento: document.getElementById('diaFechamento').value,
      mes_fiscal: document.getElementById('mesFiscal').value,
      bloquear_lancamentos: document.querySelector('[data-toggle="bloquear"]').classList.contains('active') ? '1' : '0',
    }),
  });

  btn.classList.remove('loading');
  btn.textContent = 'Salvar Alterações';

  if (res.ok) showToast('ok', 'Configurações salvas', 'As regras de fechamento foram atualizadas.');
  else        showToast('error', 'Erro', res.message);
});

document.getElementById('btnCancelar').addEventListener('click', carregar);

/* ================================================
   FECHAR PERÍODO ATUAL
================================================ */
document.getElementById('btnFecharPeriodo').addEventListener('click', async () => {
  const confirmado = await confirmModal({
    title: 'Fechar período atual?',
    text: 'Após o fechamento, lançamentos deste mês não poderão mais ser editados (se o bloqueio estiver ativo). Esta ação pode ser desfeita reabrindo o período.',
    confirmLabel: 'Fechar período',
    danger: true,
  });
  if (!confirmado) return;

  const res = await api('/api/configuracoes/fechamento.php', {
    method: 'POST',
    body: new URLSearchParams({ acao: 'fechar_periodo' }),
  });

  if (res.ok) { showToast('ok', 'Período fechado', 'O período atual foi encerrado com sucesso.'); carregar(); }
  else          showToast('error', 'Erro', res.message);
});

/* ================================================
   REABRIR PERÍODO
================================================ */
async function reabrirPeriodo(mesReferencia) {
  const confirmado = await confirmModal({
    title: 'Reabrir período?',
    text: `${nomeMes(mesReferencia)} voltará a aceitar edições de lançamentos.`,
    confirmLabel: 'Reabrir',
  });
  if (!confirmado) return;

  const res = await api('/api/configuracoes/fechamento.php', {
    method: 'POST',
    body: new URLSearchParams({ acao: 'reabrir_periodo', mes_referencia: mesReferencia }),
  });

  if (res.ok) { showToast('ok', 'Período reaberto', `${nomeMes(mesReferencia)} está aberto novamente.`); carregar(); }
  else          showToast('error', 'Erro', res.message);
}

/* ════════════════════════════════════════════════════════
   CAMADA MOCK — substitui o fetch() real por enquanto.
   Mesma assinatura de api(url, options) do config-shared.js,
   mesmo formato de retorno { ok, message, data }.
   Isso é o que você vai DELETAR quando ligar o PHP de verdade
   — o resto do arquivo continua igual.
   ════════════════════════════════════════════════════════ */
function api(url, options = {}) {
  return new Promise(resolve => {
    setTimeout(() => {                              // simula latência de rede
      const isPost = options.method === 'POST';

      if (!isPost) {
        resolve({
          ok: true, message: 'ok',
          data: {
            dia_fechamento: mockDB.dia_fechamento,
            mes_fiscal: mockDB.mes_fiscal,
            bloquear_lancamentos: mockDB.bloquear_lancamentos,
            periodo_atual: mockDB.historico[0],
            historico: mockDB.historico,
          },
        });
        return;
      }

      const body = options.body; // URLSearchParams
      const acao = body.get('acao');

      if (acao === 'salvar_config') {
        mockDB.dia_fechamento = parseInt(body.get('dia_fechamento'), 10);
        mockDB.mes_fiscal     = parseInt(body.get('mes_fiscal'), 10);
        mockDB.bloquear_lancamentos = body.get('bloquear_lancamentos') === '1';
        resolve({ ok: true, message: 'Configurações salvas.', data: {} });
        return;
      }

      if (acao === 'fechar_periodo') {
        const atual = mockDB.historico[0];
        if (atual.status === 'fechado') {
          resolve({ ok: false, message: 'Nenhum período aberto encontrado para fechar.', data: {} });
          return;
        }
        atual.status = 'fechado';
        atual.fechado_em = new Date().toISOString();

        // cria o próximo mês como aberto, no topo da lista
        const proximo = new Date(atual.mes_referencia);
        proximo.setMonth(proximo.getMonth() + 1);
        mockDB.historico.unshift({
          mes_referencia: proximo.toISOString().slice(0, 8) + '01',
          status: 'aberto',
          fechado_em: null,
        });

        resolve({ ok: true, message: 'Período fechado com sucesso.', data: {} });
        return;
      }

      if (acao === 'reabrir_periodo') {
        const mes = body.get('mes_referencia');
        const item = mockDB.historico.find(h => h.mes_referencia === mes);
        if (!item) { resolve({ ok: false, message: 'Período não encontrado.', data: {} }); return; }
        item.status = 'aberto';
        item.fechado_em = null;
        resolve({ ok: true, message: 'Período reaberto.', data: {} });
        return;
      }

      resolve({ ok: false, message: 'Ação inválida.', data: {} });
    }, 350);
  });
}

/* ── Init ── */
popularDias();
carregar();