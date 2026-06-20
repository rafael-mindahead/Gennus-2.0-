/* configuracoes.js — busca/filtro das configurações */

const searchInput = document.getElementById('settingsSearch');
const sections    = document.querySelectorAll('[data-section]');
const emptyState  = document.getElementById('settingsEmpty');

searchInput?.addEventListener('input', e => {
  const query = e.target.value.trim().toLowerCase();
  let totalVisible = 0;

  sections.forEach(section => {
    let visibleInSection = 0;

    section.querySelectorAll('.settings-card').forEach(card => {
      const titulo    = card.querySelector('h2')?.textContent.toLowerCase()  ?? '';
      const descricao = card.querySelector('p')?.textContent.toLowerCase()   ?? '';
      const keywords  = card.dataset.keywords?.toLowerCase()                  ?? '';

      const match = !query
        || titulo.includes(query)
        || descricao.includes(query)
        || keywords.includes(query);

      card.style.display = match ? '' : 'none';
      if (match) visibleInSection++;
    });

    // Esconde a seção inteira se nenhum card bateu
    section.classList.toggle('hidden', visibleInSection === 0);
    totalVisible += visibleInSection;
  });

  // Mostra estado vazio se a busca não retornou nada
  emptyState.classList.toggle('visible', totalVisible === 0);
});

/* Atalho: "/" foca a busca (padrão GitHub) */
document.addEventListener('keydown', e => {
  if (e.key === '/' && document.activeElement !== searchInput) {
    e.preventDefault();
    searchInput.focus();
  }
});