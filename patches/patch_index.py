from pathlib import Path
import os
import re
import sys


path = Path(sys.argv[1])
text = path.read_text(encoding="utf-8")


def replace_required(old, new):
    global text
    if old not in text:
        raise SystemExit(f"Expected dashboard fragment not found: {old[:80]}")
    text = text.replace(old, new, 1)


replace_required(
    '<meta name="description" content="منصة المديرية العامة لخدمات المتعاملين بصندوق الحماية الاجتماعية" />',
    '<meta name="description" content="بوصلة المتعامل — المنصة التنفيذية للمديرية العامة لخدمات المتعاملين بصندوق الحماية الاجتماعية" />')
replace_required(
    '<title>خدمات المتعاملين | العرض المؤسسي</title>',
    '<title>بوصلة المتعامل | المنصة التنفيذية لخدمات المتعاملين</title>')
replace_required(
    '        <a href="#work-tracker">متابعة الأعمال</a>\n        <a href="#performance">الأداء والمؤشرات</a>',
    '        <a href="#work-tracker">متابعة الأعمال</a>\n        <a href="#risk-register">سجل المخاطر</a>\n        <a href="#performance">الأداء والمؤشرات</a>')
replace_required(
'''        <div class="page-heading">
          <span class="eyebrow">صندوق الحماية الاجتماعية · سلطنة عُمان</span>
          <h1>المديرية العامة لخدمات المتعاملين</h1>
        </div>''',
'''        <div class="page-heading platform-identity">
          <span class="eyebrow">صندوق الحماية الاجتماعية · سلطنة عُمان</span>
          <h1>بوصلة المتعامل</h1>
          <small>المنصة التنفيذية للمديرية العامة لخدمات المتعاملين</small>
        </div>''')

replace_required(
'''        </section>

        <section class="section-block" id="directorate">''',
'''        </section>

        <section class="operational-budget-card" aria-label="الموازنة التشغيلية">
          <div class="budget-heading">
            <span class="budget-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h16v12H4zM7 7V5h10v2M8 12h8M8 15h5"/></svg></span>
            <div><small>الإدارة المالية</small><h2>الموازنة التشغيلية</h2><p>ملخص الاستخدام الفعلي من الموازنة المعتمدة</p></div>
          </div>
          <div class="budget-usage" aria-label="النسبة المستخدمة من الموازنة 36 بالمئة">
            <div class="budget-ring" style="--budget-used:36"><strong>36%</strong><span>المستخدم</span></div>
            <div><b>النسبة المستخدمة من الموازنة</b><small>المتبقي 64% من إجمالي الاعتماد</small></div>
          </div>
          <div class="budget-values">
            <article><span>القيمة المصروفة من الموازنة</span><strong dir="ltr">1,243,351.62</strong><small>ريال عُماني</small></article>
            <article><span>الموازنة المعتمدة</span><strong dir="ltr">3,498,674.918</strong><small>ريال عُماني</small></article>
          </div>
          <div class="budget-progress" aria-hidden="true"><i style="width:36%"></i></div>
        </section>

        <section class="section-block" id="directorate">''')


replace_required(
'''          <div class="plan-summary">
            <article><span>إجمالي بنود الخطة</span><strong>20</strong><small>هدفًا ومبادرة</small></article>
            <article><span>الأهداف التشغيلية</span><strong>7</strong><small>أهداف رئيسية مفصلة</small></article>
            <article><span>المبادرات الإضافية</span><strong>13</strong><small>هدفًا داعمًا</small></article>
            <article class="plan-target"><span>المستهدف العام</span><strong>90% فأكثر</strong><small>إنجاز الخطة التشغيلية</small></article>
          </div>''',
'''          <div class="plan-summary plan-hero-kpis" aria-label="مؤشرات إنجاز الخطة التشغيلية">
            <article class="plan-target"><span>نسبة إنجاز الخطة</span><strong id="planCompletionRate">0%</strong><small>المبادرات المسلّمة من إجمالي الخطة</small></article>
            <article class="plan-kpi-on-time"><span>سُلّمت في الوقت المحدد</span><strong id="planOnTimeCount">0</strong><small>تحقق أو تفوق التوقعات</small></article>
            <article class="plan-kpi-late"><span>المبادرات المتأخرة</span><strong id="planLateCount">0</strong><small>تسليم متأخر أو تجاوز الموعد</small></article>
            <article><span>إجمالي بنود الخطة</span><strong id="planTotalCount">22</strong><small>9 أهداف و13 مبادرة إضافية</small></article>
          </div>''')

replace_required(
    '<button class="btn secondary" id="updateGuide">دليل التحديث</button>',
    '<button class="btn secondary" id="privacyLockButton">قفل العرض</button>\n          <button class="btn secondary" id="updateGuide">دليل التحديث</button>')
replace_required(
    '<button class="btn primary edit-entry" id="editContent">تحرير المحتوى</button>',
    '<button class="btn primary edit-entry" id="editContent">تعديل المحتوى</button>')
replace_required('الأهداف التشغيلية السبعة', 'الأهداف التشغيلية التسعة')
replace_required('سبعة أهداف رئيسية تقود التنفيذ', 'تسعة أهداف رئيسية تقود التنفيذ')

