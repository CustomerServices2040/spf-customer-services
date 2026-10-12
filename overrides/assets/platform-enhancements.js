(function(){
  "use strict";
  const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
  const fmt=n=>new Intl.NumberFormat("en-US").format(Number(n)||0);
  // NCSI September 2026 monthly bulletin, table 1: registered Omanis at end of August.
  const omanisByGovernorate={
    "مسقط":612670,"ظفار":247723,"مسندم":36932,"البريمي":77161,
    "الداخلية":416156,"شمال الباطنة":615828,"جنوب الباطنة":384828,
    "جنوب الشرقية":254642,"شمال الشرقية":217200,"الظاهرة":182044,"الوسطى":27915
  };

  // Community and media-center chapters are injected server-side by patch_index.py.
  // Keeping their chapter markup out of this runtime enhancement script prevents
  // duplicate/bleeding sections and lets exhibition.js own tab visibility.

  function enhanceGovernorateInspector(){
    const inspector=$("#governorateInspector"); if(!inspector) return;
    const setText=(element,value)=>{
      if(element && element.textContent!==value) element.textContent=value;
    };
    const titleCards=$$("article",inspector);
    titleCards.forEach(card=>{
      const span=$("span",card); if(!span)return;
      if(span.textContent.trim()==="القوى العاملة") span.textContent="الكوادر البشرية";
      if(span.textContent.includes("الحصة من موظفي المحافظات")) span.textContent="نسبة الموظفين من إجمالي موظفي المديرية";
    });
    const staff=$("#governorateStaff"),share=$("#governorateShare"),total=$("#governorateTotalWork");
    const shareSmall=share?.parentElement?.querySelector("small");
    setText(shareSmall,"من إجمالي 236 موظفًا في المديرية");
    const oldAverage=[...inspector.querySelectorAll("small")].find(x=>x.textContent.includes("المتوسط:"));
    setText(oldAverage,"تُحسب النسبة من إجمالي موظفي المديرية: 236");
    let extra=$("#governorateProductivity",inspector);
    if(!extra && total){
      extra=document.createElement("div"); extra.id="governorateProductivity"; extra.className="governorate-productivity";
      extra.innerHTML=`<article><span>متوسط الأعمال الشهري لكل موظف</span><b id="govWorkPerEmployee">—</b><small>متوسط يناير–سبتمبر · 9 أشهر</small></article><article><span>المعدل اليومي لكل موظف</span><b id="govDailyPerEmployee">—</b><small>متوسط تقريبي على أساس 198 يومًا من الأحد–الخميس</small></article>`;
      total.closest("div")?.parentElement?.appendChild(extra);
    }
    let population=$("#governoratePopulation",inspector);
    if(!population){
      population=document.createElement("div"); population.id="governoratePopulation"; population.className="governorate-population";
      population.innerHTML=`<div class="population-head"><span>العمانيون في المحافظة · أغسطس 2026</span><a href="reports/population-aug-2026.pdf" target="_blank" rel="noopener">المصدر: النشرة الإحصائية لشهر سبتمبر 2026 ↗</a></div><div class="population-grid"><article><span>عدد العمانيين</span><b id="govOmaniPopulation">—</b></article></div>`;
      inspector.appendChild(population);
    }
    let premises=$("#dakhiliyahPremises",inspector);
    if(!premises){
      premises=document.createElement("section");
      premises.id="dakhiliyahPremises";
      premises.className="dakhiliyah-premises";
      premises.hidden=true;
      premises.setAttribute("aria-label","مقر دائرة الحماية الاجتماعية بمحافظة الداخلية");
      premises.innerHTML=`<div class="premises-heading"><span class="premises-mark" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 21V7l8-4 8 4v14M8 21v-4h8v4M8 9h2m4 0h2m-8 4h2m4 0h2"/></svg></span><div><small>بيانات المقر</small><h4>مقر دائرة الحماية الاجتماعية بمحافظة الداخلية</h4></div></div><div class="premises-metrics"><article><span aria-hidden="true">□</span><div><small>المساحة</small><strong><b>632</b> متر مربع</strong></div></article><article><span aria-hidden="true">ر.ع</span><div><small>قيمة الإيجار</small><strong><b>2,214</b> ريال عُماني شهريًا</strong></div></article><article><span aria-hidden="true">◇</span><div><small>تكلفة التنفيذ</small><strong><b>267,980</b> ريال عُماني</strong></div></article></div><a class="premises-location" href="https://maps.app.goo.gl/amkyRoVHV9xiTp2C7" target="_blank" rel="noopener"><span><small>الموقع الجغرافي</small><b>فتح موقع المقر على الخريطة</b></span><i aria-hidden="true">⌖</i></a>`;
      population.after(premises);
    }
    let reportLink=$("#governorateReportLink",inspector);
    if(!reportLink){
      reportLink=document.createElement("a");
      reportLink.id="governorateReportLink";
      reportLink.className="governorate-report-link";
      reportLink.href="reports/dakhiliyah-june-2026.html";
      reportLink.hidden=true;
      reportLink.innerHTML='<span><small>تقرير المحافظة</small><b>تقرير دائرة الحماية الاجتماعية بمحافظة الداخلية يونيو 2026</b></span><i aria-hidden="true">↗</i>';
      reportLink.addEventListener("click",event=>{
        const href=reportLink.getAttribute("href")||"";
        if(!href.startsWith("data:text/html;base64,")) return;
        event.preventDefault();
        try{
          const binary=atob(href.slice("data:text/html;base64,".length));
          const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0));
          location.assign(URL.createObjectURL(new Blob([bytes],{type:"text/html;charset=utf-8"})));
        }catch(_){ location.assign(href) }
      });
      population.before(reportLink);
    }
    let profile=$(".governorate-profile-column",inspector);
    if(!profile){
      profile=document.createElement("div");
      profile.className="governorate-profile-column";
      const work=$(".governorate-work",inspector);
      inspector.prepend(profile);
      [...inspector.children].filter(node=>node!==profile&&node!==work).forEach(node=>profile.appendChild(node));
    }
    const governorateSelect=$("#governorateSelect",inspector);
    if(governorateSelect){
      const allOption=governorateSelect.querySelector('option[value="all"]')||governorateSelect.options[0];
      const heading=$("#governorateName");
      // Set the requested default once. Do not keep forcing it afterward:
      // map buttons update the select programmatically and dispatch an
      // untrusted change event, which a persistent default synchronizer would
      // otherwise immediately overwrite.
      setText(allOption,"جميع المحافظات");
      governorateSelect.value=allOption.value;
      governorateSelect.dispatchEvent(new Event("change",{bubbles:true}));
      setText(heading,"جميع المحافظات");
    }
    const update=()=>{
      Array.from(inspector.querySelectorAll("article")).forEach(card=>{
        const label=$("span",card); if(!label)return;
        if(label.textContent.trim()==="القوى العاملة") label.textContent="الكوادر البشرية";
        if(label.textContent.includes("الحصة من موظفي المحافظات")) label.textContent="نسبة الموظفين من إجمالي موظفي المديرية";
      });
      const workCards=$$(".work-metrics article",inspector);
      setText(workCards[0]?.querySelector("span"),"زيارة إلى المقر");
      setText(workCards[7]?.querySelector("span"),"تقييم عبر QR الإجادة المؤسسية - وزارة العمل");
      const name=String($("#governorateName")?.textContent||"").trim().replace(/^محافظة\s*/,"");
      const showDakhiliyahReport=name==="الداخلية";
      if(reportLink.hidden===showDakhiliyahReport) reportLink.hidden=!showDakhiliyahReport;
      if(premises.hidden===showDakhiliyahReport) premises.hidden=!showDakhiliyahReport;
      const omanCount=omanisByGovernorate[name];
      setText($("#govOmaniPopulation",population),omanCount?fmt(omanCount):"—");
      const currentShareSmall=share?.parentElement?.querySelector("small");
      setText(currentShareSmall,"من إجمالي 236 موظفًا في المديرية");
      const s=Number(String(staff?.textContent||"").replace(/[^0-9.]/g,""))||0;
      const w=Number(String(total?.textContent||"").replace(/[^0-9.]/g,""))||0;
      if(share && s) setText(share,(s/236*100).toFixed(1)+"%");
      const per=$("#govWorkPerEmployee"),daily=$("#govDailyPerEmployee");
      setText(per,s?fmt(Math.round(w/s/9)):"—");
      setText(daily,s?(w/s/198).toFixed(1):"—");
    };
    update();
    new MutationObserver(update).observe(inspector,{subtree:true,childList:true,characterData:true});
  }

  function decorateGovernorateCards(){
    const inspector=$("#governorateInspector"); if(!inspector)return;
    const icons={
      staff:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 9a3 3 0 0 1 0 6m2 2a4 4 0 0 1 2 3"/>',
      share:'<path d="M12 3v9h9A9 9 0 0 0 12 3Z"/><path d="M9 4a9 9 0 1 0 11 11H9Z"/>',
      transaction:'<path d="M5 3h14v18l-3-2-4 2-4-2-3 2V3Z"/><path d="M8 8h8M8 12h8"/>',
      calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>',
      message:'<path d="M4 4h16v12H9l-5 4V4Z"/><path d="M8 9h8m-8 3h5"/>',
      field:'<path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12Z"/><circle cx="12" cy="9" r="2"/>',
      proactive:'<path d="m12 3-2 6H4l5 4-2 7 5-4 5 4-2-7 5-4h-6l-2-6Z"/>',
      self:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M10 17h4"/>',
      community:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z"/>',
      qr:'<path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h2m4 0v3m-6 3h6"/>',
      productivity:'<path d="M4 19h16M6 16l4-5 3 2 5-7"/><path d="M15 6h3v3"/>',
      daily:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>'
    };
    const groups=[
      [".inspector-kpis article",["staff","share"]],
      [".work-metrics article",["transaction","calendar","message","field","proactive","self","community","qr"]],
      [".governorate-productivity article",["productivity","daily"]]
    ];
    groups.forEach(([selector,kinds])=>$$(selector,inspector).forEach((card,index)=>{
      const kind=kinds[index]; if(!kind||card.querySelector(".governorate-card-icon"))return;
      card.classList.add("gov-kind-"+kind);
      const svg=document.createElementNS("http://www.w3.org/2000/svg","svg");
      svg.setAttribute("class","governorate-card-icon");svg.setAttribute("viewBox","0 0 24 24");
      svg.setAttribute("fill","none");svg.setAttribute("stroke","currentColor");
      svg.setAttribute("stroke-width","1.8");svg.setAttribute("stroke-linecap","round");svg.setAttribute("stroke-linejoin","round");
      svg.setAttribute("aria-hidden","true");svg.innerHTML=icons[kind];card.prepend(svg);
    }));
  }

  function correctDirectorateEmployeeCount(){
    const coverage=$("#coverage"); if(!coverage) return;
    $$("article",coverage).forEach(card=>{
      const s=$("span",card),strong=$("strong",card),small=$("small",card);
      if(s && /إجمالي موظفي/.test(s.textContent)){
        s.textContent="إجمالي موظفي المديرية"; if(strong)strong.textContent="236";
        if(small)small.textContent="يشمل جميع موظفي المديرية بالمركز ودوائر المحافظات";
      }
    });
  }

  function enhanceFullscreenToggle(){
    const actions=$(".top-actions"); if(!actions)return;
    let button=$("#fullscreenViewButton",actions);
    if(!button){
      button=document.createElement("button");
      button.id="fullscreenViewButton";
      button.type="button";
      button.className="btn secondary fullscreen-action";
      button.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 3H3v5M16 3h5v5M8 21H3v-5m13 5h5v-5"/></svg><span>شاشة كاملة</span>';
      const printAction=$(".print-action",actions)||[...actions.querySelectorAll("button")].find(item=>item.textContent.includes("طباعة"));
      if(printAction)printAction.before(button);else actions.appendChild(button);
    }
    const requestFullscreen=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;
    const exitFullscreen=document.exitFullscreen||document.webkitExitFullscreen;
    let nativeFullscreenEntered=false;
    const sync=()=>{
      const active=Boolean(document.fullscreenElement||document.webkitFullscreenElement||document.documentElement.classList.contains("presentation-fullscreen"));
      button.setAttribute("aria-pressed",String(active));
      button.setAttribute("aria-label",active?"الخروج من الشاشة الكاملة":"شاشة كاملة");
      const label=$("span",button);if(label)label.textContent=active?"الخروج من الشاشة الكاملة":"شاشة كاملة";
      button.classList.toggle("active",active);
    };
    button.addEventListener("click",async()=>{
      const nativeActive=Boolean(document.fullscreenElement||document.webkitFullscreenElement);
      const presentationActive=document.documentElement.classList.contains("presentation-fullscreen");
      try{
        if(nativeActive&&exitFullscreen)await exitFullscreen.call(document);
        else if(presentationActive)document.documentElement.classList.remove("presentation-fullscreen");
        else{
          document.documentElement.classList.add("presentation-fullscreen");
          if(requestFullscreen)await requestFullscreen.call(document.documentElement);
        }
      }catch(_){button.title="تم تفعيل العرض الكامل داخل الصفحة؛ يمنع هذا المتصفح الشاشة الكاملة الأصلية";}
      sync();
    });
    const onFullscreenChange=()=>{
      const nativeActive=Boolean(document.fullscreenElement||document.webkitFullscreenElement);
      if(nativeActive)nativeFullscreenEntered=true;
      else if(nativeFullscreenEntered){document.documentElement.classList.remove("presentation-fullscreen");nativeFullscreenEntered=false;}
      sync();
    };
    document.addEventListener("fullscreenchange",onFullscreenChange);
    document.addEventListener("webkitfullscreenchange",onFullscreenChange);
    document.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&document.documentElement.classList.contains("presentation-fullscreen")){
        document.documentElement.classList.remove("presentation-fullscreen");
        sync();
      }
    });
    document.addEventListener("dblclick",event=>{
      if(!document.documentElement.classList.contains("presentation-fullscreen"))return;
      if(event.target.closest("a,button,input,select,textarea,video"))return;
      button.click();
    });
    sync();
  }

  function boot(){
    enhanceGovernorateInspector(); decorateGovernorateCards(); correctDirectorateEmployeeCount(); enhanceFullscreenToggle();
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",()=>setTimeout(boot,0)); else setTimeout(boot,0);
})();

