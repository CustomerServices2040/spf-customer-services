"""Uniform report cards and a standalone source-backed recognition chapter."""
import html
import json
import re
from collections import Counter
from pathlib import Path


LOGOS = {
    "labour": ("وزارة العمل", "https://omannews.gov.om/images/topics/pictures/topic444281.png"),
    "social": ("وزارة التنمية الاجتماعية", "https://pbs.twimg.com/media/EN-mEM6WAAAeIgA.jpg"),
    "health": ("وزارة الصحة", "https://www.moh.gov.om/media/kvpb5xtu/moh-logo-2.png"),
    "education": ("وزارة التربية والتعليم", "https://alkhaleej-services.net/user_images/news/OMAN-MOI.jpg"),
    "interior": ("وزارة الداخلية", "https://dalilak-inv.com/images/articles/1639236886054425600.jpg"),
    "commerce": ("وزارة التجارة والصناعة وترويج الاستثمار", "https://omannews.gov.om/images/topics/pictures/topic864566.jpg"),
    "agriculture": ("وزارة الثروة الزراعية والسمكية وموارد المياه", "https://d1oi3s9sr6ymrv.cloudfront.net/wp-content/uploads/2023/06/19100005/image0.jpeg"),
    "environment": ("هيئة البيئة", "https://shabiba.eu-central-1.linodeobjects.com/2025/10/1759291776-1759291776-19jfggpgnzal.JPG"),
    "culture": ("وزارة الثقافة والرياضة والشباب", "https://mcsy.gov.om/og-image.png"),
    "awqaf": ("وزارة الأوقاف والشؤون الدينية", "https://www.mara.gov.om/uploadsall/News/ebafaad2-c171-42e9-b0e2-3eddf2bee2be.JPG"),
    "heritage": ("وزارة التراث والسياحة", "https://mwasalat.om/Uploads/Partners/8e76909a-4834-4fd1-b18b-b1b5a7aa09ca4784018a-4f80-48d4-bef6-3df3cb6f96a4.jpg"),
    "consumer": ("هيئة حماية المستهلك", "https://alkhaleej-services.net/user_images/news/channels4_profile%283%29.jpg"),
    "chamber": ("غرفة تجارة وصناعة عُمان", "https://gov.om/documents/20117/580035/Oman%2BChamber%2Bof%2BCommerce%2Band%2BIndustry.png/3aea088c-8a47-3ee3-7cde-6fc096cd0d53?download=true&amp;objectDefinitionExternalReferenceCode=7b52014f-8590-d13a-8d09-9509908e8896&amp;objectEntryExternalReferenceCode=f8737ce5-df35-507a-4729-1b8b55031cd3&amp;t=1740291843528&amp;version=1.0"),
    "caa": ("هيئة الطيران المدني", "https://www.caa.gov.om/site/images/logos/logoicon.png?v=1"),
    "utas": ("جامعة التقنية والعلوم التطبيقية", "https://i0.wp.com/ksalogo.com/wp-content/uploads/2025/01/University-of-Technology-and-Applied-Sciences-01.png?fit=1000%2C1000&amp;ssl=1"),
    "dhofar": ("جامعة ظفار", "https://pbs.twimg.com/profile_images/1599460575788105729/Nx4owTPw.jpg"),
    "sharqiyah": ("جامعة الشرقية", "https://vectorseek.com/wp-content/uploads/2025/01/ASharqiyah-University-Logo-Vector.svg-.png"),
}


def issuer_identity(issuer):
    value = issuer or ""
    rules = [
        (r"عمل|مهنية", "labour"), (r"تنمية اجتماعية|التنمية الاجتماعية|الوفا|المرأة العمانية|إحسان", "social"),
        (r"صح|مستشفى|عمان للعلوم الصحية", "health"), (r"تربية|تعليم|مدرسة|كلية البريمي|معهد", "education"),
        (r"محافظ|والي|ولاية|الشورى", "interior"), (r"تجارة|صناعة|استثمار|منطقة حرة", "commerce"),
        (r"ثروة زراعية|سمكية|موارد الميا", "agriculture"), (r"بيئة", "environment"),
        (r"ثقافة|رياضة|شباب|مجمع السلطان قابوس الشبابي", "culture"), (r"أوقاف|شؤون دينية", "awqaf"),
        (r"تراث|سياحة", "heritage"), (r"حماية المستهلك", "consumer"), (r"غرفة", "chamber"),
        (r"طيران مدني|الطيران المدني", "caa"), (r"مؤسسات الصغيرة والمتوسطة|رواد الأعمال", "commerce"),
        (r"التقنية|التطبيقية", "utas"), (r"جامعة ظفار", "dhofar"),
        (r"جامعة الشرقية", "sharqiyah"),
    ]
    for pattern, key in rules:
        if re.search(pattern, value):
            return LOGOS[key]
    return ("الجهة المانحة", "")


