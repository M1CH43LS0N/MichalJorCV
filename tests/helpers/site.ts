/*
 * Shared helpers + expected strings for the test suite.
 * Keeping expected copy in one place makes translation changes a one-line fix.
 */
import { expect, type Locator, type Page } from '@playwright/test';

/** Languages supported by the site. Czech is the default on load. */
export type Lang = 'en' | 'cs';

/** Shape of the expected texts for one language. */
export interface LangText {
  docTitle: string;      // <title> / tab title
  pdfTitle: string;      // document title while printing (default PDF file name)
  h1: string;
  pdfButton: string;
  badge: string;
  headings: string[];    // the six <h2> section titles, in page order
  sample: string;        // start of the intro paragraph
  expDate: string;       // first experience date
  pdfPhrases: string[];  // phrases that must appear in the generated PDF
}

/** Expected visible texts per language (a representative sample of the page). */
export const TEXT: Record<Lang, LangText> = {
  en: {
    docTitle: 'Hi, my name is Michal.',
    pdfTitle: 'Michal Jor – CV',
    h1: 'Hi, my name is Michal.',
    pdfButton: 'Download this page as PDF',
    badge: 'Works as my resumé.',
    headings: ['How to contact me', 'What I do', 'Hobbies & Other skills',
               'My past experiences', 'Where I studied', 'What future holds?'],
    sample: 'Born in 1996',
    expDate: 'Feb 2025 – present',
    pdfPhrases: ['Hi, my name is Michal', 'How to contact me', 'My past experiences', 'What future holds?']
  },
  cs: {
    docTitle: 'Ahoj, jmenuji se Michal.',
    pdfTitle: 'Michal Jor – Životopis',
    h1: 'Ahoj, jmenuji se Michal.',
    pdfButton: 'Stáhnout tuto stránku jako PDF',
    badge: 'Funguje jako moje CV.',
    headings: ['Jak mě kontaktovat', 'Čemu se věnuji', 'Koníčky a další dovednosti',
               'Moje dosavadní zkušenosti', 'Kde jsem studoval', 'Co přinese budoucnost?'],
    sample: 'Narozen v roce 1996',
    expDate: '02/2025 – současnost',
    pdfPhrases: ['Ahoj, jmenuji se Michal', 'Jak mě kontaktovat', 'Moje dosavadní zkušenosti', 'Co přinese budoucnost?']
  }
};

/**
 * Opens the CV with external hosts (Google Fonts, LinkedIn…) blocked so tests
 * are fast, offline-safe and deterministic. The page falls back to system fonts.
 */
export async function openSite(page: Page, path = '/index.html'): Promise<void> {
  await page.route(/^https?:\/\/(?!localhost)/, route => route.abort());
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('h1')).toBeVisible();
}

/** Locators for the language switcher parts (indexable by language code). */
export type Switcher = Record<Lang, Locator> & { group: Locator };

export const switcher = (page: Page): Switcher => ({
  group: page.getByRole('group', { name: /Language/ }),
  en: page.getByRole('button', { name: 'English', exact: true }),
  cs: page.getByRole('button', { name: 'Čeština', exact: true })
});

/** Collapses whitespace so text comparisons ignore PDF/HTML line wrapping. */
export const normalize = (text: string): string => text.replace(/\s+/g, ' ').trim();
