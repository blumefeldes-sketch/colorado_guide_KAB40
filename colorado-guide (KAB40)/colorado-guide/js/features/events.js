/* =========================================================================
   ДЕЛЕГУВАННЯ ПОДІЙ
   Замість inline-обробників (onclick="...") уся розмітка містить data-action,
   а події обробляються тут, на рівні документа. Це дозволяє не мати глобальних
   функцій і працювати з динамічно перемальованим HTML.
   ========================================================================= */
import {
  selectTopTab, selectSubTab, toggleStepCheck, toggleGearCheck,
  selectScenario, selectRoute, selectZone, setMicroLocationFilter, selectDisguise
} from './navigation.js';
import { handleResetProgress, exportPlanTxt } from './export-reset.js';
import { zoomMap, resetMapView, startMapDrag, moveMapDrag, endMapDrag, consumeMapMoved } from '../sections/zones.js';
import { vtabKeydown } from '../components/vtabs.js';

// Назви обробників, які компонент вертикальних вкладок передає в data-handler
const VTAB_HANDLERS = {
  selectScenario,
  selectRoute,
  selectZone,
  setMicroLocationFilter
};

const CLICK_ACTIONS = {
  'export-plan': function () { exportPlanTxt(); },
  'reset-progress': function (el) { handleResetProgress(el); },
  'top-tab': function (el) { selectTopTab(el.dataset.tab); },
  'zoom-map': function (el) { zoomMap(Number(el.dataset.delta)); },
  'reset-map': function () { resetMapView(); },
  'sub-tab': function (el) { selectSubTab(el.dataset.section, el.dataset.target); },
  'vtab-select': function (el) {
    const handler = VTAB_HANDLERS[el.dataset.handler];
    if (handler) handler(el.dataset.id);
  },
  'select-disguise': function (el) { selectDisguise(el.dataset.id); },
  'map-zone': function (el) {
    if (consumeMapMoved()) return;
    selectZone(el.dataset.id);
  }
};

const CHANGE_ACTIONS = {
  'toggle-step': function (el) { toggleStepCheck(el.dataset.key, el.checked); },
  'toggle-gear': function (el) { toggleGearCheck(el.dataset.key, el.checked); }
};

function handleAvatarError(imgEl) {
  if (!imgEl || !imgEl.parentElement) return;
  const parent = imgEl.parentElement;
  parent.textContent = parent.getAttribute(`data-fallback`) || `№`;
}

export function initEvents() {
  document.addEventListener(`click`, function (e) {
    const el = e.target.closest(`[data-action]`);
    if (!el) return;
    const fn = CLICK_ACTIONS[el.dataset.action];
    if (fn) fn(el);
  });

  document.addEventListener(`change`, function (e) {
    const el = e.target.closest(`[data-action]`);
    if (!el) return;
    const fn = CHANGE_ACTIONS[el.dataset.action];
    if (fn) fn(el);
  });

  document.addEventListener(`keydown`, function (e) {
    const tab = e.target.closest && e.target.closest(`.vtab`);
    if (tab) vtabKeydown(e, tab);
  });

  // `error` не спливає, тому слухаємо у фазі перехоплення
  document.addEventListener(`error`, function (e) {
    if (e.target && e.target.matches && e.target.matches(`img[data-avatar-img]`)) handleAvatarError(e.target);
  }, true);

  const viewport = document.getElementById(`map-viewport`);
  if (viewport) {
    viewport.addEventListener(`mousedown`, startMapDrag);
    viewport.addEventListener(`mousemove`, moveMapDrag);
    viewport.addEventListener(`mouseup`, endMapDrag);
    viewport.addEventListener(`mouseleave`, endMapDrag);
  }
}
