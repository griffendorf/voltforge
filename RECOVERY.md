# Frontend recovery (Oct 22, 2026)

The frontend source from Jun 6 to Oct 10, 2026 was lost with the old phone, because it was never pushed.
The live site kept running from the deployed bundle `index-nh2A--fv.js`
(in voltforge-deploy, tag `live-2026-10-10-nh2A`).

This branch makes that exact bundle the editable source:

- `src/live/app.js` is the Oct 10 production bundle, reformatted with Prettier into one file of about 54k lines.
  App code is roughly lines 8,600 to 20,000 and 42,000 to 54,162. three.js and other libraries sit in between.
  Variable names are minified, but every string, style and endpoint is intact, so anchor-based patch scripts work.
- `src/live/app.css` is the Oct 10 stylesheet, reformatted.
- `index.html` is the live index.html (SEO tags, JSON-LD, seo-nav), loading the two files above.
- `vite.config.js` turns the modulepreload polyfill off, because app.js already contains it.
- Everything else in `src/` is the old June Base44 source, kept for reference only. It is not built.

Verified before push:
- `vf guard`: 0 strings lost and 0 new compared with the live bundle.
- The built `dist/index.html` is identical to the live index.html apart from asset hashes.
- The CSS hash is the same as live (`index-DeVBtxY_.css`).
- Headless Chromium renders the same screen as the live bundle, with no new console errors.
- The remaining minified differences are noise from re-minifying (declaration grouping, helper inlining).
  The one helper difference (`__privateWrapper` setter) is only ever called without a setter, so behavior is the same.

Workflow: edit `src/live/app.js`, then `vf build`, then `vf guard`, then `vf deploy`.
