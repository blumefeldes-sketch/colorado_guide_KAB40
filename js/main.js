/* =========================================================================
   ІНІЦІАЛІЗАЦІЯ ЗАСТОСУНКУ (ES-модулі виконуються після розбору DOM)
   ========================================================================= */
import { loadAppData } from './data-loader.js';
import { appState, loadSavedState, setSaveStatus } from './state.js';
import { escapeHtml } from './utils.js';
import { renderStoriesPanel } from './sections/stories.js';
import { renderRoutesPanel } from './sections/routes.js';
import { renderZonesPanel, initMapImageSource } from './sections/zones.js';
import { renderDisguisesPanel } from './sections/disguises.js';
import { initEvents } from './features/events.js';

async function initDashboard() {
  try {
    await loadAppData();
  } catch (e) {
    document.querySelector(`.tabs-shell`).insertAdjacentHTML(`beforebegin`,
      `<p role="alert" style="padding:1rem;margin:1rem 0;border:2px solid #a4261e;background:#fcf7f5;">` +
      `Не вдалося завантажити дані (${escapeHtml(e.message)}). Відкрийте сайт через сервер ` +
      `(GitHub Pages, Firebase Hosting або локально: <code>npx serve</code>), а не подвійним кліком по index.html.</p>`);
    return;
  }
  initMapImageSource();
  loadSavedState();

  const topTab = appState.activeTopTab || `stories`;
  const keys = [`stories`, `routes`, `zones`, `disguises`];
  keys.forEach(function (k) {
    const btn = document.getElementById(`top-tab-${k}`);
    const panel = document.getElementById(`panel-${k}`);
    const isActive = k === topTab;
    if (btn) {
      btn.classList.toggle(`active`, isActive);
      btn.setAttribute(`aria-selected`, isActive ? `true` : `false`);
    }
    if (panel) panel.hidden = !isActive;
  });

  initEvents();
  renderStoriesPanel();
  renderRoutesPanel();
  renderZonesPanel();
  renderDisguisesPanel();
  setSaveStatus(`Збережено`, false);
}

initDashboard();
