/*
 * PDF download tests
 *
 * The "Download this page as PDF" button calls window.print(). A native print
 * dialog cannot be automated, so the journey is verified in two complementary ways:
 *
 *   1. CLICK  — a spy on window.print() proves the button triggers printing and
 *               that, at that moment, the page language and print title match
 *               the active language.
 *   2. OUTPUT — Chromium's page.pdf() renders the same print stylesheet the
 *               browser would use; the PDF text is extracted and compared with
 *               the selected language.
 *
 * page.pdf() only exists in Chromium, so this file is skipped elsewhere.
 */
const { test, expect } = require('@playwright/test');
const pdfParse = require('pdf-parse');
const { TEXT, openSite, switcher, normalize } = require('./helpers/site');

test.skip(({ browserName }) => browserName !== 'chromium', 'page.pdf() is Chromium-only');

/** Renders the current page to PDF and returns { text, title, pages }. */
async function renderPdf(page) {
  const buffer = await page.pdf({ format: 'A4', printBackground: true });
  const data = await pdfParse(buffer);
  return { text: normalize(data.text), title: data.info && data.info.Title, pages: data.numpages };
}

/** Replaces window.print with a spy that mimics the browser's print events. */
async function spyOnPrint(page) {
  await page.evaluate(() => {
    window.__prints = [];
    window.print = () => {
      window.dispatchEvent(new Event('beforeprint'));          // same events a real print fires
      window.__prints.push({ lang: document.documentElement.lang, title: document.title });
      window.dispatchEvent(new Event('afterprint'));
    };
  });
}

test.describe('PDF download', () => {
  test.beforeEach(async ({ page }) => { await openSite(page); });

  test('button is visible on screen in both languages', async ({ page }) => {
    const btn = page.locator('button.download-pdf');
    await expect(btn).toBeVisible();
    await expect(btn).toContainText(TEXT.cs.pdfButton);      // Czech is the default
    await switcher(page).en.click();
    await expect(btn).toContainText(TEXT.en.pdfButton);
  });

  for (const lang of ['en', 'cs']) {
    const title = TEXT[lang].pdfTitle;
    test(`clicking the button prints in ${lang.toUpperCase()} with a matching file title`, async ({ page }) => {
      if (lang === 'en') await switcher(page).en.click();     // Czech needs no click (default)
      await spyOnPrint(page);

      await page.locator('button.download-pdf').click();

      const prints = await page.evaluate(() => window.__prints);
      expect(prints).toEqual([{ lang, title }]);
      // Tab title is restored after printing
      await expect(page).toHaveTitle(TEXT[lang].docTitle);
    });
  }

  test('English PDF contains English content only', async ({ page }) => {
    await switcher(page).en.click();
    const { text, title, pages } = await renderPdf(page);

    expect(pages).toBeGreaterThanOrEqual(1);
    expect(title).toBe(TEXT.en.pdfTitle);   // language-specific PDF title
    TEXT.en.pdfPhrases.forEach(p => expect(text).toContain(p));
    TEXT.cs.pdfPhrases.forEach(p => expect(text).not.toContain(p));
  });

  test('Czech PDF (default language) contains Czech content only', async ({ page }) => {
    const { text, title } = await renderPdf(page);   // no switching: Czech is shown on load

    expect(title).toBe(TEXT.cs.pdfTitle);   // language-specific PDF title
    TEXT.cs.pdfPhrases.forEach(p => expect(text).toContain(p));
    TEXT.en.pdfPhrases.forEach(p => expect(text).not.toContain(p));
  });

  test('PDF follows the language active at download time (CS → EN → CS)', async ({ page }) => {
    expect((await renderPdf(page)).text).toContain(TEXT.cs.pdfPhrases[1]);   // default: Czech

    await switcher(page).en.click();
    const en = (await renderPdf(page)).text;
    expect(en).toContain(TEXT.en.pdfPhrases[1]);
    expect(en).not.toContain(TEXT.cs.pdfPhrases[1]);

    await switcher(page).cs.click();
    expect((await renderPdf(page)).text).toContain(TEXT.cs.pdfPhrases[1]);
  });

  test('PDF is clean: no switcher or download-button text in either language', async ({ page }) => {
    for (const lang of ['en', 'cs']) {
      await switcher(page)[lang].click();
      const { text } = await renderPdf(page);
      expect(text).not.toContain(TEXT.en.pdfButton);
      expect(text).not.toContain(TEXT.cs.pdfButton);
      expect(text).not.toMatch(/Language \/ Jazyk/);
    }
  });
});