risk_section = '''        <section class="section-block risk-register-section" id="risk-register">
          <div class="section-heading">
            <div><span class="section-kicker">07 · سجل المخاطر</span><h2>المخاطر المصاحبة لأنشطة المديرية لعام 2026</h2></div>
            <span class="section-note">4 مخاطر تشغيلية نشطة · آخر تحديث 5 أبريل 2026</span>
          </div>
          <div class="risk-summary" aria-label="الملخص التنفيذي لسجل المخاطر">
            <article><span>إجمالي المخاطر</span><strong>4</strong><small>جميعها نشطة وتشغيلية</small></article>
            <article class="risk-before"><span>متوسط الخطر المتأصل</span><strong>14</strong><small>مرتفع قبل تطبيق الضوابط</small></article>
            <article class="risk-after"><span>متوسط الخطر المتبقي</span><strong>7</strong><small>معتدل بعد تطبيق الضوابط</small></article>
            <article class="risk-reduction"><span>خفض مستوى التعرض</span><strong>52%</strong><small>من 56 إلى 27 نقطة إجمالية</small></article>
          </div>
          <div class="risk-scale" aria-label="مفتاح تصنيف المخاطر"><span><i class="risk-dot high"></i>متأصل كبير</span><span><i class="risk-dot medium"></i>متبقٍ معتدل</span><span><i class="risk-dot active"></i>الحالة: نشط</span><small>اضغط على أي خطر لعرض الضوابط وخطة المعالجة كاملة.</small></div>
          <div class="risk-cards">
            <details class="risk-card">
              <summary>
                <span class="risk-ref">R01</span><div class="risk-title"><small>إدارة العمليات التشغيلية لخدمات المتعاملين</small><h3>ارتفاع حجم الأعباء التشغيلية على موظفي خدمات المتعاملين ومركز الاتصال</h3><div><span class="risk-chip">تشغيلي</span><span class="risk-chip active">نشط</span><span class="risk-date">المعالجة المستهدفة: الربع الأول 2027</span></div></div>
                <div class="risk-score-flow"><span class="score inherent"><b>12</b><small>كبير · متأصل</small></span><i>←</i><span class="score residual"><b>6</b><small>معتدل · متبقٍ</small></span></div>
              </summary>
              <div class="risk-detail-grid">
                <article class="risk-description"><h4>وصف الخطر</h4><p>تزايد المهام والمسؤوليات التشغيلية على موظفي خدمات المتعاملين ومركز الاتصال بما يفوق الطاقة التشغيلية، بسبب التغيرات على منظومة الحماية الاجتماعية وعدم كفاية نقل المعرفة من التقسيمات الإدارية؛ بما قد يؤثر في كفاءة الأداء وجودة الخدمات ورضا المتعاملين والسمعة المؤسسية.</p></article>
                <article><h4>التقييم المتأصل</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>محتمل · 3</b></li><li><span>الأثر التشغيلي</span><b>عالٍ · 4</b></li><li><span>الأثر الاستراتيجي</span><b>معتدل · 3</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article><h4>الضوابط الداخلية · C1</h4><p class="control-name">تعزيز الموارد البشرية والتوعية المجتمعية</p><ul><li>طلب تعزيز المديرية بالتعيين أو الندب أو التدوير الوظيفي أو العقود والتدريب حسب الموارد المتاحة.</li><li>زيادة التوعية باستخدام القنوات الرقمية لتقليل الحضور الشخصي وعبء الأعمال.</li></ul><div class="control-meta"><span>وقائي</span><span>يدوي</span><span>دوري</span><span>التصميم: فعال 3</span><span>التشغيل: فعال جزئيًا 2</span><span>الرقابة: كافية جزئيًا</span></div></article>
                <article><h4>التقييم المتبقي</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>نادر · 2</b></li><li><span>الأثر التشغيلي</span><b>معتدل · 3</b></li><li><span>الأثر الاستراتيجي</span><b>لا ينطبق · 0</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article class="risk-actions"><h4>الإجراءات الإضافية لمعالجة الخطر</h4><ol><li>العمل مع دائرة رأس المال البشري لاستحداث معايير قياسية تجمع الأبعاد الكمية والنوعية لتحديد الاحتياج، وإدراج المخرجات ضمن آليات الاستقطاب والاختيار الوظيفي.</li><li>تعزيز الكوادر البشرية بالندب أو التدريب أو التعيين أو التدوير لشغل الشواغر المتاحة.</li><li>تمكين موظفي تقديم الخدمة ومركز الاتصال من البيانات والمعلومات في الأنظمة التقنية.</li></ol></article>
                <article class="risk-accountability"><h4>الملكية والمسؤولية</h4><dl><div><dt>مالك الخطر</dt><dd>مدير عام المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤول الخطر والضابط</dt><dd>المديرية العامة لخدمات المتعاملين بالتنسيق مع المديرية العامة للدعم المؤسسي</dd></div><div><dt>مسؤولية التنفيذ</dt><dd>المديرية العامة للدعم المؤسسي، التقسيمات الإدارية المعنية، والمديرية العامة لخدمات المتعاملين</dd></div><div><dt>النطاق</dt><dd>جميع التقسيمات، ودائرة إدارة وتطوير الخدمات، ودوائر الحماية الاجتماعية والمنافذ في المحافظات</dd></div><div><dt>التواريخ</dt><dd>التعرف: 4 نوفمبر 2025 · آخر تحديث: 4 أبريل 2026</dd></div></dl></article>
              </div>
            </details>

            <details class="risk-card">
              <summary>
                <span class="risk-ref">R02</span><div class="risk-title"><small>معالجة طلبات المستفيدين</small><h3>ضعف كفاءة الاستجابة لمعالجة طلبات المتعاملين</h3><div><span class="risk-chip">تشغيلي</span><span class="risk-chip active">نشط</span><span class="risk-date">المعالجة المستهدفة: الربع الثاني 2027</span></div></div>
                <div class="risk-score-flow"><span class="score inherent"><b>16</b><small>كبير · متأصل</small></span><i>←</i><span class="score residual"><b>6</b><small>معتدل · متبقٍ</small></span></div>
              </summary>
              <div class="risk-detail-grid">
                <article class="risk-description"><h4>وصف الخطر</h4><p>ضعف الاستجابة وإنجاز طلبات المتعاملين من التقسيمات الإدارية أو الجهات الخارجية في معاملات المنافع، ومنها منفعة الإعاقة ودعم دخل الأسر والحقيبة المدرسية ومستحقات منافع كبار السن والطفولة وطلبات الاسترداد؛ نتيجة عدم اكتمال الربط بين الجهات المعنية والمديرية، مما يؤثر في سرعة الإنجاز وجودة الخدمة ورضا المتعاملين والتقييم المؤسسي.</p></article>
                <article><h4>التقييم المتأصل</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>مرجح · 4</b></li><li><span>الأثر التشغيلي</span><b>عالٍ · 4</b></li><li><span>الأثر الاستراتيجي</span><b>معتدل · 3</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article><h4>الضوابط الداخلية · C2</h4><p class="control-name">التنسيق الداخلي ومعالجة طلبات المستفيدين</p><ul><li>المتابعة المستمرة مع التقسيمات والجهات المعنية لتسريع كفاءة الاستجابة.</li><li>تقديم بلاغ عبر نظام الدعم الفني لتنفيذ المعالجات المطلوبة في البيانات.</li><li>المتابعة واتخاذ إجراءات التصعيد المعمول بها.</li></ul><div class="control-meta"><span>تصحيحي</span><span>يدوي</span><span>دوري</span><span>التصميم: فعال جزئيًا 2</span><span>التشغيل: فعال 3</span><span>الرقابة: كافية جزئيًا</span></div></article>
                <article><h4>التقييم المتبقي</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>نادر · 2</b></li><li><span>الأثر التشغيلي</span><b>معتدل · 3</b></li><li><span>الأثر الاستراتيجي</span><b>منخفض · 2</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article class="risk-actions"><h4>الإجراءات الإضافية لمعالجة الخطر</h4><ol><li>التنسيق مع المديرية العامة للحلول الرقمية ونظم المعلومات لتسريع الربط مع الجهات المعنية.</li><li>إعداد آلية تصعيد واضحة ومتابعة تنفيذها.</li></ol></article>
                <article class="risk-accountability"><h4>الملكية والمسؤولية</h4><dl><div><dt>مالك الخطر</dt><dd>مدير عام المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤول الخطر والضابط</dt><dd>المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤولية التنفيذ</dt><dd>المديرية العامة للحلول الرقمية ونظم المعلومات، المديرية العامة لخدمات المتعاملين، ودائرة التخطيط ومتابعة الرؤية</dd></div><div><dt>النطاق</dt><dd>جميع التقسيمات، ودائرة إدارة وتطوير الخدمات، ودوائر الحماية الاجتماعية والمنافذ في المحافظات</dd></div><div><dt>التواريخ</dt><dd>التعرف: 4 نوفمبر 2025 · آخر تحديث: 4 أبريل 2026</dd></div></dl></article>
              </div>
            </details>

            <details class="risk-card">
              <summary>
                <span class="risk-ref">R03</span><div class="risk-title"><small>إدارة العمليات التشغيلية لخدمات المتعاملين</small><h3>توقف قنوات تقديم الخدمات</h3><div><span class="risk-chip">تشغيلي</span><span class="risk-chip active">نشط</span><span class="risk-date urgent">المعالجة المستهدفة: الربع الرابع 2026</span></div></div>
                <div class="risk-score-flow"><span class="score inherent"><b>16</b><small>كبير · متأصل</small></span><i>←</i><span class="score residual"><b>9</b><small>معتدل · متبقٍ</small></span></div>
              </summary>
              <div class="risk-detail-grid">
                <article class="risk-description"><h4>وصف الخطر</h4><p>توقف الخدمات المقدمة للمتعاملين عبر الموقع الإلكتروني ومركز الاتصال والتطبيق الإلكتروني ووسائل التواصل الاجتماعي ونظام «ثقة»، إضافة إلى توقف أو تأثر مواقع تقديم الخدمات المباشرة بسبب انقطاع الإنترنت أو الكهرباء أو العوامل الطبيعية مثل الأعاصير والأمراض المعدية أو أي ظروف طارئة واستثنائية.</p></article>
                <article><h4>التقييم المتأصل</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>مرجح · 4</b></li><li><span>الأثر التشغيلي</span><b>عالٍ · 4</b></li><li><span>الأثر الاستراتيجي</span><b>منخفض · 2</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article><h4>الضوابط الداخلية · C3</h4><p class="control-name">استمرارية الأعمال</p><ul><li>العمل عن بعد عند انقطاع الكهرباء وفي الحالات الاستثنائية للوظائف الملائمة.</li><li>تشغيل الحد الأدنى من العمليات واستخدام النماذج اليدوية كبدائل.</li><li>التنسيق مع دوائر المحافظات لتوفير مواقع بديلة لاستقبال المتعاملين.</li><li>إشعار المتعاملين بتوقف الخدمة عبر الوسائل الإعلامية.</li><li>تفعيل خطة استمرارية الأعمال والتوعية بالقنوات الرقمية البديلة.</li></ul><div class="control-meta"><span>تصحيحي</span><span>آلي</span><span>دوري</span><span>التصميم: فعال جزئيًا 2</span><span>التشغيل: فعال جزئيًا 2</span><span>الرقابة: كافية جزئيًا</span></div></article>
                <article><h4>التقييم المتبقي</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>محتمل · 3</b></li><li><span>الأثر التشغيلي</span><b>معتدل · 3</b></li><li><span>الأثر الاستراتيجي</span><b>منخفض · 2</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article class="risk-actions"><h4>الإجراءات الإضافية لمعالجة الخطر</h4><ol><li>استخدام مولد كهربائي لضمان استمرارية تقديم الخدمة في الدوائر.</li><li>تعزيز التوعية والاستعانة بدليل الاستجابة السريعة للمخاطر الصحية والنفسية والعامة والمرتبطة بالأنظمة، بالتنسيق مع دائرة الحوكمة وإدارة المخاطر والامتثال.</li></ol></article>
                <article class="risk-accountability"><h4>الملكية والمسؤولية</h4><dl><div><dt>مالك الخطر</dt><dd>مدير عام المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤول الخطر والضابط</dt><dd>المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤولية التنفيذ</dt><dd>المديرية العامة لخدمات المتعاملين، المديرية العامة للحلول الرقمية ونظم المعلومات، دائرة الحوكمة وإدارة المخاطر والامتثال، ودائرة التواصل والإعلام</dd></div><div><dt>النطاق</dt><dd>دوائر الحماية الاجتماعية بالمحافظات، ودائرة إدارة وتطوير الخدمات، والدوائر والمنافذ</dd></div><div><dt>التواريخ</dt><dd>التعرف: 4 ديسمبر 2025 · آخر تحديث: 5 أبريل 2026</dd></div></dl></article>
              </div>
            </details>

            <details class="risk-card">
              <summary>
                <span class="risk-ref">R04</span><div class="risk-title"><small>إدارة إطلاق وتعميم البرامج التأمينية</small><h3>عدم جاهزية مقدم الخدمة وموظفي مركز الاتصال عند إطلاق برامج وتحديثات جديدة</h3><div><span class="risk-chip">تشغيلي</span><span class="risk-chip active">نشط</span><span class="risk-date">المعالجة المستهدفة: الربع الأول 2027</span></div></div>
                <div class="risk-score-flow"><span class="score inherent"><b>12</b><small>كبير · متأصل</small></span><i>←</i><span class="score residual"><b>6</b><small>معتدل · متبقٍ</small></span></div>
              </summary>
              <div class="risk-detail-grid">
                <article class="risk-description"><h4>وصف الخطر</h4><p>عدم إشراك مديرية خدمات المتعاملين عند إطلاق برامج أو تنفيذ تحديثات على الأنظمة دون تنسيق مسبق وكافٍ، مما يؤدي إلى عدم جاهزية مقدمي الخدمة وموظفي مركز الاتصال ومنصة تجاوب وحساب العناية بالمتعاملين في منصة «إكس» من حيث التأهيل والتدريب، ويرفع الضغط التشغيلي ويؤثر سلبًا في جودة الخدمة ورضا المتعاملين وسمعة الصندوق وتقييمه المؤسسي.</p></article>
                <article><h4>التقييم المتأصل</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>محتمل · 3</b></li><li><span>الأثر التشغيلي</span><b>معتدل · 3</b></li><li><span>الأثر الاستراتيجي</span><b>عالٍ · 4</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article><h4>الضوابط الداخلية · C4</h4><p class="control-name">التواصل الداخلي وبناء القدرات التشغيلية</p><p>بعد اطلاع المديرية بالمستجدات، يجري التنسيق الفوري مع التقسيمات المعنية وعقد لقاءات لموظفي خدمات المتعاملين ومركز الاتصال لشرح المستجدات وتعزيز الفهم والتطبيق الصحيح للإجراءات وضمان الجاهزية.</p><div class="control-meta"><span>وقائي</span><span>يدوي</span><span>دوري</span><span>التصميم: فعال 3</span><span>التشغيل: فعال جزئيًا 2</span><span>الرقابة: كافية جزئيًا</span></div></article>
                <article><h4>التقييم المتبقي</h4><ul class="risk-metrics"><li><span>الاحتمالية</span><b>نادر · 2</b></li><li><span>الأثر التشغيلي</span><b>معتدل · 3</b></li><li><span>الأثر الاستراتيجي</span><b>منخفض · 2</b></li><li><span>الأثر المالي</span><b>منخفض · 1</b></li><li><span>أثر الامتثال</span><b>لا ينطبق · 0</b></li></ul></article>
                <article class="risk-actions"><h4>الإجراءات الإضافية لمعالجة الخطر</h4><ol><li>إعداد منهجية واضحة للخدمات والبرامج الجديدة والمنقولة من جهات خارجية، ودورة مستندية للتعاميم تضمن وضوح الإجراءات والمتابعة والتنفيذ.</li><li>إعداد مواد إعلامية توضّح تسلسل الإجراءات والرسائل المطلوب نشرها، بالتنسيق مع التقسيمات المختصة.</li><li>إعداد أدلة إرشادية وتنفيذ ورش عمل لمقدمي الخدمة وموظفي مركز الاتصال قبل إطلاق البرامج أو القرارات الجديدة.</li></ol></article>
                <article class="risk-accountability"><h4>الملكية والمسؤولية</h4><dl><div><dt>مالك الخطر</dt><dd>مدير عام المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤول الخطر والضابط</dt><dd>المديرية العامة لخدمات المتعاملين</dd></div><div><dt>مسؤولية التنفيذ</dt><dd>التقسيمات الإدارية المعنية، دائرة التواصل والإعلام، ودائرة التخطيط ومتابعة الرؤية</dd></div><div><dt>النطاق</dt><dd>جميع التقسيمات، ودائرة إدارة وتطوير الخدمات، ودوائر الحماية الاجتماعية والمنافذ في المحافظات</dd></div><div><dt>التواريخ</dt><dd>التعرف: 4 نوفمبر 2025 · آخر تحديث: 4 أبريل 2026</dd></div></dl></article>
              </div>
            </details>
          </div>
          <p class="risk-source-note">المصدر: سجل المخاطر المصاحبة لأنشطة المديرية العامة لخدمات المتعاملين لعام 2026م. التصنيف المتأصل لجميع المخاطر «كبير»، والتصنيف المتبقي لجميعها «معتدل» بعد تطبيق الضوابط.</p>
        </section>

'''

