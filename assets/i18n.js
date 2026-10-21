/*
 * ══════════════════════════════════════════════════════════════
 *  i18n.js — English ⇄ Czech language switch
 * ══════════════════════════════════════════════════════════════
 *
 * DEFAULT LANGUAGE
 *   Czech is shown when the site loads. English (the language the HTML markup is
 *   written in) is one click away. Priority on load:
 *     ?lang=xx in the URL  →  language the visitor chose earlier  →  Czech.
 *
 * HOW IT WORKS
 *   • The English text is the ORIGINAL content and stays untouched in index.html.
 *   • Every translatable element carries a  data-i18n="key"  attribute
 *     (plus data-i18n-alt / data-i18n-content for attributes).
 *   • On start-up the script remembers each element's original (English) HTML,
 *     so switching back to English restores it exactly — nothing is duplicated.
 *   • Czech strings live in the CS / CS_ATTR dictionaries below, keyed by the
 *     same names. A missing key falls back to the English original.
 *
 * PDF EXPORT
 *   The "Download this page as PDF" button calls window.print(), which prints
 *   the LIVE page. Because switching language rewrites the live DOM, the PDF is
 *   automatically in whichever language is active when the button is pressed.
 *   The beforeprint/afterprint handlers at the bottom additionally give the PDF
 *   a language-specific title (browsers use it as the default file name).
 *
 * PUBLIC API (used by the Playwright tests)
 *   window.i18n.setLanguage('cs' | 'en')
 *   window.i18n.getLanguage()
 */
