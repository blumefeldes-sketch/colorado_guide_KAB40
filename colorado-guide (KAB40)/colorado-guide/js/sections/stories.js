import { SCENARIOS } from '../data-loader.js';
import { appState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { renderSubtabsForSection, renderTargetAvatar, renderTargetWho, renderTargetBanner } from '../components/targets.js';
import { renderVTabsLayout } from '../components/vtabs.js';

/* =========================================================================
   ВКЛАДКА 1: СЮЖЕТНІ ЛІНІЇ
   ========================================================================= */
export function renderStoriesPanel() {
  renderSubtabsForSection(`stories`);
  const panel = document.getElementById(`subpanel-stories`);
  if (!panel) return;

  const filter = appState.subTabs.stories || `all`;
  const filtered = SCENARIOS.filter(function (sc) {
    return filter === `all` || sc.target === filter;
  });

  let totalSteps = 0;
  let doneSteps = 0;
  SCENARIOS.forEach(function (sc) {
    sc.steps.forEach(function (_, idx) {
      totalSteps += 1;
      if (appState.checkedSteps[`${sc.id}-${idx}`]) doneSteps += 1;
    });
  });
  const badge = document.getElementById(`stories-progress-badge`);
  if (badge) badge.textContent = `Виконано: ${doneSteps} / ${totalSteps} кроків`;

  const renderCard = function (sc) {
    let scDone = 0;
    sc.steps.forEach(function (_, idx) {
      if (appState.checkedSteps[`${sc.id}-${idx}`]) scDone += 1;
    });
    const pct = Math.round((scDone / sc.steps.length) * 100);
    const isComplete = scDone === sc.steps.length;
    const avatarTarget = sc.target === `all` ? `all` : sc.target;

    const stepsHtml = sc.steps.map(function (stepText, idx) {
      const stepKey = `${sc.id}-${idx}`;
      const isChecked = Boolean(appState.checkedSteps[stepKey]);
      const numStr = String(idx + 1).padStart(2, `0`);
      return `<li>
        <label class="step-item ${isChecked ? `checked` : ``}">
          <input type="checkbox" class="step-checkbox" ${isChecked ? `checked` : ``} data-action="toggle-step" data-key="${stepKey}">
          <span class="step-num">${numStr}</span>
          <span class="step-text">${escapeHtml(stepText)}</span>
        </label>
      </li>`;
    }).join(``);

    return `<article class="scenario-card ${isComplete ? `is-complete` : ``}">
      <div class="scenario-head">
        <div class="scenario-title-wrap">
          ${renderTargetAvatar(avatarTarget, `avatar-30`)}
          <div>
            ${renderTargetWho(avatarTarget)}
            <h3 class="scenario-title">${escapeHtml(sc.title)}</h3>
            <div class="scenario-sub">${escapeHtml(sc.sourceTag)} · ${scDone}/${sc.steps.length} кроків</div>
          </div>
        </div>
        <span class="method-badge">${escapeHtml(sc.method)}</span>
      </div>
      <div class="scenario-progress-bar" aria-hidden="true">
        <div class="scenario-progress-fill" style="width: ${pct}%"></div>
      </div>
      <ol class="step-list">${stepsHtml}</ol>
    </article>`;
  };

  const activeSc = filtered.find(function (sc) { return sc.id === appState.selectedScenarioId; }) || filtered[0];
  const tabItems = filtered.map(function (sc) {
    let done = 0;
    sc.steps.forEach(function (_, idx) { if (appState.checkedSteps[`${sc.id}-${idx}`]) done += 1; });
    return {
      id: sc.id,
      title: sc.title,
      meta: `${sc.sourceTag} · ${done}/${sc.steps.length}`,
      lead: renderTargetAvatar(sc.target === `all` ? `all` : sc.target, `avatar-28`)
    };
  });
  panel.innerHTML = renderTargetBanner(filter) + renderVTabsLayout({
    label: `Сюжетні лінії`,
    items: tabItems,
    activeId: activeSc ? activeSc.id : null,
    onSelect: `selectScenario`
  }, activeSc ? renderCard(activeSc) : ``);
}