replace_required('        <section class="section-block" id="performance">', risk_section + '        <section class="section-block" id="performance">')
replace_required('07 · الأداء وحجم الأعمال', '08 · الأداء وحجم الأعمال')
replace_required('08 · منصة تجاوب', '09 · منصة تجاوب')
replace_required('09 · الحضور المؤسسي', '10 · الحضور المؤسسي')
replace_required('10 · محفظة التطوير', '11 · محفظة التطوير')
replace_required('11 · الريادة والشراكة المجتمعية', '12 · الريادة والشراكة المجتمعية')

# Quarterly KPI cards use a visual journey: Q1 -> net change -> Q2.
performance_section = '''        <section class="section-block performance-priority" id="performance">
          <div class="section-heading">
            <div><span class="section-kicker">08 · الأداء والمؤشرات</span><h2>المؤشر الرئيسي للمديرية ثم الأداء التشغيلي وحجم الأعمال</h2></div>
            <span class="section-note">حتى أغسطس 2026 · وفق فترة توفر كل مصدر</span>
          </div>
          <svg class="performance-icon-sprite" aria-hidden="true">
            <symbol id="pi-heart" viewBox="0 0 24 24"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"/></symbol>
            <symbol id="pi-message" viewBox="0 0 24 24"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4Z"/><path d="M8 8h8M8 12h5"/></symbol>
            <symbol id="pi-headset" viewBox="0 0 24 24"><path d="M4 14v-2a8 8 0 0 1 16 0v2M18 19h-2v-6h4v4a2 2 0 0 1-2 2ZM6 19H4a2 2 0 0 1-2-2v-4h4v6ZM18 19c0 2-2 3-5 3"/></symbol>
            <symbol id="pi-inbox" viewBox="0 0 24 24"><path d="M4 4h16v16H4zM4 14h4l2 3h4l2-3h4"/></symbol>
            <symbol id="pi-layers" viewBox="0 0 24 24"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5M3 17l9 5 9-5"/></symbol>
            <symbol id="pi-digital" viewBox="0 0 24 24"><rect x="3" y="3" width="14" height="12" rx="2"/><path d="M8 21h8M12 15v6M19 8h2v11h-5"/></symbol>
            <symbol id="pi-building" viewBox="0 0 24 24"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 10h1M14 10h1M9 14h1M14 14h1M10 21v-3h4v3"/></symbol>
            <symbol id="pi-chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol>
            <symbol id="pi-bot" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></symbol>
            <symbol id="pi-clock" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></symbol>
            <symbol id="pi-timer" viewBox="0 0 24 24"><circle cx="12" cy="13" r="8"/><path d="M9 2h6M12 5v2M18 7l2-2M12 13l3-2"/></symbol>
            <symbol id="pi-smile" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M8 10h.01M16 10h.01M8 15c1.2 1.3 2.5 2 4 2s2.8-.7 4-2"/></symbol>
          </svg>

          <article class="primary-kpi-hero" aria-label="مؤشر التواصل ورضا المستفيدين">
            <div class="primary-kpi-copy">
              <span>المؤشر المؤسسي الرئيسي للمديرية</span>
              <h3>مؤشر التواصل ورضا المستفيدين</h3>
              <div class="primary-kpi-trend" aria-label="تحسن المؤشر من 82 إلى 86 بالمئة"><div><b>82%</b><i>منتصف 2025</i></div><span><em>+4</em><u></u></span><div><b>86%</b><i>النصف الأول 2026</i></div></div>
            </div>
            <div class="primary-kpi-score"><div class="score-ring"><strong>86%</strong><span>النتيجة المعتمدة</span></div><small>التقييم العام · جيد</small></div>
          </article>

          <div class="kpi-components" aria-label="مكونات المؤشر الرئيسي وأوزانها">
            <article class="component-card satisfaction-component">
              <div class="component-head"><div class="icon-title"><svg class="card-icon"><use href="#pi-heart"/></svg><div><span>المكوّن الأول</span><h3>مؤشر رضا المستفيدين</h3></div></div><b>70%<small>الوزن</small></b></div>
              <div class="component-score-layout"><div class="component-result"><div class="component-ring" style="--value:86"><strong>86%</strong><span>النتيجة</span></div></div><div class="quarter-comparison" aria-label="تحسن رضا المستفيدين من 82 بالمئة في الربع الأول إلى 87 بالمئة في الربع الثاني"><div class="quarter-period quarter-q1"><span>الربع الأول</span><b>82%</b></div><div class="quarter-change quarter-up"><i>←</i><strong>+5</strong><small>نقاط</small></div><div class="quarter-period quarter-q2"><span>الربع الثاني</span><b>87%</b></div></div></div>
              <div class="satisfaction-sources">
                <span>المؤشرات الفرعية المعتمدة</span>
                <div><article><i>01</i><b>المركز الوطني للإحصاء والمعلومات</b><small>وفق مؤشرات المركز</small></article><article><i>02</i><b>وزارة العمل</b><small>وفق مؤشرات الوزارة</small></article><article><i>03</i><b>منصة تجاوب</b><small>المقترحات والشكاوى والبلاغات</small></article></div>
              </div>
            </article>
            <article class="component-card communication-component">
              <div class="component-head"><div class="icon-title"><svg class="card-icon gold-icon"><use href="#pi-message"/></svg><div><span>المكوّن الثاني</span><h3>مؤشر التواصل والتفاعل</h3></div></div><b>30%<small>الوزن</small></b></div>
              <div class="component-score-layout"><div class="component-result"><div class="component-ring gold-ring" style="--value:88"><strong>88%</strong><span>النتيجة</span></div></div><div class="quarter-comparison communication-quarters" aria-label="انخفاض التواصل والتفاعل من 90 بالمئة في الربع الأول إلى 86 بالمئة في الربع الثاني"><div class="quarter-period quarter-q1"><span>الربع الأول</span><b>90%</b></div><div class="quarter-change quarter-down"><i>←</i><strong>−4</strong><small>نقاط</small></div><div class="quarter-period quarter-q2"><span>الربع الثاني</span><b>86%</b></div></div></div>
            </article>
          </div>

          <div class="performance-tier-heading"><div><span>المستوى الثاني</span><h3>المؤشرات التشغيلية ذات الأولوية</h3></div><small>مؤشران مباشران لكفاءة الاستجابة</small></div>
          <div class="operational-priority-grid">
            <article><div class="operational-rank"><svg class="card-icon"><use href="#pi-headset"/></svg></div><div><span>كفاءة استجابة مركز الخدمة الهاتفية</span><strong>100%</strong></div><div class="target-achievement target-ring" style="--target:90"><b>90%</b><small>المستهدف</small><em>+10</em></div></article>
            <article><div class="operational-rank"><svg class="card-icon"><use href="#pi-inbox"/></svg></div><div><span>الاستجابة لطلبات منصة تجاوب</span><strong>100%</strong></div><div class="target-achievement target-ring" style="--target:85"><b>85%</b><small>المستهدف</small><em>+15</em></div></article>
          </div>

          <div class="performance-tier-heading workload-heading"><div><span>المستوى الثالث</span><h3>حجم الأعمال حسب قناة تقديم الخدمة</h3></div><small>تفاصيل تشغيلية بعد المؤشرات الرئيسية</small></div>
          <div class="workload-overview">
            <article class="workload-total"><svg class="summary-icon"><use href="#pi-layers"/></svg><span>إجمالي حجم الأعمال</span><strong>452,453</strong><small>خدمة خلال ستة أشهر · 3,428 خدمة يوميًا</small></article>
            <article class="channel-share"><div class="performance-share-ring" style="--share:62"><svg class="ring-icon"><use href="#pi-digital"/></svg><b>62%</b></div><div><span>القنوات الرقمية</span><strong>279,580</strong><small>من إجمالي الأعمال</small></div></article>
            <article class="channel-share physical-share"><div class="performance-share-ring" style="--share:38"><svg class="ring-icon"><use href="#pi-building"/></svg><b>38%</b></div><div><span>القنوات غير الرقمية</span><strong>172,873</strong><small>من إجمالي الأعمال</small></div></article>
          </div>

          <div class="workload-groups">
            <article class="workload-group branches-workload">
              <div class="workload-group-head"><div class="icon-title"><svg class="card-icon"><use href="#pi-building"/></svg><div><span>دوائر ومنافذ المحافظات</span><h3>الوصول والخدمات المباشرة</h3></div></div><b>7 مؤشرات</b></div>
              <div class="workload-metrics visual-metrics"><div style="--v:62"><span>حجوزات المواعيد</span><strong>94,081</strong><i></i><small>713 يوميًا</small></div><div style="--v:100"><span>استخدام تقييم QR</span><strong>151,117</strong><i></i><small>الأعلى حجمًا</small></div><div style="--v:16"><span>الخدمات الميدانية</span><strong>24,773</strong><i></i><small>188 يوميًا</small></div><div style="--v:3"><span>الخدمات الاستباقية</span><strong>4,294</strong><i></i><small>33 يوميًا</small></div><div style="--v:11"><span>الخدمات الذاتية</span><strong>17,160</strong><i></i><small>130 يوميًا</small></div><div style="--v:1"><span>الأنشطة الإعلامية</span><strong>313</strong><i></i><small>52 شهريًا</small></div><div class="branch-whatsapp-metric"><img src="assets/channels/whatsapp.png" alt="واتساب"><span>الخدمات المقدمة عبر واتساب دوائر المحافظات</span><strong>7,728</strong><small>يوليو–أغسطس 2026</small></div></div>
            </article>
            <article class="workload-group contact-workload">
              <div class="workload-group-head"><div class="icon-title"><svg class="card-icon"><use href="#pi-headset"/></svg><div><span>مركز الاتصال</span><h3>المكالمات وجودة الاستجابة والتفاعل</h3></div></div><b>7 مؤشرات</b></div>
              <div class="contact-kpi-grid"><div class="contact-primary-metric"><svg class="contact-lead-icon"><use href="#pi-headset"/></svg><strong>184,197</strong><span>مكالمة مستلمة</span></div><div class="contact-satisfaction-metric"><svg class="contact-metric-icon"><use href="#pi-smile"/></svg><strong>86.7%</strong><span>الرضا عن الخدمة الهاتفية</span><small>المؤشر الأهم</small></div><div><svg class="contact-metric-icon"><use href="#pi-inbox"/></svg><strong>100%</strong><span>كفاءة الاستجابة</span></div><div><svg class="contact-metric-icon"><use href="#pi-clock"/></svg><strong>52</strong><span>ثانية متوسط الانتظار</span></div><div><svg class="contact-metric-icon"><use href="#pi-timer"/></svg><strong>3:15</strong><span>متوسط مدة المكالمة</span></div><div class="contact-wide"><svg class="contact-metric-icon"><use href="#pi-bot"/></svg><strong>40,736</strong><span>خدمة عبر المساعد الذكي</span></div><div class="contact-x-metric"><img src="assets/channels/x.png" alt="منصة X"><strong>2,067</strong><span>خدمات مقدمة عبر منصة X</span><small>يناير–يونيو</small></div></div>
            </article>
          </div>
        </section>'''