(function () {
  'use strict';

  /* ── Configuration ─────────────────────────────────────────── */
  const STORAGE_KEY  = 'preferredLang';   // localStorage key for the saved choice
  const SOURCE_LANG  = 'en';              // language the HTML markup is written in (original content)
  const DEFAULT_LANG = 'cs';              // language shown when the site loads
  const SUPPORTED    = ['en', 'cs'];      // allowed language codes

  // Document title used while printing → becomes the default PDF file name
  const PDF_TITLES = {
    en: 'Michal Jor – CV',
    cs: 'Michal Jor – Životopis'
  };

  /* ── Czech translations: element content (HTML allowed) ────────
     Inline tags / links are kept identical to the English markup,
     only the visible wording is translated.                       */
  const CS = {
    /* Document + top bar */
    'doc-title':    'Ahoj, jmenuji se Michal.',
    'works-as':     'Funguje jako moje CV.',
    'download-pdf': 'Stáhnout tuto stránku jako PDF',

    /* Intro block */
    'h1': 'Ahoj, jmenuji se Michal.<span class="cursor-blink"></span>',
    'intro':
      'Narozen v roce 1996, jsem QA inženýr a technologický nadšenec se zájmem ' +
      'o různá multimédia, umění a design. ' +
      'Mám zkušenosti s front-end i back-end testováním, webovými aplikacemi, ' +
      'testováním mobilních aplikací a testováním hardwaru. ' +
      'V současnosti se učím programovací jazyky Python a JavaScript ' +
      'a jejich využití v automatizaci. Kromě tohoto CV pracuji na webu pro své koníčky. ' +
      'Pro svou práci používám GitHub.',
    'photo-label': 'michal.jor — QA inženýr',

    /* § 01 — Contact */
    'h2-contact': 'Jak mě kontaktovat',
    'contact-1':
      'Celým jménem jsem <strong>Michal Jor</strong> a momentálně žiji ' +
      'v <strong>Jičíně, Česká republika</strong>.',
    'contact-2':
      'Napsat mi můžete na ✉️ <a href="mailto:michal.jor96@gmail.com">michal.jor96@gmail.com</a>.<br />\n' +
      'Najdete mě také na sociálních sítích — například na ' +
      '<a href="https://www.linkedin.com/in/michal-jor-b941731a4/?locale=en_US" target="_blank">LinkedIn</a> ' +
      'nebo <a href="https://github.com/M1CH43LS0N" target="_blank">GitHub</a>.',

    /* § 02 — What I do */
    'h2-what': 'Čemu se věnuji',
    'what-1':
      'Jsem QA inženýr se zaměřením na ' +
      '<strong>manuální testování webových a mobilních aplikací</strong> ' +
      'a za svou hlavní specializaci považuji testování mobilních aplikací. ' +
      'Mám rozsáhlé zkušenosti s psaním testovacích scénářů krok za krokem i ve formátu BDD. ' +
      'Z vlastní iniciativy udržuji znalostní databázi (know-how). ' +
      'Když je to možné, organizuji retrospektivy. ' +
      'Při pohovorech s novými členy QA týmu vystupuji jako technický recruiter. ' +
      'V neposlední řadě se snažím o proaktivní přístup k řešení problémů a komunikaci chyb.',
    'what-h3': 'Testování a testovací techniky',
    'what-2':
      'Snažím se pokrýt všechny oblasti oboru – od kontroly interaktivních prvků ' +
      'a funkcí přes UI design a UX až po celkový výsledek, který se dostane k uživatelům. ' +
      'Cením si dobrých testovacích postupů. Vedu přehledné reporty a snažím se k tomu ' +
      'vést i ostatní. Všechny předpoklady (preconditions) pro konkrétní flow zaznamenávám ' +
      'do znalostní databáze.',
    'what-3':
      'Mám také rád <strong>open-source</strong> a nepropietární řešení, ' +
      'takže by nemělo překvapit, že toto CV je ' +
      '<a href="https://github.com/M1CH43LS0N/MichalJorCV/blob/development/index_en.md">soubor Markdown</a>, ' +
      'který lze snadno převést do PDF, na tento web nebo vytisknout.',

    /* § 03 — Hobbies */
    'h2-hobbies': 'Koníčky a další dovednosti',
    'hobbies-intro':
      'Ve volném čase se často zdokonaluji v různých oborech. Ve skutečnosti mám ' +
      'koníčků mnohem víc, než je uvedeno níže, ale takové, jako je „vaření“, ' +
      'považuji pro účel této stránky za zcela nepodstatné.',
    'hobby-3d':
      '<strong>3D tisk</strong>\n' +
      'Zatím častěji využívám cizí návrhy, ale pomalu se pouštím do 3D modelovacího softwaru, ' +
      'jako je Tinkercad nebo Onshape.',
    'hobby-gamedev':
      '<strong>Vývoj her</strong>\n' +
      'Zatím jde jen o teoretické znalosti, ale plánuji vytvářet projekty v enginu Godot, ' +
      'který používá syntaxi GDScriptu převážně odvozenou z Pythonu.',
    'hobby-laser':
      '<strong>Laserové gravírování</strong>\n' +
      'Zatím gravíruji pouze dřevo, ale chci se postupně dopracovat ke složitějším materiálům.',
    'hobby-exercise':
      '<strong>Cvičení</strong>\n' +
      'Vzhledem k povaze své práce se snažím každý den hodinu cvičit, abych vedl zdravější životní styl.',
    'hobby-photo':
      '<strong>Fotografie a střih videa</strong>\n' +
      'Kromě mobilního telefonu s výměnným objektivem používám také 360° kameru ' +
      'k natáčení videí. Fotky upravuji v Gimpu a videa střihám v DaVinci Resolve.',
    'hobby-music':
      '<strong>Hudba</strong>\n' +
      'Hraji na akustickou kytaru jako samouk, ale postupně rozšiřuji své obzory i o další nástroje.',

    /* § 04 — Experience (company links are language-neutral and stay as-is) */
    'h2-exp': 'Moje dosavadní zkušenosti',

    'exp1-title': 'QA inženýr ve společnosti Generali Česká pojišťovna',
    'exp1-date':  '02/2025 – současnost',
    'exp1-desc':
      'Zodpovídám za testování front-end i back-end částí podnikové webové aplikace, ' +
      'tvorbu a správu testovací a funkční dokumentace, práci s SQL dotazy ' +
      'a používání nástrojů jako Postman, Swagger a Kafka.',

    'exp2-title': 'QA inženýr ve společnosti Gen Digital',
    'exp2-date':  '02/2024 – 01/2025',
    'exp2-desc':
      'Manuální testování předplatitelských marketingových kampaní pro mobilní aplikace ' +
      'Avast, AVG, Norton, CCleaner a HMA.',

    'exp3-title': 'QA inženýr ve společnosti Cera Care',
    'exp3-date':  '04/2023 – 12/2023',
    'exp3-desc':  'Manuální testování webové aplikace pro správu pečovatelů.',

    'exp4-title': 'QA inženýr ve společnosti Rohlik Group',
    'exp4-date':  '10/2022 – 03/2023',
    'exp4-desc':
      'Manuální testování mobilních a webových e-shopových aplikací pro systémy Android a iOS.',

    'exp5-title': 'QA tester ve společnosti eMan a.s.',
    'exp5-date':  '12/2021 – 09/2022',
    'exp5-desc':
      'Manuální testování webových aplikací pro energetické společnosti ' +
      '(správa techniků, zákaznické stránky).',

    'exp6-title': 'Softwarový tester ve společnosti ŠKODA AUTO a.s.',
    'exp6-date':  '01/2019 – 11/2021',
    'exp6-desc':
      'Manuální tester infotainmentu zaměřený na komunikaci se smartphony. ' +
      'Manuální tester mobilní aplikace MyŠkoda. ' +
      'Testovací inženýr softwaru pro virtuální realitu.',

    /* § 05 — Education */
    'h2-study': 'Kde jsem studoval',
    'study-school':
      '\n              <a href="https://prumyslovkajicin.cz/" target="_blank">Střední průmyslová škola, Jičín</a>\n            ',
    'study-grad': 'Maturita — IT',

    /* § 06 — Future */
    'h2-future': 'Co přinese budoucnost?',
    'future-1':
      'Brzy bych se rád posunul na vyšší úroveň a automatizoval testovací procesy. ' +
      'Proto se samostatně učím Python, v příštích letech bych však chtěl automatizovat ' +
      'pomocí TypeScriptu ve frameworku Playwright.',
    'future-2': 'Za 5 let bych se chtěl vyvinout ve front-end vývojáře pracujícího s Reactem.'
  };

  /* ── Czech translations: attribute values (plain text) ─────── */
  const CS_ATTR = {
    'photo-alt': 'Moje fotografie',
    'meta-desc': 'Můj osobní web'
  };

  /* ── State ─────────────────────────────────────────────────── */
  const originalHtml = new Map();   // element → original English innerHTML
  const originalAttr = new Map();   // "element|attr" → original English attribute value
  let currentLang = DEFAULT_LANG;

  /* ── Helpers ───────────────────────────────────────────────── */

  /** Safe localStorage read/write (can throw in private mode or when blocked). */
  function readSaved() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveLang(lang) {
    try { window.localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ignore */ }
  }

  /** Language to start with: ?lang= in URL → saved choice → default (Czech). */
  function getInitialLanguage() {
    const fromUrl = new URLSearchParams(window.location.search).get('lang');
    if (SUPPORTED.includes(fromUrl)) return fromUrl;
    const saved = readSaved();
    if (SUPPORTED.includes(saved)) return saved;
    return DEFAULT_LANG;
  }

  /** Remember the original English content before anything is replaced. */
  function captureOriginals() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      originalHtml.set(el, el.innerHTML);
    });
    // Attribute translations: data-i18n-alt="key" / data-i18n-content="key"
    ['alt', 'content'].forEach(function (attr) {
      document.querySelectorAll('[data-i18n-' + attr + ']').forEach(function (el) {
        originalAttr.set(el, Object.assign(originalAttr.get(el) || {}, { [attr]: el.getAttribute(attr) }));
      });
    });
  }

  /** Reflect the active language on the switcher buttons (visual + a11y state). */
  function updateSwitcher(lang) {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      const active = btn.dataset.lang === lang;
      btn.setAttribute('aria-pressed', String(active));
      btn.classList.toggle('is-active', active);
    });
  }

  /* ── Core: apply a language to the whole page ──────────────── */
  function setLanguage(lang, persist) {
    if (!SUPPORTED.includes(lang)) return;
    currentLang = lang;
    const useCs = lang === 'cs';

    // 1) Element content — Czech from dictionary, English from saved original
    originalHtml.forEach(function (orig, el) {
      const key = el.getAttribute('data-i18n');
      el.innerHTML = useCs && CS[key] !== undefined ? CS[key] : orig;
    });

    // 2) Attributes (img alt, meta description)
    originalAttr.forEach(function (orig, el) {
      Object.keys(orig).forEach(function (attr) {
        const key = el.getAttribute('data-i18n-' + attr);
        el.setAttribute(attr, useCs && CS_ATTR[key] !== undefined ? CS_ATTR[key] : orig[attr]);
      });
    });

    // 3) Document-level state: <html lang>, tab title, switcher buttons
    document.documentElement.lang = lang;
    updateSwitcher(lang);

    // 4) Remember the choice for the next visit
    if (persist !== false) saveLang(lang);

    // 5) Let other scripts / tests know the language changed
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: lang } }));
  }

  /* ── Wire up the switcher buttons ──────────────────────────── */
  function bindSwitcher() {
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () { setLanguage(btn.dataset.lang); });
    });
  }

  /* ── PDF: language-specific document title while printing ──── */
  let titleBeforePrint = null;
  window.addEventListener('beforeprint', function () {
    titleBeforePrint = document.title;
    document.title = PDF_TITLES[currentLang] || titleBeforePrint;   // default PDF file name
  });
  window.addEventListener('afterprint', function () {
    if (titleBeforePrint !== null) document.title = titleBeforePrint;
    titleBeforePrint = null;
  });

  /* ── Init ──────────────────────────────────────────────────── */
  captureOriginals();
  bindSwitcher();
  // Apply the starting language. The default is NOT saved (only explicit choices are),
  // so changing DEFAULT_LANG later affects visitors who never used the switch.
  const initial = getInitialLanguage();
  if (initial === SOURCE_LANG) {
    // Markup is already English — just sync the switcher and <html lang>
    currentLang = SOURCE_LANG;
    updateSwitcher(SOURCE_LANG);
    document.documentElement.lang = SOURCE_LANG;
  } else {
    setLanguage(initial, false);
  }
  // A ?lang=xx URL choice counts as an explicit choice → remember it
  if (SUPPORTED.includes(new URLSearchParams(window.location.search).get('lang'))) saveLang(initial);

  // Small public API (used by tests and handy in the console)
  window.i18n = {
    setLanguage: setLanguage,
    getLanguage: function () { return currentLang; }
  };
})();
