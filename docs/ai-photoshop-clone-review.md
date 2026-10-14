# AI Photoshop Clone conversion and sample review

Checked: October 14, 2026. Hosted engine: `72921900975c7e6f`.

## Changes

1. Bilingual `/ai-photoshop-clone` puts the free browser workflow and editor CTA first, with one explicit line that this hosted build has no generative AI service.
2. The opening sample displays our original practice PNG and an actual exported brush edit. It does not use a generated or simulated editor result.
3. Three steps, three task-based entry points, a compact Photoshop comparison, actual exported samples and eight visible FAQ answers precede the longer version/source discussion.
4. Existing bilingual `/tutorial` adds reproducible resize, crop, text, transparency and mask examples. `/photocraft-vs-photoshop` records the measured result and limited scope.
5. Existing self-hosted engine binaries are unchanged. The current `main` also includes previously merged CADCraft content, which remains in the full site build.

## Actual browser samples

Environment: desktop Chrome on Windows, local server, existing WebAssembly engine. Each PNG was produced through the editor UI and checked with Pillow.

| Sample | Observed result | Scope |
| --- | --- | --- |
| Brush edit | Original green pixel `(22,78,71)` becomes black `(0,0,0)` | A duplicate pixel layer |
| Resize | 640 × 400 → 320 × 200 exported PNG | Image → Image Size |
| Crop | Exported PNG is 300 × 200 | Selected rectangular region |
| Text | Inter `Hello PhotoCraft` retained in PNG; pixel differences occupy `(107,285,475,323)` | Simple rendered text, not arbitrary font or PSD text compatibility |
| Transparent PNG | 320 × 200 RGBA; alpha extrema `(0,255)` | New transparent canvas with brush stroke |
| Layer mask | Masked pixel returns from black to original green | One simple mask, not a complex-mask Photoshop round trip |
| Layered PSD | PSD contains two layers; reopening and PNG export retain the black edit | PhotoCraft-to-PhotoCraft sample only |

Public sample outputs and screenshots are in `public/assets/clone/`. Local raw PSD, UI review records and diagnostics remain under ignored `evidence/clone-optimization/`.

## Checks

- Production build and production checks: 56 routes; valid domain, indexing, sitemap, links and JSON-LD.
- Development route/asset checks: 56 routes, 85 assets, 2,544 internal links, unchanged 24,710,609-byte PhotoCraft engine.
- UI: English and Chinese clone, tutorial and comparison pages at 1440px and 390px; all images decode, no page overflow, menu open/Escape close, FAQ interaction and no page errors.
- Staging is limited to these page, style, manifest, sample and documentation changes; build files, local test files and deployment ZIPs are excluded.

## Publication acceptance

After the PR is merged, build from the actual resulting `main` commit. Cloudflare publication is complete only when the intended Worker and custom domain serve that exact `release.json` revision, the bilingual clone pages return HTTP 200 with the new headings, and the actual PNG asset hashes match the local build.

The check does not establish complex PSD, Photoshop parity, arbitrary typography, cross-platform GUI support, persistent offline startup or generative AI capability.
