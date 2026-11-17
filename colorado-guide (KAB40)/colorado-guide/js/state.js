/* =========================================================================
   СТАН ДОДАТКА ТА ПЕРСИСТЕНТНІСТЬ (localStorage)
   Версіонування: ключ містить номер схеми. При зміні структури стану
   піднімайте STATE_VERSION і додайте крок у migrateLegacyState().
   ========================================================================= */
export const STATE_VERSION = 2;
const STORAGE_KEY = `colorado-guide:state:v${STATE_VERSION}`;
const LEGACY_KEYS = [`colorado-guide:state:v1`];

export const DEFAULT_STATE = {
  activeTopTab: `stories`,
  subTabs: {
    stories: `all`,
    routes: `all`,
    zones: `all`,
    disguises: `all`
  },
  checkedSteps: {},
  checkedGear: {},
  selectedScenarioId: null,
  selectedRouteId: null,
  selectedZoneId: `z1`,
  microLocationFilter: `all`,
  selectedDisguiseId: `d-elite`,
  mapScale: 1,
  mapPanX: 0,
  mapPanY: 0
};

const TOP_TABS = [`stories`, `routes`, `zones`, `disguises`];

function cloneDefault() {
  return JSON.parse(JSON.stringify(DEFAULT_STATE));
}

export let appState = cloneDefault();
let saveTimer = null;

export function resetAppState() {
  appState = cloneDefault();
}

export function setSaveStatus(text, isTemp) {
  const textEl = document.getElementById(`save-status-text`);
  if (!textEl) return;
  textEl.textContent = text;
  if (isTemp) {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      const el = document.getElementById(`save-status-text`);
      if (el) el.textContent = `Збережено`;
    }, 1600);
  }
}

export function persistState() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ v: STATE_VERSION, state: appState }));
    setSaveStatus(`Збережено`, false);
  } catch (e) {
    // приватний режим / переповнене сховище — працюємо без збереження
    setSaveStatus(`Не вдалося зберегти (стан діє лише до закриття вкладки)`, true);
  }
}

const isPlainObject = function (v) { return v !== null && typeof v === `object` && !Array.isArray(v); };

// Перевіряє збережений стан: невідповідні типи замінюються значеннями за замовчуванням
function sanitizeState(saved) {
  const out = cloneDefault();
  if (!isPlainObject(saved)) return out;
  if (TOP_TABS.indexOf(saved.activeTopTab) !== -1) out.activeTopTab = saved.activeTopTab;
  if (isPlainObject(saved.subTabs)) {
    TOP_TABS.forEach(function (k) {
      if (typeof saved.subTabs[k] === `string`) out.subTabs[k] = saved.subTabs[k];
    });
  }
  [`checkedSteps`, `checkedGear`].forEach(function (k) {
    if (!isPlainObject(saved[k])) return;
    Object.keys(saved[k]).forEach(function (key) { if (saved[k][key] === true) out[k][key] = true; });
  });
  [`selectedScenarioId`, `selectedRouteId`, `selectedZoneId`, `microLocationFilter`, `selectedDisguiseId`].forEach(function (k) {
    if (typeof saved[k] === `string`) out[k] = saved[k];
  });
  const num = function (v, min, max, fallback) {
    return typeof v === `number` && isFinite(v) ? Math.min(max, Math.max(min, v)) : fallback;
  };
  out.mapScale = num(saved.mapScale, 0.8, 2.4, 1);
  out.mapPanX = num(saved.mapPanX, -180, 180, 0);
  out.mapPanY = num(saved.mapPanY, -140, 140, 0);
  return out;
}

// Міграція зі старих версій схеми (v1 мала ту саму структуру, але без обгортки { v, state })
function migrateLegacyState() {
  for (const key of LEGACY_KEYS) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;
    const parsed = JSON.parse(raw);
    window.localStorage.removeItem(key);
    return parsed;
  }
  return null;
}

export function loadSavedState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    let saved = null;
    if (raw) {
      const parsed = JSON.parse(raw);
      saved = parsed && parsed.v === STATE_VERSION ? parsed.state : null;
    } else {
      saved = migrateLegacyState();
    }
    if (saved) {
      appState = sanitizeState(saved);
      persistState();
    }
  } catch (e) {
    // пошкоджені дані — залишаємо стан за замовчуванням
  }
}
