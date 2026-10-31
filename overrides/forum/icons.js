(()=>{'use strict';
const paths={
 home:'<path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10.5V20h13v-9.5"/><path d="M9 20v-6h6v6"/>',
 spark:'<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"/><path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z"/>',
 map:'<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3V6Z"/><path d="M9 3v15M15 6v15"/>',
 people:'<circle cx="8" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20c.5-4 2.3-6 5.5-6s5 2 5.5 6M14 15c3.6-.6 6.4 1 7 5"/>',
 services:'<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 10h18M8 4v16M13 14h5M13 17h3"/>',
 daily:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2M7 3.5 5 1.5M17 3.5l2-2"/>',
 heart:'<path d="M20.8 8.5c0 5.5-8.8 11-8.8 11s-8.8-5.5-8.8-11A4.8 4.8 0 0 1 12 5.7a4.8 4.8 0 0 1 8.8 2.8Z"/><path d="M8 11h2l1-2 2 5 1-3h2"/>',
 network:'<circle cx="12" cy="5" r="2"/><circle cx="5" cy="18" r="2"/><circle cx="19" cy="18" r="2"/><path d="m11 7-5 9M13 7l5 9M7 18h10"/>',
 qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-4M14 18h2"/>',
 consensus:'<path d="M7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM17 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M1.5 21c.5-5 2.3-7 5.5-7s5 2 5.5 7M13 15c4.5-.8 8 1.3 9 6"/><path d="m14 4 1.3 1.3L18 2.5"/>',
 limit:'<path d="M5 20V10M12 20V4M19 20v-7"/><path d="M2 20h20"/>',
 timer:'<circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 2M9 2h6M12 2v3"/>',
 route:'<circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h3a3 3 0 0 0 3-3V9a3 3 0 0 1 3-3"/>',
 trophy:'<path d="M7 4h10v4a5 5 0 0 1-10 0V4Z"/><path d="M7 6H3v1a4 4 0 0 0 5 4M17 6h4v1a4 4 0 0 1-5 4M12 13v4M8 21h8M9 17h6"/>'
 ,calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18M8 14h3M13 14h3M8 17h3"/>'
 ,compass:'<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2"/>'
};
function icon(name,cls='nav-symbol'){return `<span class="${cls}" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.spark}</svg></span>`}
const nav=['home','compass','spark','map','people'];document.querySelectorAll('.main-nav button').forEach((el,i)=>el.insertAdjacentHTML('afterbegin',icon(nav[i])));
const kpis=['services','daily','heart','network'];document.querySelectorAll('.kpi').forEach((el,i)=>el.insertAdjacentHTML('afterbegin',icon(kpis[i],'card-symbol')));
const sections={future:'compass',pride:'spark',map:'map',activity:'consensus'};Object.entries(sections).forEach(([id,name])=>{const target=document.querySelector(`#${id} .page-intro>div:first-child`);if(target)target.insertAdjacentHTML('afterbegin',icon(name,'section-symbol'))});
function decorate(root=document){
 root.querySelectorAll('.rule:not([data-decorated])').forEach((el,i)=>{el.dataset.decorated='1';el.insertAdjacentHTML('afterbegin',icon(['limit','consensus','people'][i%3],'card-symbol'))});
 root.querySelectorAll('.path-card:not(.summary-card):not([data-decorated])').forEach((el,i)=>{el.dataset.decorated='1';const h=el.querySelector('header');if(h)h.insertAdjacentHTML('afterbegin',icon(['route','spark','network','services'][i%4],'mini-symbol'))});
 root.querySelectorAll('.work-row:not([data-decorated])').forEach((el,i)=>{el.dataset.decorated='1';const d=el.querySelector('div');if(d)d.insertAdjacentHTML('afterbegin',icon(['services','people','map','spark','network','consensus'][i%6],'mini-symbol'))});
 root.querySelectorAll('.branch-stat:not([data-decorated])').forEach(el=>{el.dataset.decorated='1';el.insertAdjacentHTML('afterbegin',icon(el.dataset.statIcon||'services','stat-symbol'))});
 root.querySelectorAll('.future-axis:not([data-decorated])').forEach((el,i)=>{el.dataset.decorated='1';el.insertAdjacentHTML('afterbegin',icon(['map','network','people','services','spark'][i%5],'axis-symbol'))});
 root.querySelectorAll('.future-card:not([data-decorated])').forEach((el,i)=>{el.dataset.decorated='1';el.insertAdjacentHTML('afterbegin',icon(['route','network','people','services','spark'][i%5],'future-symbol'))});
 root.querySelectorAll('.achievement:not([data-decorated])').forEach(el=>{el.dataset.decorated='1';el.insertAdjacentHTML('afterbegin',icon('trophy','mini-symbol'))});
}
decorate();new MutationObserver(m=>{for(const x of m)for(const n of x.addedNodes)if(n.nodeType===1)decorate(n.matches?.('.rule,.path-card,.work-row,.achievement,.branch-stat,.future-axis,.future-card')?n.parentElement:n)}).observe(document.querySelector('main')||document.body,{subtree:true,childList:true});
})();
