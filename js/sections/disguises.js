import { DISGUISES, MICRO_LOCATIONS, ANTAGONIST_AVATARS } from '../data-loader.js';
import { appState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { renderSubtabsForSection, renderDisguiseIcon } from '../components/targets.js';
import { renderVTabButtons } from '../components/vtabs.js';

/* =========================================================================
   ВКЛАДКА 4: МАТРИЦЯ МАСКУВАНЬ
   ========================================================================= */
function formatAccessBadge(level) {
  if (level === `nodata`) return `<span class="access-badge" style="background: var(--surface-container); border: 1px dashed var(--outline);">немає даних</span>`;
  if (level === `allowed`) return `<span class="access-badge badge-allowed">Дозволено</span>`;
  if (level === `suspicious`) return `<span class="access-badge badge-suspicious">Під підозрою</span>`;
  return `<span class="access-badge badge-forbidden">Заборонено</span>`;
}

export function renderDisguisesPanel() {
  renderSubtabsForSection(`disguises`);
  const tbody = document.getElementById(`disguise-table-body`);
  const countEl = document.getElementById(`disguise-row-count`);
  const passportEl = document.getElementById(`risk-passport`);
  const microTabsEl = document.getElementById(`micro-location-tabs`);
  if (!tbody || !countEl || !passportEl) return;

  const targetFilter = appState.subTabs.disguises || `all`;
  const microFilter = appState.microLocationFilter || `all`;
  if (microTabsEl) {
    microTabsEl.innerHTML = renderVTabButtons({
      activeId: microFilter,
      onSelect: `setMicroLocationFilter`,
      items: MICRO_LOCATIONS.map(function (m) {
        const n = DISGUISES.filter(function (d) {
          const targetOk = targetFilter === `all` || d.targets.indexOf(targetFilter) !== -1;
          return targetOk && (m.value === `all` || d.access[m.value] !== `forbidden`);
        }).length;
        return { id: m.value, title: m.label, meta: `${n} маскувань` };
      })
    });
  }

  const filtered = DISGUISES.filter(function (d) {
    const targetOk = targetFilter === `all` || d.targets.indexOf(targetFilter) !== -1;
    const microOk = microFilter === `all` || d.access[microFilter] !== `forbidden`;
    return targetOk && microOk;
  });

  countEl.textContent = `Показано ${filtered.length} із ${DISGUISES.length} маскувань`;

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 1.5rem; color: var(--on-surface-muted);">За обраними фільтрами немає дозволених маскувань. Спробуйте обрати «Усі зони бази» або іншу ціль.</td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(function (d) {
      const isSelected = appState.selectedDisguiseId === d.id;
      return `<tr class="${isSelected ? `active-row` : ``}" data-action="select-disguise" data-id="${escapeHtml(d.id)}">
        <td><span class="dis-name">${renderDisguiseIcon(d.id)}<strong>${escapeHtml(d.name)}</strong></span></td>
        <td>${formatAccessBadge(d.access.perimeter)}</td>
        <td>${formatAccessBadge(d.access.barn)}</td>
        <td>${formatAccessBadge(d.access.garage)}</td>
        <td>${formatAccessBadge(d.access.explosives)}</td>
        <td>${formatAccessBadge(d.access.house)}</td>
        <td>${formatAccessBadge(d.access.basement)}</td>
        <td>${formatAccessBadge(d.access.camp)}</td>
      </tr>`;
    }).join(``);
  }

  const activeDisguise = filtered.find(function (d) { return d.id === appState.selectedDisguiseId; })
    || filtered[0]
    || DISGUISES.find(function (d) { return d.id === appState.selectedDisguiseId; })
    || DISGUISES[0];

  const targetBadges = activeDisguise.targets.map(function (tid) {
    return ANTAGONIST_AVATARS[tid] ? ANTAGONIST_AVATARS[tid].name : tid;
  }).join(`, `);

  passportEl.innerHTML = `
    <div class="risk-passport-head">
      <h3 class="dis-head">${renderDisguiseIcon(activeDisguise.id, `dis-icon-lg`)}<span>Паспорт ризику маскування: ${escapeHtml(activeDisguise.name)}</span></h3>
      <span class="method-badge">Ефективно проти: ${escapeHtml(targetBadges)}</span>
    </div>
    <div class="risk-grid">
      <div class="risk-cell">
        <div class="risk-cell-title">Де отримати форму</div>
        <p>${escapeHtml(activeDisguise.where)}</p>
      </div>
      <div class="risk-cell">
        <div class="risk-cell-title">Правила щодо зброї</div>
        <p>${escapeHtml(activeDisguise.weapons)}</p>
      </div>
      <div class="risk-cell">
        <div class="risk-cell-title">Хто викриває (інфорсери)</div>
        <p>${escapeHtml(activeDisguise.enforcers)}</p>
      </div>
      <div class="risk-cell">
        <div class="risk-cell-title">Тактичне застосування</div>
        <p>${escapeHtml(activeDisguise.tactic)}</p>
      </div>
    </div>
  `;
}

