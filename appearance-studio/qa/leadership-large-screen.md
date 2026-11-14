# Large-screen leadership preview

Scope: leadership.html and its presentation shell only. Main platform content, metrics, order, editing, data sources and production deployment are unchanged.

- A 1280 CSS-pixel logical content canvas expands proportionally for wider displays: 1.5× at 1920px and 3× at 3840px. At widths below 1280px the existing responsive layout remains active. Scaling the existing iframe preserves its content and scroll interaction; no slide is rebuilt.
- Header and footer remain grid rows outside the scrollable iframe. Compact controls replace the previous tall navigation bands, and the redundant footer instruction line is removed.
- Fullscreen hides the contents selector, restores it on browser exit, and retains previous/next and keyboard navigation. Unsupported browsers receive an in-window presentation mode with an accessible status notice; this is not native fullscreen.
- Institutional colors, gold logo, presentation title and subtitle are preserved.

Validation: JavaScript syntax and whitespace checks; local asset reference audit; preservation of published private-tab encryption; DOM-contract checks for all 17 chapters, 390/1280/1920/3840 widths, fullscreen enter/exit/Escape/rejection, retained chapter and keyboard navigation.

Limit: browser automation is unavailable in this session, so no new rendered screenshots or real-browser visual/fullscreen verification were performed. A physical 85-inch display has not been tested. Verify readability from the last audience row, actual output resolution and screen overscan during rehearsal. Preview is separate from production and awaits review.
