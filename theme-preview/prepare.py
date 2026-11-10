from pathlib import Path
import shutil,re
R=Path(__file__).resolve().parents[1];D=R/'dist';P=R/'theme-preview'

from urllib.request import urlopen
from urllib.parse import urljoin,quote,urlsplit,unquote
from concurrent.futures import ThreadPoolExecutor
D.mkdir(exist_ok=True)
def fetch(path):
 target=D/unquote(path)
 if target.exists():return
 target.parent.mkdir(parents=True,exist_ok=True)
 with urlopen(urljoin('https://customerservices2040.github.io/spf-customer-services/legacy/',quote(path,safe='/%')),timeout=90) as response:target.write_bytes(response.read())

shutil.copytree(R/'overrides',D,dirs_exist_ok=True)
shutil.copy2(R/'communications/integrated.js',D/'assets/communications.js')
paths=set(re.findall(r'(?:src|href)=["\']([^"\'#?]+)',(P/'baseline.html').read_text()))
paths={x for x in paths if not urlsplit(x).scheme and not x.startswith('/') and '.' in x.rsplit('/',1)[-1]}
paths|={'assets/data.js','assets/excel-import.js','assets/exhibition.css','assets/spf-logo.png','assets/release.json','assets/channels/oman-governorates.png','assets/oman-governorates-map.png','assets/model-branch-poster.jpg','assets/model-branch.mp4','assets/قالب تحديث منصة خدمات المتعاملين.xlsx'}
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(fetch,sorted(paths)))
extra=set(re.findall(r'["\'](assets/[^"\']+\.(?:png|jpg|jpeg|svg|webp))["\']',(D/'assets/data.js').read_text()))
with ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(fetch,sorted(extra)))

for f in ['themes.css','themes.js','isolation.js']:shutil.copy2(P/f,D/'assets'/f)
files={'index.html':P/'baseline.html','forum/index.html':R/'overrides/forum/index.html','forum/join.html':R/'overrides/forum/join.html','forum/facilitator.html':R/'overrides/forum/facilitator.html','assets/work-tracker.html':R/'overrides/assets/work-tracker.html','reports/dakhiliyah-june-2026.html':R/'overrides/reports/dakhiliyah-june-2026.html'}
for i,(dest,src) in enumerate(files.items()):
 raw=src.read_text();base=raw.replace('<head>','<head><script src="/assets/isolation.js"></script>',1)
 raw=re.sub(r'<html', '<html data-bt-page="'+dest+'"',raw,count=1)
 out=re.sub(r'(<head[^>]*>)',r'\1<script src="/assets/isolation.js"></script><link rel="stylesheet" href="/assets/themes.css"><script src="/assets/themes.js"></script>',raw,count=1)
 compiled='compiled-main.css' if i==0 else 'compiled-linked-'+str(i-1)+'.css'
 shutil.copy2(P/compiled,D/'assets'/compiled)
 out=out.replace('</head>','<link rel="stylesheet" href="/assets/'+compiled+'"><link rel="stylesheet" href="/assets/themes.css"></head>')
 (D/dest).write_text(out);(D/dest.replace('.html','-original.html')).write_text(base)
print('Built six theme-enabled entrypoints; original source files untouched')

shutil.copy2(P/'review.html',D/'theme-review.html')

shutil.copytree(R/'docs/multi-theme',D/'theme-evidence',dirs_exist_ok=True)
