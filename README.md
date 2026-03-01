# Michal Jor — Personal CV Website

This repository contains the source code for the personal resume website of **Michal Jor**, a QA Engineer [cite: MichalJorCV.zip/MichalJorCV/index.html]. The site is designed with a modern, "cyber-grid" aesthetic, reflecting a passion for technology, clean code, and multimedia [cite: MichalJorCV.zip/MichalJorCV/index.html].

## 🚀 Overview

The website serves as a digital business card and professional portfolio [cite: MichalJorCV.zip/MichalJorCV/index.html]. It highlights Michal's transition from manual testing into automation and front-end development, showcasing professional experiences at companies like Generali, Gen Digital (Avast), and ŠKODA AUTO [cite: MichalJorCV.zip/MichalJorCV/index.html].

### Key Features
* **Responsive Design:** Mobile-first approach using CSS Flexbox and Grid, scaling from smartphones to desktop displays [cite: MichalJorCV.zip/MichalJorCV/index.html].
* **Print-Ready:** Includes a dedicated `print.css` and `@media print` logic to ensure the resume looks professional when exported as a PDF [cite: MichalJorCV.zip/MichalJorCV/index.html, MichalJorCV.zip/MichalJorCV/assets/print.css].
* **Interactive UI:** Subtle scanline effects, background parallax, and "fade-in" scroll animations using the Intersection Observer API [cite: MichalJorCV.zip/MichalJorCV/index.html].
* **Modern Aesthetic:** A dark-mode theme utilizing CSS variables for easy branding updates [cite: MichalJorCV.zip/MichalJorCV/index.html].

---

## 🛠 Tech Stack

* **HTML5:** Semantic markup for SEO and accessibility [cite: MichalJorCV.zip/MichalJorCV/index.html].
* **CSS3:** Custom Properties (CSS Variables), advanced animations, and Google Fonts integration (Syne, DM Sans, JetBrains Mono) [cite: MichalJorCV.zip/MichalJorCV/index.html].
* **Vanilla JavaScript:** Handles on-scroll reveal animations and background parallax effects [cite: MichalJorCV.zip/MichalJorCV/index.html].

---

## 📁 Project Structure

```text
MichalJorCV/
├── index.html          # Main entry point and structural markup
├── assets/
│   ├── screen.css      # Primary styling for web display
│   ├── print.css       # Styles for PDF/Print optimization
│   └── photo.jpg       # Profile photography
└── README.md           # Documentation
```

---

## 🔧 Developer Information

### Customization
The visual theme is controlled via the `:root` variables in `index.html` [cite: MichalJorCV.zip/MichalJorCV/index.html]. You can change the "glow" color or background depth by adjusting these hex codes:

```css
:root {
  --blue-deep:    #0a0e2e;
  --blue-accent:  #2d6fff;
  --cyan:         #00d4ff;
}
```

### PDF Generation
The "Download this page as PDF" button triggers the `window.print()` function [cite: MichalJorCV.zip/MichalJorCV/index.html]. The print CSS hides interactive elements and converts text to high-contrast for readability [cite: MichalJorCV.zip/MichalJorCV/index.html, MichalJorCV.zip/MichalJorCV/assets/print.css].

---

## 🎯 Future Roadmap
As stated in the resume, future goals include [cite: MichalJorCV.zip/MichalJorCV/index.html]:
* Moving to automated testing using **Python** and **Playwright** (TypeScript).
* Developing into a front-end developer using **React**.

---

**Contact:** [michal.jor96@gmail.com](mailto:michal.jor96@gmail.com) [cite: MichalJorCV.zip/MichalJorCV/index.html]  
**GitHub:** [@M1CH43LS0N](https://github.com/M1CH43LS0N) [cite: MichalJorCV.zip/MichalJorCV/index.html]
