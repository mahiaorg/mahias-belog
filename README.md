# Mahia's portfolio

Static HTML/CSS/JavaScript portfolio. Open `index.html` directly to preview it.
All display assets (CSS, images, fonts and SVG icons) are local. No server-side
service or runtime Tailwind compiler is required to display the page.

## Editing

- `index.html`: content, project cards, links and metadata.
- `style.css`: shared components, responsive layout and accessibility rules.
- `script.js`: filters, carousel, navigation, email draft and optional motion.
- `utilities.css`: generated Tailwind utilities; do not edit manually.
- `styles.input.css`: shared card, button, label and heading classes; edit repeated styles here.
- `tailwind.config.cjs`: design tokens used by the utility build.
- `images/` and `assets/fonts/`: local assets; font license is in `assets/fonts/OFL.txt`.

After changing utility classes, run:

```sh
npm ci
npm run build
```

`utilities.css` is included so viewing or publishing the site does not require
running npm. `work/` contains local backups and test artifacts and is ignored by Git.

## Checks

```sh
npm test
```

The browser checks currently use Chrome at its standard Windows installation
path. They cover widths 320, 390, 768, 1024, 1366 and 1920, horizontal overflow,
vertical scrolling, filters, carousel positions, actual touch swiping, keyboard
navigation, local asset loading, reduced motion, high-DPI canvas and enlarged text.
The contact test checks validation, URL encoding and preservation of the draft;
it sends no email. Screenshots and results are written under `work/audit-checks/`.

## Contact and resume

The form opens a `mailto:` draft in the visitor's email application. It does not
send an email itself, claim delivery, or clear the entered message. Direct email
and social links are also available. The current email is
`mahiatavakkoli9@gmail.com`; update it in both HTML and JavaScript if needed.

The copy-address button works independently of an email application. Without
JavaScript, the draft form stays hidden and a direct email link is available.
Direct form delivery requires a configured mail service; none is connected yet.

## Motion and layout

Projects follow the introduction, then skills, about, interests and contact.
Background bubbles are clipped to the introduction and stop animating offscreen.
Mouse-trail bubbles remain available across the page. The introduction's pause
button controls both effects; both respect reduced-motion settings.
Project thumbnails use local WebP images, with the original PNG files retained.

Resume links were removed because no PDF has been supplied. Add a real PDF and
a descriptive download link when it is available.

## Publication metadata

The site is not published yet. A favicon, description and 1200×630 share image
are ready. The share image reference remains relative until the public address
is known. Once published, set the actual address with:

```sh
npm run site-url -- https://YOUR-ACTUAL-SITE.example/path/
```

This sets the canonical URL, `og:url`, and absolute share-image URL. It does not
publish the site. To regenerate the share image, use `npm run share-image`.

## Audit completion

- Items 1–6: real destinations, responsive carousel, active navigation and email links.
- Item 7: removed nonfunctional resume links pending a real PDF.
- Item 8: replaced simulated submission with an explicitly labelled email draft.
- Items 9–18: responsive header/content, wrapping, flexible hobby cards, fantasy-tech
  glow, multicolor glass bubbles, concise workflow panel, real project previews,
  visible scrolling and section-relative backgrounds.
- Items 19–26: larger targets, accessible filter/slide states, reduced-motion
  support, descriptive alternatives, decorative SVGs, skip link and focus styles.
- Items 27–36: prebuilt CSS, local assets, lazy images, idle-aware/time-based motion,
  capped device-pixel ratio, resize redraw and shared filter/card implementations.
- Items 37–39: removed template project claims/prices and updated time references.
- Item 40: metadata, favicon and share image ready; final public URL awaits publication.

No changes have been pushed or published by this audit.
