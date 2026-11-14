# Main platform editorial presentation coverage

Implementation: `preview-v2/sections.css`.

This is an additive presentation layer, opt-in through `html.vt-next`. Source HTML, text, datasets, identifiers, ordering, application state, existing controls and persistence are not rewritten. The stylesheet does not introduce `display:none`, remove tab states, intercept clicks or write content. No dependencies are added.

## Component coverage

| Existing section / area | Presentation treatment | Verification state at handoff |
|---|---|---|
| `about` | Editorial title, restrained framing and spacing for the original slide images; original aspect ratios retained | Source selectors inspected; image interiors intentionally remain original |
| `directorate` | Mission spread, strategic row list, organization chart, workforce hierarchy and employee distribution bars | Source HTML/CSS inspected; browser review assigned to integration owner |
| `methodology` | Framed institutional question, customer cycle, five pillar panels, application steps, journey and roadmap | Original order and labels retained; mobile cycle stacks at 480 px |
| `practices` | Five practice families, category count hierarchy, readable lists with location labels | Dynamically rendered source inspected; no generated item edited |
| `operational-plan` | Locked entry panel plus source-defined planning KPI, goal cards, milestones and modal typography | Inner content is encrypted in the deployed baseline; visual verification after authorized unlock remains required |
| `work-tracker` | Locked entry panel plus source-defined summary, departmental rows and kanban typography | Inner content is encrypted; detailed standalone board styled by linked-experiences contributor |
| `risk-register` | Severity summary, expandable dossiers, original inherent/residual values, detail grids | Original details/open state preserved |
| `tajawob` | Request summary, request types, process, annual comparison, challenge records, monthly table and response-guide entry | Source values and rates preserved; external response-guide site is outside repository scope |
| `committees` | Locked entry panel plus source-defined committee cards, statuses and metadata | Inner content is encrypted; no bypass attempted |
| `projects` | Existing filters, future project groups, status-led project portfolio, original detail modal | Existing filter/data handlers unchanged |
| `community-line` | Result spread, four impact figures, original roadmap and events, three community paths | Existing numeric values and decorative source meters unchanged |
| `media-center` | Editorial hero, three mixed-format summary items, report-cover catalog and downloads | Text labels receive a smaller scale than count figures; linked file content unchanged |
| `service-achievements` | Honor count, compact achievement record cards, source/issuer details | Existing achievements and counts unchanged |
| `recognitions` | Recognition hero, filter toolbar, catalog and issuer marks | Existing search/filter controls unchanged; external logo availability not fixed in presentation layer |
| `achievements` | Certification spread, ISO badges, original timeline and community evidence | All original content retained |
| Main Communications integration | Shadow-root style layer covers `intro`, `strategy`, `channels`, `community`, `performance`, `coordination`, and its pager | Must inject this stylesheet within open shadow root and set `data-vt` on its host |
| Project detail modal | Existing details, document-link editor spacing and readable fields | Modal behavior untouched; generic modal/forms owned by integration shell |

## Integration requirement for Communications

`communications/integrated.js` attaches an open shadow root to `#communications-app`. Global document CSS cannot cross this boundary. On the existing `spf:communications-ready` event (or after detecting a ready shadow root), add `data-vt="true"` to the host and a stylesheet link to `sections.css` within that shadow root. Do not alter or remount the original component. Styles are scoped with `:host([data-vt])`; the outer document selectors remain inactive inside it. The shadow stylesheet should be loaded after the source styles.

## Responsive and accessibility intent

- Explicit editorial adjustments at 1100, 760 and 480 px; the communications subtree has its own 1000/640 px rules.
- Mixed text and numeric KPIs have separate scales; no forced common tall card height.
- Original interactive button labels and click targets remain intact. Targets in scoped controls are at least 42–46 px high.
- Focus uses a visible gold outline within the communications shadow root; root shell supplies global focus styling.
- Reduced motion disables communications animations and added hover transforms.
- All original data-bearing conic/bar visuals remain data-driven. This stylesheet does not invent values or new chart series.

## Static checks

- Balanced CSS braces.
- No `display:none`, `pointer-events` or `user-select` overrides.
- All rules opt in through `html.vt-next` or the communications host marker.
- No source text, data JSON, JavaScript, storage or protection file changed by this contributor.
- Full cross-device and interaction verification must be recorded by the integration browser pass; this document does not assert those checks have passed.
