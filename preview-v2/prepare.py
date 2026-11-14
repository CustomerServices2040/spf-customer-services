"""Build a complete isolated visual review; original content and application logic are retained; report motion is audited separately."""
from pathlib import Path
import runpy,re,shutil,json,hashlib,subprocess
ROOT=Path(__file__).resolve().parents[1]
runpy.run_path(str(ROOT/'preview/prepare.py'))
D=ROOT/'dist'; V=ROOT/'preview-v2'
assets=D/'assets/vt';assets.mkdir(parents=True,exist_ok=True)
for p in V.glob('*.css'):shutil.copy2(p,assets/p.name)
for p in V.glob('*.js'):shutil.copy2(p,assets/p.name)
# Every injected asset is retained by the original secure-tab source snapshot.
def decorate(html,page,styles):
 html=re.sub(r'<html\b',f'<html class="vt-next" data-vt-page="{page}"',html,count=1)
 injection='<script src="/assets/review-isolation.js"></script>\n'+''.join(f'<link rel="stylesheet" href="/assets/vt/{s}">\n' for s in styles)+'<script defer src="/assets/vt/experience.js"></script>\n'
 return re.sub(r'<head\b([^>]*)>',lambda m:m.group(0)+'\n'+injection,html,count=1)
main=(ROOT/'preview/baseline.html').read_text()
(D/'pilot.html').write_text((D/'index.html').read_text())
(D/'index.html').write_text(decorate(main,'main',['foundation.css','performance.css','executive.css','geography.css','sections.css']))
linked={
'forum/index.html':'forum','forum/join.html':'forum-join','forum/facilitator.html':'forum-facilitator',
'assets/work-tracker.html':'work-tracker','reports/dakhiliyah-june-2026.html':'dakhiliyah'}
for relative,page in linked.items():
 raw=(ROOT/'overrides'/relative).read_text()
 file=D/relative
 file.with_name(file.stem+'-before.html').write_text(raw.replace('<head>','<head><script src="/assets/review-isolation.js"></script>',1))
 file.write_text(decorate(raw,page,['foundation.css','linked.css']))
report=D/'reports/dakhiliyah-june-2026.html'
subprocess.run(['node',str(V/'report-motion.js'),str(report),str(report),'/assets/vt/report-motion.js'],check=True)
shutil.copy2(str(report)+'.motion-audit.json',ROOT/'docs/visual-transformation/report-motion-audit.json')
if (V/'review.html').exists():shutil.copy2(V/'review.html',D/'review.html')
review=D/'review-assets-v2';review.mkdir(exist_ok=True)
for p in (ROOT/'docs/visual-transformation').glob('*'):
 if p.suffix.lower() in {'.jpg','.png','.json','.md'}:shutil.copy2(p,review/p.name)
print('Full visual build ready. Original data/security unchanged; standalone report motion audited separately.')
