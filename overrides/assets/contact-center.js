(function(){
  "use strict";

  const svg = {
    pin:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-7 8-13a8 8 0 1 0-16 0c0 6 8 13 8 13Z"/><circle cx="12" cy="9" r="3"/></svg>',
    whatsapp:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 3.5A11.8 11.8 0 0 0 2 17.7L.4 23.5l6-1.6A11.8 11.8 0 0 0 20.5 3.5ZM12 21a9.7 9.7 0 0 1-4.9-1.3l-.4-.2-3.5.9.9-3.4-.3-.5A9.7 9.7 0 1 1 12 21Zm5.4-7.3c-.3-.1-1.7-.8-1.9-.9-.3-.1-.5-.1-.7.2l-.9 1c-.2.2-.3.2-.6.1a8 8 0 0 1-3.9-3.4c-.2-.3 0-.4.1-.6l.6-.7c.1-.2.1-.4 0-.6l-.9-2c-.2-.5-.4-.5-.6-.5h-.5c-.2 0-.5.1-.7.3-.7.7-1.1 1.6-1 2.5 0 1.5 1.1 2.9 1.3 3.1.2.2 2.2 3.4 5.3 4.6 2.2.9 3 .8 3.6.7 1-.2 1.8-1.1 2-1.8.1-.6.1-1.1 0-1.2-.1-.2-.3-.2-.6-.4Z"/></svg>',
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
              '<header><span class="cc-brand-mark">'+svg.whatsapp+'</span><div><small>المساعد الذكي · واتساب</small><strong dir="ltr">112,238</strong><span>إجمالي المحادثات</span></div></header>',
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
                '<svg viewBox="0 0 800 220" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="ccArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CCA862" stop-opacity=".42"/><stop offset="1" stop-color="#CCA862" stop-opacity=".03"/></linearGradient></defs><path d="M20 176 L115 116 L210 98 L305 121 L400 103 L495 99 L590 83 L685 82 L780 43 L780 205 L20 205 Z" fill="url(#ccArea)"/><polyline points="20,176 115,116 210,98 305,121 400,103 495,99 590,83 685,82 780,43"/><g><circle cx="20" cy="176" r="6"/><circle cx="115" cy="116" r="6"/><circle cx="210" cy="98" r="6"/><circle cx="305" cy="121" r="6"/><circle cx="400" cy="103" r="6"/><circle cx="495" cy="99" r="6"/><circle cx="590" cy="83" r="6"/><circle cx="685" cy="82" r="6"/><circle cx="780" cy="43" r="6"/></g></svg>',
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
    if(!layout||!map||!inspector) return;

    layout.classList.remove("map-card-layout");
    layout.classList.add("map-inspector-layout");
    const oldZone=layout.querySelector(".map-navigation-zone");
    if(oldZone){
      oldZone.insertAdjacentElement("beforebegin",map);
      oldZone.remove();
    }
    layout.querySelectorAll(".governorate-quick-panel").forEach(item=>item.remove());

    map.classList.add("forum-map-surface");
    const image=map.querySelector(".oman-map-source");
    if(image){
      image.src="forum/assets/oman.png";
      image.alt="خريطة سلطنة عُمان المستخدمة في ملتقى دوائر المحافظات";
    }

    const select=document.getElementById("governorateSelect");
    const syncSelection=()=>{
      const selected=(select&&select.value)||"all";
      map.querySelectorAll(".map-label[data-governorate]").forEach(label=>{
        const active=selected!=="all"&&label.dataset.governorate===selected;
        label.classList.toggle("highlighted",active);
        label.setAttribute("aria-pressed",String(active));
      });
    };
    if(select) select.addEventListener("change",syncSelection);
    map.querySelectorAll(".map-label[data-governorate]").forEach(label=>{
      label.addEventListener("click",()=>setTimeout(syncSelection,0));
    });
    syncSelection();
  }

  function refineServiceExperience(){
    const contact=document.getElementById('contact-center');
    const geographic=document.getElementById('governorates-map');
    const tajawob=document.getElementById('tajawob');
    [contact,geographic,tajawob].forEach(section=>section&&section.classList.add('service-refined'));
    if(geographic){
      const inspector=geographic.querySelector('.governorate-inspector');
      const profile=geographic.querySelector('.governorate-profile-column');
      if(inspector&&profile&&!inspector.querySelector('.governorate-context')){
        const context=document.createElement('div');
        context.className='governorate-context';
        [...profile.children].filter(item=>!item.matches('.inspector-heading,.inspector-title,.inspector-kpis')).forEach(item=>context.appendChild(item));
        inspector.appendChild(context);
      }
      const heading=geographic.querySelector('.map-heading>div');
      if(heading&&!heading.querySelector('.experience-symbol')){
        heading.insertAdjacentHTML('afterbegin','<i class="experience-symbol" aria-hidden="true">'+svg.pin+'</i>');
      }
      const map=geographic.querySelector('.oman-vector-map');
      if(map&&!map.querySelector('.map-surface-heading')){
        map.insertAdjacentHTML('afterbegin','<div class="map-surface-heading"><b>سلطنة عُمان</b><small>اختر محافظة لاستعراض مؤشراتها</small></div>');
      }
    }
    if(!tajawob)return;
    const title=tajawob.querySelector('.section-heading');
    if(title&&!title.querySelector('.experience-symbol')){
      title.insertAdjacentHTML('beforeend','<i class="experience-symbol" aria-hidden="true">'+svg.message+'</i>');
    }
    const flowIcons=[svg.message,svg.share,svg.check,svg.chart];
    tajawob.querySelectorAll('.tajawob-flow article>i').forEach((item,index)=>{item.innerHTML=flowIcons[index];});
    const typeIcons=[svg.heart,svg.message,svg.pin,svg.book];
    tajawob.querySelectorAll('.tajawob-type-grid article').forEach((item,index)=>{
      if(!item.querySelector('.experience-type-icon'))item.insertAdjacentHTML('afterbegin','<i class="experience-type-icon" aria-hidden="true">'+typeIcons[index]+'</i>');
    });
    // Read the existing monthly table so the chart always follows its authored values.
    const monthly=tajawob.querySelector('.tajawob-monthly');
    const rows=monthly?[...monthly.querySelectorAll('tbody tr')]:[];
    if(rows.length&&!tajawob.querySelector('.tajawob-trend')){
      const months=rows.map(row=>[...row.cells].map(cell=>cell.textContent.trim()));
      const maximum=Math.max(...months.map(month=>Number(month[1].replace(/,/g,''))));
      const trend=document.createElement('figure');
      trend.className='tajawob-trend';
      trend.setAttribute('aria-label','الاتجاه الشهري لإجمالي طلبات منصة تجاوب');
      trend.innerHTML='<header><div><span>اتجاه الطلبات</span><h3>حجم التفاعل عبر الأشهر</h3></div><small>يناير–سبتمبر 2026</small></header><div class="tajawob-trend-bars">'+months.map(month=>'<div style="--month-height:'+(Number(month[1].replace(/,/g,''))/maximum*100).toFixed(2)+'%"><b dir="ltr">'+month[1]+'</b><i></i><span>'+month[0]+'</span></div>').join('')+'</div>';
      tajawob.querySelector('.tajawob-compare').insertAdjacentElement('beforebegin',trend);
    }
  }

  insertContactCenter();
  enhanceGovernorateMap();
  refineServiceExperience();
  // The shared governorate profile is assembled after DOMContentLoaded.
  // Run the idempotent decoration again once that profile exists.
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(refineServiceExperience,0));
  else setTimeout(refineServiceExperience,0);
})();