def update_media_catalog(text):
    e = html.escape
    start = text.index('          <div class="media-shelf">')
    flow_start = text.index('          <div class="media-flow-v2">', start)
    media_close = text.index('</section>', flow_start) + len('</section>')
    old = text[start:flow_start]
    flow = text[flow_start:media_close - len('</section>')]
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
    year_counts = Counter(r['year'] for r in rows)
    gov_counts = Counter(r['governorate'] or 'غير محددة في المصدر' for r in rows)
    top_governorates = gov_counts.most_common(3)
    awards = []
    for r in rows:
        kind = 'درع وشهادة' if 'درع' in r['description'] and 'شهادة' in r['description'] else 'درع' if 'درع' in r['description'] else 'شهادة' if 'شهادة' in r['description'] else 'تكريم'
        gov = r['governorate'] or 'غير محددة في المصدر'
        parent, logo = issuer_identity(r['issuer'])
        issuer = r['issuer'] or 'غير مذكورة في المصدر'
        parent_note = f'<small>الجهة الأم: {e(parent)}</small>' if issuer != parent and parent != 'الجهة المانحة' else ''
        fallback_letter = e(parent[:1] if parent != 'الجهة المانحة' else issuer[:1] if r['issuer'] else '—')
        logo_markup = f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span><img src="{logo}" alt="شعار {e(parent)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true">' if logo else f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span>'
        awards.append(f'<article class="recognition-card" data-governorate="{e(gov)}" data-year="{e(r["year"])}" data-source-row="{r["sourceRow"]}"><header><span class="recognition-kind">{kind}</span><time>{e(r["year"])}</time></header><div class="issuer-logo">{logo_markup}</div><h4>{e(gov)}</h4><p>{e(r["description"])}</p><footer><span>الجهة المانحة</span><strong>{e(issuer)}</strong>{parent_note}</footer></article>')

    def options(values):
        return ''.join(f'<option value="{e(v)}">{e(v)}</option>' for v in values)

    top_markup = ''.join(f'<li><span>{e(gov)}</span><strong>{count}</strong></li>' for gov, count in top_governorates)
    recognition = f'''<section class="section-block recognition-page" id="recognitions" aria-labelledby="recognitionTitle">
      <div class="recognition-hero">
        <div class="recognition-intro"><span class="recognition-kicker">سجل التقدير المؤسسي</span><h2 id="recognitionTitle">إنجازاتٌ تصنع الأثر</h2><p>محطات تقدير توثّق حضور دوائر الحماية الاجتماعية وشراكاتها في مختلف محافظات سلطنة عُمان.</p><div class="recognition-years"><span><b>{year_counts['2026']}</b> في 2026</span><span><b>{year_counts['2025']}</b> في 2025</span><span><b>{year_counts['2024']}</b> في 2024</span></div></div>
        <div class="recognition-donut" style="--y26:{year_counts['2026'] / len(rows) * 100:.1f};--y25:{(year_counts['2026'] + year_counts['2025']) / len(rows) * 100:.1f}"><div><strong>{len(rows)}</strong><span>تكريمًا وشهادة</span></div></div>
        <div class="recognition-leaders"><span>الأكثر توثيقًا</span><ol>{top_markup}</ol></div>
      </div>
      <div class="recognition-filters"><label>البحث<input id="recognitionSearch" type="search" placeholder="ابحث في الإنجاز أو الجهة المانحة…"></label><label>المحافظة<select id="recognitionGovernorate"><option value="">جميع المحافظات</option>{options(govs)}<option>غير محددة في المصدر</option></select></label><label>السنة<select id="recognitionYear"><option value="">جميع السنوات</option>{options(years)}</select></label><button id="recognitionReset" type="button">مسح التصفية</button></div>
      <div class="recognition-results-head"><p id="recognitionCount" role="status" aria-live="polite">عرض {len(rows)} من {len(rows)} سجلًا</p><span>يمكن البحث باسم الجهة أو نص الإنجاز</span></div>
      <div class="recognition-grid">{''.join(awards)}</div><p id="recognitionEmpty" hidden>لا توجد نتائج مطابقة. جرّب كلمة أخرى أو غيّر التصفية.</p><p class="recognition-source">المصدر: سجل الشهادات والإنجازات في المحافظات · 2024–2026. يظهر شعار الجهة المانحة أو الجهة الحكومية الأم عند توفره، وتُعرض السجلات كما وردت في المصدر.</p>
    </section>'''

    reports = '<div class="catalog-heading"><h3>التقارير والإصدارات</h3><p>جميع الإصدارات في مكتبة واحدة</p></div><div class="report-catalog">' + ''.join(cards) + '</div>' + flow + '</section>'
    return text[:start] + reports + recognition + text[media_close:]
