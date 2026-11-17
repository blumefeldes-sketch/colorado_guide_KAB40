import { ANTAGONIST_AVATARS, DISGUISES, DISGUISE_ICONS } from '../data-loader.js';
import { appState } from '../state.js';
import { escapeHtml } from '../utils.js';

/* =========================================================================
   РЕНДЕР АВАТАРІВ ТА ПІДВКЛАДОК
   ========================================================================= */
export function renderTargetAvatar(targetId, sizeClass) {
  const cfg = ANTAGONIST_AVATARS[targetId] || ANTAGONIST_AVATARS.all;
  if (targetId === `all`) {
    return `<span class="avatar-circle ${sizeClass} av-all" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="7" r="3.5"/><circle cx="7" cy="16" r="3.5"/><circle cx="17" cy="16" r="3.5"/>
      </svg>
    </span>`;
  }
  if (cfg.photo) {
    return `<span class="avatar-circle ${sizeClass} ${cfg.className}" title="${escapeHtml(cfg.roleShort || ``)}"><img src="${cfg.photo}" alt="${escapeHtml(cfg.fullName || cfg.name)}"></span>`;
  }
  if (cfg.img) {
    return `<span class="avatar-circle ${sizeClass} ${cfg.className}" data-fallback="${escapeHtml(cfg.badge)}">
      <img src="${escapeHtml(cfg.img)}" alt="${escapeHtml(cfg.name)}" data-avatar-img>
    </span>`;
  }
  return `<span class="avatar-circle ${sizeClass} ${cfg.className}" aria-hidden="true">${escapeHtml(cfg.badge)}</span>`;
}

export function renderRoleIcon(targetId, extraClass) {
  const c = ANTAGONIST_AVATARS[targetId];
  if (!c || !c.img || targetId === `all`) return ``;
  return `<img class="role-icon ${extraClass || ``}" src="${escapeHtml(c.img)}" alt="${escapeHtml(c.roleShort || ``)}" title="${escapeHtml(c.roleShort || ``)}">`;
}

export function renderTargetWho(targetId) {
  const c = ANTAGONIST_AVATARS[targetId];
  if (!c || targetId === `all`) return ``;
  return `<div class="scenario-who"><span>${escapeHtml(c.name)}</span>${renderRoleIcon(targetId, `role-icon-sm`)}</div>`;
}

// Які маскування згадано у «Дозволені маскування» зони (за текстом зони)
const DISGUISE_KEYS = [
  [`d-pointman`, /Point Man|Провідник/],
  [`d-specops`, /Spec Ops|Спецпризначенець/],
  [`d-soldier`, /Солдат(?!ам)/],
  [`d-elite`, /Елітний боєць/],
  [`d-technician`, /Технік(?!ів)/],
  [`d-explosives`, /Спеціаліст із вибухівки|Explosives/],
  [`d-hacker`, /Хакер(?!ів)/],
  [`d-cook`, /Militia Cook|Кухар(?!ям)/],
  [`d-scarecrow`, /Опудал/]
];
function zoneDisguiseIds(z) {
  return DISGUISE_KEYS.filter(function (k) { return k[1].test(z.disguises || ``); }).map(function (k) { return k[0]; });
}
function disguiseLabel(id) {
  const d = DISGUISES.find(function (x) { return x.id === id; });
  return d ? d.name : id;
}
export function renderDisguiseChips(z) {
  const ids = zoneDisguiseIds(z);
  if (!ids.length) return ``;
  return `<div class="dis-chips">` + ids.map(function (id) {
    return `<span class="dis-chip" title="${escapeHtml(disguiseLabel(id))}">${renderDisguiseIcon(id, `dis-icon-sm`)}<span>${escapeHtml(disguiseLabel(id).split(` (`)[0])}</span></span>`;
  }).join(``) + `</div>`;
}
export function renderMapDisguises(z) {
  const ids = zoneDisguiseIds(z);
  if (!ids.length) return ``;
  return `<span class="map-dis">` + ids.map(function (id) {
    return `<img class="dis-icon dis-icon-map" src="${escapeHtml(DISGUISE_ICONS[id])}" alt="" title="${escapeHtml(disguiseLabel(id))}">`;
  }).join(``) + `</span>`;
}

export function renderDisguiseIcon(disguiseId, extraClass) {
  const src = DISGUISE_ICONS[disguiseId];
  return src ? `<img class="dis-icon ${extraClass || ``}" src="${escapeHtml(src)}" alt="" aria-hidden="true">` : ``;
}

export function renderSubtabsForSection(sectionKey) {
  const container = document.getElementById(`subtabs-${sectionKey}`);
  if (!container) return;
  const activeTarget = appState.subTabs[sectionKey] || `all`;
  const keys = [`all`, `t1`, `t2`, `t3`, `t4`];
  container.innerHTML = keys.map(function (key) {
    const cfg = ANTAGONIST_AVATARS[key];
    const isActive = activeTarget === key;
    return `<button type="button"
      class="folder-tab subtab ${isActive ? `active` : ``}"
      role="tab"
      aria-selected="${isActive ? `true` : `false`}"
      data-action="sub-tab" data-section="${sectionKey}" data-target="${key}">
      <span class="tab-cap" aria-hidden="true"></span>
      ${renderTargetAvatar(key, `avatar-28`)}
      <span>${escapeHtml(cfg.name)}</span>${renderRoleIcon(key, `role-icon-sm`)}
    </button>`;
  }).join(``);
}

export function renderTargetBanner(targetId) {
  if (targetId === `all`) return ``;
  const t = ANTAGONIST_AVATARS[targetId];
  if (!t) return ``;
  return `<div class="target-banner">
    ${renderTargetAvatar(targetId, `avatar-56`)}
    <div class="target-banner-info">
      <h3 class="target-banner-title">
        <span class="target-name-line">${escapeHtml(t.name)}${renderRoleIcon(targetId)}</span>
        <span class="target-role-tag">${escapeHtml(t.role)}</span>
      </h3>
      <div class="target-meta-grid">
        <div><strong>Маршрут патруля:</strong> ${escapeHtml(t.patrol)}</div>
        <div><strong>Вразливості:</strong> ${escapeHtml(t.weakness)}</div>
        <div><strong>Ключові предмети:</strong> ${escapeHtml(t.items)}</div>
      </div>
    </div>
  </div>`;
}

