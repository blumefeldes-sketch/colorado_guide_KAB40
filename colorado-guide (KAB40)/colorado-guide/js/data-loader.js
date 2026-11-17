/* =========================================================================
   ЗАВАНТАЖЕННЯ ДАНИХ (JSON у папці data/)
   Експортовані `let`-змінні — «живі» прив'язки: після loadAppData()
   усі модулі, що їх імпортують, бачать оновлені значення.
   ========================================================================= */
export let MAP_IMAGE_SRC = ``;
export let ANTAGONIST_AVATARS = {};
export let MAP_RECTS = {};
export let MAP_ZONES = [];
export let SCENARIOS = [];
export let ROUTES_DATA = {};
export let DISGUISES = [];
export let DISGUISE_ICONS = {};
export let MICRO_LOCATIONS = [];

async function loadJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`${path}: ${res.status}`);
  return res.json();
}

export async function loadAppData() {
  const [targets, zones, scenarios, routes, disguises] = await Promise.all([
    loadJson(`data/targets.json`),
    loadJson(`data/zones.json`),
    loadJson(`data/scenarios.json`),
    loadJson(`data/routes.json`),
    loadJson(`data/disguises.json`)
  ]);
  ANTAGONIST_AVATARS = targets;
  MAP_RECTS = zones.rects;
  MAP_ZONES = zones.zones;
  MAP_IMAGE_SRC = zones.mapImage;
  SCENARIOS = scenarios;
  ROUTES_DATA = routes;
  DISGUISES = disguises.items;
  DISGUISE_ICONS = disguises.icons;
  MICRO_LOCATIONS = disguises.microLocations;
}
