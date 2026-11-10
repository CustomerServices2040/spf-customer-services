/* Busola report motion adapter — presentation only.
 * Browser: include before the report's inline scripts on html[data-vt-page=dakhiliyah].
 * Build: node preview-v2/report-motion.js SOURCE GENERATED [RUNTIME_SRC]
 * Exports transformReport() and inverseReport(); exact anchor counts fail closed.
 * No storage, requests, permissions, numbers, labels or global scheduler overrides.
 */
(function (scope) {
  'use strict';
  if (typeof module === 'object' && module.exports) {
    const crypto = require('node:crypto');
    const fs = require('node:fs');
    const hash = value => crypto.createHash('sha256').update(value).digest('hex');
    const gate = 'window.BusolaReportMotion';
    const edits = [
      {id:'__original_carousel__', anchor:'function animate(now) {', after:`function animate(now) {\n    if (${gate} && ${gate}.paused()) { ${gate}.resume(animate); return; }`},
      {id:'__original_carousel__', anchor:'function animateIntro(startTime) {', after:`function animateIntro(startTime) {\n    if (${gate} && ${gate}.reduced()) {\n      ctx.clearRect(0, 0, innerWidth, innerHeight);\n      introFinished = true;\n      cards.forEach(el => { el.classList.remove('intro-hidden'); el.classList.add('intro-reveal'); });\n      if (centerTitle) centerTitle.classList.add('show');\n      render();\n      return;\n    }`},
      {id:'spf-anim-js', anchor:"function glint(s){s.classList.remove('go');", after:`function glint(s){if (${gate} && ${gate}.paused()) return;s.classList.remove('go');`},
      {id:'spf-anim-js', anchor:'function step(ts){if(t0===null)t0=ts;', after:`function step(ts){if (${gate} && ${gate}.reduced()) { e.textContent=t.orig; return; }if(t0===null)t0=ts;`},
      {id:'spf-open-js', anchor:'if(reduced)return;', after:`if(reduced || (${gate} && ${gate}.reduced()))return;`},
      {id:'spf-open-js', anchor:'function frame(ts){\n      if(t0===null)t0=ts;', after:`function frame(ts){\n      if (${gate} && ${gate}.reduced()) { img.style.opacity='1'; canvas.remove(); return; }\n      if(t0===null)t0=ts;`},
      {id:'spf-req6-js', anchor:'function advance(){', after:`function advance(){\n  if (!wrap.isConnected || (${gate} && ${gate}.paused())) return;`},
      {id:'spf-req10-js', anchor:'function frame(ts){\n    if(start===null)start=ts;', after:`function frame(ts){\n    if (!wrap.isConnected || wrap.classList.contains('spf-v100-icons-source-hidden')) return;\n    if (${gate} && ${gate}.paused()) { ${gate}.resume(frame); return; }\n    if(start===null)start=ts;`},
      {id:'spf-req15-js', anchor:'if(reduced){\n  data.forEach(activate);', after:`if (${gate}) ${gate}.onReduce(function(){data.forEach(activate);});\nif(reduced){\n  data.forEach(activate);`},
      {id:'spf-v95-fast-navigation', anchor:'function fastScrollTo(targetY) {\n      const startY = window.scrollY;', after:`function fastScrollTo(targetY) {\n      if (${gate} && ${gate}.reduced()) { window.scrollTo({top:targetY,behavior:'instant'}); busy=false; return; }\n      const startY = window.scrollY;`},
      {id:'spf-v95-fast-navigation', anchor:'function tick(now) {\n        const p = Math.min(1, (now - start) / duration);', after:`function tick(now) {\n        if (${gate} && ${gate}.reduced()) { window.scrollTo({top:targetY,behavior:'instant'}); busy=false; return; }\n        const p = Math.min(1, (now - start) / duration);`},
      {id:'spf-v100-swap-js', anchor:'function frame(now){\n        var dt=Math.min(32,now-last);', after:`function frame(now){\n        if (${gate} && ${gate}.paused()) { ${gate}.resume(frame); return; }\n        var dt=Math.min(32,now-last);`},
      {id:'spf-v103-home-button-js', anchor:"window.scrollTo({top: top, behavior:'smooth'});", after:`window.scrollTo({top: top, behavior:(${gate} && ${gate}.reduced())?'instant':'smooth'});`}
    ];
    const start = '<!--BUSOLA_REPORT_MOTION_START-->';
    const end = '<!--BUSOLA_REPORT_MOTION_END-->';
    function replaceExactly(text, before, after, context) {
      const count = text.split(before).length - 1;
      if (count !== 1) throw new Error(`Report motion anchor mismatch ${context}: expected 1, got ${count}`);
      return text.replace(before, after);
    }
    function scriptId(attrs, body, index) {
      const id = /\bid\s*=\s*["']([^"']+)["']/.exec(attrs);
      if (id) return id[1];
      if (body.includes('const baseAutoSpeed = -0.023;') && body.includes('function animateIntro(startTime)')) return '__original_carousel__';
      return `__unmodified_${index}`;
    }
    function rewrite(html, reverse) {
      const touched = [];let index=0;
      const result = html.replace(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi, (whole, attrs, body) => {
        const id=scriptId(attrs,body,index++);
        const rules=edits.filter(rule=>rule.id===id);
        if(!rules.length)return whole;
        let next=body;
        for(const rule of reverse?[...rules].reverse():rules){
          next=replaceExactly(next,reverse?rule.after:rule.anchor,reverse?rule.anchor:rule.after,id);
        }
        // Original scripts are classic scripts. Parse without executing browser/data actions.
        new Function(next);
        touched.push({id,original_sha256:hash(reverse?next:body),enhanced_sha256:hash(reverse?body:next),replacements:rules.map(r=>({before:r.anchor,after:r.after}))});
        return whole.replace(body,next);
      });
      const expected=[...new Set(edits.map(e=>e.id))];
      for(const id of expected) if(!touched.some(e=>e.id===id))throw new Error(`Report motion missing script ${id}`);
      return {html:result,touched};
    }
    function inverseReport(enhanced) {
      const marker=new RegExp(start+'[\\s\\S]*?'+end,'g');
      const matches=enhanced.match(marker)||[];
      if(matches.length!==1)throw new Error('Expected one report motion loader marker');
      const stripped=enhanced.replace(marker,'');
      return rewrite(stripped,true).html;
    }
    function transformReport(source,runtimeSrc='../assets/report-motion.js') {
      if(source.includes(start))throw new Error('Report motion already applied');
      if(!/^[./a-zA-Z0-9_-]+\.js(?:\?[-\w=.]+)?$/.test(runtimeSrc))throw new Error('Invalid local report motion runtime path');
      const changed=rewrite(source,false);
      const injection=`${start}<script src="${runtimeSrc}"></script>${end}`;
      const enhanced=replaceExactly(changed.html,'</head>',injection+'</head>','runtime loader');
      const restored=inverseReport(enhanced);
      if(restored!==source)throw new Error('Report motion inverse did not reproduce input exactly');
      const scripts=/<!--BUSOLA_REPORT_MOTION_START-->[\s\S]*?<!--BUSOLA_REPORT_MOTION_END-->|<script\b[^>]*>[\s\S]*?<\/script>/gi;
      if(source.replace(scripts,'')!==enhanced.replace(scripts,''))throw new Error('Non-script report content changed');
      const embedded=html=>(html.match(/data:[^"\s)]+/g)||[]);
      if(JSON.stringify(embedded(source))!==JSON.stringify(embedded(enhanced)))throw new Error('Embedded report asset changed');
      return {html:enhanced,audit:{source_sha256:hash(source),enhanced_sha256:hash(enhanced),reversed_sha256:hash(restored),byte_exact_inverse:true,non_script_bytes_unchanged:true,embedded_assets_unchanged:true,modified_script_ids:changed.touched.map(x=>x.id),scripts:changed.touched}};
    }
    module.exports={transformReport,inverseReport};
    if(require.main===module){
      const [input,output,runtimeSrc]=process.argv.slice(2);
      if(!input||!output)throw new Error('Usage: node report-motion.js source.html generated.html [runtimeSrc]');
      const source=fs.readFileSync(input,'utf8');
      const result=transformReport(source,runtimeSrc);
      fs.writeFileSync(output,result.html);
      fs.writeFileSync(output+'.motion-audit.json',JSON.stringify(result.audit,null,2)+'\n');
      console.log(JSON.stringify({output,bytes:Buffer.byteLength(result.html),audit:output+'.motion-audit.json',scripts:result.audit.modified_script_ids,byte_exact_inverse:true,non_script_bytes_unchanged:true,embedded_assets_unchanged:true}));
    }
    return;
  }

  if (!scope.document || scope.document.documentElement.dataset.vtPage !== 'dakhiliyah') return;
  const doc=scope.document;
  const media=scope.matchMedia('(prefers-reduced-motion: reduce)');
  const waiting=new Set();
  const reduceListeners=new Set();
  const reduced=()=>media.matches;
  const paused=()=>media.matches||doc.hidden;
  scope.BusolaReportMotion=Object.freeze({
    reduced, paused,
    // Used only by three explicitly patched report-carousel functions, never global RAF.
    resume(callback){waiting.add(callback);},
    onReduce(callback){reduceListeners.add(callback);if(media.matches)callback();}
  });
  function settle(){
    if(!media.matches)return;
    // __spfNum is the original report's exact string, captured before count-up.
    doc.querySelectorAll('.spf-num').forEach(el=>{
      if(el.__spfNum){el.__spfDone=true;if(el.textContent!==el.__spfNum.orig)el.textContent=el.__spfNum.orig;}
    });
    reduceListeners.forEach(callback=>callback());
  }
  function synchronize(){
    settle();
    if(paused())return;
    const callbacks=[...waiting];waiting.clear();
    callbacks.forEach(callback=>scope.requestAnimationFrame(callback));
  }
  media.addEventListener('change',synchronize);
  doc.addEventListener('visibilitychange',synchronize);
  // The reduced presentation gives access to every existing card; no clones or new data.
  const style=doc.createElement('style');style.id='busola-report-reduced-motion';
  style.textContent=`
@media(prefers-reduced-motion:reduce){
 html[data-vt-page=dakhiliyah],html[data-vt-page=dakhiliyah] body{scroll-behavior:auto!important}
 html[data-vt-page=dakhiliyah] *,html[data-vt-page=dakhiliyah] *:before,html[data-vt-page=dakhiliyah] *:after{animation:none!important;transition:none!important;scroll-behavior:auto!important}
 html[data-vt-page=dakhiliyah] :is(.spf-r,.spf-line,.spf-zoom,.spf-book-open,.spf-bar-card,.spf-theme-item,.spf-cat-item,.spf-logo-target){opacity:1!important;translate:none!important;scale:none!important;filter:none!important}
 html[data-vt-page=dakhiliyah] :is(.spf-r,.spf-line,.spf-zoom,.spf-book-open,.spf-bar-card,.spf-theme-item,.spf-cat-item){transform:none!important}
 html[data-vt-page=dakhiliyah] .carousel-stage{perspective:none!important;touch-action:pan-x pan-y!important}
 html[data-vt-page=dakhiliyah] .carousel-wrap{height:auto!important;min-height:180px;perspective:none!important;transform-style:flat!important}
 html[data-vt-page=dakhiliyah] .carousel-ring{position:relative!important;inset:auto!important;display:flex!important;align-items:center;gap:18px;padding:18px 12px 26px;overflow-x:auto;overflow-y:hidden;max-width:100%;height:auto!important;transform:none!important;transform-style:flat!important;will-change:auto!important;scrollbar-width:auto;scroll-snap-type:x proximity;touch-action:pan-x pan-y}
 html[data-vt-page=dakhiliyah] .carousel-ring>.card{position:relative!important;left:auto!important;top:auto!important;flex:0 0 220px!important;width:220px!important;height:170px!important;margin:0!important;opacity:1!important;filter:none!important;transform:none!important;backface-visibility:visible!important;transform-style:flat!important;scroll-snap-align:center}
 html[data-vt-page=dakhiliyah] .spf-icon-carousel-ring>.card{flex-basis:150px!important;width:150px!important;height:150px!important}
 html[data-vt-page=dakhiliyah] .carousel-ring .card-photo{transform:none!important}
 html[data-vt-page=dakhiliyah] .carousel-ring:focus-visible{outline:3px solid #6c2947;outline-offset:4px}
}`;
  doc.head.appendChild(style);
  function prepareRows(){
    doc.querySelectorAll('.carousel-ring').forEach(ring=>{
      if(!ring.hasAttribute('tabindex'))ring.tabIndex=0;
      if(!ring.hasAttribute('aria-label')){
        const label=ring.closest('[aria-label]')?.getAttribute('aria-label');
        if(label)ring.setAttribute('aria-label',label);
      }
    });
    settle();
  }
  const observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1)))prepareRows();
  });
  function ready(){prepareRows();observer.observe(doc.body,{childList:true,subtree:true});}
  if(doc.readyState==='loading')doc.addEventListener('DOMContentLoaded',()=>setTimeout(ready,0),{once:true});else ready();
})(typeof window==='object'?window:globalThis);
