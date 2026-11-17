import { MAP_IMAGE_SRC, MAP_RECTS, MAP_ZONES, ANTAGONIST_AVATARS, MICRO_LOCATIONS } from '../data-loader.js';
import { appState, persistState } from '../state.js';
import { escapeHtml } from '../utils.js';
import { renderSubtabsForSection, renderTargetAvatar, renderMapDisguises, renderDisguiseChips } from '../components/targets.js';
import { renderVTabButtons } from '../components/vtabs.js';

let isDraggingMap = false;
let dragStartX = 0;
let dragStartY = 0;
let dragOriginX = 0;
let dragOriginY = 0;
let mapMoved = false;

// true, якщо щойно було перетягування карти (тоді «клік» по сектору ігнорується)
export function consumeMapMoved() {
  const moved = mapMoved;
  mapMoved = false;
  return moved;
}

/* =========================================================================
   ВКЛАДКА 3: ЗОНИ ДОСТУПУ ТА КАРТА
   ========================================================================= */
export function initMapImageSource() {
  const img = document.getElementById(`map-photo-layer`);
  const svg = document.getElementById(`map-svg-fallback`);
  const statusEl = document.getElementById(`map-source-status`);
  if (!img || !svg) return;
  img.addEventListener(`error`, function () { handleMapImageError(img); });
  if (MAP_IMAGE_SRC) {
    img.src = MAP_IMAGE_SRC;
    img.style.display = `block`;
    svg.style.display = `none`;
    if (statusEl) statusEl.textContent = `Підкладка: map.png`;
  } else {
    img.style.display = `none`;
    svg.style.display = `block`;
  }
}

export function handleMapImageError(imgEl) {
  if (!imgEl) return;
  imgEl.style.display = `none`;
  const svg = document.getElementById(`map-svg-fallback`);
  if (svg) svg.style.display = `block`;
  const statusEl = document.getElementById(`map-source-status`);
  if (statusEl) statusEl.textContent = `Тут буде карта`;
}

export function applyMapTransform() {
  const stage = document.getElementById(`map-stage`);
  if (!stage) return;
  stage.style.transform = `translate(${appState.mapPanX}px, ${appState.mapPanY}px) scale(${appState.mapScale})`;
}

export function zoomMap(delta) {
  const next = Math.min(2.4, Math.max(0.8, Number((appState.mapScale + delta).toFixed(2))));
  appState.mapScale = next;
  applyMapTransform();
  persistState();
}

export function resetMapView() {
  appState.mapScale = 1;
  appState.mapPanX = 0;
  appState.mapPanY = 0;
  applyMapTransform();
  persistState();
}

export function startMapDrag(e) {
  mapMoved = false; dragOriginX = e.clientX; dragOriginY = e.clientY;
  isDraggingMap = true;
  dragStartX = e.clientX - appState.mapPanX;
  dragStartY = e.clientY - appState.mapPanY;
}

export function moveMapDrag(e) {
  if (!isDraggingMap) return;
  if (Math.abs(e.clientX - dragOriginX) + Math.abs(e.clientY - dragOriginY) > 5) mapMoved = true;
  appState.mapPanX = Math.max(-180, Math.min(180, e.clientX - dragStartX));
  appState.mapPanY = Math.max(-140, Math.min(140, e.clientY - dragStartY));
  applyMapTransform();
}

export function endMapDrag() {
  if (!isDraggingMap) return;
  isDraggingMap = false;
  persistState();
}

export function renderZonesPanel() {
  renderSubtabsForSection(`zones`);
  const pinsLayer = document.getElementById(`map-pins-layer`);
  const listEl = document.getElementById(`zones-list`);
  const passportEl = document.getElementById(`zone-passport`);
  if (!pinsLayer || !listEl || !passportEl) return;

  const targetFilter = appState.subTabs.zones || `all`;

  pinsLayer.innerHTML = MAP_ZONES.filter(function (z) { return MAP_RECTS[z.id]; }).map(function (z) {
    const r = MAP_RECTS[z.id];
    const isSelected = appState.selectedZoneId === z.id;
    const matchesTarget = targetFilter === `all` || z.targets.indexOf(targetFilter) !== -1;
    return `<button type="button"
      class="map-zone ${isSelected ? `active` : ``} ${matchesTarget ? `` : `is-dimmed`}"
      style="left: ${r.x}%; top: ${r.y}%; width: ${r.w}%; height: ${r.h}%;"
      title="${escapeHtml(z.name)}" aria-pressed="${isSelected ? `true` : `false`}"
      data-action="map-zone" data-id="${escapeHtml(z.id)}"
      aria-label="Обрати сектор ${escapeHtml(z.name)}">
      <span>${escapeHtml(z.code)}</span>${renderMapDisguises(z)}
    </button>`;
  }).join(``);

  listEl.innerHTML = renderVTabButtons({
    activeId: appState.selectedZoneId,
    onSelect: `selectZone`,
    items: MAP_ZONES.map(function (z) {
      return {
        id: z.id,
        title: z.name,
        meta: z.code,
        dimmed: !(targetFilter === `all` || z.targets.indexOf(targetFilter) !== -1),
        trail: z.targets.map(function (tid) { return renderTargetAvatar(tid, `avatar-28`); }).join(``)
      };
    })
  });

  const currentZone = MAP_ZONES.find(function (z) { return z.id === appState.selectedZoneId; }) || MAP_ZONES[0];
  const passagesList = currentZone.passages.map(function (p) {
    return `<li>${escapeHtml(p)}</li>`;
  }).join(``);
  const targetNames = currentZone.targets.map(function (tid) {
    return ANTAGONIST_AVATARS[tid] ? ANTAGONIST_AVATARS[tid].name : tid;
  }).join(`, `) || `немає даних`;

  passportEl.innerHTML = `
    <div class="passport-header">
      <h3>Паспорт зони: ${escapeHtml(currentZone.code)} — ${escapeHtml(currentZone.name)}</h3>
      <span class="method-badge">Присутні цілі: ${escapeHtml(targetNames)}</span>
    </div>
    <div class="passport-cards-row">
      <div class="passport-card">
        <span class="passport-card-label">Дозволені маскування</span>
        ${renderDisguiseChips(currentZone)}<p>${escapeHtml(currentZone.disguises)}</p>
      </div>
      <div class="passport-card">
        <span class="passport-card-label">Рівень обшуку та зброя</span>
        <p>${escapeHtml(currentZone.frisk)}</p>
      </div>
      <div class="passport-card">
        <span class="passport-card-label">Безпека та камери</span>
        <p>${escapeHtml(currentZone.security)}</p>
      </div>
      <div class="passport-card">
        <span class="passport-card-label">Проходи, сховки та виходи</span>
        <ul>${passagesList}</ul>
      </div>
    </div>
  `;
  applyMapTransform();
}

