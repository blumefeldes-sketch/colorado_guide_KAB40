import { SCENARIOS, ROUTES_DATA, MAP_ZONES, ANTAGONIST_AVATARS } from '../data-loader.js';
import { appState, resetAppState, setSaveStatus } from '../state.js';
import { selectTopTab } from './navigation.js';
import { resetMapView } from '../sections/zones.js';

export function handleResetProgress(btn) {
  if (!btn) return;
  if (btn.dataset.armed !== `true`) {
    btn.dataset.armed = `true`;
    btn.classList.add(`btn-danger-armed`);
    btn.textContent = `Підтвердити скидання?`;
    setTimeout(function () {
      if (btn.dataset.armed === `true`) {
        btn.dataset.armed = `false`;
        btn.classList.remove(`btn-danger-armed`);
        btn.textContent = `Скинути прогрес`;
      }
    }, 4000);
    return;
  }
  btn.dataset.armed = `false`;
  btn.classList.remove(`btn-danger-armed`);
  btn.textContent = `Скинути прогрес`;
  resetAppState();
  selectTopTab(`stories`);
  resetMapView();
  setSaveStatus(`Прогрес скинуто`, true);
}

export function exportPlanTxt() {
  const lines = [
    `================================================================`,
    `[КОЛОРАДО]: ТАКТИЧНИЙ ПЛАН ОПЕРАЦІЇ «БОРЦІ ЗА СВОБОДУ»`,
    `================================================================`,
    `Цілі: Sean Rose, Maya Parvati, Ezra Berg, Penelope Graves`,
    `Камери: 9 | Виходи: 4 | Сховки: 18`,
    ``,
    `--- 01. СЮЖЕТНІ ЛІНІЇ ТА СТАТУС ВИКОНАННЯ ---`
  ];

  SCENARIOS.forEach(function (sc) {
    const doneCount = sc.steps.filter(function (_, idx) {
      return Boolean(appState.checkedSteps[`${sc.id}-${idx}`]);
    }).length;
    const targetLabel = ANTAGONIST_AVATARS[sc.target] ? ANTAGONIST_AVATARS[sc.target].name : `Усі цілі`;
    lines.push(`\n[${targetLabel}] ${sc.title} (${doneCount}/${sc.steps.length}) — ${sc.method}`);
    sc.steps.forEach(function (step, idx) {
      const mark = appState.checkedSteps[`${sc.id}-${idx}`] ? `[x]` : `[ ]`;
      lines.push(`  ${mark} ${idx + 1}. ${step}`);
    });
  });

  lines.push(`\n--- 02. МАРШРУТИ SILENT ASSASSIN ---`);
  ROUTES_DATA.all.forEach(function (rt) {
    lines.push(`\n${rt.title} (${rt.badge})`);
    lines.push(`Спорядження:`);
    rt.gear.forEach(function (g, idx) {
      const mark = appState.checkedGear[`${rt.id}-gear-${idx}`] ? `[x]` : `[ ]`;
      lines.push(`  ${mark} ${g}`);
    });
    lines.push(`Кроки:`);
    rt.steps.forEach(function (s, idx) {
      const mark = appState.checkedSteps[`${rt.id}-${idx}`] ? `[x]` : `[ ]`;
      lines.push(`  ${mark} ${idx + 1}. ${s}`);
    });
  });

  const activeZone = MAP_ZONES.find(function (z) { return z.id === appState.selectedZoneId; }) || MAP_ZONES[0];
  lines.push(`\n--- 03. ОБРАНИЙ СЕКТОР ЗОН ДОСТУПУ ---`);
  lines.push(`${activeZone.code}: ${activeZone.name}`);
  lines.push(`Маскування: ${activeZone.disguises}`);
  lines.push(`Безпека: ${activeZone.security}`);

  const content = lines.join(`\n`);

  const blob = new Blob([content], { type: `text/plain;charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement(`a`);
  link.href = url;
  link.download = `colorado-tactical-plan.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  setSaveStatus(`Експортовано (.txt)`, true);
}

