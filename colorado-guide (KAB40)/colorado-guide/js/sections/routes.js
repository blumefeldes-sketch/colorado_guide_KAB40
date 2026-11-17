import { ROUTES_DATA } from '../data-loader.js';
import { appState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { renderSubtabsForSection, renderTargetBanner } from '../components/targets.js';
import { renderVTabsLayout } from '../components/vtabs.js';

/* =========================================================================
   ВКЛАДКА 2: МАРШРУТИ SILENT ASSASSIN
   ========================================================================= */
export function renderRoutesPanel() {
  renderSubtabsForSection(`routes`);
  const panel = document.getElementById(`subpanel-routes`);
  if (!panel) return;

  const filter = appState.subTabs.routes || `all`;
  const routes = ROUTES_DATA[filter] || ROUTES_DATA.all;

  let totalRouteSteps = 0;
  let doneRouteSteps = 0;
  Object.keys(ROUTES_DATA).forEach(function (k) {
    ROUTES_DATA[k].forEach(function (rt) {
      rt.steps.forEach(function (_, idx) {
        totalRouteSteps += 1;
        if (appState.checkedSteps[`${rt.id}-${idx}`]) doneRouteSteps += 1;
      });
    });
  });
  const badge = document.getElementById(`routes-progress-badge`);
  if (badge) badge.textContent = `Кроків маршруту: ${doneRouteSteps} / ${totalRouteSteps}`;

  const renderRoute = function (rt) {
    const gearHtml = rt.gear.map(function (item, idx) {
      const gKey = `${rt.id}-gear-${idx}`;
      const isChecked = Boolean(appState.checkedGear[gKey]);
      return `<label class="gear-item ${isChecked ? `checked` : ``}">
        <input type="checkbox" ${isChecked ? `checked` : ``} data-action="toggle-gear" data-key="${gKey}">
        <span>${escapeHtml(item)}</span>
      </label>`;
    }).join(``);

    const stepsHtml = rt.steps.map(function (stepText, idx) {
      const sKey = `${rt.id}-${idx}`;
      const isChecked = Boolean(appState.checkedSteps[sKey]);
      const numStr = String(idx + 1).padStart(2, `0`);
      return `<li>
        <label class="step-item ${isChecked ? `checked` : ``}">
          <input type="checkbox" class="step-checkbox" ${isChecked ? `checked` : ``} data-action="toggle-step" data-key="${sKey}">
          <span class="step-num">${numStr}</span>
          <span class="step-text">${escapeHtml(stepText)}</span>
        </label>
      </li>`;
    }).join(``);

    return `<article class="route-card has-gear">
      <aside class="gear-aside">
        <h4>Спорядження маршруту</h4>
        <div>${gearHtml}</div>
      </aside>
      <div>
        <div class="route-main-head">
          <h3>${escapeHtml(rt.title)}</h3>
          <span class="method-badge">${escapeHtml(rt.badge)}</span>
        </div>
        <ol class="step-list">${stepsHtml}</ol>
        <div class="route-note"><strong>Примітка:</strong> ${escapeHtml(rt.note)}</div>
      </div>
    </article>`;
  };

  const activeRt = routes.find(function (rt) { return rt.id === appState.selectedRouteId; }) || routes[0];
  const tabItems = routes.map(function (rt) {
    let done = 0;
    rt.steps.forEach(function (_, idx) { if (appState.checkedSteps[`${rt.id}-${idx}`]) done += 1; });
    return { id: rt.id, title: rt.title, meta: `${rt.badge} · ${done}/${rt.steps.length}` };
  });
  panel.innerHTML = renderTargetBanner(filter) + renderVTabsLayout({
    label: `Маршрути`,
    items: tabItems,
    activeId: activeRt ? activeRt.id : null,
    onSelect: `selectRoute`
  }, activeRt ? renderRoute(activeRt) : ``);
}

