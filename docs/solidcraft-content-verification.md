# SolidCraft bilingual guide delivery

Date: 2026-10-16. This report records local validation before publication.
Publication status is tracked in the associated GitHub PR and the live `release.json`.

## Pages

The following pages exist in English and under `/zh` in Chinese:

- `/solidcraft-app`
- `/solidcraft/download`
- `/solidcraft/tutorial`
- `/solidcraft-vs-fusion-360`
- `/solidcraft/mcp`

Routes and indexing are registered in `src/site-manifest.json` and `site.config.json`.
Both locales have navigation, footer, related-page links and localized breadcrumbs.
SolidCraft is described as a separate parametric CAD project, without claiming an
official relationship with the ArtCraft organization.

## Original worked case

SolidCraft v0.12.0 Windows x64 portable package was downloaded from its official
GitHub release and matched the published SHA256SUMS.txt. The application ran its
own loopback control bridge. Actual MCP calls built an original 60 × 30 × 4 mm
mounting plate, fully constrained on XY, with two diameter-6 mm through-holes.
Setting width to 80 mm rebuilt the timeline and moved the right hole from x=50
to x=70 mm. Both holes remain 10 mm from their respective side edges.

Three screenshots came from the real desktop application's `screenshot` MCP tool
with its default `source=window`. Published WebP images are resized copies of
those captures, with no synthetic geometry or UI. Original PNG captures remain
in the task-local `.local/solidcraft/` directory. Both languages share the same
English-interface captures, with localized captions and alternative text.

Public examples in `public/examples/solidcraft/` contain:

- Original 60 mm and 80 mm editable designs.
- A complete replayable JSON recipe.
- 60 mm STEP and STL exports, plus an 80 mm STEP export.
- A Python standard-library MCP verification client. It rejects existing outputs
  and needs no AI account, paid API or third-party Python packages.

The downloadable client was executed against the published 60 mm design. It
checked body count, bounding box, analytic-volume tolerance, zero sketch DOF,
both hole centers and radii, a native save/reopen and STEP export/reimport.
The tutorial's CLI replay and resize instructions were also executed separately.
See `solidcraft-v0.12.0-verification.json` for measurements and artifact hashes.

This demonstrates an actual SolidCraft/MCP tool workflow, not a paid language
model conversation or a benchmark of model reliability. macOS/Linux instructions
come from upstream documentation; installations on those platforms, physical
printing, slicer behavior and Fusion performance comparisons were not tested.

## Local validation

- `npm.cmd run build:production`: 70 pages.
- `npm.cmd run check:production`: correct domain, indexing and local editor.
- `CHECK_BASE_URL=http://127.0.0.1:5183` with `npm.cmd run check`: 70 routes,
  96 local assets and 3,284 internal links.
- `npm.cmd run audit:upload`: no findings.
- `git diff --check`: no whitespace errors.
- New-page links: 15 unique external URLs and 34 unique local URLs returned 200.
- Headless Chrome: all ten pages at 1440×1000, 390×844 and 320×812;
  30 cases passed. Checked image loading, document overflow, single H1,
  canonical/indexing metadata, language-pair targets and breadcrumbs.
- At 390 px, checked mobile menu open/close, SolidCraft entry visibility and the
  language-switch target. Full-page screenshots were saved for both locales at
  desktop and mobile widths and selected screenshots visually reviewed.

Task-local evidence and verification scripts live under `.local/solidcraft/`;
they are ignored by Git. The public model artifacts, screenshots and this report
are included in the working-tree deliverable.

## Primary references

- https://github.com/bherbruck/solidcraft/releases/tag/v0.12.0
- https://github.com/bherbruck/solidcraft/blob/v0.12.0/docs/mcp.md
- https://github.com/bherbruck/solidcraft/blob/v0.12.0/docs/compatibility.md
- https://bherbruck.github.io/solidcraft/guide/getting-started.html
- https://bherbruck.github.io/solidcraft/guide/sketching.html
- https://help.autodesk.com/view/fusion360/ENU/
