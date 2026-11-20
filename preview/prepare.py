"""Build an isolated preview from the deployed release, without touching deployment workflows."""
from pathlib import Path
from urllib.request import urlopen, Request
from urllib.parse import urljoin, urlsplit, unquote, quote
from concurrent.futures import ThreadPoolExecutor
import shutil, re, json, hashlib

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / 'dist'
BASE = 'https://customerservices2040.github.io/spf-customer-services/legacy/'
DIST.mkdir(exist_ok=True)
shutil.copytree(ROOT / 'overrides', DIST, dirs_exist_ok=True)

def fetch(path):
    target = DIST / unquote(path)
    if target.is_file(): return
    target.parent.mkdir(parents=True, exist_ok=True)
    with urlopen(Request(urljoin(BASE,quote(path,safe='/%')),headers={'User-Agent':'Busola-Visual-Review'}),timeout=90) as r:
        target.write_bytes(r.read())

snapshot = ROOT / 'preview' / 'baseline.html'
if not snapshot.exists():
    with urlopen(BASE,timeout=90) as r: snapshot.write_bytes(r.read())
html = snapshot.read_text()
paths = set(re.findall(r'(?:src|href)=["\']([^"\'#?]+)',html))
paths = {p for p in paths if not urlsplit(p).scheme and not p.startswith('/') and '.' in p.rsplit('/',1)[-1]}
paths |= {'assets/data.js','assets/excel-import.js','assets/exhibition.css','assets/spf-logo.png','assets/release.json',
    'assets/channels/oman-governorates.png','assets/oman-governorates-map.png','assets/model-branch-poster.jpg',
    'assets/model-branch.mp4','assets/قالب تحديث منصة خدمات المتعاملين.xlsx'}
with ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(fetch, sorted(paths)))
shutil.copy2(ROOT/'communications/integrated.js',DIST/'assets/communications.js')
data=(DIST/'assets/data.js').read_text()
extra=set(re.findall(r'["\'](assets/[^"\']+\.(?:png|jpg|jpeg|svg|webp))["\']',data))
with ThreadPoolExecutor(max_workers=8) as pool: list(pool.map(fetch,sorted(extra)))
isolated=html.replace('<head>','<head>\n<script src="assets/review-isolation.js"></script>')
(DIST/'before.html').write_text(isolated)
enhanced=isolated.replace('</head>','<link rel="stylesheet" href="assets/visual-pilot.css?v=1">\n</head>')
enhanced=enhanced.replace('</body>','<script src="assets/visual-pilot.js?v=1"></script>\n</body>')
(DIST/'index.html').write_text(enhanced)
for name in ['visual-pilot.css','visual-pilot.js']: shutil.copy2(ROOT/'preview'/name,DIST/'assets'/name)
shutil.copy2(ROOT/'preview/isolation.js',DIST/'assets/review-isolation.js')
if (ROOT/'preview/review.html').exists():shutil.copy2(ROOT/'preview/review.html',DIST/'review.html')
(DIST/'preview-provenance.json').write_text(json.dumps({'source':BASE,'source_sha':'fcd2fe2f350c33af119c7909cd0c0dc6d73cfba4','baseline_sha256':hashlib.sha256(snapshot.read_bytes()).hexdigest()},indent=2))
print(f'Preview prepared: {DIST}; {len(paths|extra)} remote references retained')
