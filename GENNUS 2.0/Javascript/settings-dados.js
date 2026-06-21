/* dados-empresa.js
   ════════════════════════════════════════════════════════
   MODO PROTÓTIPO (fase alfa) — os dados da empresa ficam
   em memória (mockSavedState), mesmo padrão das outras
   páginas de configuração.

   EXCEÇÃO: a busca de CEP usa a API pública do ViaCEP de
   verdade (https://viacep.com.br) — não é nosso backend,
   é um serviço externo gratuito, então funciona igual vai
   funcionar em produção. Não precisa trocar isso depois.
   ════════════════════════════════════════════════════════ */

/* ================================================
   MÁSCARAS
================================================ */
document.getElementById('cnpj').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  e.target.value = v;
});

document.getElementById('telefoneEmpresa').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 11);
  if      (v.length > 10) v = v.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  else if (v.length >  6) v = v.replace(/^(\d{2})(\d{4})(\d*)/, '($1) $2-$3');
  else if (v.length >  2) v = v.replace(/^(\d{2})(\d*)/, '($1) $2');
  else                    v = v.replace(/^(\d*)/, '($1');
  e.target.value = v;
});

document.getElementById('cep').addEventListener('input', e => {
  let v = e.target.value.replace(/\D/g, '').slice(0, 8);
  if (v.length > 5) v = v.replace(/^(\d{5})(\d*)/, '$1-$2');
  e.target.value = v;
});

/* ================================================
   BUSCA DE ENDEREÇO PELO CEP (ViaCEP — API real)
   Disparada quando o campo CEP perde o foco.
================================================ */
const cepInput   = document.getElementById('cep');
const cepSpinner = document.getElementById('cepSpinner');

cepInput.addEventListener('blur', async () => {
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) return;

  cepSpinner.classList.add('loading');
  setField(cepInput, '');

  try {
    const res  = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await res.json();

    if (data.erro) { setField(cepInput, 'error', 'CEP não encontrado.'); return; }

    document.getElementById('logradouro').value = data.logradouro  || '';
    document.getElementById('bairro').value      = data.bairro      || '';
    document.getElementById('cidade').value      = data.localidade  || '';
    document.getElementById('estado').value      = data.uf          || '';

    setField(cepInput, 'ok');
    document.getElementById('numero').focus();

  } catch {
    setField(cepInput, 'error', 'Não foi possível buscar o CEP. Verifique sua conexão.');
  } finally {
    cepSpinner.classList.remove('loading');
  }
});

/* ================================================
   VALIDAÇÃO
================================================ */
function validarFormulario() {
  let valido = true;

  const razao = document.getElementById('razaoSocial');
  if (razao.value.trim().length < 3) { setField(razao, 'error', 'Informe a razão social.'); valido = false; }
  else setField(razao, 'ok');

  const cnpj = document.getElementById('cnpj');
  if (cnpj.value.replace(/\D/g, '').length !== 14) { setField(cnpj, 'error', 'CNPJ deve ter 14 dígitos.'); valido = false; }
  else setField(cnpj, 'ok');

  const email = document.getElementById('emailEmpresa');
  if (email.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    setField(email, 'error', 'E-mail inválido.'); valido = false;
  } else {
    setField(email, 'ok');
  }

  return valido;
}

/* ================================================
   CARREGAR
================================================ */
async function carregar() {
  const res = await api('/api/configuracoes/empresa.php');
  if (!res.ok) { showToast('error', 'Erro ao carregar', res.message); return; }

  const d = res.data;
  const campos = {
    razaoSocial: d.razao_social, nomeFantasia: d.nome_fantasia,
    cnpj: d.cnpj, inscricaoEstadual: d.inscricao_estadual,
    cep: d.cep, logradouro: d.logradouro, numero: d.numero,
    complemento: d.complemento, bairro: d.bairro, cidade: d.cidade, estado: d.estado,
    telefoneEmpresa: d.telefone, emailEmpresa: d.email, site: d.site,
  };

  Object.entries(campos).forEach(([id, valor]) => {
    const el = document.getElementById(id);
    if (el) el.value = valor ?? '';
  });

  document.querySelectorAll('.form-group input').forEach(el => el.classList.remove('input-ok', 'input-error'));
}