text, performance_replacements = re.subn(
    r'        <section class="section-block" id="performance">.*?        </section>',
    performance_section,
    text,
    count=1,
    flags=re.S,
)
if performance_replacements != 1:
    raise SystemExit("Expected the performance section once")

tajawob_section = '''        <section class="section-block tajawob-updated" id="tajawob">
          <div class="section-heading">
            <div><span class="section-kicker">09 · منصة تجاوب</span><h2>صوت المتعامل في مسار قابل للقياس</h2></div>
            <span class="section-note">يناير–أغسطس 2026</span>
          </div>
          <div class="tajawob-hero updated">
            <div><span>إجمالي الطلبات</span><strong>5,610</strong><small>خلال ثمانية أشهر</small></div>
            <div><span>متوسط نسبة الإنجاز</span><strong>97.8%</strong><small>المستهدف 100%</small></div>
            <div><span>الطلبات المنجزة</span><strong>5,488</strong><small>مقابل 122 غير منجز</small></div>
            <div><span>عدد الأشهر</span><strong>8</strong><small>يناير إلى أغسطس 2026</small></div>
          </div>
          <div class="tajawob-flow" aria-label="مسار معالجة طلب المتعامل في منصة تجاوب">
            <article><i>1</i><b>استقبال الطلب</b><span>شكوى أو استفسار أو مقترح أو بلاغ</span></article>
            <article><i>2</i><b>التصنيف والإسناد</b><span>تحديد الجهة والمدة المستهدفة</span></article>
            <article><i>3</i><b>المعالجة والإغلاق</b><span>متابعة جودة الاستجابة وإتمام الحل</span></article>
            <article><i>4</i><b>قياس التجربة</b><span>قراءة الإنجاز والاتجاهات الزمنية</span></article>
          </div>
          <div class="tajawob-type-grid" aria-label="طلبات منصة تجاوب حسب النوع">
            <article style="--rate:98"><span>المقترحات</span><strong>212</strong><b>208 منجزة · 98%</b><i><em></em></i></article>
            <article style="--rate:96"><span>الشكاوى</span><strong>1,879</strong><b>1,811 منجزة · 96%</b><i><em></em></i></article>
            <article style="--rate:65"><span>البلاغات</span><strong>20</strong><b>13 منجزة · 65%</b><i><em></em></i></article>
            <article style="--rate:99"><span>الاستفسارات</span><strong>3,499</strong><b>3,456 منجزة · 99%</b><i><em></em></i></article>
          </div>
          <div class="tajawob-compare" aria-label="مقارنة حجم الطلبات ونسبة الإنجاز بين 2025 و2026">
            <article class="tajawob-year-card year-2025" style="--year-rate:74" data-rate="74%"><div><span>عام 2025</span><strong>3,481 <small>طلبًا</small></strong></div><p>معدل الإنجاز وفق التقرير السابق</p></article>
            <article class="tajawob-year-card year-2026" style="--year-rate:97.8" data-rate="97.8%"><div><span>يناير–أغسطس 2026</span><strong>5,610 <small>طلبات</small></strong></div><p data-growth="↑ 61.2%">متوسط الإنجاز مع نمو واضح في حجم الطلبات</p></article>
          </div>
          <div class="tajawob-peaks" aria-label="أوقات الذروة في منصة تجاوب">
            <article><span>أكثر يوم ازدحامًا</span><strong>الاثنين 27 أبريل</strong><small>97 طلبًا</small></article>
            <article><span>أكثر أيام الأسبوع</span><strong>الأحد</strong><small>811 طلبًا إجمالًا</small></article>
            <article><span>أكثر ساعة ازدحامًا</span><strong>11:00 صباحًا</strong><small>362 طلبًا</small></article>
          </div>
          <aside class="tajawob-response-guide" aria-labelledby="tajawob-response-guide-title">
            <div class="response-guide-icon" aria-hidden="true">
              <svg viewBox="0 0 48 48"><path d="M10 8h20a6 6 0 0 1 6 6v22H16a6 6 0 0 0-6 6V8Z"/><path d="M16 14h14M16 20h14M16 26h9M36 36H16a6 6 0 0 0-6 6M34 8h4v24"/></svg>
            </div>
            <div class="response-guide-content">
              <span>مرجع معرفي موحّد</span>
              <h3 id="tajawob-response-guide-title">دليل الردود النموذجية</h3>
              <p>دليل عملي يساعد الموظفين على تقديم ردود دقيقة ومتسقة على استفسارات المتعاملين، مع نماذج جاهزة ومنظمة تسهّل الوصول إلى المعلومة المناسبة.</p>
              <div class="response-guide-features" aria-label="مزايا دليل الردود النموذجية">
                <small>ردود موحّدة</small><small>بحث سريع</small><small>صياغة مهنية</small>
              </div>
            </div>
            <a class="response-guide-link" href="https://ethmar-om.github.io/spf-responses/" target="_blank" rel="noopener noreferrer" aria-label="فتح الدليل الشامل للردود النموذجية في نافذة جديدة">
              <span>فتح الدليل الشامل</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
            </a>
          </aside>
        </section>'''

