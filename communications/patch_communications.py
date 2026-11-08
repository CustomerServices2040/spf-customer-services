"""Add the communications presentation as one main tab with internal tabs."""
from pathlib import Path
import os
import re
import sys

target = Path(sys.argv[1])
html = target.read_text(encoding="utf-8")
revision = os.environ.get("GITHUB_SHA", "local-preview")[:12]

nav = re.search(
    r'(<nav\b[^>]*class="[^"]*\btop-navigation\b[^"]*"[^>]*>)(.*?)(</nav>)',
    html, re.S
)
if not nav or 'href="#communications"' in nav.group(0):
    raise SystemExit("Could not safely add communications navigation")
new_nav = nav.group(1) + nav.group(2) + (
    '\n        <a href="#communications">التواصل والإعلام</a>\n'
) + nav.group(3)
html = html[:nav.start()] + new_nav + html[nav.end():]

closing = html.rfind("</main>")
if closing < 0 or html.count('id="communications"'):
    raise SystemExit("Could not safely add communications section")
section = (
    '\n<section class="section-block" id="communications" '
    'aria-label="دائرة التواصل والإعلام">'
    '<div id="communications-app"><p>جارٍ تحميل العرض…</p></div>'
    '</section>\n'
)
html = html[:closing] + section + html[closing:]

ux_script = f'<script src="assets/ux-system.js?v={revision}"></script>'
if ux_script not in html:
    raise SystemExit("Unified UX script anchor missing")
html = html.replace(
    ux_script,
    f'<script src="assets/communications.js?v={revision}"></script>\n  '
    + ux_script, 1
)
target.write_text(html, encoding="utf-8")
