"""Uniform report cards and source-backed governorate recognition catalog."""
import html
import json
import re
from pathlib import Path


def update_media_catalog(text):
    e = html.escape
    start = text.index('          <div class="media-shelf">')
    end = text.index('          <div class="media-flow-v2">', start)
    old = text[start:end]
    cards = []
    for article in re.findall(r'<article\b.*?</article>', old, re.S):
        href = re.search(r'href="(reports/[^\"]+\.pdf)"', article).group(1)
        img = re.search(r'<img[^>]+>', article).group(0)
        period = re.search(r'<small>(.*?)</small>', article).group(1)
        title = re.search(r'<h[34]><a[^>]*>(.*?)</a></h[34]>', article).group(1)
        quarter = re.search(r'<strong>(.*?)</strong>', article)
        if quarter:
            title += ' · ' + quarter.group(1)
        details = re.search(r'<details>.*?</details>', article, re.S)
        ppt = re.search(r'<a href="reports/[^\"]+\.pptx"[^>]*>.*?</a>', article)
        cards.append(f'<article class="catalog-report"><a class="catalog-cover" href="{href}" target="_blank" rel="noopener">{img}<span>قراءة التقرير ↗</span></a><div class="catalog-report-body"><small>{period}</small><h3>{title}</h3><a class="catalog-open" href="{href}" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a>{ppt.group(0) if ppt else ""}{details.group(0) if details else ""}</div></article>')
    rows = json.loads((Path(__file__).resolve().parents[1] / 'overrides/assets/recognitions.json').read_text())['records']
    govs = sorted({r['governorate'] for r in rows if r['governorate']})
    years = sorted({r['year'] for r in rows}, reverse=True)
    awards = []
    for r in rows:
        kind = 'درع وشهادة' if 'درع' in r['description'] and 'شهادة' in r['description'] else 'درع' if 'درع' in r['description'] else 'شهادة' if 'شهادة' in r['description'] else 'تكريم'
        gov = r['governorate'] or 'غير محددة في المصدر'
        awards.append(f'<article class="recognition-card" data-governorate="{e(gov)}" data-year="{e(r["year"])}" data-source-row="{r["sourceRow"]}"><header><span class="recognition-icon" aria-hidden="true">✧</span><span>{kind}</span><time>{e(r["year"])}</time></header><h4>{e(gov)}</h4><p>{e(r["description"])}</p><footer><span>الجهة المانحة</span><strong>{e(r["issuer"] or "غير مذكورة في المصدر")}</strong></footer></article>')
    def options(values):
        return ''.join(f'<option value="{e(v)}">{e(v)}</option>' for v in values)
    recognition = f'''<section class="recognition-catalog" aria-labelledby="recognitionTitle">
      <div class="recognition-heading"><div><span class="media-eyebrow">الإنجازات والشهادات</span><h3 id="recognitionTitle">أثرٌ يستحق التقدير</h3><p>سجل تكريم دوائر الحماية الاجتماعية في المحافظات، وشهادات تقدير جهودها وشراكاتها.</p></div><div class="recognition-total"><strong>{len(rows)}</strong><span>سجل تكريم وشهادة</span></div></div>
      <div class="recognition-filters"><label>البحث<input id="recognitionSearch" type="search" placeholder="ابحث في الإنجاز أو الجهة المانحة…"></label><label>المحافظة<select id="recognitionGovernorate"><option value="">جميع المحافظات</option>{options(govs)}<option>غير محددة في المصدر</option></select></label><label>السنة<select id="recognitionYear"><option value="">جميع السنوات</option>{options(years)}</select></label><button id="recognitionReset" type="button">مسح التصفية</button></div>
      <p id="recognitionCount" role="status" aria-live="polite">عرض {len(rows)} من {len(rows)} سجلًا</p><div class="recognition-grid">{''.join(awards)}</div><p id="recognitionEmpty" hidden>لا توجد نتائج مطابقة. جرّب كلمة أخرى أو غيّر التصفية.</p><p class="recognition-source">المصدر: سجل الشهادات والإنجازات في المحافظات · 2024–2026. السجلات معروضة كما وردت في الملف، وقد تتشابه بعض بنود التكريم.</p></section>'''
    return text[:start] + '<div class="catalog-heading"><h3>التقارير والإصدارات</h3><p>جميع الإصدارات في مكتبة واحدة</p></div><div class="report-catalog">' + ''.join(cards) + '</div>' + recognition + text[end:]
