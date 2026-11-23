from pathlib import Path
import json,html
R=Path(__file__).resolve().parents[1]; V=R/'preview-v2'
base=json.loads((R/'docs/visual-pilot/chapter-audit.json').read_text())
items=[{'id':x['id'],'title':x['title'],'after':'index.html#'+x['id'],'before':'before.html#'+x['id']} for x in base]
items += [{'id':key,'title':title,'after':url,'before':url.replace('.html','-before.html')} for key,title,url in [
 ('forum','ملتقى دوائر المحافظات','forum/index.html'),('join','المشاركة في الملتقى','forum/join.html'),('facilitator','إدارة جلسة الملتقى','forum/facilitator.html'),('tasks','اللوحة التفصيلية للأعمال','assets/work-tracker.html'),('dakhiliyah','تقرير محافظة الداخلية','reports/dakhiliyah-june-2026.html')]]
family={'about':'عرض الشرائح ومقدمة القسم','overview':'تكوين تحريري، قوس الهوية وشريط مؤشرات متنوع','performance':'نتيجة رئيسية، مقارنات نصفية، مصادر ومؤشرات تشغيلية','channels':'شبكة قنوات، خريطة بارزة ولوحة محافظة','coverage':'تغطية رئيسية وأشرطة بيانات وشبكة وصول','contact-center':'نتائج ومخططات شهرية وقدرات المركز','directorate':'مهمة وهيكل وكوادر','methodology':'مركزية العميل، دورة الخدمة والمراحل','projects':'مشاريع ومراحل وتفاصيل','communications':'الهوية والمكونات داخل ستة تبويبات فرعية','forum':'ستة تبويبات، خرائط وتوجهات وممارسات وحوارات','tasks':'أربعة تبويبات، فلاتر وجداول ونماذج','join':'نموذج الدخول والإجابة','facilitator':'إدارة الجلسة والمشاركات','dakhiliyah':'صفحات التقرير ومعارضه وأدواته'}
checks={}
report=R/'docs/visual-transformation/browser-checks.json'
if report.exists():
 try:checks=json.loads(report.read_text()).get('summary',{})
 except:pass
rows=''
for item in items:
 key=item['id']; status=checks.get(key,'تم تطبيق التصميم؛ يجري فحص الواجهة')
 if key in ['operational-plan','work-tracker','committees']: status='واجهة الحماية محفوظة؛ المكونات الداخلية مشمولة بالقواعد ولم تُفتح لاختبارها'
 if key in ['join','facilitator']:status='الواجهة مشمولة؛ تشغيل الخدمة الحية غير مختبر'
 rows+=f'<tr><td>{html.escape(item["title"])}</td><td>{html.escape(family.get(key,"بطاقات ومحتوى وعناوين وأدوات القسم"))}</td><td>{html.escape(status)}</td></tr>'
pairs=''
for key,title in [('overview','نظرة عامة'),('performance','الأداء والمؤشرات'),('geography','المحافظات'),('projects','المشاريع'),('communications','التواصل والإعلام'),('forum','ملتقى دوائر المحافظات'),('tasks','اللوحة التفصيلية للأعمال')]:
 if (R/f'docs/visual-transformation/{key}-after.jpg').exists():
  pairs+=f'<h2>{title}</h2><div class="pairs">'+''.join(f'<figure><figcaption>{label}</figcaption><img loading="lazy" src="review-assets-v2/{key}-{ver}.jpg" alt="{title} {label}"></figure>' for ver,label in [('before','قبل'),('after','بعد')])+'</div>'
s=(V/'review-template.html').read_text().replace('__OPTIONS__',''.join(f'<option value="{x["id"]}"'+(' selected' if x['id']=='overview' else '')+f'>{html.escape(x["title"])}</option>' for x in items)).replace('__PAGES__',json.dumps({x['id']:x for x in items},ensure_ascii=False)).replace('__ROWS__',rows).replace('__PAIRS__',pairs)
(V/'review.html').write_text(s)
print('Review built:',len(items),'entrypoints')
