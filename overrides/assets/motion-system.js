(()=>{'use strict';
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const numberSelector=[
  '.hero-metrics .metric-card>strong','.metric-value','.plan-hero-kpis>article>strong',
  '.tracker-summary>article>strong','.board-metric-grid>article>strong','.board-proof strong',
  '.board-portfolio strong','.work-total strong','.gov-metrics strong','.work-row b',
  '.branch-stat strong','.reach>strong','.overview-kpis .kpi>strong','.future-total>b',
  '.future-orbit>strong','.map-badge>b','.budget-values strong','.premises-metrics strong',
  '.tajawob-hero strong','.tajawob-type-grid strong','.tajawob-peaks strong',
  '.component-ring strong','.target-ring strong','.half-year-details>b',
  '.recognition-total-visual>strong','.recognition-years b','.achievement-total strong',
  '.operational-priority-grid strong','[data-animate-number]'
].join(',');
const barSelector=[
  '.micro-bar i','.split-bar i','.work-row em','.budget-progress i','.half-year-meter i',
  '.tracker-kanban-progress i','.tracker-kanban-progress em','.progress-bar i','.bar-fill',
  '#trackerRateBar','#boardRateBar','.pillar-progress i'
].join(',');
const ringSelector='.component-ring,.target-ring,.budget-ring,.recognition-donut,.donut,.ring';
const revealSelector=[
  '.metric-card','.kpi','.plan-hero-kpis>article','.tracker-summary>article','.branch-stat',
  '.future-card','.solution-card','.agreement-rules>article','.scenario-story>article',
  '.tajawob-type-grid>article','.tajawob-peaks>article','.recognition-card',
  '.service-achievement-card','.operational-priority-grid>article'
].join(',');
const activeNodes=new WeakSet(),signatures=new WeakMap();
const western=value=>String(value).replace(/[٠-٩]/g,d=>String(d.charCodeAt(0)-1632)).replace(/[۰-۹]/g,d=>String(d.charCodeAt(0)-1776));
function numericNode(element){
  if(element.closest('[contenteditable="true"],.editing,.forum-editing'))return null;
  return [...element.childNodes].find(node=>node.nodeType===3&&/[0-9٠-٩۰-۹]/.test(node.nodeValue||''))||null;
}
function parseNumeric(raw){
  const match=String(raw).match(/^(\s*)([+-]?[0-9٠-٩۰-۹][0-9٠-٩۰-۹,٬،.\s]*?)(\s*%?)(\s*)$/);if(!match)return null;
  const clean=western(match[2]).replace(/[٬،,\s]/g,'');const value=Number(clean);if(!Number.isFinite(value))return null;
  const decimal=(clean.split('.')[1]||'').length;return {value,decimal,grouped:/[,٬،]/.test(match[2]),before:match[1],suffix:match[3],after:match[4]};
}
function animateNumber(element){
  const node=numericNode(element);if(!node||activeNodes.has(node))return;const original=node.nodeValue,parsed=parseNumeric(original);if(!parsed||parsed.value<0)return;
  if(signatures.get(node)===original)return;signatures.set(node,original);element.classList.add('motion-number');if(reduce){node.nodeValue=original;return}
  activeNodes.add(node);const started=performance.now(),duration=Math.min(1250,650+Math.log10(Math.abs(parsed.value)+1)*120);
  const format=value=>new Intl.NumberFormat('en-US',{useGrouping:parsed.grouped,minimumFractionDigits:parsed.decimal,maximumFractionDigits:parsed.decimal}).format(value);
  const frame=now=>{const progress=Math.min(1,(now-started)/duration),eased=1-Math.pow(1-progress,3),value=parsed.value*eased;node.nodeValue=parsed.before+format(value)+parsed.suffix+parsed.after;if(progress<1)requestAnimationFrame(frame);else{node.nodeValue=original;signatures.set(node,original);setTimeout(()=>activeNodes.delete(node),0)}};requestAnimationFrame(frame);
}
const visibility=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;entry.target.classList.add('motion-visible');visibility.unobserve(entry.target);if(entry.target.matches(numberSelector))animateNumber(entry.target)}),{threshold:.16,rootMargin:'0px 0px -4%'});
function prepare(root=document){
  const scope=root.nodeType===1?root:document;
  scope.querySelectorAll(numberSelector).forEach(element=>visibility.observe(element));
  scope.querySelectorAll(barSelector).forEach(element=>{if(element.dataset.motionReady)return;element.dataset.motionReady='1';element.classList.add('motion-bar');visibility.observe(element)});
  scope.querySelectorAll(ringSelector).forEach(element=>{if(element.dataset.motionReady)return;element.dataset.motionReady='1';element.classList.add('motion-ring');visibility.observe(element)});
  scope.querySelectorAll(revealSelector).forEach((element,index)=>{if(element.dataset.motionReveal)return;element.dataset.motionReveal='1';element.style.transitionDelay=Math.min(index%8,5)*45+'ms';element.classList.add('motion-reveal');visibility.observe(element)});
  scope.querySelectorAll('.map-pin').forEach((element,index)=>{if(element.dataset.motionReady)return;element.dataset.motionReady='1';element.style.transitionDelay=(index%12)*45+'ms';element.classList.add('motion-map-pin');visibility.observe(element)});
  scope.querySelectorAll('svg path[data-animate],svg circle[data-animate]').forEach(element=>{if(element.dataset.motionReady)return;element.dataset.motionReady='1';element.classList.add('motion-chart-stroke');visibility.observe(element)});
}
let queued=false;const schedule=()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;prepare()})};
new MutationObserver(records=>{for(const record of records){if(record.type==='characterData'){const parent=record.target.parentElement;if(parent?.matches(numberSelector)&&!activeNodes.has(record.target)){signatures.delete(record.target);visibility.observe(parent)}}else if(record.addedNodes.length)schedule()}}).observe(document.documentElement,{subtree:true,childList:true,characterData:true});
document.addEventListener('spf:content-applied',schedule);document.addEventListener('forum:content-applied',schedule);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>prepare(),{once:true});else prepare();
})();