text, tajawob_replacements = re.subn(
    r'        <section class="section-block" id="tajawob">.*?        </section>',
    tajawob_section,
    text,
    count=1,
    flags=re.S,
)
if tajawob_replacements != 1:
    raise SystemExit("Expected the Tajawob section once")

replace_required('الفترة المرجعية: يناير–يونيو 2026', 'الفترة المرجعية: يناير–أغسطس 2026')
replace_required(
'''            <article><img src="assets/channels/contact-center.png" alt=""><strong>184,197</strong><span>مكالمة مستلمة</span></article>
            <article><span class="board-line-icon">◷</span><strong>52</strong><span>ثانية انتظار</span></article>
            <article><span class="board-line-icon">♡</span><strong>86.7%</strong><span>رضا الخدمة الهاتفية</span></article>
            <article><img src="assets/channels/whatsapp.png" alt=""><strong>40,736</strong><span>خدمة ذكية وواتساب</span></article>
            <article><img src="assets/channels/x.png" alt=""><strong>2,067</strong><span>خدمة عبر X</span></article>''',
'''            <article><img src="assets/channels/contact-center.png" alt=""><strong>184,197</strong><span>مكالمة مستلمة</span></article>
            <article><span class="board-line-icon">✓</span><strong>100%</strong><span>كفاءة الاستجابة</span></article>
            <article><span class="board-line-icon">◷</span><strong>52</strong><span>ثانية انتظار</span></article>
            <article><span class="board-line-icon">♡</span><strong>86.7%</strong><span>رضا الخدمة الهاتفية</span></article>
            <article><img src="assets/channels/whatsapp.png" alt=""><strong>7,728</strong><span>طلب واتساب · يوليو–أغسطس</span></article>
            <article><img src="assets/channels/x.png" alt=""><strong>2,067</strong><span>خدمات مقدمة عبر منصة X</span></article>''')

replace_required(
'''            <article class="method-application">
              <span>كيف تُطبّقها المديرية؟</span>
              <div><b>100%</b><small>تحليل شهري للشكاوى</small></div>
              <div><b>277+</b><small>ملف معرفة وأدلة خدمة</small></div>
              <ul><li>تقارير الرؤى السلوكية وشخصيات المتعاملين</li><li>تصميم الخدمات حول رحلة المتعامل وأحداث الحياة</li><li>خيار بشري وإتاحة شاملة في القنوات الرقمية</li><li>قياس التجربة والتحسين وفق النتائج</li></ul>
            </article>''',
'''            <article class="method-application">
              <span>كيف تطبّق المديرية مركزية المتعامل عمليًا؟</span>
              <p class="application-intro">مسار عمل متكرر يبدأ بصوت المتعامل وينتهي بتحسين قابل للقياس.</p>
              <ol class="application-steps">
                <li><b>1</b><div><strong>نستمع</strong><small>نجمع الشكاوى والمقترحات ونتائج الرضا.</small></div></li>
                <li><b>2</b><div><strong>نحلّل</strong><small>نحدد أكثر نقاط الألم تكرارًا وأسبابها.</small></div></li>
                <li><b>3</b><div><strong>نحسّن</strong><small>نبسّط الإجراء ونحدّث المعرفة والقنوات.</small></div></li>
                <li><b>4</b><div><strong>نقيس</strong><small>نقارن النتيجة بالمؤشر ونصحح المسار.</small></div></li>
              </ol>
              <div class="application-proof"><div><b>100%</b><small>تحليل شهري للشكاوى</small></div><div><b>277+</b><small>ملف معرفة ودليل خدمة</small></div></div>
            </article>''')

replace_required(
    '<p class="plan-data-note">يعرض القسم المستهدفات والمواعيد الواردة في الخطة المرفقة. لم تُدرج نسب إنجاز فعلية لعدم توفرها في المصدر.</p>',
    '<p class="plan-data-note">حدّث حالة التسليم وتاريخه داخل كل مبادرة؛ تُحتسب النتيجة ومؤشرات الإنجاز تلقائيًا وتُحفظ على هذا الجهاز.</p>')
replace_required('آخر تحديث في المصدر · 26 أغسطس 2026', 'آخر تحديث أسبوعي · 17 سبتمبر 2026')

