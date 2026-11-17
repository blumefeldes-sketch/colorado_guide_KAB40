import { appState, persistState } from '../state.js';
import { renderStoriesPanel } from '../sections/stories.js';
import { renderRoutesPanel } from '../sections/routes.js';
import { renderZonesPanel } from '../sections/zones.js';
import { renderDisguisesPanel } from '../sections/disguises.js';

/* =========================================================================
   КЕРУВАННЯ ВКЛАДКАМИ ТА СТАНОМ
   ========================================================================= */
export function selectTopTab(tabKey) {
  appState.activeTopTab = tabKey;
  const keys = [`stories`, `routes`, `zones`, `disguises`];
  keys.forEach(function (k) {
    const btn = document.getElementById(`top-tab-${k}`);
    const panel = document.getElementById(`panel-${k}`);
    const isActive = k === tabKey;
    if (btn) {
      btn.classList.toggle(`active`, isActive);
      btn.setAttribute(`aria-selected`, isActive ? `true` : `false`);
    }
    if (panel) {
      panel.hidden = !isActive;
    }
  });
  renderActiveSection();
  persistState();
}

export function selectSubTab(sectionKey, targetKey) {
  appState.subTabs[sectionKey] = targetKey;
  renderActiveSection();
  persistState();
}

export function toggleStepCheck(stepKey, checked) {
  if (checked) {
    appState.checkedSteps[stepKey] = true;
  } else {
    delete appState.checkedSteps[stepKey];
  }
  renderActiveSection();
  persistState();
}

export function toggleGearCheck(gearKey, checked) {
  if (checked) {
    appState.checkedGear[gearKey] = true;
  } else {
    delete appState.checkedGear[gearKey];
  }
  renderActiveSection();
  persistState();
}

export function selectScenario(scenarioId) {
  appState.selectedScenarioId = scenarioId;
  renderStoriesPanel();
  persistState();
}

export function selectRoute(routeId) {
  appState.selectedRouteId = routeId;
  renderRoutesPanel();
  persistState();
}

export function selectZone(zoneId) {
  appState.selectedZoneId = zoneId;
  renderZonesPanel();
  persistState();
}

export function setMicroLocationFilter(val) {
  appState.microLocationFilter = val;
  renderDisguisesPanel();
  persistState();
}

export function selectDisguise(disguiseId) {
  appState.selectedDisguiseId = disguiseId;
  renderDisguisesPanel();
  persistState();
}

export function renderActiveSection() {
  const tab = appState.activeTopTab || `stories`;
  if (tab === `stories`) renderStoriesPanel();
  else if (tab === `routes`) renderRoutesPanel();
  else if (tab === `zones`) renderZonesPanel();
  else if (tab === `disguises`) renderDisguisesPanel();
}

