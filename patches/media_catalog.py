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
    "buraimi": ("جامعة البريمي", "https://commons.wikimedia.org/wiki/Special:FilePath/%D8%AC%D8%A7%D9%85%D8%B9%D8%A9%20%D8%A7%D9%84%D8%A8%D8%B1%D9%8A%D9%85%D9%8A.png"),
    "nama": ("نماء لخدمات ظفار", "https://pbs.twimg.com/profile_images/1653667083610144768/5wHJcb05_400x400.jpg"),
    "oq": ("مجموعة أوكيو", "https://assets.oq.com/dist/images/content/html5/our-journey/2019_OQ.png?v=dc422a58d97048a26915c1fae838868a"),
    "mazoon": ("مزون للألبان", "https://omannews.gov.om/images/topics/pictures/topic65584.jpeg"),
    "spf": ("صندوق الحماية الاجتماعية", "assets/spf-logo.png"),
}


def issuer_identity(issuer):
    value = issuer or ""
    rules = [
        (r"عمل|مهنية", "labour"), (r"تنمية اجتماعية|التنمية الاجتماعية|الوفا|المرأة العمانية|إحسان", "social"),
        (r"صح|مستشفى|عمان للعلوم الصحية", "health"), (r"تربية|تعليم|مدرسة|كلية البريمي|معهد", "education"),
        (r"محافظ|والي|ولاية|الشورى", "interior"), (r"تجارة|صناعة|استثمار|منطقة حرة", "commerce"),
        (r"ثروة زراعية|سمكية|موارد الميا", "agriculture"), (r"بيئة", "environment"),
        (r"ثقافة|رياضة|رياضية|شباب|مجمع السلطان قابوس الشبابي", "culture"), (r"أوقاف|شؤون دينية", "awqaf"),
        (r"تراث|سياحة", "heritage"), (r"حماية المستهلك", "consumer"), (r"غرفة", "chamber"),
        (r"طيران مدني|الطيران المدني", "caa"), (r"مؤسسات الصغيرة والمتوسطة|رواد الأعمال", "commerce"),
        (r"التقنية|التطبيقية", "utas"), (r"جامعة ظفار", "dhofar"),
        (r"جامعة الشرقية", "sharqiyah"), (r"جامعة البريمي", "buraimi"),
        (r"نماء", "nama"), (r"OQ|أوكيو", "oq"),
        (r"مزون", "mazoon"), (r"خدمات المتعاملين|الشراكة ومؤسسات المجتمع المدني", "spf"),
        (r"بلدية", "interior"),
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

    def is_service_achievement(record):
        return bool(re.search(r"ك?[أا]فضل\s+(?:منفذ|منافذ)", record['description']))

    def award_cycle(record):
        translated = record['description'].translate(str.maketrans('٠١٢٣٤٥٦٧٨٩', '0123456789'))
        mentioned = re.findall(r'20\d{2}', translated)
        return mentioned[-1] if mentioned else record['year']

    raw_achievements = [r for r in rows if is_service_achievement(r)]
    recognition_rows = [r for r in rows if not is_service_achievement(r)]
    achievements = []
    achievement_keys = set()
    for record in sorted(raw_achievements, key=lambda item: (item['year'], item['sourceRow']), reverse=True):
        key = (record['governorate'], award_cycle(record))
        if key in achievement_keys:
            continue
        achievement_keys.add(key)
        achievements.append(record)

    govs = sorted({r['governorate'] for r in recognition_rows if r['governorate']})
    years = sorted({r['year'] for r in recognition_rows}, reverse=True)
    year_counts = Counter(r['year'] for r in recognition_rows)
    gov_counts = Counter(r['governorate'] or 'غير محددة في المصدر' for r in recognition_rows)
    top_governorates = gov_counts.most_common(3)
    awards = []
    for r in recognition_rows:
        kind = 'درع وشهادة' if 'درع' in r['description'] and 'شهادة' in r['description'] else 'درع' if 'درع' in r['description'] else 'شهادة' if 'شهادة' in r['description'] else 'تكريم'
        gov = r['governorate'] or 'غير محددة في المصدر'
        parent, logo = issuer_identity(r['issuer'])
        issuer = r['issuer'] or 'غير مذكورة في المصدر'
        fallback_letter = e(parent[:1] if parent != 'الجهة المانحة' else issuer[:1] if r['issuer'] else '—')
        logo_markup = f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span><img src="{logo}" alt="شعار {e(parent)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true">' if logo else f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span>'
        awards.append(f'<article class="recognition-card" data-governorate="{e(gov)}" data-year="{e(r["year"])}" data-source-row="{r["sourceRow"]}"><header><span class="recognition-kind">{kind}</span><time>{e(r["year"])}</time></header><div class="issuer-logo">{logo_markup}</div><h4>{e(gov)}</h4><p>{e(r["description"])}</p><footer><span>الجهة المانحة</span><strong>{e(issuer)}</strong></footer></article>')

    def options(values):
        return ''.join(f'<option value="{e(v)}">{e(v)}</option>' for v in values)

    achievement_cards = []
    for index, r in enumerate(achievements, start=1):
        gov = r['governorate'] or 'غير محددة في المصدر'
        parent, logo = issuer_identity(r['issuer'])
        issuer = r['issuer'] or 'غير مذكورة في المصدر'
        fallback_letter = e(parent[:1] if parent != 'الجهة المانحة' else issuer[:1] if r['issuer'] else '—')
        logo_markup = f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span><img src="{logo}" alt="شعار {e(parent)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.hidden=true">' if logo else f'<span class="issuer-monogram" aria-hidden="true">{fallback_letter}</span>'
        achievement_cards.append(f'''<article class="service-achievement-card" data-cycle="{award_cycle(r)}" data-source-row="{r['sourceRow']}">
          <header><span class="achievement-rank">{index:02d}</span><span class="achievement-trophy" aria-hidden="true">★</span><time>{award_cycle(r)}</time></header>
          <div class="achievement-branch"><div class="issuer-logo">{logo_markup}</div><div><small>فرع محافظة</small><h3>{e(gov)}</h3></div></div>
          <strong class="achievement-title">أفضل منفذ لتقديم الخدمة</strong><p>{e(r['description'])}</p>
          <footer><span>جهة التقييم والتكريم</span><b>{e(issuer)}</b></footer>
        </article>''')

    achievement_governorates = len({r['governorate'] for r in achievements if r['governorate']})
    cycle_years = sorted({award_cycle(r) for r in achievements})
    achievements_section = f'''<section class="section-block service-achievements-page" id="service-achievements" aria-labelledby="serviceAchievementTitle">
      <div class="achievement-hero">
        <div class="achievement-hero-copy"><span class="achievement-eyebrow">الإنجازات أولًا</span><h2 id="serviceAchievementTitle">منصات خدمة تتصدر محافظاتها</h2><p>سجل مستقل للدوائر والفروع التي نالت تقدير «أفضل منفذ لتقديم الخدمة»، بوصفه إنجازًا مؤسسيًا يتجاوز إطار الشهادة أو الدرع.</p><div class="achievement-cycles"><span>دورات التقييم</span><b>{' · '.join(cycle_years)}</b></div></div>
        <div class="achievement-total"><span>إنجازًا موثقًا</span><strong>{len(achievements)}</strong><small>بعد دمج السجلات المتكررة</small></div>
        <div class="achievement-reach"><span>حضور على مستوى المحافظات</span><strong>{achievement_governorates}</strong><small>محافظات حققت مراكز متقدمة</small><i><em style="width:{achievement_governorates / 11 * 100:.0f}%"></em></i></div>
      </div>
      <div class="achievement-section-heading"><div><span>سجل التميز</span><h3>أفضل منافذ تقديم الخدمة</h3></div><p>مرتبة من الأحدث، ويظهر كل استحقاق مرة واحدة.</p></div>
      <div class="service-achievement-grid">{''.join(achievement_cards)}</div>
      <p class="achievement-source">المصدر: سجل الشهادات والإنجازات في المحافظات. جرى فصل استحقاقات «أفضل منفذ لتقديم الخدمة» ودمج السجلات المكررة للاعتماد البصري.</p>
    </section>'''

    top_markup = ''.join(f'<li><span>{e(gov)}</span><strong>{count}</strong></li>' for gov, count in top_governorates)
    recognition = f'''<section class="section-block recognition-page" id="recognitions" aria-labelledby="recognitionTitle">
      <div class="recognition-hero">
        <div class="recognition-intro"><span class="recognition-kicker">سجل الشهادات والدروع</span><h2 id="recognitionTitle">تقديرٌ يوثّق الشراكة والأثر</h2><p>الشهادات والدروع والتكريمات الناتجة عن المشاركات والبرامج والشراكات المجتمعية، في سجل مستقل عن الإنجازات المؤسسية.</p><div class="recognition-years"><span><b>{year_counts['2026']}</b> في 2026</span><span><b>{year_counts['2025']}</b> في 2025</span><span><b>{year_counts['2024']}</b> في 2024</span></div></div>
        <div class="recognition-donut" style="--y26:{year_counts['2026'] / len(recognition_rows) * 100:.1f};--y25:{(year_counts['2026'] + year_counts['2025']) / len(recognition_rows) * 100:.1f}"><div><strong>{len(recognition_rows)}</strong><span>شهادة ودرع وتكريم</span></div></div>
        <div class="recognition-leaders"><span>الأكثر توثيقًا</span><ol>{top_markup}</ol></div>
      </div>
      <div class="recognition-filters"><label>البحث<input id="recognitionSearch" type="search" placeholder="ابحث في الإنجاز أو الجهة المانحة…"></label><label>المحافظة<select id="recognitionGovernorate"><option value="">جميع المحافظات</option>{options(govs)}<option>غير محددة في المصدر</option></select></label><label>السنة<select id="recognitionYear"><option value="">جميع السنوات</option>{options(years)}</select></label><button id="recognitionReset" type="button">مسح التصفية</button></div>
      <div class="recognition-results-head"><p id="recognitionCount" role="status" aria-live="polite">عرض {len(recognition_rows)} من {len(recognition_rows)} سجلًا</p><span>يمكن البحث باسم الجهة أو نص التكريم</span></div>
      <div class="recognition-grid">{''.join(awards)}</div><p id="recognitionEmpty" hidden>لا توجد نتائج مطابقة. جرّب كلمة أخرى أو غيّر التصفية.</p><p class="recognition-source">المصدر: سجل الشهادات والإنجازات في المحافظات · 2024–2026. يظهر الشعار المؤسسي المناسب عند توفره، وتُعرض السجلات كما وردت في المصدر.</p>
    </section>'''

    reports = '<div class="catalog-heading"><h3>التقارير والإصدارات</h3><p>جميع الإصدارات في مكتبة واحدة</p></div><div class="report-catalog">' + ''.join(cards) + '</div>' + flow + '</section>'
    return text[:start] + reports + achievements_section + recognition + text[media_close:]
