/* Presentation-only adapter: never writes text, values, editing keys, storage or network. */
(()=>{
 'use strict';
 const root=document.documentElement;
 const overview=document.getElementById('overview');
 const performanceSection=document.getElementById('performance');
 if(!overview||!performanceSection)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let last='';
 const sync=()=>{
   const current=!overview.hidden?'overview':!performanceSection.hidden?'performance':'';
   root.classList.toggle('vp-pilot',Boolean(current));
   root.dataset.vpChapter=current;
   if(current===last)return;
   last=current;
   if(!current)return;
   const scope=current==='overview'?[overview,document.getElementById('heroMetrics'),document.getElementById('operationalBudget')]:[performanceSection];
   scope.filter(Boolean).forEach(container=>{
     const cards=container.matches('#overview')?[container]:[...container.querySelectorAll('.metric-card,.primary-kpi-hero,.component-card,.operational-priority-grid>article,.workload-overview>article,.workload-group')];
     cards.forEach((card,index)=>{
       card.removeAttribute('data-vp-reveal');
       card.style.setProperty('--vp-delay',`${Math.min(index,4)*65}ms`);
       if(!reduced.matches)requestAnimationFrame(()=>card.setAttribute('data-vp-reveal',''));
     });
   });
 };
 const observer=new MutationObserver(sync);
 [overview,performanceSection].forEach(node=>observer.observe(node,{attributes:true,attributeFilter:['hidden']}));
 window.addEventListener('hashchange',sync);
 window.addEventListener('popstate',sync);
 reduced.addEventListener('change',()=>{if(reduced.matches)document.querySelectorAll('[data-vp-reveal]').forEach(n=>n.removeAttribute('data-vp-reveal'));});
 // Chart tooltips repeat the existing accessible description; no inferred data.
 document.querySelectorAll('#performance .semester-visual[aria-label],#performance .primary-kpi-trend[aria-label]').forEach(chart=>{
   chart.dataset.vpTooltip=chart.getAttribute('aria-label');
   chart.tabIndex=0;
 });
 sync();
})();
