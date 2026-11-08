(()=>{
  "use strict";
  const nav=document.querySelector(".top-navigation");
  if(!nav)return;

  const links=Array.from(nav.querySelectorAll('a[href^="#"]'));
  const entries=links.map(link=>{
    const id=(link.getAttribute("href")||"").slice(1);
    return {link,id,section:document.getElementById(id)};
  }).filter(item=>item.id&&item.section);

  if(!entries.length)return;

  let current=0;
  let footer=document.querySelector(".chapter-footer");
  if(!footer){
    footer=document.createElement("div");
    footer.className="chapter-footer";
    footer.innerHTML='<button id="previousChapter" type="button">→ السابق</button><output id="chapterPosition" aria-live="polite"></output><button id="nextChapter" type="button">التالي ←</button>';
    document.body.appendChild(footer);
  }

  const previous=document.getElementById("previousChapter");
  const next=document.getElementById("nextChapter");
  const output=document.getElementById("chapterPosition");
  const heroMetrics=document.querySelector(".hero-metrics");
  const overviewCompanions=[heroMetrics,document.querySelector(".operational-budget-card")].filter(Boolean);

  function normalizeIndex(index){
    if(!Number.isFinite(index))return 0;
    return Math.max(0,Math.min(Math.trunc(index),entries.length-1));
  }

  function indexFromHash(hash){
    const value=(hash||"").replace(/^#/,"");
    const found=entries.findIndex(item=>item.id===value);
    return found>=0?found:0;
  }

  function applyChapter(index,{historyMode="replace",scroll=true}={}){
    current=normalizeIndex(index);
    document.documentElement.classList.toggle("communications-active", entries[current].id === "communications");
    entries.forEach((item,i)=>{
      const active=i===current;
      item.section.classList.toggle("chapter-hidden",!active);
      item.section.hidden=!active;
      item.section.setAttribute("aria-hidden",active?"false":"true");
      item.link.classList.toggle("active",active);
      if(active)item.link.setAttribute("aria-current","page");
      else item.link.removeAttribute("aria-current");
    });

    if(overviewCompanions.length){
      const overviewActive=entries[current].id==="overview";
      overviewCompanions.forEach(section=>{
        section.classList.toggle("chapter-hidden",!overviewActive);
        section.hidden=!overviewActive;
        section.setAttribute("aria-hidden",overviewActive?"false":"true");
      });
    }

    if(output)output.textContent=`${String(current+1).padStart(2,"0")} / ${entries.length} — ${entries[current].link.textContent.trim()}`;
    if(previous)previous.disabled=current===0;
    if(next)next.disabled=current===entries.length-1;

    // Keep the selected tab reachable in the horizontally scrolling RTL bar.
    entries[current].link.scrollIntoView({block:"nearest",inline:"nearest"});

    const hash="#"+entries[current].id;
    if(location.hash!==hash){
      if(historyMode==="push")history.pushState({chapter:current},"",hash);
      else history.replaceState({chapter:current},"",hash);
    }
    if(scroll)window.scrollTo({top:0,left:0,behavior:"auto"});
  }

  links.forEach(link=>{
    link.addEventListener("click",event=>{
      const index=entries.findIndex(item=>item.link===link);
      if(index<0)return;
      event.preventDefault();
      applyChapter(index,{historyMode:"push",scroll:true});
    });
  });

  if(previous)previous.addEventListener("click",()=>applyChapter(current-1,{historyMode:"push",scroll:true}));
  if(next)next.addEventListener("click",()=>applyChapter(current+1,{historyMode:"push",scroll:true}));

  window.addEventListener("hashchange",()=>applyChapter(indexFromHash(location.hash),{historyMode:"replace",scroll:true}));
  window.addEventListener("popstate",()=>applyChapter(indexFromHash(location.hash),{historyMode:"replace",scroll:true}));

  document.addEventListener("keydown",event=>{
    if(event.target?.isContentEditable||/INPUT|TEXTAREA|SELECT/.test(event.target?.tagName||"")||document.querySelector(".modal.open"))return;
    if(event.key==="ArrowLeft")applyChapter(current+1,{historyMode:"push",scroll:true});
    if(event.key==="ArrowRight")applyChapter(current-1,{historyMode:"push",scroll:true});
  });

  applyChapter(indexFromHash(location.hash),{historyMode:"replace",scroll:false});

  const context=document.modelContext;
  if(context?.registerTool){
    try{
      Promise.resolve(context.registerTool({
        name:"navigate_directorate_chapter",
        description:"Open one of the directorate presentation chapters without changing its content",
        inputSchema:{type:"object",properties:{chapter:{type:"integer",minimum:1,maximum:entries.length}},required:["chapter"],additionalProperties:false},
        annotations:{readOnlyHint:true},
        execute(input){
          if(!Number.isInteger(input.chapter)||input.chapter<1||input.chapter>entries.length)throw new Error("Invalid chapter");
          applyChapter(input.chapter-1,{historyMode:"push",scroll:true});
          return {chapter:input.chapter,title:entries[current].link.textContent.trim()};
        }
      })).catch(()=>{});
    }catch(_){}
  }
})();
