/*
 * Favicon / app icon tests
 * Verifies the <head> declares every icon, the files are served,
 * and the web manifest is valid and points at existing images.
 */
const { test, expect } = require('@playwright/test');
const { openSite } = require('./helpers/site');

test.describe('Favicon and web manifest', () => {
  test.beforeEach(async ({ page }) => { await openSite(page); });

  test('head declares favicon, PNG icons, apple-touch-icon, manifest and theme colour', async ({ page }) => {
    await expect(page.locator('link[rel="icon"][href$="favicon.ico"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="16x16"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', './site.webmanifest');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0B0E2D');
  });

  test('every icon referenced in <head> is served as an image', async ({ page, request }) => {
    const hrefs = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]',
      ls => ls.map(l => l.href));
    expect(hrefs.length).toBeGreaterThanOrEqual(4);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
      expect(res.headers()['content-type'], href).toMatch(/^image\//);
    }
  });

  test('site.webmanifest is valid and all its icons exist', async ({ page, request }) => {
    const manifestUrl = await page.locator('link[rel="manifest"]').evaluate(l => l.href);
    const res = await request.get(manifestUrl);
    expect(res.status()).toBe(200);
    const manifest = await res.json();

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBe('MichalJorCV');
    expect(manifest.theme_color).toBe('#0B0E2D');
    expect(manifest.background_color).toBe('#0B0E2D');

    const sizes = manifest.icons.map(i => i.sizes);
    expect(sizes).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some(i => i.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons) {
      const r = await request.get(new URL(icon.src, manifestUrl).href);   // resolved relative to the manifest
      expect(r.status(), icon.src).toBe(200);
    }
  });
});
