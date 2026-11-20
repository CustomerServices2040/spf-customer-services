# Busola visual reference audit — 10 November 2026

## Inspected evidence

- Read previous pilot report and CSS and visually inspected the four saved overview/performance before/after screenshots.
- Opened the user-supplied `الهوية المؤسسية.pptx` as an OOXML package. It contains 13 template slides. DIN Next LT Arabic appears in 182 font declarations; explicit colors include `CCA862` (30 declarations) and `3A564C` (27). This is evidence of the supplied template, not proof of a current complete brand manual.
- Extracted and viewed all embedded raster assets. `/workspace/scratch/7d973d4fab23/identity-audit/contact.jpg` is the review contact sheet. Source assets remain in that directory.
- Brand imagery uses interlocking broad ribbons/crescent sweeps, restrained green depth, gold, occasional lavender, grayscale Omani fort photography, and human/community photography integrated into the ribbon compositions. Content templates use calm white space and thin gold boundaries. These are stronger brand cues than arbitrary gradients or repeated glowing circles.

## Why the previous pilot can feel weaker

1. It reduces distinctive composition into four nearly identical white cards. Original overview alternates green, burgundy and light surfaces with clearer visual variety. The pilot improves cleanliness but loses some of that character.
2. The original coverage value sits in a distinctive burgundy arch. The pilot turns it into a generic translucent bordered rectangle. A revised composition should retain the signature architectural/curved brand character while reducing surrounding noise.
3. The pilot's performance lead is quieter, but its comparator is narrow, leaving a large quiet area in the green panel. The original comparison used more width. The next version should align the headline, main result and comparison into a deliberate editorial grid.
4. CSS uses 11–12 px for many metadata labels and 10 px for some ring labels. This is not strong executive presentation typography, especially on a large display viewed at distance. Aim for 13–14 px metadata on desktop, 15–17 px body, larger executive-mode scale where it does not overflow.
5. The `.vp-pilot` shell changes depending on whether one of two tabs is selected. This visibly breaks the platform's coherence. The complete version should keep one shell across all tabs, with section-specific content composition.
6. Prior improvement is concentrated in surfaces, typography, borders and spacing. It is limited proof of design craft and not evidence of transformation across the platform. Complete section families and comparisons should demonstrate the new scope.

## Recommended coherent direction

Institutional editorial style with a recognisable ribbon signature: deep green structural frame, warm white content fields, fine gold dividers, burgundy for the few results that must command attention. Use locally available Arabic font assets; don't embed unlicensed DIN files merely because the template names DIN.

- Reserve branded curved/ribbon backgrounds for chapter leads and major summary areas. Never place dense paragraphs or tables over complex imagery.
- Give content families different composition: open KPI strips, narrative information panels with editorial dividers, strong focal results, achievement plaques/media covers, tables with calm aligned rows, geographic map canvas and a clear selected-governorate panel, timeline rows for stage content.
- Maintain data and all existing text exactly; reveal hierarchy using scale, weight, spacing and backgrounds rather than rewording or dropping labels.
- Make maps visually central. Selected area should gain outline/contrast and its associated panel should have the same color cue; do not imply population/coverage values through shape scaling unless source data already supports that encoding.
- Motion: brief emphasis on entry and state changes, settle to stable content quickly. Do not animate every small card every time a user returns. Existing numeric engine should remain authoritative.
- The current repo and screenshot evidence justify native CSS/JS. Extra chart/motion libraries are not an art-direction solution by themselves.

## External reference access and specific takeaways

| Source | Access evidence | Useful takeaway and limits |
|---|---|---|
| https://www.instagram.com/spf_oman/ | Direct open failed with HTTP 429 | No claims about specific Instagram posts. |
| https://www.spf.gov.om/corporate-branding/ | Official indexed page found with logo, audio identity and guideline links | Confirms official branding resource exists. |
| https://www.spf.gov.om/wp-content/uploads/2026/04/SPF_Brand_Guidline_V2.pdf | Found through official search; direct fetch timed out; executor returned HTTP 503 | Not visually inspected; do not cite it as examined. Supplied PPTX is the actually inspected brand reference. |
| https://www.awwwards.com/websites/data-visualization/ | Page retrieved successfully | Curated examples connect interaction, visual storytelling and readable data. Reviewed listing/category text, not full browser behavior of every listed site. It is inspiration, not validation of a specific visual claim. |
| https://www.behance.net/gallery/248718253/Mapping-social-protection-systems | Full project description retrieved | WIEGO interactive four-page editorial/data visualization concept: useful precedent for varied editorial composition in the social-protection domain. No copying of content/artwork. |
| https://www.behance.net/gallery/86597239/UNICEFs-Social-Protection-Framework | Page retrieved; indexed images retrieved through image search | Observed consistent blue family, line icons, carefully bounded diagrams, and clear grouping across complex social-protection subject matter. Principle: visual variety with one grammar. No UNICEF data enters Busola. |
| https://www.figma.com/community/file/946837271092540314/gov-uk-design-system | Failed / robots restriction | Community file itself not inspected. |
| https://www.figma.com/resource-library/design-system-examples/ | Official Figma article successfully retrieved | Tokens, components, patterns and documentation; same foundations can support distinct component families. Used as official fallback to blocked Community content. |
| https://www.carbondesignsystem.com/building-blocks/data-visualization/overview | IBM Carbon official page successfully retrieved | Chart families separated by simple, flow and spatial purposes. Choose chart by communication goal, not by decoration. |
| https://designsystem.digital.gov/components/data-visualizations/ | USWDS official guidance successfully retrieved | Simple familiar chart types, consistent color roles, textual values/labels, key message available without hover, manual testing of meaning. |
| https://design-system.service.gov.uk/components/tabs/ | GOV.UK official guidance successfully retrieved | Related sections, active state and keyboard-accessible components. Preserve existing tab structure and behavior. |

## Practical acceptance evidence

Use same-size screenshots for overview, performance, geography, projects, media/communications, an information section, and at least one linked tool. Record tab-by-tab mobile overflow, heading/card clipping, focus state, locked-section limitations and function coverage. A numerical self-rating is not proof. Do not claim actual end-to-end save/publish verification if preview deliberately prevents writes to the official origin.

## Web reference IDs for parent reopening if final citations needed

- `turn2view1`: Awwwards data visualization listing.
- `turn4view1`: Behance Mapping social protection systems.
- `turn4view2`: Behance UNICEF Social Protection Framework.
- `turn5image0` / `turn5image1`: retrieved UNICEF project reference visuals.
- `turn6view0`: Figma official design system examples.
- `turn6view1`: Carbon overview.
- `turn4view0`: USWDS data visualizations.
- `turn3view2`: GOV.UK tabs.
- `turn1search0` / `turn1search7`: official SPF branding page / indexed guideline.

The parent must reopen/search sources before using subagent refs as final citations.
