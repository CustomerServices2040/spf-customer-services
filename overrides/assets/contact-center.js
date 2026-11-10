(function(){
  "use strict";

  const svg = {
    phone:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.6 10.8c1.8 3.5 3.1 4.8 6.6 6.6l2.2-2.2c.3-.3.8-.4 1.2-.2 1.3.4 2.7.7 4.1.7.7 0 1.3.6 1.3 1.3v3.6c0 .7-.6 1.3-1.3 1.3C10.4 22 2 13.6 2 3.3 2 2.6 2.6 2 3.3 2h3.6c.7 0 1.3.6 1.3 1.3 0 1.4.2 2.8.7 4.1.1.4 0 .9-.3 1.2l-2 2.2Z"/></svg>',
    check:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/><circle cx="12" cy="12" r="9"/></svg>',
    chart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10m6 10V4m6 16v-7m4 7H2"/></svg>',
    clock:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/></svg>',
    smile:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
    headset:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 14v-2a8 8 0 0 1 16 0v2M4 14h3v6H5a2 2 0 0 1-2-2v-2a2 2 0 0 1 1-2Zm16 0h-3v6h2a2 2 0 0 0 2-2v-2a2 2 0 0 0-1-2ZM17 20c-1 1-2.5 2-5 2"/></svg>',
    message:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 9h8m-8 3h5"/></svg>',
    share:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.5 6.8-4m-6.8 7 6.8 4"/></svg>',
    book:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5a3 3 0 0 1 3-2h5v17H7a3 3 0 0 0-3 2V5Zm16 0a3 3 0 0 0-3-2h-5v17h5a3 3 0 0 1 3 2V5Z"/></svg>',
    bot:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="7" width="16" height="12" rx="3"/><path d="M12 3v4M8 12h.01M16 12h.01M8 16h8"/></svg>',
    mic:'<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3m-4 0h8"/></svg>',
    heart:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/></svg>'
  };

  function metric(icon,label,value,detail,extra){
    return '<article class="cc-metric '+(extra||'')+'"><span class="cc-icon">'+icon+'</span><div><span>'+label+'</span><strong dir="ltr">'+value+'</strong><small>'+detail+'</small></div></article>';
  }

  function insertContactCenter(){
    if(document.getElementById("contact-center")) return;
    const channels=document.getElementById("channels");
    const navigation=document.querySelector(".top-navigation");
    const channelsLink=navigation&&navigation.querySelector('a[href="#channels"]');
    if(!channels||!navigation||!channelsLink) return;

    const link=document.createElement("a");
    link.href="#contact-center";
    link.textContent="مركز الاتصال";
    channelsLink.insertAdjacentElement("afterend",link);

    const section=document.createElement("section");
    section.id="contact-center";
    section.className="section-block chapter-hidden cc-section";
    section.hidden=true;
    section.setAttribute("aria-hidden","true");
    section.innerHTML=[
      '<div class="cc-shell">',
        '<header class="cc-hero">',
          '<div class="cc-hero-copy">',
            '<span class="cc-eyebrow">مركز الاتصال والقنوات الرقمية</span>',
            '<h2>الأداء العام لمركز الاتصال</h2>',
            '<p>قراءة تنفيذية موحّدة لأداء المكالمات وجودة الخدمة والتفاعل الرقمي.</p>',
            '<div class="cc-period"><span></span> يناير–سبتمبر 2026</div>',
          '</div>',
          '<div class="cc-hero-visual" aria-hidden="true"><div class="cc-orbit"><i></i><i></i><i></i><span>'+svg.headset+'</span></div><b>مركز الاتصال</b><small>صوت المتعامل في مسار واحد</small></div>',
        '</header>',

        '<div class="cc-primary-grid" aria-label="المؤشرات الرئيسية لمركز الاتصال">',
          metric(svg.phone,'إجمالي المكالمات الواردة','271,763','مكالمة خلال الفترة','cc-primary'),
          metric(svg.check,'المكالمات المستلمة','111,740','مكالمة تمت خدمتها','cc-primary'),
          '<article class="cc-rate-card"><div class="cc-rate-ring" style="--cc-rate:97.6"><strong dir="ltr">97.60%</strong><span>نسبة الاستجابة</span></div><p>مؤشر يوضح كفاءة الوصول إلى المتعامل والاستجابة للمكالمات.</p></article>',
        '</div>',

        '<section class="cc-panel cc-performance">',
          '<div class="cc-panel-heading"><div><span>كفاءة الأداء</span><h3>السرعة والجاهزية التشغيلية</h3></div><span class="cc-section-icon">'+svg.chart+'</span></div>',
          '<div class="cc-performance-grid">',
            '<article class="cc-level"><div class="cc-mini-ring" style="--cc-rate:93"><strong dir="ltr">93.0%</strong></div><div><b>مستوى الخدمة</b><small>النتيجة الإجمالية للفترة</small></div></article>',
            metric(svg.clock,'متوسط وقت الانتظار','00:00:40','ساعة : دقيقة : ثانية','cc-compact'),
            metric(svg.clock,'متوسط مدة المكالمة','00:03:22','ساعة : دقيقة : ثانية','cc-compact'),
            metric(svg.phone,'خدمة «اتصل بي»','2,336','طلب اتصال عكسي','cc-compact'),
            '<article class="cc-satisfaction"><span class="cc-icon">'+svg.smile+'</span><div><span>نسبة رضا المتعاملين</span><strong dir="ltr">86.64%</strong><div class="cc-progress"><i style="width:86.64%"></i></div></div></article>',
          '</div>',
        '</section>',

        '<section class="cc-panel cc-digital">',
          '<div class="cc-panel-heading"><div><span>القنوات الرقمية</span><h3>حجم التفاعل واتجاه النمو</h3></div><span class="cc-section-icon">'+svg.share+'</span></div>',
          '<div class="cc-chart-grid">',
            '<article class="cc-chart-card cc-whatsapp">',
              '<header><span class="cc-brand-mark">WA</span><div><small>المساعد الذكي · واتساب</small><strong dir="ltr">112,238</strong><span>إجمالي المحادثات</span></div></header>',
              '<div class="cc-bars" aria-label="محادثات واتساب من أبريل إلى سبتمبر 2026">',
                '<div style="--h:39%"><i></i><b>14,980</b><span>أبريل</span></div>',
                '<div style="--h:31%"><i></i><b>11,640</b><span>مايو</span></div>',
                '<div style="--h:37%"><i></i><b>14,116</b><span>يونيو</span></div>',
                '<div style="--h:38%"><i></i><b>14,263</b><span>يوليو</span></div>',
                '<div style="--h:51%"><i></i><b>19,273</b><span>أغسطس</span></div>',
                '<div style="--h:100%"><i></i><b>37,966</b><span>سبتمبر</span></div>',
              '</div>',
            '</article>',
            '<article class="cc-chart-card cc-x">',
              '<header><span class="cc-brand-mark">X</span><div><small>الردود في منصة X</small><strong dir="ltr">3,424</strong><span>إجمالي الردود</span></div></header>',
              '<div class="cc-line-chart" aria-label="الردود الشهرية في منصة X من يناير إلى سبتمبر 2026">',
                '<svg viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ccArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC20D" stop-opacity=".42"/><stop offset="1" stop-color="#FFC20D" stop-opacity=".03"/></linearGradient></defs><path d="M20 176 L115 116 L210 98 L305 121 L400 103 L495 99 L590 83 L685 82 L780 43 L780 205 L20 205 Z" fill="url(#ccArea)"/><polyline points="20,176 115,116 210,98 305,121 400,103 495,99 590,83 685,82 780,43"/><g><circle cx="20" cy="176" r="6"/><circle cx="115" cy="116" r="6"/><circle cx="210" cy="98" r="6"/><circle cx="305" cy="121" r="6"/><circle cx="400" cy="103" r="6"/><circle cx="495" cy="99" r="6"/><circle cx="590" cy="83" r="6"/><circle cx="685" cy="82" r="6"/><circle cx="780" cy="43" r="6"/></g></svg>',
                '<div class="cc-line-values"><span><b>183</b><small>يناير</small></span><span><b>356</b><small>فبراير</small></span><span><b>397</b><small>مارس</small></span><span><b>348</b><small>أبريل</small></span><span><b>387</b><small>مايو</small></span><span><b>396</b><small>يونيو</small></span><span><b>425</b><small>يوليو</small></span><span><b>426</b><small>أغسطس</small></span><span><b>506</b><small>سبتمبر</small></span></div>',
              '</div>',
            '</article>',
          '</div>',
        '</section>',

        '<section class="cc-panel cc-smart">',
          '<div class="cc-panel-heading"><div><span>التقنيات والخصائص الذكية</span><h3>منظومة متكاملة ترفع دقة الخدمة وسرعة الاستجابة</h3></div><span class="cc-section-icon">'+svg.headset+'</span></div>',
          '<div class="cc-smart-layout">',
            '<article class="cc-capability cc-cap-1"><span>'+svg.heart+'</span><div><h4>تحليل مشاعر المتعاملين</h4><p>تحليل نبرة الصوت والنصوص لقياس المشاعر والرضا ودعم التحسين المستمر.</p></div></article>',
            '<article class="cc-capability cc-cap-2"><span>'+svg.chart+'</span><div><h4>عرض 360 درجة</h4><p>رؤية موحّدة وشاملة لكل تفاعلات المتعامل لضمان اتساق وجودة الخدمة.</p></div></article>',
            '<article class="cc-capability cc-cap-3"><span>'+svg.bot+'</span><div><h4>المساعد الافتراضي</h4><p>تفاعل ذكي ومباشر يجيب عن الاستفسارات الفورية ويخدم المتعامل على مدار الساعة.</p></div></article>',
            '<div class="cc-smart-core" aria-hidden="true"><span>'+svg.headset+'</span><b>مركز اتصال ذكي</b><small>بيانات · معرفة · استجابة</small></div>',
            '<article class="cc-capability cc-cap-4"><span>'+svg.book+'</span><div><h4>قاعدة المعرفة الشاملة</h4><p>مستودع معلوماتي ضخم يعزز دقة وسرعة المعلومات المقدمة للمتعاملين والموظفين.</p></div></article>',
            '<article class="cc-capability cc-cap-5"><span>'+svg.mic+'</span><div><h4>نظام الرد الآلي المتقدم IVR</h4><p>نظام تفاعلي متعدد المستويات يتيح الخدمة الذاتية دون الحاجة لتدخل بشري.</p></div></article>',
          '</div>',
        '</section>',
      '</div>'
    ].join("");
    channels.insertAdjacentElement("afterend",section);
  }

  function enhanceGovernorateMap(){
    const layout=document.querySelector("#governorates-map .interactive-map-layout");
    const map=document.querySelector("#governorates-map .oman-map-scroll");
    const inspector=document.getElementById("governorateInspector");
    if(!layout||!map||!inspector||layout.querySelector(".map-navigation-zone")) return;

    const zone=document.createElement("div");
    zone.className="map-navigation-zone";
    const quick=document.createElement("div");
    quick.className="governorate-quick-panel";
    quick.innerHTML='<div class="governorate-quick-heading"><span>التنقل بين المحافظات</span><strong>اختر محافظة لمتابعة بياناتها</strong></div><div class="governorate-quick-grid"></div>';
    const grid=quick.querySelector(".governorate-quick-grid");
    const select=document.getElementById("governorateSelect");

    const all=document.createElement("button");
    all.type="button";
    all.className="governorate-quick-card active";
    all.dataset.governorate="all";
    all.innerHTML='<span><b>جميع المحافظات</b><small>عرض المؤشرات الإجمالية</small></span><i aria-hidden="true">11</i>';
    grid.appendChild(all);

    document.querySelectorAll("#governorates-map .map-label[data-governorate]").forEach(label=>{
      const button=document.createElement("button");
      button.type="button";
      button.className="governorate-quick-card";
      button.dataset.governorate=label.dataset.governorate;
      button.innerHTML='<span><b>'+label.querySelector("b").textContent+'</b><small dir="ltr">'+label.querySelector("small").textContent+'</small></span><i aria-hidden="true">›</i>';
      button.addEventListener("click",()=>{ label.click(); setTimeout(sync,0); });
      grid.appendChild(button);
    });

    function sync(){
      const value=(select&&select.value)||"all";
      grid.querySelectorAll("button").forEach(button=>{
        const active=button.dataset.governorate===value;
        button.classList.toggle("active",active);
        button.setAttribute("aria-pressed",String(active));
      });
    }
    all.addEventListener("click",()=>{
      if(select){
        select.value="all";
        select.dispatchEvent(new Event("change",{bubbles:true}));
      }
      sync();
    });
    if(select) select.addEventListener("change",sync);

    zone.append(map,quick);
    layout.insertBefore(zone,inspector);
    layout.classList.add("map-card-layout");
    sync();
  }

  insertContactCenter();
  enhanceGovernorateMap();
})();