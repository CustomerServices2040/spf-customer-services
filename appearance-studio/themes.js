/* Busola Design System 3.0: semantic presentation only. Existing API retained.
   No content, handlers, permissions, data-source or operational storage writes. */
(()=>{'use strict';
document.documentElement.dataset.bsType='';
const themes=new Set(['original','green','navy','burgundy']);let selected='original',queued=false,css='';const roots=new Map(),scanned=new WeakSet();
const exclude='#busola-visual-editor,#appearance-studio,.as-palette,.bt-picker,svg,.issuer-logo,.brand-logo,.channel-logo,[data-brand],.official-logo,.spf-mark';
const families={
 media:'.photo-card',
 executive:'.executive-hero,.primary-kpi-hero,.cc-hero,.achievement-hero,.recognition-hero,.community-hero-v2,.media-hero-v2,.tajawob-hero,.future-hero,.hero',
 performance:'.metric-card,.component-card,.cc-metric,.cc-rate-card,.cc-service-hours,.risk-summary>article,.workload-metrics>*,.contact-kpi-grid>*,.tajawob-year-card,.kpi,.sav-stat,.media-metric,.media-stat,.operation-metric,.output-item',
 geographic:'.reach-card,.network-card,.map-stat,.inspector-kpis>article,.governorate-work,.work-metrics>article,.population-reading,.premises-metrics>article,.coverage-main',
 information:'.people-card,.availability-card,.digital-channel-card,.service-catalog,.platform,.community-hero-kpis>*,.community-plan-stats>*,.community-impact-grid>*,.map-page-intro,.hero-stat',
 achievement:'.service-achievement-card,.recognition-card,.media-stat-strip>*',
 project:'.project-card,.future-project-item,.plan-card,.committee-card,.future-projects-card',
 timeline:'.timeline-card,.roadmap-step',
 comparison:'.semester-visual,.risk-card,.cc-chart-card,.coverage-bars,.unit-bars',
 detail:'#quarter-chart,.cc-capability,.future-project-item,.geographic-map-card,.risk-detail-grid>article,.operational-budget-card,.mission-card,.strategy-card,.method-application,.practice-axis,.practice-item,.org-card,.community-roadmap-card,.community-calendar-card,.community-details,.modal-panel,.privacy-panel,.spf-encrypted-tab-card,.table-wrap,.table-card,.import-panel,.card.challenge,.answer,.sav-panel,.sav-summary,.sav-context,.sav-matrix>article,.sav-timeline>article,.sav-closing,.activity'
};
const numbers={
 hero:'.impact-number>strong,.primary-kpi-score strong,.coverage-total>strong,.cc-primary strong',
 primary:'.platform strong,.future-orbit>strong,.gov-metrics strong,.gov-work strong,.map-badge>b,.tajawob-hero strong,.tajawob-type-grid strong,.community-plan-stats strong,.community-impact-grid strong,.community-hero-kpis strong,.visual-metrics strong,.digital-workload-row strong,.workload-total strong,.recognition-hero strong,.achievement-hero strong,.media-stat-strip strong,.cc-hours-range strong,.cc-hours-always strong,.semester-score strong,#heroMetrics>article>strong,.workforce-total>strong,.reach-card>strong,.network-card strong,.service-catalog>strong,#governorateTotalWork,.practices-summary strong,.risk-summary strong,.cc-metric strong,.cc-rate-card strong,.contact-primary-metric strong,.contact-satisfaction-metric strong,.contact-x-metric strong,.kpi strong,.media-stat>strong,.media-metric>strong,.operation-metric strong,.output-item>strong,.sav-stat strong',
 secondary:'.budget-values strong,.inspector-kpis strong,.work-metrics b,.premises-metrics b,.population-reading strong,.sav-reach-value strong,.quarter-result-row b,.semester-score b,.quarter-score b,.quarter-point strong,.stat-value,.insurance-value,.total-number,.extra-summary-number,.network-split-value'
};
const paintCandidates='article,.card,[class$="-card"],[class$="-panel"],[class$="-block"],.kpi,.hero-stat,.stat,form,table';
function mark(root){
 for(const [family,selector]of Object.entries(families))for(const e of root.querySelectorAll(selector)){if(e.closest(exclude))continue;if(e.dataset.bsComponent!==family)e.dataset.bsComponent=family;const surface=['detail','comparison'].includes(family)?'light':'dark';if(e.dataset.bsSurface!==surface)e.dataset.bsSurface=surface}
 for(const e of root.querySelectorAll(paintCandidates)){if(e.dataset.bsSurface||e.closest(exclude)||e.matches('.section-block'))continue;e.dataset.bsSurface=e.matches('form,table')?'light':'dark';if(e.matches('article,.card,[class$="-card"],[class$="-panel"]'))e.dataset.bsComponent='information'}
 for(const e of root.querySelectorAll('div,section,header,footer,aside,li,figure,details,summary,span,b,small,em,a,button,p,dt,dd,i,time')){if(scanned.has(e))continue;scanned.add(e);if(e.dataset.bsSurface||e.closest(exclude)||e.matches('button,summary,.ux-skip-link,.section-block,.content-wrap,.main-content,.app-shell,.comm-shell,.comm-main,.shell,.topbar,.ux-nav-groups,.chapter-footer')||/bar|ring|meter|track|progress|chart|map|legend|logo|icon|dot|circle|swatch|slide|modal|overlay/.test(e.className||''))continue;const s=getComputedStyle(e);if(s.backgroundImage!=='none'||!['rgba(0, 0, 0, 0)','transparent'].includes(s.backgroundColor))e.dataset.bsSurface='subtle'}
 for(const [tier,selector]of Object.entries(numbers))for(const e of root.querySelectorAll(selector))if(!e.closest(exclude)&&/^[\s\d٠-٩.,%٪+−–:/]+(?:ألف|مليون)?$/.test([...e.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join('').trim())){if(tier!=='hero'&&e.matches(numbers.hero))continue;if(e.dataset.bsKpi!==tier)e.dataset.bsKpi=tier;}
 for(const e of root.querySelectorAll('table'))if(e.dataset.bsSurface!=='light')e.dataset.bsSurface='light';
}

/* Legacy Original color customization only. It owns no picker, theme dataset,
   persistence or operational behavior. Inactive Original remains untouched. */
function makeOriginalColorAdapter(){
 let active=false;const roots=new Map(),originals=new Map();
const colorRE=/#(?:[\da-f]{8}|[\da-f]{6}|[\da-f]{4}|[\da-f]{3})\b|rgba?\([^)]*\)|\b(?:white|black)\b/gi;
function token(color,property){let r,g,b,a=1;if(color==='white'){r=g=b=255}else if(color==='black'){r=g=b=0}else if(color[0]==='#'){let h=color.slice(1);if(h.length<5)h=[...h].map(x=>x+x).join('');r=parseInt(h.slice(0,2),16);g=parseInt(h.slice(2,4),16);b=parseInt(h.slice(4,6),16);if(h.length===8)a=parseInt(h.slice(6,8),16)/255}else{const n=color.match(/[\d.]+/g);if(!n||n.length<3)return color;[r,g,b]=n.map(Number);if(n.length>3)a=+n[3]}
// Keep red/orange/bright success/blue semantic colors meaningful across palettes.
if((r>g*1.5&&r>b*1.3&&r>130)||(g>r*1.55&&g>b*1.25&&g>120)||(b>r*1.8&&b>g*1.15))return color;
let role;const light=(r+g+b)/3, spread=Math.max(r,g,b)-Math.min(r,g,b),text=/color|fill|stroke/.test(property)&&!/background|border/.test(property);
if(r>g*1.2&&b>g*1.1&&r<160&&light<120)role='secondary';else if(r>g*1.08&&g>b*1.15&&r>100&&light<225)role=text?'gold-text':'gold';else if(light>248)role=text?'on':'surface';else if(light>228)role=text?'on':'canvas';else if(light>195)role=text?'muted':'soft';else if(light>145&&spread<50)role=text?'muted':'line';else if(light<48)role=text?'ink':'deep';else if(light<112)role=text?'brand':'brand';else role=text?'muted':'mid';
const v='var(--bt-'+role+')';return a<1?`color-mix(in srgb, ${v} ${Math.round(a*10000)/100}%, transparent)`:v;}
function convert(v,p){if(/url\(/i.test(v))return v;return v.replace(colorRE,c=>token(c.toLowerCase(),p))}
function selectors(text){const out=[];let start=0,depth=0,quote='';for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c===quote&&text[i-1]!=='\\')quote='';continue}if(c==='"'||c==="'"){quote=c;continue}if(c==='('||c==='[')depth++;if(c===')'||c===']')depth--;if(c===','&&!depth){out.push(text.slice(start,i));start=i+1}}out.push(text.slice(start));return out}
function rules(list,shadow){let out='';for(const rule of list){if(rule.selectorText&&rule.style){if(/appearance|as-panel|as-control|bt-picker|bt-menu|bt-toggle|data-busola-theme|data-bt-inline/.test(rule.selectorText))continue;let decl='';for(const p of rule.style){if(!/(color|background|border|shadow|fill|stroke|outline|--)/.test(p))continue;const v=rule.style.getPropertyValue(p),n=convert(v,p);if(n!==v)decl+=p+':'+n+(rule.style.getPropertyPriority(p)?'!important':'')+';'}if(decl){const prefix=shadow?':host-context(html[data-bs-original-custom]) ': 'html[data-bs-original-custom] ';const sels=selectors(rule.selectorText).map(s=>{s=s.trim();if(shadow)return prefix+s;return /^(html|:root)(?=[\s.:#\[]|$)/.test(s)?s.replace(/^(html|:root)/,prefix.trim()):prefix+s}).join(',');out+=sels+'{'+decl+'}\n'}}else if(rule.cssRules&&!rule.name){let inner=rules(rule.cssRules,shadow);if(inner)out+=rule.cssText.slice(0,rule.cssText.indexOf('{')+1)+inner+'}\n'}}return out}

 function register(root){if(roots.has(root))return;const style=document.createElement('style');style.dataset.btGenerated='';style.dataset.bsOriginalAdapter='';(root.head||root).append(style);roots.set(root,{style,signature:''});}
 function refresh(){
  if(!active)return;
  register(document);for(const e of document.querySelectorAll('*'))if(e.shadowRoot)register(e.shadowRoot);
  for(const [root,state]of roots){
   const sheets=[...root.querySelectorAll('style:not([data-bt-generated]),link[rel="stylesheet"]')].filter(e=>!e.hasAttribute('data-as-generated')&&!/themes\.css|appearance-studio\.css/.test(e.href||''));
   const signature=sheets.map(e=>{let count=0;try{count=e.sheet?.cssRules.length||0}catch{}return(e.href||e.textContent)+':'+count}).join('|');
   if(signature!==state.signature){let css='';for(const sheet of sheets){try{if(sheet.sheet)css+=rules(sheet.sheet.cssRules,root!==document)}catch{}}state.style.textContent=css;state.signature=signature;}
   for(const e of root.querySelectorAll('[style]')){
    if(e.closest('#busola-visual-editor,#appearance-studio,.as-palette,.bt-picker,svg[data-brand],.issuer-logo,.brand-logo,.channel-logo,.official-logo,.spf-mark,[data-as-color-custom]'))continue;
    for(const property of ['color','background','background-color','border-color','box-shadow','fill','stroke']){
     const current=e.style.getPropertyValue(property);let record=originals.get(e);
     if(!record?.has(property)&&current&&!current.includes('--bt-')){if(!record){record=new Map();originals.set(e,record)}record.set(property,{value:current,priority:e.style.getPropertyPriority(property)});}
     const original=record?.get(property);if(original){const value=convert(original.value,property);if(e.style.getPropertyValue(property)!==value)e.style.setProperty(property,value,original.priority);}
    }
   }
  }
 }
 function setActive(value){
  if(value===active){if(active)refresh();return;}
  active=value;document.documentElement.toggleAttribute('data-bs-original-custom',value);
  if(active){refresh();return;}
  for(const [e,properties]of originals)for(const [property,original]of properties){if(original.value)e.style.setProperty(property,original.value,original.priority);else e.style.removeProperty(property)}
  originals.clear();
 }
 return {setActive,refresh};
}
let originalColorAdapter;
function customizeOriginal(enabled){if(enabled&&selected==='original'){originalColorAdapter||(originalColorAdapter=makeOriginalColorAdapter());originalColorAdapter.setActive(true)}else originalColorAdapter?.setActive(false)}

function register(root){if(roots.has(root))return;let style=null;if(root!==document){style=document.createElement('style');style.dataset.btGenerated='';style.textContent=css;root.append(style)}roots.set(root,{style});new MutationObserver(records=>{if(records.some(r=>[...r.addedNodes].some(n=>n.nodeType===1&&!n.matches('[data-bt-generated],[data-as-generated],#busola-visual-editor,#appearance-studio,.as-palette'))))schedule();if(records.some(r=>r.type==='attributes'||r.type==='characterData'||[...r.addedNodes].some(n=>n.nodeType===3)))requestAnimationFrame(fit)}).observe(root,{childList:true,characterData:true,attributes:true,attributeFilter:['class','hidden'],subtree:true})}
let fitQueued=false;
function fit(){if(fitQueued)return;fitQueued=true;requestAnimationFrame(()=>{fitQueued=false;const values=[...roots.keys()].flatMap(root=>[...root.querySelectorAll('[data-bs-kpi]')]).filter(e=>e.getClientRects().length);for(const e of values)e.style.removeProperty('--bs-fit');
// Measure the group after resetting it, then converge after sibling reflow.
for(let pass=0;pass<3;pass++){const changes=[];for(const e of values){const p=e.parentElement,s=getComputedStyle(p),available=Math.min(e.clientWidth||Infinity,p.clientWidth-parseFloat(s.paddingLeft)-parseFloat(s.paddingRight));if(available>0&&e.scrollWidth>available+1){const previous=Number(e.style.getPropertyValue('--bs-fit'))||1;changes.push([e,Math.max(.35,previous*available/e.scrollWidth*.97)]);}}if(!changes.length)break;for(const [e,factor]of changes)e.style.setProperty('--bs-fit',String(factor));}
});}
function rebuild(){queued=false;register(document);for(const e of document.querySelectorAll('*'))if(e.shadowRoot)register(e.shadowRoot);for(const [root,state]of roots){mark(root);if(root!==document){if(state.style.textContent!==css)state.style.textContent=css;const wrapper=root.querySelector('.comm-shell')||root.querySelector('div');if(wrapper){wrapper.dataset.bsType='';if(selected==='original')delete wrapper.dataset.bsActive;else wrapper.dataset.bsActive=''}}}originalColorAdapter?.refresh();fit();document.dispatchEvent(new Event('busola:theme-ready'))}
function schedule(){if(!queued){queued=true;requestAnimationFrame(rebuild)}}
function choose(value){if(!themes.has(value))return;originalColorAdapter?.setActive(false);selected=value;document.documentElement.dataset.busolaTheme=value;if(value==='original')delete document.documentElement.dataset.bsActive;else document.documentElement.dataset.bsActive='';schedule()}
window.BusolaTheme={choose,customizeOriginal,refresh:schedule,version:'3.0',inventory:()=>Object.fromEntries([...roots].map(([r])=>[r===document?'document':'communications',{cards:r.querySelectorAll('[data-bs-component]').length,dark:r.querySelectorAll('[data-bs-component][data-bs-surface=dark]').length,light:r.querySelectorAll('[data-bs-component][data-bs-surface=light]').length}]))};
const sheet=[...document.querySelectorAll('link[rel=stylesheet]')].find(e=>/\/themes\.css/.test(e.href));if(sheet)fetch(sheet.href).then(r=>r.text()).then(s=>{css=s;schedule()}).catch(()=>{});
document.addEventListener('DOMContentLoaded',schedule);document.addEventListener('spf:communications-ready',schedule);document.addEventListener('busola:appearance-applied',fit);window.addEventListener('hashchange',schedule);window.addEventListener('resize',fit);document.fonts?.addEventListener('loadingdone',fit);document.addEventListener('animationend',fit,true);document.addEventListener('load',schedule,true);window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.type==='busola-theme')choose(e.data.theme)});if(document.readyState!=='loading')schedule();
})();
