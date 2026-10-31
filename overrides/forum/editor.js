(()=>{'use strict';
const $=s=>document.querySelector(s),all=s=>[...document.querySelectorAll(s)];
const endpoint='https://api.github.com/repos/CustomerServices2040/spf-customer-services/contents/overrides/forum/content-edits.json';
const authProxy='https://customer-compass-github-auth.spf2040.chatgpt.site';
const original=JSON.parse(JSON.stringify(window.FORUM_DATA)),defaults=new Map();
let saved={},working={},baseline={},token='',editing=false,busy=false,loaded=false;
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function notice(message){$('#editor-status').textContent=message;const t=$('#toast');t.textContent=message;t.classList.add('show');clearTimeout(notice.timer);notice.timer=setTimeout(()=>t.classList.remove('show'),6500)}
function clean(edits){if(!edits||typeof edits!=='object'||Array.isArray(edits))throw Error('ملف المحتوى غير صالح');const out={};for(const [k,v] of Object.entries(edits)){if(k.length>500||typeof v!=='string'||v.length>12000||k.split('.').some(s=>['__proto__','constructor','prototype'].includes(s)))throw Error('قيمة غير صالحة في ملف المحتوى');out[k]=v}return out}
function numberValue(value){return Number(String(value).replace(/[٠-٩]/g,c=>c.charCodeAt(0)-1632).replace(/[۰-۹]/g,c=>c.charCodeAt(0)-1776).replace(/[,٬،\s]/g,''))}
function sourceValue(key){const bits=key.slice(5).split('.');let value=window.FORUM_DATA;for(const bit of bits)value=value?.[bit];return value}
function updateData(values){Object.keys(window.FORUM_DATA).forEach(k=>delete window.FORUM_DATA[k]);Object.assign(window.FORUM_DATA,JSON.parse(JSON.stringify(original)));for(const [key,value] of Object.entries(values)){if(!key.startsWith('data.'))continue;const bits=key.slice(5).split('.'),last=bits.pop();let target=window.FORUM_DATA;for(const bit of bits){if(!own(target,bit)){target=null;break}target=target[bit]}if(!target||!own(target,last))continue;target[last]=typeof target[last]==='number'?numberValue(value):value}
 const g=window.FORUM_DATA.governorates,fields=['staff','transactions','community','field','proactive','selfService','appointments','whatsapp','qr'];for(const key of fields)g.all[key]=Object.entries(g).filter(([id])=>id!=='all').reduce((sum,[,g])=>sum+Number(g[key]),0);
}
function stableKey(el){const scope=el.closest('[data-edit-scope]')||el.closest('.page');if(!scope)return '';const parts=[];let node=el;while(node&&node!==scope){if(node.id){parts.unshift('#'+node.id);break}const siblings=[...node.parentElement.children].filter(e=>e.tagName===node.tagName&&!e.matches('[aria-hidden="true"],.card-symbol,.section-symbol,.mini-symbol,.future-symbol'));parts.unshift(node.tagName.toLowerCase()+':'+siblings.indexOf(node));node=node.parentElement}return 'text.'+(scope.dataset.editScope||scope.id)+'.'+parts.join('/')}
function prepare(){
 const candidates=all('main .page h1,main .page h2,main .page h3,main .page p,main .page span,main .page strong,main .page small,main .page b,main .page em,main .page li');
 for(const el of candidates){if(el.dataset.forumEdit||el.parentElement.closest('[data-forum-edit]'))continue;
 if(el.closest('#answer-wall,#answer-count,#connection,#wall-caption,#qr-wrap,#join-short,#current-mission,#stage-track,#emergency,.timer-block,.mission-limit,.gov-metrics,.work-row,.branch-stat,.branch-secondary,.future-orbit,.future-total,.future-focus>header>strong,.future-card>span,.future-card>b,.activity-footer,.agreement-rules,.paths-budget,.solution-cost,.solution-index,.solution-open,.solution-detail>aside,.reflection-count,.reflection-controls,.stage,.join-steps,.title-visual,[aria-hidden="true"]'))continue;
 if(el.closest('button')&&!el.closest('.solution-card'))continue;
 if(el.querySelector('h1,h2,h3,p,span,strong,small,b,em,li')||!el.textContent.trim())continue;
 if(el.closest('#gov-detail')&&/^[\d,.%\s]+$/.test(el.textContent))continue;
 const key=stableKey(el);if(key)el.dataset.forumEdit=key;
 }
 for(const el of all('[data-forum-edit]')){const key=el.dataset.forumEdit;if(key.startsWith('data.governorates.all.')){el.removeAttribute('contenteditable');continue}if(!defaults.has(key))defaults.set(key,el.textContent);
 if(document.activeElement!==el){const value=own(working,key)?working[key]:key.startsWith('data.')?sourceValue(key):defaults.get(key);if(value!==undefined&&el.textContent!==String(value))el.textContent=String(value)}
 if(editing){el.contentEditable='true';el.spellcheck=true;el.setAttribute('aria-label','نص قابل للتعديل');}else{el.removeAttribute('contenteditable');el.removeAttribute('aria-label')}
 }
}
function apply(){updateData(working);document.dispatchEvent(new Event('forum:content-applied'));prepare()}
function mode(active){editing=active;document.body.classList.toggle('forum-editing',active);$('#editor-toolbar').hidden=!active;$('#edit-content').disabled=active||!loaded;prepare()}
function headers(){return {Authorization:'Bearer '+token,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'}}
function decode(content){return new TextDecoder().decode(Uint8Array.from(atob(content.replace(/\s/g,'')),c=>c.charCodeAt(0)))}
function encode(content){return btoa(Array.from(new TextEncoder().encode(content),b=>String.fromCharCode(b)).join(''))}
async function remote(){const r=await fetch(endpoint+'?ref=main&t='+Date.now(),{headers:headers(),cache:'no-store'});if(!r.ok)throw Error('تعذر قراءة ملف المحتوى من GitHub');const meta=await r.json();return {sha:meta.sha,edits:clean(JSON.parse(decode(meta.content)).edits)}}
async function verify(candidate){const r=await fetch('https://api.github.com/repos/CustomerServices2040/spf-customer-services',{headers:{Authorization:'Bearer '+candidate,Accept:'application/vnd.github+json'}});if(!r.ok)throw Error('تعذر التحقق من حساب GitHub');const repo=await r.json();if(!repo.permissions?.push)throw Error('يلزم حساب يملك صلاحية تعديل مستودع المنصة');return candidate}
function login(){return new Promise((resolve,reject)=>{
 const dialog=document.createElement('dialog');dialog.className='forum-login';dialog.innerHTML='<form method="dialog"><button class="login-close" aria-label="إغلاق">×</button></form><span class="eyebrow">تعديل محتوى الملتقى</span><h2>الدخول عبر GitHub</h2><p>استخدم حسابًا مخوّلًا بتعديل المنصة. تبقى صلاحية الدخول في ذاكرة هذه الصفحة فقط.</p><button id="device-login" class="primary">الدخول عبر GitHub</button><div id="device-progress" role="status"></div><details><summary>الدخول برمز وصول مؤقت</summary><label for="forum-token">رمز بصلاحية Contents: Read and write</label><input id="forum-token" type="password" autocomplete="off"><button id="token-login" class="outline">تحقق وابدأ التحرير</button></details><p id="login-error" role="alert"></p>';
 document.body.appendChild(dialog);let closed=false,settled=false;dialog.addEventListener('close',()=>{closed=true;dialog.remove();if(!settled)reject(Error('تم إلغاء تسجيل الدخول'))});dialog.showModal();
 const success=value=>{if(closed)return;settled=true;dialog.close();resolve(value)};
 $('#token-login').onclick=async()=>{const button=$('#token-login');button.disabled=true;try{success(await verify($('#forum-token').value.trim()))}catch(e){if(!closed){$('#login-error').textContent=e.message;button.disabled=false}}};
 $('#device-login').onclick=async()=>{const button=$('#device-login');button.disabled=true;$('#login-error').textContent='';try{
 const r=await fetch(authProxy+'/device/code',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!r.ok)throw Error('تعذر بدء الدخول؛ يمكنك استخدام رمز وصول مؤقت');const flow=await r.json();if(closed)return;
 const url=new URL(flow.verification_uri);if(url.protocol!=='https:'||url.hostname!=='github.com')throw Error('رابط تسجيل الدخول غير صالح');
 $('#device-progress').innerHTML='<strong dir="ltr">'+esc(flow.user_code)+'</strong><a class="outline" target="_blank" rel="noopener" href="'+esc(url.href)+'">فتح GitHub وإدخال الرمز ↗</a><small>بانتظار الموافقة…</small>';
 let interval=Math.max(5,Number(flow.interval)||5)*1000;const end=Date.now()+(Number(flow.expires_in)||900)*1000;
 while(!closed&&Date.now()<end){await new Promise(r=>setTimeout(r,interval));if(closed)return;const response=await fetch(authProxy+'/oauth/access-token',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device_code:flow.device_code})});const result=await response.json();if(closed)return;if(result.access_token){success(await verify(result.access_token));return}if(result.error==='slow_down')interval+=5000;else if(result.error&&result.error!=='authorization_pending')throw Error('لم تكتمل موافقة GitHub')}
 if(!closed)throw Error('انتهت مهلة الدخول؛ حاول مرة أخرى');
 }catch(e){if(!closed){$('#login-error').textContent=e.message;button.disabled=false}}};
})}
$('#edit-content').onclick=async()=>{if(busy)return;busy=true;$('#edit-content').disabled=true;try{if(!token)token=await login();const current=await remote();saved={...current.edits};baseline={...saved};working={...saved};apply();mode(true);notice('اضغط أي نص محدد لتعديله، ثم احفظ لنشره للجميع')}catch(e){token='';notice(e.message);$('#edit-content').disabled=!loaded}finally{busy=false}};
$('#cancel-content').onclick=()=>{if(busy)return;working={...saved};apply();mode(false);notice('تم إلغاء التعديلات غير المحفوظة')};
$('#save-content').onclick=async()=>{if(busy)return;busy=true;$('#save-content').disabled=true;$('#cancel-content').disabled=true;all('[contenteditable]').forEach(el=>el.contentEditable='false');try{
 const current=await remote(),next={...current.edits};for(const [key,value] of Object.entries(working)){if(value===baseline[key])continue;if(current.edits[key]!==baseline[key]&&current.edits[key]!==value)throw Error('عُدّل النص نفسه من جهاز آخر. ألغِ التعديل وافتح التحرير مجددًا لقراءة أحدث نسخة.');next[key]=value}
 const payload={version:1,updatedAt:new Date().toISOString(),edits:next};const r=await fetch(endpoint,{method:'PUT',headers:{...headers(),'Content-Type':'application/json'},body:JSON.stringify({branch:'main',sha:current.sha,message:'Update forum presentation content',content:encode(JSON.stringify(payload,null,2)+'\n')})});
 if(!r.ok)throw Error(r.status===409?'تغيّر الملف أثناء الحفظ. حاول الحفظ مجددًا.':'تعذر الحفظ إلى GitHub؛ تعديلاتك ما زالت متاحة لإعادة المحاولة.');saved=next;baseline={...next};working={...next};apply();mode(false);notice('حُفظت التعديلات في GitHub؛ تظهر للجميع بعد اكتمال النشر خلال دقائق.');
 }catch(e){notice(e.message)}finally{busy=false;$('#save-content').disabled=false;$('#cancel-content').disabled=false;prepare()}};
document.addEventListener('input',e=>{const el=e.target.closest('[data-forum-edit]');if(!editing||!el||busy)return;const key=el.dataset.forumEdit,value=el.textContent;
 if(key.startsWith('data.')&&typeof sourceValue(key)==='number'){const n=numberValue(value);if(!value.trim()||!Number.isFinite(n)||n<0||!Number.isInteger(n)||(key.endsWith('.staff')&&n<1)){el.dataset.invalid='true';$('#save-content').disabled=true;notice('أدخل عددًا صحيحًا موجبًا للموظفين، أو صفرًا فأكثر للأعمال');return}delete el.dataset.invalid}
 working[key]=value;$('#save-content').disabled=!!document.querySelector('[data-invalid]');
});
document.addEventListener('focusout',e=>{const el=e.target.closest?.('[data-forum-edit]');if(editing&&el?.dataset.forumEdit.startsWith('data.governorates.')&&!el.dataset.invalid){apply()}});
document.addEventListener('paste',e=>{if(!editing||!e.target.isContentEditable)return;e.preventDefault();const text=e.clipboardData.getData('text/plain');document.execCommand('insertText',false,text)});
window.addEventListener('beforeunload',e=>{if(editing&&JSON.stringify(working)!==JSON.stringify(saved)){e.preventDefault();e.returnValue=''}});
const observer=new MutationObserver(records=>{if(records.some(r=>r.type==='childList'&&[...r.addedNodes].some(n=>n.nodeType===1)))prepare()});observer.observe(document.querySelector('main'),{subtree:true,childList:true});
const ready=(async()=>{try{const r=await fetch('content-edits.json?v='+Date.now(),{cache:'no-store'});if(!r.ok)throw Error();saved=clean((await r.json()).edits);working={...saved};updateData(working);loaded=true;$('#edit-content').disabled=false}catch{notice('تعذر تحميل التعديلات المركزية؛ أعد فتح الصفحة قبل التحرير.')}prepare()})();
window.ForumEditor={ready,prepare,value:(k,v)=>own(working,k)?working[k]:v,get editing(){return editing}};
})();
