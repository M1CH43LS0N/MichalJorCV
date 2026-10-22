/*
 * Language switcher tests (CS default ⇄ EN)
 * Covers: Czech shown on load, presence, switching to English, restoring Czech,
 * persistence, keyboard use, print visibility and mobile layout.
 * Each test starts in a fresh browser context, so no saved preference exists.
 */
import { test, expect, type Page } from '@playwright/test';
import { TEXT, openSite, switcher, type Lang } from './helpers/site';

/** [data-i18n key, innerHTML] pairs for every translatable element. */
const readTranslatable = (page: Page): Promise<[string, string][]> =>
  page.$$eval('[data-i18n]', els =>
    els.map((e): [string, string] => [(e as HTMLElement).dataset.i18n ?? '', e.innerHTML]));

test.describe('Language switcher', () => {
  test.beforeEach(async ({ page }) => { await openSite(page); });

  test('is present, labelled, and Czech is active by default', async ({ page }) => {
    const sw = switcher(page);
    await expect(sw.group).toBeVisible();
    await expect(sw.en).toBeVisible();
    await expect(sw.cs).toBeVisible();
    await expect(sw.cs).toHaveAttribute('aria-pressed', 'true');
    await expect(sw.en).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
  });

  test('Czech is shown on load: headings, topbar, body text, dates and tab title', async ({ page }) => {
    await expect(page).toHaveTitle(TEXT.cs.docTitle);
    await expect(page.locator('h1')).toContainText(TEXT.cs.h1);
    await expect(page.locator('.works-as')).toHaveText(TEXT.cs.badge);
    await expect(page.locator('button.download-pdf')).toContainText(TEXT.cs.pdfButton);
    await expect(page.locator('h2')).toHaveText(TEXT.cs.headings);
    await expect(page.locator('.intro-text p')).toContainText(TEXT.cs.sample);
    await expect(page.locator('.exp-date').first()).toHaveText(TEXT.cs.expDate);

    // No English leftovers in the translated areas
    await expect(page.locator('main')).not.toContainText('How to contact me');
    await expect(page.locator('main')).not.toContainText('Born in 1996');
  });

  test('switching to English shows the original content', async ({ page }) => {
    await switcher(page).en.click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(switcher(page).en).toHaveAttribute('aria-pressed', 'true');
    await expect(switcher(page).cs).toHaveAttribute('aria-pressed', 'false');

    await expect(page).toHaveTitle(TEXT.en.docTitle);
    await expect(page.locator('h1')).toContainText(TEXT.en.h1);
    await expect(page.locator('.works-as')).toHaveText(TEXT.en.badge);
    await expect(page.locator('button.download-pdf')).toContainText(TEXT.en.pdfButton);
    await expect(page.locator('h2')).toHaveText(TEXT.en.headings);
    await expect(page.locator('.intro-text p')).toContainText(TEXT.en.sample);
    await expect(page.locator('.exp-date').first()).toHaveText(TEXT.en.expDate);
  });

  test('English → Czech → English round trip restores the exact original text', async ({ page }) => {
    // Compare translatable content only (main.js toggles scroll-reveal classes on wrappers)
    await switcher(page).en.click();
    await expect(page.locator('h2').first()).toHaveText(TEXT.en.headings[0]);
    const english = await readTranslatable(page);

    await switcher(page).cs.click();
    await expect(page.locator('h2').first()).toHaveText(TEXT.cs.headings[0]);
    await switcher(page).en.click();
    await expect(page.locator('h2').first()).toHaveText(TEXT.en.headings[0]);

    expect(await readTranslatable(page)).toEqual(english);
  });

  test('every translatable element differs between Czech and English', async ({ page }) => {
    const czech = await readTranslatable(page);       // default language
    await switcher(page).en.click();
    const english = await readTranslatable(page);

    expect(czech.length).toBe(english.length);
    expect(english.length).toBeGreaterThan(40);
    czech.forEach(([key, html], i) => {
      expect(html, `key "${key}" is not translated`).not.toBe(english[i][1]);
    });
  });

  test('links, mailto and structure are identical in both languages', async ({ page }) => {
    const hrefs = () => page.$$eval('main a', as => as.map(a => a.getAttribute('href')));
    const counts = () => page.evaluate(() => ({
      sections: document.querySelectorAll('.section-block').length,
      exp: document.querySelectorAll('.exp-entry').length,
      hobbies: document.querySelectorAll('.hobby-list li').length,
      cursor: document.querySelectorAll('.cursor-blink').length
    }));

    const hrefsCs = await hrefs();
    const countsCs = await counts();
    await switcher(page).en.click();

    expect(await hrefs()).toEqual(hrefsCs);
    expect(await counts()).toEqual(countsCs);
    await expect(page.locator('a[href^="mailto:"]')).toHaveText('michal.jor96@gmail.com');
  });

  test('image alt text and meta description follow the language', async ({ page }) => {
    await expect(page.locator('img.photo')).toHaveAttribute('alt', 'Moje fotografie');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Můj osobní web');

    await switcher(page).en.click();
    await expect(page.locator('img.photo')).toHaveAttribute('alt', 'My photography');
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'My personal website');
  });

  test('an explicit choice persists across reloads; ?lang= deep links work', async ({ page }) => {
    await switcher(page).en.click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('h2').first()).toHaveText(TEXT.en.headings[0]);

    // URL parameter overrides the saved choice
    await page.goto('/index.html?lang=cs', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h2').first()).toHaveText(TEXT.cs.headings[0]);
  });

  test('Czech is shown again on a fresh visit (nothing saved)', async ({ page }) => {
    // The default is not written to storage — only explicit choices are
    const saved = await page.evaluate(() => localStorage.getItem('preferredLang'));
    expect(saved).toBeNull();
    await expect(page.locator('h2').first()).toHaveText(TEXT.cs.headings[0]);
  });

  test('unsupported ?lang= value falls back to Czech', async ({ page }) => {
    await page.goto('/index.html?lang=xx', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
    await expect(page.locator('h1')).toContainText(TEXT.cs.h1);
  });

  test('is usable with the keyboard', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard navigation is a desktop concern');
    await switcher(page).en.focus();
    await expect(switcher(page).en).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await switcher(page).cs.focus();
    await page.keyboard.press('Space');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
  });

  test('is hidden in print output so it never lands in the PDF', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await expect(switcher(page).group).toBeHidden();
    await expect(page.locator('button.download-pdf')).toBeHidden();
  });

  test('does not overflow the viewport horizontally in either language', async ({ page }) => {
    for (const lang of ['cs', 'en'] as Lang[]) {
      await switcher(page)[lang].click();
      const overflow = await page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow, `horizontal overflow in ${lang}`).toBeLessThanOrEqual(0);
      await expect(switcher(page)[lang]).toBeInViewport();
    }
  });
});
