/*
 * Favicon / app icon tests
 * Verifies the <head> declares every icon, the files are served, icons have the
 * intended background (transparent vs. solid) and the web manifest is valid.
 */
import { test, expect, type Page } from '@playwright/test';
import { openSite } from './helpers/site';

/** Minimal shape of site.webmanifest used in the assertions. */
interface WebManifest {
  name: string;
  short_name: string;
  theme_color: string;
  background_color: string;
  icons: { src: string; sizes: string; type: string; purpose?: string }[];
}

/** Alpha (0–255) of the top-left pixel of a PNG, decoded in the browser. 0 = transparent. */
const cornerAlpha = (page: Page, pngBase64: string): Promise<number> =>
  page.evaluate(async (data: string) => {
    const bytes = Uint8Array.from(atob(data), ch => ch.charCodeAt(0));
    const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }));
    const canvas = document.createElement('canvas');
    canvas.width = bmp.width;
    canvas.height = bmp.height;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(bmp, 0, 0);
    return ctx.getImageData(0, 0, 1, 1).data[3];
  }, pngBase64);

test.describe('Favicon and web manifest', () => {
  test.beforeEach(async ({ page }) => { await openSite(page); });

  test('head declares favicon, SVG, PNG icons, apple-touch-icon, manifest and theme colour', async ({ page }) => {
    await expect(page.locator('link[rel="icon"][href$="favicon.ico"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"][href$="favicon.svg"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveCount(1);
    await expect(page.locator('link[rel="icon"][sizes="16x16"]')).toHaveCount(1);
    await expect(page.locator('link[rel="apple-touch-icon"][sizes="180x180"]')).toHaveCount(1);
    await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', './site.webmanifest');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#0B0E2D');
  });

  test('every icon referenced in <head> is served as an image', async ({ page, request }) => {
    const hrefs = await page.$$eval('link[rel~="icon"], link[rel="apple-touch-icon"]',
      links => links.map(l => (l as HTMLLinkElement).href));
    expect(hrefs.length).toBeGreaterThanOrEqual(5);
    for (const href of hrefs) {
      const res = await request.get(href);
      expect(res.status(), href).toBe(200);
      expect(res.headers()['content-type'], href).toMatch(/^image\//);
    }
  });

  test('icons have the intended background: transparent, except apple-touch and maskable (opaque)', async ({ page, request }) => {
    const base64Of = async (path: string): Promise<string> =>
      (await (await request.get(path)).body()).toString('base64');

    const transparent = ['/assets/icons/favicon-16x16.png', '/assets/icons/favicon-32x32.png',
      '/assets/icons/android-chrome-192x192.png', '/assets/icons/android-chrome-512x512.png'];
    const opaque = ['/apple-touch-icon.png', '/assets/icons/maskable-icon-512x512.png'];

    for (const src of transparent) expect(await cornerAlpha(page, await base64Of(src)), `${src} should be transparent`).toBe(0);
    for (const src of opaque)      expect(await cornerAlpha(page, await base64Of(src)), `${src} should be opaque`).toBe(255);
  });

  test('favicon.ico holds 16, 32 and 48 px images with a transparent background', async ({ page, request }) => {
    const buf = await (await request.get('/favicon.ico')).body();
    expect([buf.readUInt16LE(0), buf.readUInt16LE(2)]).toEqual([0, 1]);          // ICO header: reserved=0, type=1

    const count = buf.readUInt16LE(4);
    const sizes: number[] = [];
    let firstPng: Buffer = Buffer.alloc(0);
    for (let i = 0; i < count; i++) {
      const entry = 6 + i * 16;                                                   // directory entry
      sizes.push(buf[entry] || 256);                                              // width byte (0 means 256)
      if (i === 0) {
        const offset = buf.readUInt32LE(entry + 12);
        firstPng = buf.subarray(offset, offset + buf.readUInt32LE(entry + 8));
      }
    }
    expect(sizes.sort((a, b) => a - b)).toEqual([16, 32, 48]);
    expect(await cornerAlpha(page, firstPng.toString('base64'))).toBe(0);
  });

  test('favicon.svg has no background tile and uses the brand colour', async ({ request }) => {
    const svg = await (await request.get('/favicon.svg')).text();
    expect(svg).not.toMatch(/<rect\b/i);              // no filled background rectangle
    expect(svg.toLowerCase()).toContain('#02d4ff');   // brand colour
  });

  test('site.webmanifest is valid and all its icons exist', async ({ page, request }) => {
    const manifestUrl = await page.locator('link[rel="manifest"]').evaluate(l => (l as HTMLLinkElement).href);
    const res = await request.get(manifestUrl);
    expect(res.status()).toBe(200);
    const manifest = (await res.json()) as WebManifest;

    expect(manifest.name).toBeTruthy();
    expect(manifest.short_name).toBe('MichalJorCV');
    expect(manifest.theme_color).toBe('#0B0E2D');
    expect(manifest.background_color).toBe('#0B0E2D');

    expect(manifest.icons.map(i => i.sizes)).toEqual(expect.arrayContaining(['192x192', '512x512']));
    expect(manifest.icons.some(i => i.purpose === 'maskable')).toBe(true);

    for (const icon of manifest.icons) {
      const r = await request.get(new URL(icon.src, manifestUrl).href);   // resolved relative to the manifest
      expect(r.status(), icon.src).toBe(200);
    }
  });
});
