(()=>{'use strict';
const steps=[['الملخص التنفيذي','نظرة عامة','overview'],['الملخص التنفيذي','الأداء والمؤشرات','performance'],['المتعامل والقنوات','منهجية المديرية','methodology'],['المتعامل والقنوات','التغطية','coverage'],['المتعامل والقنوات','قنوات الخدمة','channels'],['المتعامل والقنوات','مركز الاتصال الذكي','contact-center'],['المتعامل والقنوات','الممارسات','practices'],['المتعامل والقنوات','منصة تجاوب','tajawob'],['التواصل المجتمعي','الموقف التنفيذي لخطة التواصل المجتمعي','community-line'],['التواصل المجتمعي','خطة التواصل المجتمعي التفصيلية','plan'],...['نبذة عامة','التوجه الاستراتيجي','المنصات والوصول','التواصل المجتمعي','الأداء والمؤشرات','التحديات والتكامل','نظام الادخار'].map((t,i)=>['التواصل والإعلام',t,'communications',['intro','strategy','channels','community','performance','coordination','savings'][i]])];
const $=s=>document.querySelector(s),platform=$('#platform'),plan=$('#plan');let current=0,ready=false,planReady=false;const params=new URLSearchParams(location.hash.slice(1));current=Math.min(steps.length-1,Math.max(0,(parseInt(params.get('slide'),10)||1)-1));
let group;steps.forEach((s,i)=>{if(!group||group.label!==s[0]){group=document.createElement('optgroup');group.label=s[0];$('#contents').append(group)}const o=document.createElement('option');o.value=i;o.textContent=`${i+1}. ${s[1]}`;group.append(o)});
function keys(e){if(e.key==='Escape'&&focusMode){focusMode=false;syncFullscreen();return}if(e.defaultPrevented||e.ctrlKey||e.altKey||e.metaKey||e.target.closest('input,textarea,select,[contenteditable=true]'))return;if(['ArrowLeft','PageDown'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();go(current+1)}else if(['ArrowRight','PageUp'].includes(e.key)){e.preventDefault();e.stopImmediatePropagation();go(current-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(steps.length-1)}}
window.addEventListener('keydown',keys,true);
// Use a readable logical canvas on high-resolution displays, without rebuilding content.
const stage=$('#stage');
function fitStage(){
 const width=stage.clientWidth,height=stage.clientHeight;
 if(!width||!height)return;
 const scale=Math.max(1,width/1280);
 for(const frame of [platform,plan]){
  frame.style.width=(width/scale)+'px';frame.style.height=(height/scale)+'px';
  frame.style.transform='scale('+scale+')';
 }
 document.documentElement.style.setProperty('--display-unit',Math.max(1,Math.min(3,width/1280))+'px');
}
const stageObserver=new ResizeObserver(fitStage);stageObserver.observe(stage);
window.addEventListener('resize',fitStage);fitStage();

function style(doc,text,id){if(doc.getElementById(id))return;const s=doc.createElement('style');s.id=id;s.textContent=text;doc.head.append(s)}
const stageCSS=`html{--presentation-header-height:0px!important;--presentation-nav-height:0px!important;--presentation-footer-height:0px!important;scroll-padding-top:0!important}.topbar,.top-navigation,.ux-nav-groups,.chapter-footer,.as-palette,#appearance-studio,.as-backdrop,.skip-link,.edit-toolbar,.edit-tools-panel{display:none!important}body{padding:0!important;margin:0!important}.shell{padding-top:0!important}main{padding-bottom:24px!important}body::before{pointer-events:none}`;
function go(n){if(n<0||n>=steps.length)return;current=n;const s=steps[n],isPlan=s[2]==='plan';platform.hidden=isPlan;plan.hidden=!isPlan;$('#loading').hidden=isPlan?planReady:ready;$('#contents').value=n;$('#title').textContent=s[0]+' · '+s[1];$('#counter').textContent=(n+1)+' / '+steps.length;$('#progress').max=steps.length;$('#progress').value=n+1;$('#prev').disabled=n===0;$('#next').disabled=n===steps.length-1;history.replaceState(null,'','#slide='+(n+1));if(isPlan){if(planReady)plan.contentWindow.scrollTo(0,0);return}if(!ready)return;platform.contentWindow.location.hash=s[2];const root=platform.contentDocument.querySelector('#communications-app')?.shadowRoot;if(root){style(root.ownerDocument,stageCSS,'leadership-stage');if(!root.querySelector('#leadership-comm')){const css=document.createElement('style');css.id='leadership-comm';css.textContent='.comm-pager,.nav,footer{display:none!important}.comm-main{padding-bottom:25px!important}';root.append(css)}if(s[3])root.querySelector('[data-page="'+s[3]+'"]')?.click()}platform.contentWindow.scrollTo(0,0)}
function bind(frame){frame.contentDocument.addEventListener('keydown',keys,true);frame.contentDocument.addEventListener('click',e=>{const a=e.composedPath().find(x=>x?.tagName==='A');if(!a)return;const href=a.getAttribute('href')||'';if(href.includes('community-communication-plan-2026.html')){e.preventDefault();go(9)}else if(href.startsWith('#')){const i=steps.findIndex(s=>s[2]===href.slice(1));e.preventDefault();if(i>=0)go(i)}else if(href.includes('index.html#community-line')){e.preventDefault();go(8)}else if(!a.hasAttribute('download')){a.target='_blank';a.rel='noopener'}},true)}
platform.addEventListener('load',()=>{try{const d=platform.contentDocument;if(!d.querySelector('#overview'))throw Error('المحتوى غير جاهز');style(d,stageCSS,'leadership-stage');bind(platform);ready=true;go(current);const host=d.querySelector('#communications-app');if(host&&!host.shadowRoot){let attempts=0;const timer=setInterval(()=>{if(host.shadowRoot||++attempts>30){clearInterval(timer);go(current)}},100)}}catch(e){$('#loading').textContent='تعذر تحميل محتوى العرض. أعد تحميل الصفحة.'}});
plan.addEventListener('load',()=>{try{style(plan.contentDocument,'header,.as-palette,#appearance-studio{display:none!important}main{padding-top:20px!important}','leadership-plan');bind(plan);planReady=true;if(steps[current][2]==='plan')go(current)}catch(e){}});
$('#contents').onchange=e=>go(Number(e.target.value));$('#next').onclick=()=>go(current+1);$('#prev').onclick=()=>go(current-1);
let focusMode=false,fullscreenBusy=false;
function nativeFullscreen(){return document.fullscreenElement||document.webkitFullscreenElement}
function syncFullscreen(){
 const active=!!nativeFullscreen()||focusMode;
 document.body.classList.toggle('is-fullscreen',active);
 $('#contents').hidden=active;
 $('#full').setAttribute('aria-pressed',String(active));
 $('#full').setAttribute('aria-label',active?'إنهاء الشاشة الكاملة':'شاشة كاملة');
 $('#full').title=active?'إنهاء الشاشة الكاملة':'شاشة كاملة';
 requestAnimationFrame(fitStage);
}
$('#full').onclick=async()=>{
 if(fullscreenBusy)return;
 fullscreenBusy=true;
 try{
  if(nativeFullscreen()){
   const exit=document.exitFullscreen||document.webkitExitFullscreen;
   if(exit)await exit.call(document);
   focusMode=false;
  }else if(focusMode){focusMode=false}else{
   const enter=document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen;
   if(enter){
    try{await enter.call(document.documentElement)}catch(error){focusMode=true}
   }else{focusMode=true}
   if(focusMode)$('#display-status').textContent='تم تفعيل وضع العرض داخل النافذة؛ ملء الشاشة غير متاح في هذا المتصفح.';
  }
 }finally{fullscreenBusy=false;syncFullscreen()}
};
for(const event of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(event,()=>{if(nativeFullscreen())focusMode=false;syncFullscreen()});
// Escape also restores the controls when a browser cannot enter native fullscreen.
window.addEventListener('keydown',e=>{if(e.key==='Escape'&&focusMode){focusMode=false;syncFullscreen()}},true);
syncFullscreen();go(current);
})();