replace_required(
'''            <article class="tracker-rate"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-8M22 19H2"/></svg><span>نسبة البنود المنجزة</span><strong>71%</strong><small>252 من أصل 354 بندًا</small><i><em style="width:71%"></em></i></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/></svg><span>إجمالي الأعمال</span><strong>354</strong><small>خمسة أقسام تشغيلية</small></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg><span>منجز</span><strong>252</strong><small>أُغلقت بنودها</small></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>قيد الإجراء</span><strong>102</strong><small>تتطلب متابعة</small></article>''',
'''            <article class="tracker-rate"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-8M22 19H2"/></svg><span>نسبة البنود المنجزة</span><strong id="trackerRate">71%</strong><small id="trackerRateSummary">252 من أصل 354 بندًا</small><i><em id="trackerRateBar" style="width:71%"></em></i></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM8 8h8M8 12h8M8 16h5"/></svg><span>إجمالي الأعمال</span><strong id="trackerTotalCount">354</strong><small id="trackerCountSummary">خمسة أقسام تشغيلية</small></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/></svg><span>منجز</span><strong id="trackerDoneCount">252</strong><small>أُغلقت بنودها</small></article>
            <article><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span>قيد الإجراء</span><strong id="trackerProgressCount">102</strong><small>تتطلب متابعة</small></article>''')

replace_required(
    '''            <article><div><span>مركز الاتصال</span><b>102 / 107</b></div><i><em style="width:95%"></em></i><small>95% من البنود منجزة</small></article>
            <article><div><span>التنسيق والمتابعة</span><b>7 / 7</b></div><i><em style="width:100%"></em></i><small>100% من البنود منجزة</small></article>
            <article><div><span>إدارة علاقات المتعاملين</span><b>35 / 42</b></div><i><em style="width:83%"></em></i><small>83% من البنود منجزة</small></article>
            <article><div><span>إدارة وتطوير الخدمات</span><b>72 / 123</b></div><i><em style="width:59%"></em></i><small>59% من البنود منجزة</small></article>
            <article><div><span>شؤون الدوائر والمنافذ</span><b>36 / 75</b></div><i><em style="width:48%"></em></i><small>48% من البنود منجزة</small></article>''',
    '''            <article data-tracker-dept="contact"><div><span>مركز الاتصال</span><b class="tracker-dept-ratio">102 / 107</b></div><i><em style="width:95%"></em></i><small>95% من البنود منجزة</small></article>
            <article data-tracker-dept="coord"><div><span>التنسيق والمتابعة</span><b class="tracker-dept-ratio">7 / 7</b></div><i><em style="width:100%"></em></i><small>100% من البنود منجزة</small></article>
            <article data-tracker-dept="crm"><div><span>إدارة علاقات المتعاملين</span><b class="tracker-dept-ratio">35 / 42</b></div><i><em style="width:83%"></em></i><small>83% من البنود منجزة</small></article>
            <article data-tracker-dept="service-dev"><div><span>إدارة وتطوير الخدمات</span><b class="tracker-dept-ratio">72 / 123</b></div><i><em style="width:59%"></em></i><small>59% من البنود منجزة</small></article>
            <article data-tracker-dept="branches"><div><span>شؤون الدوائر والمنافذ</span><b class="tracker-dept-ratio">36 / 75</b></div><i><em style="width:48%"></em></i><small>48% من البنود منجزة</small></article>''')

replace_required(
    '<div class="board-slide-heading"><span>05 · الموقف التنفيذي</span><h2>لوحة واحدة لمتابعة 354 بندًا تشغيليًا</h2><p>قراءة تنفيذية لحالة الأعمال حسب القسم حتى 26 أغسطس 2026.</p></div>',
    '<div class="board-slide-heading"><span>05 · الموقف التنفيذي</span><h2>لوحة واحدة لمتابعة 354 بندًا تشغيليًا</h2><p>قراءة تنفيذية لحالة الأعمال حسب القسم وفق تحديث 17 سبتمبر 2026.</p></div>')
replace_required(
    '<article class="board-maturity"><span>البنود المنجزة</span><strong>71%</strong><i><em style="width:71%"></em></i><div><b>252 منجزًا</b><b>102 قيد الإجراء</b></div></article>',
    '<article class="board-maturity"><span>البنود المنجزة</span><strong id="boardRate">71%</strong><i><em id="boardRateBar" style="width:71%"></em></i><div><b id="boardDone">252 منجزًا</b><b id="boardProgressCount">102 قيد الإجراء</b></div></article>')
replace_required(
    '<div class="board-proof"><article><strong>95%</strong><span>مركز الاتصال</span></article><article><strong>83%</strong><span>علاقات المتعاملين</span></article><article><strong>59%</strong><span>إدارة وتطوير الخدمات</span></article></div>',
    '<div class="board-proof"><article data-board-dept="contact"><strong>95%</strong><span>مركز الاتصال</span></article><article data-board-dept="crm"><strong>83%</strong><span>علاقات المتعاملين</span></article><article data-board-dept="branches"><strong>48%</strong><span>شؤون الدوائر والمنافذ</span></article></div>')
replace_required(
    '<div class="board-portfolio"><article><strong>100%</strong><span>التنسيق والمتابعة</span></article><article><strong>48%</strong><span>شؤون الدوائر والمنافذ</span></article><article><strong>5</strong><span>أقسام ضمن المتابعة</span></article></div>',
    '<div class="board-portfolio"><article data-board-dept="service-dev"><strong>59%</strong><span>إدارة وتطوير الخدمات</span></article><article id="boardDeptCount"><strong>5</strong><span>أقسام ضمن المتابعة</span></article><article id="boardTotalItems"><strong>354</strong><span>بندًا في التحديث الأسبوعي</span></article></div>')

privacy_modal = '''  <div class="modal" id="privacyLockModal" aria-hidden="true"><div class="modal-backdrop" data-close-privacy></div><article class="modal-panel wide privacy-panel" role="dialog" aria-modal="true" aria-labelledby="privacyLockTitle"><button class="modal-close" data-close-privacy aria-label="إغلاق">×</button><span class="modal-status">خصوصية العرض على هذا الجهاز</span><h2 id="privacyLockTitle">قفل أو تشويش تبويبات مختارة</h2><p class="privacy-note">هذا قفل عرض مناسب للاجتماعات والعروض، ولا يُعد بديلًا عن نظام دخول مؤسسي لأن الموقع الحالي صفحة عامة.</p><div class="privacy-grid" id="privacyTabChoices"></div><div class="privacy-pin"><label><span>رمز العرض</span><input id="privacyPin" type="password" inputmode="numeric" autocomplete="new-password" placeholder="أدخل 4 أرقام أو أكثر"></label><label><span>تأكيد الرمز</span><input id="privacyPinConfirm" type="password" inputmode="numeric" autocomplete="new-password" placeholder="أعد إدخال الرمز"></label></div><div class="privacy-actions"><button class="btn primary" id="savePrivacyLock">حفظ القفل</button><button class="btn secondary" id="clearPrivacyLock">إلغاء جميع الأقفال</button></div><div class="excel-import-status" id="privacyStatus" role="status" aria-live="polite"></div></article></div>

'''

replace_required(
    '  <script src="assets/data.js"></script>',
    privacy_modal + '  <script src="assets/data.js"></script>\n  <script src="assets/plan-data-2026.js"></script>')
replace_required(
    '<a class="btn secondary" href="assets/work-tracker.html" target="_blank" rel="noopener">فتح بالحجم الكامل</a>',
    '<a class="btn secondary" href="assets/work-tracker.html" target="_blank" rel="noopener">فتح وتحديث البيان التفصيلي</a>')
replace_required(
    '  <script src="assets/app.js"></script>',
    '  <script src="assets/app.js?v=20260927-2"></script>\n  <script src="assets/platform-enhancements.js?v=20260927-5"></script>\n  <script src="assets/privacy-lock.js"></script>')
replace_required(
    '<link rel="stylesheet" href="assets/styles.css" />',
    '<link rel="stylesheet" href="assets/styles.css?v=20260927-5" />')

# Final approved community-activity count across every presentation view.
text = text.replace('<strong>316</strong>', '<strong>313</strong>')

# Inject standalone community/media chapters before exhibition.js builds its chapter list.
# Remove any stale/partial links first so both the navigation and section markup
# are generated together in one deterministic build.
text = text.replace('        <a href="#community-line">خط التواصل المجتمعي</a>\n', '')
text = text.replace('        <a href="#media-center">المركز الإعلامي</a>\n', '')
if 'href="#community-line"' not in text:
    text = text.replace(
        '        <a href="#projects">المشاريع</a>\n        <a href="#achievements">الريادة والمجتمع</a>',
        '        <a href="#projects">المشاريع</a>\n        <a href="#community-line">خطة التواصل المجتمعي</a>\n        <a href="#media-center">المركز الإعلامي</a>\n        <a href="#achievements">الريادة والمجتمع</a>',
        1,
    )