/* ================================================
   SALVAR
================================================ */
document.getElementById('btnSalvar').addEventListener('click', async () => {
  if (!validarFormulario()) {
    showToast('error', 'Verifique os campos', 'Corrija os erros antes de salvar.');
    return;
  }

  const btn = document.getElementById('btnSalvar');
  btn.classList.add('loading');
  btn.textContent = 'Salvando…';

  const res = await api('/api/configuracoes/empresa.php', {
    method: 'POST',
    body: new URLSearchParams({
      razao_social:       document.getElementById('razaoSocial').value.trim(),
      nome_fantasia:      document.getElementById('nomeFantasia').value.trim(),
      cnpj:               document.getElementById('cnpj').value.trim(),
      inscricao_estadual: document.getElementById('inscricaoEstadual').value.trim(),
      cep:                document.getElementById('cep').value.trim(),
      logradouro:         document.getElementById('logradouro').value.trim(),
      numero:             document.getElementById('numero').value.trim(),
      complemento:        document.getElementById('complemento').value.trim(),
      bairro:             document.getElementById('bairro').value.trim(),
      cidade:             document.getElementById('cidade').value.trim(),
      estado:             document.getElementById('estado').value,
      telefone:           document.getElementById('telefoneEmpresa').value.trim(),
      email:               document.getElementById('emailEmpresa').value.trim(),
      site:               document.getElementById('site').value.trim(),
    }),
  });

  btn.classList.remove('loading');
  btn.textContent = 'Salvar Alterações';

  if (res.ok) showToast('ok', 'Dados salvos', 'As informações da empresa foram atualizadas.');
  else        showToast('error', 'Erro', res.message);
});

document.getElementById('btnCancelar').addEventListener('click', carregar);

/* ════════════════════════════════════════════════════════
   CAMADA MOCK — apaga este bloco quando integrar o PHP real
   (api/configuracoes/empresa.php já existe pronto).
   ════════════════════════════════════════════════════════ */
let mockSavedState = {
  razao_social: 'Gennus Comércio de Produtos LTDA',
  nome_fantasia: 'Gennus Store',
  cnpj: '12.345.678/0001-90',
  inscricao_estadual: '',
  cep: '80010-000',
  logradouro: 'Rua XV de Novembro',
  numero: '500',
  complemento: '',
  bairro: 'Centro',
  cidade: 'Curitiba',
  estado: 'PR',
  telefone: '(41) 99999-0000',
  email: 'contato@gennusstore.com.br',
  site: 'https://www.gennusstore.com.br',
};

function api(url, options = {}) {
  return new Promise(resolve => {
    setTimeout(() => {
      if (options.method !== 'POST') {
        resolve({ ok: true, message: 'ok', data: { ...mockSavedState } });
        return;
      }

      const body = options.body; // URLSearchParams
      mockSavedState = {
        razao_social: body.get('razao_social'),
        nome_fantasia: body.get('nome_fantasia'),
        cnpj: body.get('cnpj'),
        inscricao_estadual: body.get('inscricao_estadual'),
        cep: body.get('cep'),
        logradouro: body.get('logradouro'),
        numero: body.get('numero'),
        complemento: body.get('complemento'),
        bairro: body.get('bairro'),
        cidade: body.get('cidade'),
        estado: body.get('estado'),
        telefone: body.get('telefone'),
        email: body.get('email'),
        site: body.get('site'),
      };
      resolve({ ok: true, message: 'Dados da empresa salvos.', data: {} });
    }, 350);
  });
}

/* ── Init ── */
carregar();