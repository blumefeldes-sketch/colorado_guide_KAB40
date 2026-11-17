# [Колорадо]: тактичний довідник — Борці за свободу

Статичний сайт без збирача. Працює на GitHub Pages і Firebase Hosting без змін.
Неофіційний фанатський некомерційний проєкт; Hitman, карти та зображення персонажів належать їхнім правовласникам (IO Interactive).

## Запуск локально
`fetch` для JSON і ES-модулі не працюють з `file://`, тому потрібен сервер:

    npx serve .          # або: python -m http.server 8000

## Структура
    index.html                 розмітка (один <script type="module">)
    css/                       стилі (порядок підключення = номери файлів)
      00-fonts.css             @font-face для локальних шрифтів
    js/                        ES-модулі (без глобальних змінних)
      main.js                  точка входу, ініціалізація
      data-loader.js           завантаження data/*.json (експорт «живих» змінних)
      state.js                 стан, localStorage, версіонування та міграція
      utils.js                 escapeHtml
      components/              targets.js (аватари, рівень 2), vtabs.js (рівень 3)
      sections/                stories, routes, zones, disguises
      features/                navigation (зміна стану), export-reset, events (делегування подій)
    data/                      targets, zones, scenarios, routes, disguises (.json)
    assets/
      fonts/                   Inter, Source Serif 4, JetBrains Mono (latin + cyrillic, ліцензії OFL)
      images/map.png           підкладка карти
      images/antagonists/      фото цілей (t1..t4)
      icons/roles/             іконки ролей цілей
      icons/disguises/         іконки маскувань

## Події
У розмітці немає `onclick`/`onchange`. Елементи мають `data-action` (+ `data-id`, `data-key` тощо),
а всі події обробляє `js/features/events.js` на рівні документа. Щоб додати нову дію — додайте її
в `CLICK_ACTIONS` або `CHANGE_ACTIONS` у цьому файлі.

## Збереження стану
`localStorage`, ключ `colorado-guide:state:v2`, формат `{ v, state }`. Збережені дані перевіряються
(`sanitizeState`). Змінюєте структуру стану — підніміть `STATE_VERSION` у `js/state.js` і додайте
крок міграції в `migrateLegacyState()`. Дані зі старого ключу `v1` переносяться автоматично.

## Як додати контент
- Нова сюжетна лінія: об'єкт у `data/scenarios.json` — з'явиться вкладкою рівня 3.
- Нова зона: `data/zones.json` (`zones` + прямокутник у `rects`).
- Нова мікролокація: `data/disguises.json` → `microLocations`.
- Фото цілі: файл у `assets/images/antagonists/` і шлях у `data/targets.json` (поле `photo`).
- Карта: замініть `assets/images/map.png` (поточна — 535×674 px; краще завантажити більшу версію
  з тим самим співвідношенням сторін, шлях задається в `data/zones.json` → `mapImage`).

## Публікація
**GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
**Firebase:** `firebase init hosting` (public directory: `.`, SPA: ні, `firebase.json` і `index.html` не перезаписувати) → `firebase deploy`.