community_media_sections = r'''        <section class="section-block community-v2" id="community-line">
          <div class="community-hero-v2">
            <div class="community-hero-copy">
              <span class="community-eyebrow">خطة التواصل المجتمعي · يناير–أغسطس 2026</span>
              <h2>نقترب من المجتمع، ونحوّل المعرفة إلى أثر</h2>
              <p>خطة سنوية متكاملة تعمل عبر ثلاثة مسارات: التمكين، التعريف والتوعية، والشراكة المجتمعية.</p>
              <div class="community-paths"><span>↗ التمكين</span><span>● التعريف والتوعية</span><span>◇ الشراكة المجتمعية</span></div>
            </div>
            <div class="community-main-number"><span>إجمالي الأنشطة والفعاليات</span><strong>313</strong><small>العدد النهائي المعتمد</small></div>
          </div>
          <div class="community-impact-grid">
            <article class="impact-a"><i>◫</i><span>الأنشطة والفعاليات</span><strong>313</strong><small>يناير–أغسطس 2026</small></article>
            <article class="impact-b"><i>◎</i><span>المستفيدون والمشاركون</span><strong>17,093</strong><small>نطاق أثر مجتمعي مباشر</small></article>
            <article class="impact-c"><i>✓</i><span>الشركاء</span><strong>+255</strong><small>جهة وشريكًا في المحافظات</small></article>
            <article class="impact-d"><i>⌂</i><span>التغطية الجغرافية</span><strong>11</strong><small>محافظة</small></article>
          </div>
          <div class="community-story-grid-v2">
            <article class="community-roadmap-card">
              <div class="community-card-title"><span>كيف نعمل؟</span><h3>رحلة التواصل المجتمعي</h3></div>
              <div class="community-roadmap">
                <div><b>01</b><i>▣</i><span>التخطيط</span><small>تقويم سنوي ورسائل موحّدة</small></div>
                <div><b>02</b><i>⌂</i><span>الوصول</span><small>تنفيذ عبر دوائر المحافظات</small></div>
                <div><b>03</b><i>◎</i><span>التفاعل</span><small>ورش ولقاءات وحملات ومبادرات</small></div>
                <div><b>04</b><i>↗</i><span>قياس الأثر</span><small>جمهور، شركاء ونطاق وصول</small></div>
              </div>
            </article>
            <article class="community-calendar-card">
              <div class="community-card-title"><span>محطات موثقة</span><h3>نماذج من الأنشطة والفعاليات</h3></div>
              <div class="community-event-stream">
                <div><time>يناير</time><span></span><p><b>جلسة تصوير محتوى إعلامي للأطفال</b><small>الوسطى – الدقم</small></p></div>
                <div><time>فبراير</time><span></span><p><b>قافلة عُمان وفعاليات شتاء الوسطى</b><small>مسندم · الوسطى</small></p></div>
                <div><time>مارس</time><span></span><p><b>اليوم العالمي للسمع وساعة الأرض وورش توعوية</b><small>عدة محافظات</small></p></div>
                <div><time>أبريل</time><span></span><p><b>اليوم العالمي للتوحد والسلامة المهنية</b><small>الظاهرة · ظفار</small></p></div>
                <div><time>مايو</time><span></span><p><b>اليوم العالمي للعمال وحوارات مجتمعية</b><small>عدة محافظات</small></p></div>
                <div><time>يونيو</time><span></span><p><b>مبادرات توعوية ولقاءات تعريفية</b><small>عدة محافظات</small></p></div>
                <div class="event-future"><time>يوليو–أغسطس</time><span></span><p><b>استكمال تنفيذ الخطة المجتمعية بالمحافظات</b><small>ضمن إجمالي 313 نشاطًا وفعالية</small></p></div>
              </div>
            </article>
          </div>
          <div class="community-channel-strip">
            <div><i>01</i><b>التمكين</b><span>رفع القدرة على فهم الأنظمة والخدمات والاستفادة منها</span></div>
            <div><i>02</i><b>التعريف والتوعية</b><span>تعزيز المعرفة بموضوعات وأنظمة الحماية الاجتماعية</span></div>
            <div><i>03</i><b>الشراكة المجتمعية</b><span>توسيع نطاق الوصول وبناء شراكات ذات أثر</span></div>
          </div>
        </section>

        <section class="section-block media-v2" id="media-center">
          <div class="media-hero-v2">
            <div><span class="media-eyebrow">المركز الإعلامي للمديرية</span><h2>مكتبة التقارير والنشرات في مكان واحد</h2><p>مرجع بصري موحّد للإدارة العليا يعرض التقارير الدورية والربع سنوية، مع قابلية التوسع لإضافة النشرات والتقارير القادمة.</p></div>
            <div class="media-orbit" aria-hidden="true"><span></span><i>2026</i><b>التقارير</b></div>
          </div>
          <div class="media-stat-strip">
            <article><i>▤</i><span>التقارير المتاحة</span><strong>9</strong></article>
            <article><i>◷</i><span>دورية التحديث</span><strong>ربع سنوي وسنوي</strong></article>
            <article><i>↗</i><span>آخر فترة موثقة</span><strong>يونيو 2026</strong></article>
          </div>
          <div class="media-shelf">
            <article class="report-cover q1">
              <div class="report-cover-top"><span>Q1</span><span class="report-format">30 صفحة · PDF</span></div>
              <a class="report-preview" href="reports/q1-2026.pdf" target="_blank" rel="noopener" aria-label="قراءة التقرير الربع سنوي الأول الكامل"><img src="reports/q1-cover-01.jpg" alt="غلاف التقرير الربع سنوي الأول 2026" loading="lazy"><span>قراءة التقرير الكامل ↗</span></a>
              <div class="report-cover-body"><small>يناير–مارس 2026</small><h3><a href="reports/q1-2026.pdf" target="_blank" rel="noopener">التقرير الربع سنوي</a></h3><strong>الربع الأول</strong><p>ملخص تنفيذي · الأداء · الخطة التشغيلية · التواصل المجتمعي · حجم الأعمال</p><a class="report-open-link" href="reports/q1-2026.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
              <details><summary>أبرز المؤشرات</summary><ul><li>158 نشاطًا وفعالية مجتمعية</li><li>10,619 من الجمهور المستهدف</li><li>135,841 إجمالي حجم الأعمال المنجزة بالمحافظات</li><li>37,752 مكالمة مستلمة بمركز الاتصال</li></ul></details>
            </article>
            <article class="report-cover q2">
              <div class="report-cover-top"><span>Q2</span><span class="report-format">41 صفحة · PDF</span></div>
              <a class="report-preview" href="reports/q2-2026.pdf" target="_blank" rel="noopener" aria-label="قراءة التقرير الربع سنوي الثاني الكامل"><img src="reports/q2-cover-01.jpg" alt="غلاف التقرير الربع سنوي الثاني 2026" loading="lazy"><span>قراءة التقرير الكامل ↗</span></a>
              <div class="report-cover-body"><small>أبريل–يونيو 2026</small><h3><a href="reports/q2-2026.pdf" target="_blank" rel="noopener">التقرير الربع سنوي</a></h3><strong>الربع الثاني</strong><p>مقارنة ربعية · مؤشرات الأداء · الفرق واللجان · التواصل المجتمعي · أداء المحافظات</p><a class="report-open-link" href="reports/q2-2026.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
              <details><summary>أبرز المؤشرات</summary><ul><li>161 نشاطًا وفعالية مجتمعية خلال الربع الثاني</li><li>6,474 من الجمهور المستهدف</li><li>146,807 إجمالي حجم الأعمال المنجزة بالمحافظات</li><li>42,596 مكالمة مستلمة بمركز الاتصال</li><li>236 موظفًا إجمالي موظفي المديرية</li></ul></details>
            </article>
          </div>
          <div class="media-archive-heading"><span>أرشيف التقارير</span><h3>تقارير الأعوام السابقة</h3><p>اضغط على غلاف أي تقرير لقراءة نسخته الكاملة.</p></div>
          <div class="media-archive-grid">
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/annual-2025.pdf" target="_blank" rel="noopener" aria-label="قراءة التقرير السنوي 2025 كاملًا"><img src="reports/annual-2025-cover-01.jpg" alt="غلاف التقرير السنوي 2025" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2025 · يناير–نوفمبر 2025</small><h4><a href="reports/annual-2025.pdf" target="_blank" rel="noopener">التقرير السنوي</a></h4><a href="reports/annual-2025.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q3-2025.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الثالث 2025 كاملًا"><img src="reports/q3-2025-cover-01.jpg" alt="غلاف تقرير الربع الثالث 2025" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2025 · يوليو–سبتمبر 2025</small><h4><a href="reports/q3-2025.pdf" target="_blank" rel="noopener">تقرير الربع الثالث</a></h4><a href="reports/q3-2025.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q2-2025.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الثاني 2025 كاملًا"><img src="reports/q2-2025-cover-01.jpg" alt="غلاف تقرير الربع الثاني 2025" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2025 · أبريل–يونيو 2025</small><h4><a href="reports/q2-2025.pdf" target="_blank" rel="noopener">تقرير الربع الثاني</a></h4><a href="reports/q2-2025.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q1-2025.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الأول 2025 كاملًا"><img src="reports/q1-2025-cover-01.jpg" alt="غلاف تقرير الربع الأول 2025" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2025 · يناير–مارس 2025</small><h4><a href="reports/q1-2025.pdf" target="_blank" rel="noopener">تقرير الربع الأول</a></h4><a href="reports/q1-2025.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q3-2024.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الثالث 2024 كاملًا"><img src="reports/q3-2024-cover-01.jpg" alt="غلاف تقرير الربع الثالث 2024" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2024 · يوليو–سبتمبر 2024</small><h4><a href="reports/q3-2024.pdf" target="_blank" rel="noopener">تقرير الربع الثالث</a></h4><a href="reports/q3-2024.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a><a href="reports/q3-2024.pptx" download>تنزيل الملف الأصلي PowerPoint ↓</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q2-2024.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الثاني 2024 كاملًا"><img src="reports/q2-2024-cover-01.jpg" alt="غلاف تقرير الربع الثاني 2024" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2024 · أبريل–يونيو 2024</small><h4><a href="reports/q2-2024.pdf" target="_blank" rel="noopener">تقرير الربع الثاني</a></h4><a href="reports/q2-2024.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a><a href="reports/q2-2024.pptx" download>تنزيل الملف الأصلي PowerPoint ↓</a></div>
            </article>
            <article class="media-archive-card">
              <a class="media-archive-preview" href="reports/q1-2024.pdf" target="_blank" rel="noopener" aria-label="قراءة تقرير الربع الأول 2024 كاملًا"><img src="reports/q1-2024-cover-01.jpg" alt="غلاف تقرير الربع الأول 2024" loading="lazy"><span>قراءة التقرير ↗</span></a>
              <div class="media-archive-info"><small>2024 · يناير–مارس 2024</small><h4><a href="reports/q1-2024.pdf" target="_blank" rel="noopener">تقرير الربع الأول</a></h4><a href="reports/q1-2024.pdf" target="_blank" rel="noopener">فتح التقرير الكامل PDF ↗</a><a href="reports/q1-2024.pptx" download>تنزيل الملف الأصلي PowerPoint ↓</a></div>
            </article>
          </div>
          <div class="media-flow-v2"><span>مصدر واحد موثوق</span><i>←</i><span>قراءة سريعة للإدارة العليا</span><i>←</i><span>تحديث دوري منظم</span></div>
        </section>

'''

