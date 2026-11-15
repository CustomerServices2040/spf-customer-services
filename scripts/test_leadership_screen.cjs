// DOM-contract checks; real-device rendering/fullscreen still needs visual review.
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function element(){return {style:{setProperty(k,v){this[k]=v}},children:[],hidden:false,attrs:{},events:{},append(e){this.children.push(e)},setAttribute(k,v){this.attrs[k]=v},addEventListener(k,f){this.events[k]=f}}}
async function run(){
 const ids={};for(const id of ['platform','plan','stage','contents','title','counter','progress','prev','next','loading','full','display-status'])ids[id]=element();
 ids.stage.clientWidth=1920;ids.stage.clientHeight=940;
 const docEvents={},winEvents={};const classes=new Set();
 const content={getElementById:()=>null,createElement:element,head:element(),querySelector:s=>s==='#overview'?element():null,addEventListener(){}};
 for(const id of ['platform','plan']){ids[id].contentDocument=content;ids[id].contentWindow={location:{hash:''},scrollTo(){}}}
 const document={querySelector:s=>ids[s.slice(1)],createElement:element,documentElement:element(),body:{classList:{toggle(k,v){v?classes.add(k):classes.delete(k)}}},addEventListener(k,f){docEvents[k]=f},fullscreenElement:null};
 const window={addEventListener(k,f){(winEvents[k]??=[]).push(f)}};
 let observer;
 vm.runInNewContext(fs.readFileSync('overrides/assets/leadership.js','utf8'),{document,window,location:{hash:'#slide=1'},history:{replaceState(){}},URLSearchParams,ResizeObserver:class{constructor(f){observer=f}observe(){}},requestAnimationFrame:f=>f(),setInterval,clearInterval});
 ids.platform.events.load();ids.plan.events.load();
 assert.equal(ids.platform.style.width,'1280px');assert.equal(ids.platform.style.transform,'scale(1.5)');
 for(const width of [390,1280,1920,3840]){ids.stage.clientWidth=width;ids.stage.clientHeight=width*9/16-100;observer();const logicalWidth=parseFloat(ids.platform.style.width),scale=Number(ids.platform.style.transform.match(/[\d.]+/)[0]);assert.ok(Math.abs(logicalWidth*scale-width)<0.001);assert.ok(logicalWidth<=1280);assert.ok(parseFloat(ids.platform.style.height)>0)}
 for(let i=0;i<17;i++){ids.contents.onchange({target:{value:String(i)}});assert.equal(ids.counter.textContent,(i+1)+' / 17');assert.equal(ids.plan.hidden,i!==9);assert.equal(ids.platform.hidden,i===9)}
 ids.contents.onchange({target:{value:'5'}});assert.equal(ids.platform.contentWindow.location.hash,'contact-center');
 const selected=ids.contents.value;
 document.documentElement.requestFullscreen=async()=>{document.fullscreenElement=document.documentElement;docEvents.fullscreenchange()};
 document.exitFullscreen=async()=>{document.fullscreenElement=null;docEvents.fullscreenchange()};
 await ids.full.onclick();assert.equal(ids.contents.hidden,true);assert.equal(ids.full.attrs['aria-pressed'],'true');assert.equal(ids.contents.value,selected);
 await ids.full.onclick();assert.equal(ids.contents.hidden,false);
 await ids.full.onclick();document.fullscreenElement=null;docEvents.fullscreenchange();assert.equal(ids.contents.hidden,false,'Escape/browser exit restores contents');
 document.documentElement.requestFullscreen=async()=>{throw Error('unsupported')};await ids.full.onclick();assert.equal(ids.contents.hidden,true);assert.ok(ids['display-status'].textContent.includes('داخل النافذة'));
 for(const f of winEvents.keydown)f({key:'Escape',target:{closest:()=>false}});assert.equal(ids.contents.hidden,false);
 const event={key:'ArrowLeft',target:{closest:()=>false},preventDefault(){},stopImmediatePropagation(){}};winEvents.keydown[0](event);assert.equal(ids.contents.value,6);
 console.log('PASS: 17 chapters; mobile/HD/Full HD/4K dimensions; fullscreen enter/exit/Escape/rejection; preserved chapter; keyboard navigation.');
}
run().catch(e=>{console.error(e);process.exitCode=1});
