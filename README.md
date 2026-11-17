## About

An interactive tactical guide for the "Freedom Fighters" mission (Colorado) in *Hitman: World of Assassination*. It covers story-driven eliminations, Silent Assassin / Suit Only routes, an interactive sector map with access zones, and a disguise matrix. The interface is in Ukrainian.

**Features**
- Four main sections with three levels of tabs, including keyboard navigation
- Progress checklists saved in the browser (`localStorage`)
- Zoomable, draggable map
- Export of your plan to a `.txt` file

**Tech:** plain HTML, CSS and ES modules. No build step, no dependencies, self-hosted fonts. Content lives in `data/*.json`.

**Run locally:** the site needs a web server (modules and `fetch` do not work from `file://`):

    npx serve .

**Deploy:** works as-is on GitHub Pages (Settings → Pages → `main` / root) and Firebase Hosting (`firebase deploy`).

## Disclaimer

This is an unofficial, non-commercial fan project and is not affiliated with or endorsed by IO Interactive. *Hitman*, its names, maps and character images belong to their respective owners.