if 'id="community-line"' not in text:
    achievement_marker = '        <section class="section-block" id="achievements">'
    if achievement_marker not in text:
        raise SystemExit("Expected achievements section for standalone chapter insertion")
    text = text.replace(achievement_marker, community_media_sections + achievement_marker, 1)

# Append after earlier entries so saved edits to their positions remain intact.
award_anchor = '<article><time>2024</time><div><h3>شهادة التميز في جودة الخدمات</h3><p>تطبيق المبادئ التوجيهية للجمعية الدولية للضمان الاجتماعي (ISSA).</p></div></article>\n          </div>'
replace_required(award_anchor, '<article><time>2024</time><div><h3>شهادة التميز في جودة الخدمات</h3><p>تطبيق المبادئ التوجيهية للجمعية الدولية للضمان الاجتماعي (ISSA).</p></div></article>\n            <article class="award-2026"><time>2026</time><div><h3>جائزة التميز المؤسسي لأفضل منفذ خدمة</h3><p>حصلت 8 دوائر في المحافظات على جائزة التميز المؤسسي لأفضل منفذ خدمة.</p></div></article>\n          </div>')


# Geographic reach label describes governorates only.
replace_required('<small>محافظة مرتبطة<br>عبر واتساب</small>', '<small>محافظة</small>')

# Compact illustrations show the five practical steps without repeating paragraphs.
pillar_paths = [
    '<circle cx="12" cy="8" r="3"/><path d="M6 20v-2a6 6 0 0 1 12 0v2M3 7h3M18 7h3M3 12h3M18 12h3"/>',
    '<circle cx="4" cy="6" r="2"/><circle cx="20" cy="18" r="2"/><path d="M6 6h9a4 4 0 0 1 0 8H9a2 2 0 0 0 0 4h9M17 4l3 2-3 2"/>',
    '<path d="M12 2 3 6v6c0 5 9 10 9 10s9-5 9-10V6L12 2Z"/><path d="m8 12 3 3 5-6"/>',
    '<rect x="3" y="2" width="12" height="20" rx="2"/><path d="M7 5h4M8 18h2M17 10h2a3 3 0 0 1 3 3v5M17 6a2 2 0 1 0 4 0 2 2 0 0 0-4 0Z"/>',
    '<path d="M20 8a9 9 0 0 0-15-3L2 8M2 3v5h5M4 16a9 9 0 0 0 15 3l3-3M22 21v-5h-5M8 15v-3M12 15V8M16 15v-5"/>'
]
pillar_tags = [('الاستماع','الفهم','التصنيف'),('الوعي','الحل','المتابعة'),('المعرفة','الصلاحيات','الحل'),('سهولة','شمول','دعم بشري'),('قياس','مراجعة','تحسين')]
match = re.search(r'<div class="pillar-track">(.*?)</div>', text, re.S)
if not match:
    raise SystemExit("Expected five customer centricity steps")
index = [0]
def illustrate_pillar(m):
    n = index[0]; index[0] += 1
    art = '<svg class="pillar-illustration" viewBox="0 0 24 24" aria-hidden="true">' + pillar_paths[n] + '</svg>'
    tags = '<div class="pillar-visual-flow">' + ''.join('<span>'+t+'</span>' for t in pillar_tags[n]) + '</div>'
    return '<article>' + art + m.group(1) + tags + '</article>'
pipeline = re.sub(r'<article>(.*?)</article>', illustrate_pillar, match.group(1), flags=re.S)
if index[0] != 5:
    raise SystemExit("Expected exactly five customer centricity steps")
text = text[:match.start(1)] + pipeline + text[match.end(1):]

# Force fresh navigation and presentation scripts after routing fixes.
text = text.replace('src="assets/exhibition.js"', 'src="assets/exhibition.js?v=20260927-final"')
text = text.replace('src="assets/platform-enhancements.js?v=20260927-5"', 'src="assets/platform-enhancements.js?v=20260927-final"')

# The fullscreen board is an alternative presentation surface inside the page,
# not a second primary document landmark.
replace_required('<main class="board-stage">', '<div class="board-stage" role="region" aria-label="شرائح العرض التنفيذي">')
replace_required('</main>\n    <footer class="board-footer">', '</div>\n    <footer class="board-footer">')

# A different asset URL for every deployment avoids mixing cached JavaScript
# from an earlier publication with this page's current chapter markup.
asset_revision = os.environ.get("GITHUB_SHA", "local-preview")[:12]
for asset in [
    "data.js","plan-data-2026.js","excel-import.js","app.js",
    "platform-enhancements.js","privacy-lock.js","exhibition.js","executive-mode.js","ux-system.js"
]:
    text = re.sub(rf'src="assets/{re.escape(asset)}(?:\?v=[^"]*)?"', f'src="assets/{asset}?v={asset_revision}"', text)
text = re.sub(r'href="assets/styles.css(?:\?v=[^"]*)?"', f'href="assets/styles.css?v={asset_revision}"', text)
text = re.sub(r'href="assets/exhibition.css(?:\?v=[^"]*)?"', f'href="assets/exhibition.css?v={asset_revision}"', text)
text = re.sub(r'src="assets/work-tracker.html(?:\?v=[^"]*)?"', f'src="assets/work-tracker.html?v={asset_revision}"', text)

# Load this last: the upstream exhibition stylesheet centers an overflowing
# tab row, placing its first tabs beyond the right edge on some screens.
text = text.replace('</head>', f'  <link rel="stylesheet" href="assets/card-refinements.css?v={asset_revision}" />\n</head>', 1)
navigation_css = f'  <link rel="stylesheet" href="assets/navigation-reliability.css?v={asset_revision}" />'
text = text.replace('</head>', navigation_css + '\n</head>', 1)
ux_css = f'  <link rel="stylesheet" href="assets/ux-system.css?v={asset_revision}" />'
text = text.replace('</head>', ux_css + '\n</head>', 1)
ux_script = f'  <script src="assets/ux-system.js?v={asset_revision}"></script>'
text = text.replace('</body>', ux_script + '\n</body>', 1)

text = re.sub(r'<script>\(function\(\)\{function c\(\).*?</script>', '', text, flags=re.S)
path.write_text(text, encoding="utf-8")
