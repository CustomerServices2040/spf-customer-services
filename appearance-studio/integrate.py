"""Inject presentation assets into a built platform. No operational data changes."""
from pathlib import Path
import sys,os,shutil,re
ROOT=Path(__file__).resolve().parents[1]
site=Path(sys.argv[1]).resolve()
revision=os.environ.get('GITHUB_SHA','appearance-v1')[:12]
for name in ['themes.css','themes.js','contrast.js','appearance-studio.css','appearance-studio.js']:
 shutil.copy2(ROOT/'appearance-studio'/name,site/'assets'/name)

def links(s):
 s=re.sub(r'href="reports/community-communication-plan-2026.xlsx"\s+download="[^"]*"', 'href="reports/community-communication-plan-2026.html" target="_blank" rel="noopener"',s)
 s=s.replace('<small>Excel</small>','<small>لوحة تفاعلية</small>')
 s=s.replace('تحميل الخطة الكاملة','استعراض الخطة التفاعلية').replace('ملف Excel · خطة التواصل المجتمعي','لوحة تفاعلية · خطة التواصل المجتمعي')
 s=s.replace('<span>استعراض الخطة التفاعلية</span><small>لوحة تفاعلية</small>','<span data-edit-key="community.plan.dashboard.open">استعراض الخطة التفاعلية</span><small data-edit-key="community.plan.dashboard.format">لوحة تفاعلية</small>')
 s=re.sub(r'<span([^>]*)>استعراض الخطة التفاعلية</span>(?:<small[^>]*>لوحة تفاعلية</small>)?', r'<span\1>خطة التواصل المجتمعي</span>',s)
 return s
for page in [site/'index.html',site/'leadership.html',site/'assets/work-tracker.html',*list((site/'forum').glob('*.html')),*list((site/'reports').glob('*.html'))]:
 if not page.exists():continue
 s=links(page.read_text())
 if 'data-appearance-studio' in s:continue
 prefix=os.path.relpath(site/'assets',page.parent).replace('\\','/')+'/'
 css=''.join(f'<link data-appearance-studio rel="stylesheet" href="{prefix}{x}?v={revision}">' for x in ['themes.css','appearance-studio.css'])
 # Keep the existing UX assets last, as required by platform audit.
 match=re.search(r'<link[^>]+href="[^\"]*navigation-reliability.css[^\"]*"[^>]*>',s)
 if match:s=s[:match.start()]+css+s[match.start():]
 else:s=s.replace('</head>',css+'</head>')
 scripts='<script>window.BusolaAppearanceOwnsPicker=true;</script>'+''.join(f'<script defer data-appearance-studio src="{prefix}{x}?v={revision}"></script>' for x in ['contrast.js','themes.js','appearance-studio.js'])
 match=re.search(r'<script[^>]+src="[^\"]*ux-system.js[^\"]*"[^>]*>',s)
 if match:s=s[:match.start()]+scripts+s[match.start():]
 else:s=s.replace('</body>',scripts+'</body>')
 page.write_text(s)
print('Appearance Studio integrated:',site)
