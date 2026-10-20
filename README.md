# Michal Jor — Personal CV Website

Source code for the personal resume website of **Michal Jor**, a QA Engineer. The site has a modern "cyber-grid" look that reflects a passion for technology, clean code, and multimedia, and it is available in **English and Czech**.

## 🚀 Overview

The website works as a digital business card and professional portfolio. It highlights Michal's path from manual testing towards automation and front-end development, with professional experience at companies such as Generali, Gen Digital (Avast), and ŠKODA AUTO.

### Key Features
* **Responsive design:** mobile-first layout using CSS Flexbox and Grid, scaling from smartphones to desktop displays.
* **Czech by default, English on demand:** the site loads in Czech, and a compact **CS | EN** toggle in the top bar switches the whole page to English (the original text). An explicit choice is remembered between visits.
* **Print-ready, language-aware PDF:** a dedicated `print.css` produces a clean resume, and the PDF is generated in whichever language is active at download time.
* **Interactive UI:** subtle scanline effects, background parallax, and fade-in scroll animations using the Intersection Observer API.
* **Modern aesthetic:** dark theme built on CSS variables for easy re-branding.
* **Automated tests:** Playwright (JavaScript) tests cover the language switch, the Czech localization, and PDF output in both languages.

---

## 🛠 Tech Stack

* **HTML5:** semantic markup for SEO and accessibility.
* **CSS3:** custom properties (CSS variables), animations, and Google Fonts (Syne, DM Sans, JetBrains Mono).
* **Vanilla JavaScript:** scroll-reveal animations, background parallax, and the EN/CS language switch (no frameworks or build step).
* **Playwright (JavaScript):** end-to-end tests, plus `pdf-parse` to verify PDF text.

---

## 📁 Project Structure

```text
MichalJorCV/
├── index.html                    # Main entry point and structural markup
├── assets/
│   ├── screen.css                # Primary styling for web display (incl. language switch)
│   ├── print.css                 # Styles for PDF/print output
│   ├── main.js                   # Scroll animations + background parallax
│   ├── i18n.js                   # EN ⇄ CS language switch + Czech translations
│   └── photo.jpg                 # Profile photography
├── tests/
│   ├── language-switch.spec.js   # Playwright: switcher + Czech localization
│   ├── pdf-export.spec.js        # Playwright: PDF download in EN and CS
│   └── helpers/
│       ├── site.js               # Shared expected strings and helpers
│       └── static-server.js      # Zero-dependency local server used by the tests
├── playwright.config.js          # Playwright configuration
├── package.json                  # Test scripts and dev dependencies
└── README.md                     # Documentation
```

---

## ▶️ Running the Site Locally

The site is plain static files, so you can simply open `index.html` in a browser. To serve it over HTTP instead:

```bash
npm start        # serves the project on http://localhost:4173
```

---

## 🔧 Developer Information

### Customization
The visual theme is controlled by the `:root` variables at the top of `assets/screen.css`. Change the "glow" colour or background depth by adjusting these values:

```css
:root {
  --blue-deep:    #0a0e2e;
  --blue-accent:  #2d6fff;
  --cyan:         #00d4ff;
}
```

### Language Switch (CS ⇄ EN)
An **EN | CS** toggle sits in the top bar next to the PDF button. **Czech is the default** and is shown when the site loads.

* English is the original content and stays in `index.html`; Czech lives in `assets/i18n.js` and is applied on load.
* **Which language opens:** `?lang=` in the URL → the language the visitor chose earlier → Czech. The default itself is not saved, only explicit choices.
* **Changing the default:** edit `DEFAULT_LANG` at the top of `assets/i18n.js` (and the initial `aria-pressed` / `is-active` state of the two buttons in `index.html`).
* Translatable elements carry a `data-i18n="key"` attribute. On load, the script remembers each element's original English markup, so switching back restores it exactly.
* An explicit choice is saved in `localStorage` (key `preferredLang`). A link such as `index.html?lang=en` opens the English version directly; unsupported values fall back to Czech.
* `<html lang>`, the tab title, the image `alt` text and the meta description are updated together with the page content.

**Editing a translation:** change the matching key in the `CS` object in `assets/i18n.js`.

**Adding new text:** add `data-i18n="new-key"` to the element in `index.html` and a `'new-key'` entry to the `CS` object. Keep inline tags and links identical to the English markup.

### PDF Generation
The "Download this page as PDF" button triggers `window.print()`. Because this prints the live page, the PDF always matches the language shown when the button is pressed.

* `print.css` hides interactive elements (the language switch, the download button, the photo, and the "works as my resumé" badge) and renders high-contrast text on white.
* While printing, the document title becomes `Michal Jor – CV` (EN) or `Michal Jor – Životopis` (CS), which browsers use as the default PDF file name. The normal title is restored afterwards.

---

## ✅ Automated Tests

Tests use [Playwright](https://playwright.dev/) with JavaScript. The config starts the local static server automatically, and external hosts (e.g. Google Fonts) are blocked during tests so runs are fast and deterministic.

```bash
npm install
npm run install:browsers   # one-time Chromium download
npm test                   # run everything
npm run test:headed        # watch the browser while tests run
npm run test:report        # open the HTML report
```

| Spec | What it verifies |
|---|---|
| `language-switch.spec.js` | The switcher is present, labelled and accessible. Czech is shown on load (headings, body text, dates, title, alt text, meta description). Switching to English shows the original text, and a round trip restores it exactly. Every `data-i18n` element is translated. Links and structure are preserved. The choice persists across reloads and `?lang=` works. Keyboard use works. The switcher is hidden in print. No horizontal overflow on a phone viewport. |
| `pdf-export.spec.js` | The button triggers printing with the correct language and file title. Real PDFs rendered with `page.pdf()` contain only the selected language (Czech default, English, and CS → EN → CS). No switcher or button text leaks into the PDF. |

**Projects:** `chromium` (desktop, all specs) and `mobile-chrome` (Pixel 7 viewport, language-switch spec only).

> The native print dialog cannot be automated, so the PDF journey is verified two ways: by spying on `window.print()`, and by rendering the page with the same print stylesheet via `page.pdf()` and checking the extracted PDF text. `page.pdf()` is Chromium-only, so the PDF spec is skipped in other browsers.

---

## 🎯 Future Roadmap
As stated in the resume, future goals include:
* Moving to automated testing using **Python** and **Playwright** (TypeScript).
* Developing into a front-end developer using **React**.

---

**Contact:** [michal.jor96@gmail.com](mailto:michal.jor96@gmail.com)  
**GitHub:** [@M1CH43LS0N](https://github.com/M1CH43LS0N)
