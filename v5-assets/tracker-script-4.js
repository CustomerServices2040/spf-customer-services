
const DEFAULT_DATA = [];

const GITHUB_OWNER='CustomerServices2040';
const GITHUB_REPO='spf-customer-services';
const TASKS_REPO_PATH='overrides/assets/tasks-data.json';
const AUTH_PROXY='https://customer-compass-github-auth.spf2040.chatgpt.site';
const FILTER_STORAGE_KEY='spf-work-tracker-filters-v1';
const OWNER_SESSION_KEY='spf-work-tracker-owner-session-v1';
let isOwner=false,ownerAccessToken='',loadedTasksUpdatedAt=null,loadedTasksSha=null,pendingTaskImport=null,taskMutationInFlight=false,importReadInFlight=false,importSheetLayouts=[];
// Keep distinct people with the same first name (e.g. سعيد) separate, while
// unifying harmless spelling differences and crediting shared work to everyone.
const EMPLOYEE_ALIASES={
  'احمد':'أحمد','أحمد العبري':'أحمد','احمد العبري':'أحمد',
  'عبد العزيز':'عبدالعزيز','عبدالعزيز الغيثي':'عبدالعزيز','عبد العزيز الغيثي':'عبدالعزيز',
  'عبد الله':'عبدالله','عبدالله البوسعيدي':'عبدالله','عبد الله البوسعيدي':'عبدالله',
  'معتصم':'المعتصم',
  'شوتي':'Sruthy','شورتي':'Sruthy','سورتي':'Sruthy','سروثي':'Sruthy','سعيد':'سعيد الرحبي',
  'يسرى الراسبية':'يسرى','يسرى الراسبي':'يسرى',
  'سها':'سهى','سوهى':'سهى','سوهة':'سهى','سهى البلوشي':'سهى','سهى ا':'سهى',
  'أحمد العبري':'أحمد','عزان الريامي':'عزان','فاطمة الجرادي':'فاطمة',
  'زكية الوهيبي':'زكية','زهرة المصلحي':'زهرة','زهره المصلحي':'زهرة',
  'حسناء المنجية':'حسناء','حسناء المنجي':'حسناء',
  'ميعاد العلوي':'ميعاد'
};
const KNOWN_EMPLOYEES=[
  'أحمد','عزان','فاطمة','لمى','يسرى','عبدالله','ليلى','سليمان','زهرة','زكية','سهى','ميعاد','حسناء','عبدالعزيز','المعتصم','عبير','هاشم','شاذلي','جميلة','عصام',
  'لطيفة العوفي','سعيد الشبلي','سعادة الصارخية','عهود المعمري','غفران الوهيبي','سعيد الرحبي','يوسف الخياري','قحطان البطاشي','خلود الفارسي','لميس السعدي','آية الحراصي','شهد الغافري','علي الدغيشي','أنوار الحسني','Sruthy'
];
const NON_PERSON_ASSIGNMENTS=new Set(['القسم','الجميع','الفريق','قسم دائرة الخدمات','فريق مشروع مركز الاتصال','cc project platform']);
function employeeKey(value){
  return String(value||'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآٱ]/g,'ا').replace(/ى/g,'ي').replace(/\s+/g,' ').trim().toLowerCase();
}
const EMPLOYEE_CANONICAL=new Map();
KNOWN_EMPLOYEES.forEach(name=>EMPLOYEE_CANONICAL.set(employeeKey(name),name));
Object.entries(EMPLOYEE_ALIASES).forEach(([alias,name])=>EMPLOYEE_CANONICAL.set(employeeKey(alias),name));
const EMPLOYEE_PHRASES=[...EMPLOYEE_CANONICAL.entries()].sort((a,b)=>b[0].split(' ').length-a[0].split(' ').length);
function employeeEditDistance(left,right){
  if(Math.abs(left.length-right.length)>1)return 2;
  let previous=Array.from({length:right.length+1},(_,index)=>index);
  for(let i=1;i<=left.length;i++){
    const current=[i];
    for(let j=1;j<=right.length;j++)current[j]=Math.min(current[j-1]+1,previous[j]+1,previous[j-1]+(left[i-1]===right[j-1]?0:1));
    previous=current;
  }
  return previous[right.length];
}
function closestKnownEmployee(value){
  const key=employeeKey(value);
  if(key.length<4)return null;
  let distance=2,matches=new Set();
  for(const [alias,name] of EMPLOYEE_CANONICAL){
    const candidate=employeeEditDistance(key,alias);
    if(candidate<distance){distance=candidate;matches=new Set([name]);}
    else if(candidate===distance)matches.add(name);
  }
  return distance===1&&matches.size===1?[...matches][0]:null;
}
function canonicalEmployeeName(value){
  const clean=String(value||'').normalize('NFKC').replace(/\s+/g,' ').trim();
  return EMPLOYEE_CANONICAL.get(employeeKey(clean))||closestKnownEmployee(clean)||clean;
}
function splitKnownEmployeeSequence(value){
  const words=employeeKey(value).split(' ').filter(Boolean),memo=new Map();
  function walk(index){
    if(index===words.length)return [];
    if(memo.has(index))return memo.get(index);
    for(const [alias,name] of EMPLOYEE_PHRASES){
      const parts=alias.split(' ');
      if(parts.every((part,offset)=>words[index+offset]===part)){
        const rest=walk(index+parts.length);
        if(rest){const result=[name,...rest];memo.set(index,result);return result;}
      }
    }
    memo.set(index,null);return null;
  }
  const result=walk(0);
  return result&&result.length>1?result:null;
}
function splitEmps(emp){
  const parts=String(emp||'').normalize('NFKC')
    .replace(/\s+و\s*/g,'/')
    .split(/[/\\،,;؛|\-–—+]+/)
    .map(value=>value.trim()).filter(Boolean);
  const people=[];
  parts.forEach(part=>{
    if(NON_PERSON_ASSIGNMENTS.has(employeeKey(part)))return;
    const exact=EMPLOYEE_CANONICAL.get(employeeKey(part));
    const names=exact?[exact]:(splitKnownEmployeeSequence(part)||[canonicalEmployeeName(part)]);
    names.forEach(name=>{
      const key=employeeKey(name);
      if(name.length>1&&!NON_PERSON_ASSIGNMENTS.has(key)&&!people.some(person=>employeeKey(person)===key))people.push(name);
    });
  });
  return people;
}
function normalizeEmployees(value){return splitEmps(value).join(' / ');}
function cloneDefaults(){return DEFAULT_DATA.map((r,index)=>({...r,emp:normalizeEmployees(r.emp),id:r.id||`source-${index+1}`}));}
async function loadTasks(){
  try{
    const response=await fetch(`tasks-data.json?v=${Date.now()}`,{cache:'no-store'});
    if(!response.ok)throw new Error('تعذر تحميل ملف البيانات المركزي');
    const payload=await response.json();
    if(Array.isArray(payload.tasks)&&payload.tasks.length){loadedTasksUpdatedAt=payload.updated_at||null;return payload.tasks.map((r,index)=>({...r,emp:normalizeEmployees(r.emp),id:r.id||`central-${index+1}`}));}
  }catch(error){console.warn(error)}
  document.getElementById('tracker-load-error').hidden=false;
  return cloneDefaults();
}
let DATA=cloneDefaults();
function githubHeaders(token){return {'Accept':'application/vnd.github+json','Authorization':`Bearer ${token}`,'X-GitHub-Api-Version':'2022-11-28'};}
function encodeBase64(value){const bytes=new TextEncoder().encode(value);let binary='';bytes.forEach(byte=>binary+=String.fromCharCode(byte));return btoa(binary);}
async function githubError(response,fallback){
  const detail=await response.json().catch(()=>({}));
  const message=String(detail.message||'');
  if(response.status===401)return new Error('مفتاح GitHub غير صالح أو انتهت صلاحيته. أنشئ مفتاحًا جديدًا ثم سجّل الدخول مرة أخرى.');
  if(response.status===403&&/Resource not accessible by personal access token/i.test(message)){
    return new Error('المفتاح لا يملك صلاحية التعديل على هذا المستودع. في إعداد المفتاح اختر Resource owner: CustomerServices2040، ثم Only select repositories: spf-customer-services، ثم Repository permissions → Contents: Read and write. بعد تعديل المفتاح سجّل خروج المنسقة ثم ادخل بالمفتاح المحدّث.');
  }
  if(response.status===404)return new Error('المفتاح لا يستطيع الوصول إلى مستودع المنصة. تأكد من اختيار المستودع spf-customer-services عند إنشاء المفتاح.');
  if(response.status===409)return new Error('نُشرت تغييرات أخرى في الوقت نفسه. اضغط «تحديث السجل» ثم أعد المحاولة؛ جلسة الدخول ما زالت فعالة.');
  return new Error(message||fallback);
}
function updateOwnerUI(){
  const login=document.getElementById('owner-login-button'),add=document.getElementById('add-task-button'),refresh=document.getElementById('refresh-tasks-button'),status=document.getElementById('owner-status'),importPanel=document.getElementById('import-panel');
  if(login)login.textContent=isOwner?'خروج المالك':'دخول المالك';
  if(add)add.hidden=!isOwner;
  if(refresh)refresh.hidden=!isOwner;
  if(importPanel)importPanel.hidden=!isOwner;
  if(status)status.textContent=isOwner?'وضع الإدارة — التحديثات تُنشر للجميع':'وضع العرض';
}
function clearOwnerSession(){
  ownerAccessToken='';isOwner=false;
  try{sessionStorage.removeItem(OWNER_SESSION_KEY)}catch(_){/* Storage can be unavailable. */}
  updateOwnerUI();
}
function rememberOwnerSession(token){
  ownerAccessToken=token;isOwner=true;
  try{sessionStorage.setItem(OWNER_SESSION_KEY,token)}catch(_){/* The in-memory session still works. */}
  updateOwnerUI();
}
async function fetchCurrentTaskSnapshot(token){
  const endpoint=`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TASKS_REPO_PATH}`;
  const response=await fetch(`${endpoint}?ref=main&t=${Date.now()}`,{headers:githubHeaders(token),cache:'no-store'});
  if(!response.ok)throw await githubError(response,'تعذر قراءة أحدث نسخة من سجل الأعمال');
  const metadata=await response.json();
  const bytes=Uint8Array.from(atob(metadata.content.replace(/\s/g,'')),ch=>ch.charCodeAt(0));
  return {endpoint,metadata,payload:JSON.parse(new TextDecoder().decode(bytes))};
}
async function syncTasksFromGithub(token){
  const {metadata,payload}=await fetchCurrentTaskSnapshot(token);
  if(!Array.isArray(payload.tasks))throw new Error('ملف سجل الأعمال لا يحتوي على قائمة مهام صالحة.');
  DATA=payload.tasks.map((task,index)=>({...task,emp:normalizeEmployees(task.emp),id:task.id||`central-${index+1}`}));
  loadedTasksUpdatedAt=payload.updated_at||null;
  loadedTasksSha=metadata.sha;
  refreshFiltersAfterDataChange();
  publishSummary();
}
async function refreshTasksFromGithub(){
  if(!isOwner||taskMutationInFlight)return;
  const button=document.getElementById('refresh-tasks-button');
  if(button){button.disabled=true;button.textContent='جارٍ تحديث السجل…'}
  try{await syncTasksFromGithub(ownerAccessToken);closeDrawer();}
  catch(error){alert(error.message||'تعذر تحديث السجل. حاول مرة أخرى دون تسجيل الخروج.');}
  finally{if(button){button.disabled=false;button.textContent='تحديث السجل'}}
}
async function verifyOwnerToken(token){
  const response=await fetch('https://api.github.com/user',{headers:githubHeaders(token)});
  if(!response.ok)throw await githubError(response,'تعذر التحقق من حساب GitHub');
  const user=await response.json();
  const repo=await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}`,{headers:githubHeaders(token)});
  if(!repo.ok)throw await githubError(repo,'تعذر التحقق من صلاحية الحساب المخوّل');
  const repoData=await repo.json();
  if(!repoData.permissions?.push)throw new Error(`الحساب ${user.login||'الحالي'} يحتاج صلاحية كتابة على مستودع المنصة. أضفه متعاونًا بصلاحية Write أولاً.`);
  const endpoint=`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TASKS_REPO_PATH}?ref=main`;
  const repositoryAccess=await fetch(endpoint,{headers:githubHeaders(token)});
  if(!repositoryAccess.ok)throw await githubError(repositoryAccess,'تعذر الوصول إلى ملف بيانات المنصة');
  return true;
}
function ownerOauthPanel(code,url){
  const panel=document.createElement('div');panel.id='owner-oauth-panel';panel.style.cssText='position:fixed;inset:0;z-index:999;display:grid;place-items:center;padding:20px;background:rgba(20,42,35,.76);backdrop-filter:blur(6px)';
  panel.innerHTML=`<div style="width:min(430px,100%);padding:30px;border-radius:22px;background:#fff;text-align:center"><span style="color:#B9934C;font-weight:800">دخول المالك</span><h3 style="color:#254E44">أدخل الرمز في GitHub</h3><strong style="display:block;margin:16px;padding:12px;border:1px dashed #B9934C;border-radius:13px;font:800 28px monospace;letter-spacing:4px">${code}</strong><a href="${url}" target="_blank" rel="noopener" style="display:inline-block;padding:10px 16px;border-radius:10px;background:#254E44;color:#fff;text-decoration:none">فتح GitHub</a><p style="color:#68746F;font-size:13px">بانتظار الموافقة…</p></div>`;document.body.appendChild(panel);return panel;
}
function ownerLoginChoice(){
  return new Promise((resolve,reject)=>{
    const panel=document.createElement('div');panel.id='owner-login-choice';panel.style.cssText='position:fixed;inset:0;z-index:999;display:grid;place-items:center;padding:20px;background:rgba(20,42,35,.76);backdrop-filter:blur(6px)';
    panel.innerHTML=`<div style="position:relative;width:min(460px,100%);padding:30px;border-radius:22px;background:#fff;text-align:right"><button data-close-login type="button" style="position:absolute;left:14px;top:14px;width:32px;height:32px;border:0;border-radius:50%;background:#EEF1EE;color:#254E44;font-size:20px">×</button><span style="color:#B9934C;font-weight:800">دخول المالك</span><h3 style="margin:7px 0;color:#254E44">اختر طريقة الدخول</h3><p style="color:#68746F;font-size:13px;line-height:1.7">داخل شبكة العمل استخدم رمز وصول مؤقت. لا يُحفظ الرمز ويُحذف تلقائيًا عند الخروج أو إغلاق الصفحة.</p><label style="display:block;color:#68746F;font-size:13px;font-weight:700">رمز الوصول المؤقت<input type="password" autocomplete="off" placeholder="github_pat_… أو ghp_…" style="display:block;width:100%;min-height:44px;margin-top:6px;border:1px solid #DFE4DF;border-radius:10px;padding:9px 11px;direction:ltr;text-align:left;font-family:monospace"></label><button data-token-login type="button" style="width:100%;margin-top:9px;border:0;border-radius:10px;padding:11px;background:#254E44;color:#fff;font-weight:800">تحقق وابدأ التعديل</button><small data-login-error role="status" style="display:block;min-height:20px;margin-top:7px;color:#8E2948;text-align:center"></small><a href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener" style="display:block;color:#6A1832;font-size:13px;line-height:1.6;text-align:center">إنشاء رمز: استخدمي حسابك المضاف متعاونًا في المستودع، واختاري صلاحية Contents: Read and write</a><i style="display:block;margin:12px;text-align:center;color:#68746F;font-size:13px;font-style:normal">أو</i><button data-oauth-login type="button" style="width:100%;border:0;border-radius:10px;padding:11px;background:#EEF1EE;color:#254E44;font-weight:800">الدخول عبر GitHub خارج شبكة العمل</button></div>`;
    document.body.appendChild(panel);const input=panel.querySelector('input'),submit=panel.querySelector('[data-token-login]'),error=panel.querySelector('[data-login-error]');
    panel.querySelector('[data-close-login]').onclick=()=>{panel.remove();reject(new Error('تم إلغاء تسجيل الدخول'));};
    panel.querySelector('[data-oauth-login]').onclick=()=>{panel.remove();resolve({mode:'oauth'});};
    submit.onclick=async()=>{const token=input.value.trim();if(!token){error.textContent='أدخل رمز الوصول المؤقت';return;}submit.disabled=true;submit.textContent='جارٍ التحقق…';try{await verifyOwnerToken(token);panel.remove();resolve({mode:'token',token});}catch(err){error.textContent=err.message;submit.disabled=false;submit.textContent='تحقق وابدأ التعديل';}};
  });
}
async function githubDeviceLogin(){
  const start=await fetch(`${AUTH_PROXY}/device/code`,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(!start.ok)throw new Error('تعذر بدء تسجيل GitHub');
  const flow=await start.json();const panel=ownerOauthPanel(flow.user_code,flow.verification_uri),started=Date.now(),interval=Math.max(5,Number(flow.interval)||5)*1000;
  try{while(Date.now()-started<(Number(flow.expires_in)||900)*1000){await new Promise(r=>setTimeout(r,interval));const response=await fetch(`${AUTH_PROXY}/oauth/access-token`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device_code:flow.device_code})});const result=await response.json();if(result.access_token){await verifyOwnerToken(result.access_token);return result.access_token}if(result.error&&!["authorization_pending","slow_down"].includes(result.error))throw new Error('لم تكتمل موافقة GitHub')}throw new Error('انتهت مهلة تسجيل الدخول')}finally{panel.remove()}
}
async function loginOwner(){
  if(window.SPF_PREVIEW){if(isOwner)clearOwnerSession();else rememberOwnerSession("review-only");return;}
  if(isOwner){clearOwnerSession();closeDrawer();return;}
  const button=document.getElementById('owner-login-button');if(button)button.textContent='جارٍ التحقق…';
  try{
    const cached=ownerAccessToken||(()=>{try{return sessionStorage.getItem(OWNER_SESSION_KEY)}catch(_){return null}})();
    let token;
    if(cached){await verifyOwnerToken(cached);token=cached;}
    else{const choice=await ownerLoginChoice();token=choice.mode==='token'?choice.token:await githubDeviceLogin();}
    await syncTasksFromGithub(token);
    rememberOwnerSession(token);
  }catch(error){
    if(/غير صالح|انتهت صلاحيته|لا يملك صلاحية|لا يستطيع الوصول/.test(error.message||''))clearOwnerSession();
    else updateOwnerUI();
    if(error.message!=='تم إلغاء تسجيل الدخول')alert(error.message||'تعذر دخول المالك');
  }
}
async function restoreOwnerSession(){
  if(window.SPF_PREVIEW){updateOwnerUI();return;}
  const token=(()=>{try{return sessionStorage.getItem(OWNER_SESSION_KEY)}catch(_){return null}})();
  if(!token){updateOwnerUI();return;}
  try{await verifyOwnerToken(token);await syncTasksFromGithub(token);rememberOwnerSession(token);}
  catch(error){
    if(/غير صالح|انتهت صلاحيته|لا يملك صلاحية|لا يستطيع الوصول/.test(error.message||''))clearOwnerSession();
    else{ownerAccessToken=token;isOwner=false;updateOwnerUI();}
  }
}
async function saveTasks(){
  if(window.SPF_PREVIEW){localStorage.setItem("spf-review-tasks-v3",JSON.stringify({tasks:DATA,updated_at:new Date().toISOString()}));publishSummary();return;}
  if(!isOwner)throw new Error('يلزم دخول المالك قبل الحفظ');
  const token=ownerAccessToken;if(!token)throw new Error('انتهت جلسة التحرير');
  let snapshot=await fetchCurrentTaskSnapshot(token);
  // GitHub's read endpoint may briefly return the version preceding our last save.
  for(let attempt=0;attempt<2&&loadedTasksSha&&snapshot.metadata.sha!==loadedTasksSha&&Date.parse(snapshot.payload.updated_at)<Date.parse(loadedTasksUpdatedAt);attempt++){
    await new Promise(resolve=>setTimeout(resolve,250*(attempt+1)));
    snapshot=await fetchCurrentTaskSnapshot(token);
  }
  const {endpoint,metadata,payload:remote}=snapshot;
  if(!loadedTasksUpdatedAt||remote.updated_at!==loadedTasksUpdatedAt||loadedTasksSha&&metadata.sha!==loadedTasksSha)
    throw new Error('تغيّرت البيانات في جلسة أخرى. اضغط «تحديث السجل» لمراجعة أحدث المهام، ثم أعد التعديل. جلسة الدخول ما زالت فعالة.');
  const updatedAt=new Date(Math.max(Date.now(),Date.parse(remote.updated_at||'')+1||0)).toISOString();
  const document={version:(Number(remote.version)||0)+1,updated_at:updatedAt,tasks:DATA};
  const response=await fetch(endpoint,{method:'PUT',headers:{...githubHeaders(token),'Content-Type':'application/json'},body:JSON.stringify({message:`Update work tracker (${DATA.length} tasks)`,content:encodeBase64(JSON.stringify(document,null,2)+'\n'),sha:metadata.sha,branch:'main'})});
  if(!response.ok)throw await githubError(response,'تعذر نشر التحديث إلى GitHub');
  const saved=await response.json();
  loadedTasksUpdatedAt=document.updated_at;
  loadedTasksSha=saved.content?.sha||null;
  publishSummary(); // Keep the authorized session for the next weekly edit.
}
function completionSummary(){
  const names={'مركز الاتصال':'contact','إدارة علاقات المتعاملين':'crm','إدارة وتطوير الخدمات':'service-dev','شؤون الدوائر والمنافذ':'branches','التنسيق والمتابعة':'coord'};
  const grouped={};
  DATA.forEach(r=>{const key=r.dept||'غير محدد';(grouped[key]||(grouped[key]={id:names[key]||`dept-${Object.keys(grouped).length+1}`,name:key,done:0,total:0})).total++;if(r.status==='منجز')grouped[key].done++;});
  const total=DATA.length,done=DATA.filter(r=>r.status==='منجز').length,late=DATA.filter(r=>r.status==='متأخر').length;
  const progress=DATA.filter(r=>r.status==='قيد الإجراء').length;
  return {total,done,late,progress,rate:total?Math.round(done/total*100):0,depts:Object.values(grouped)};
}
function publishSummary(){
  const summary=completionSummary();
  try{localStorage.setItem('spf-work-tracker-summary-v3',JSON.stringify(summary));}catch(_){/* storage can be blocked */}
  if(window.parent&&window.parent!==window)window.parent.postMessage({type:'spf-work-tracker-summary',summary,tasks:DATA},window.location.origin==='null'?'*':window.location.origin);
}

// ═══════════════════════════════════════════════
// DATA QUALITY — تصحيحات تلقائية وبنود مرصودة للمراجعة
// ═══════════════════════════════════════════════
const DQ_FIXED = [
  {title:"توحيد مركز الاتصال / مركز الخدمة الهاتفية",detail:"الاسمان يشيران للوحدة نفسها. تم توحيدهما تحت اسم «مركز الاتصال» وربط 107 أعمال بها."},
  {title:"توحيد شؤون الفروع تحت الاسم الرسمي",detail:"تم توحيد السجلات تحت اسم «شؤون الدوائر والمنافذ». الإجمالي بعد الدمج: 75 عملاً."},
  {title:"توحيد أسماء الموظفين المكررة",detail:"دُمجت صيغ الاسم الأول والاسم الكامل لمنع تجزئة مؤشرات الأداء."},
  {title:"تصحيح الحالات المتعارضة مع نسبة الإنجاز",detail:"أي عمل نسبته 100% صُنّف منجزاً، وكل عمل حالته منجز أصبحت نسبته 100%."},
  {title:"إلغاء التأخير التلقائي المبني على تاريخ اليوم",detail:"تُقرأ الحالة من حقل الحالة في المصدر دون افتراض أن السجلات التاريخية متأخرة."}
];

const DQ_FLAGS = [];

// ═══════════════════════════════════════════════
// STATE & HELPERS
// ═══════════════════════════════════════════════
let filtered = [...DATA];
let fDept='all', fMonth='all', fEmp='all', fStatus='all', fSearch='';
let currentTab='overview';
let page=1;
const PAGE_SIZE=15;
let donutChart;
let searchDebounce;
let perfMode='dept';

function filterState(){return {dept:fDept,month:fMonth,emp:fEmp,status:fStatus,search:fSearch};}
function filterStateFromControls(){
  return {
    dept:document.getElementById('f-dept').value,
    month:document.getElementById('f-month').value,
    emp:document.getElementById('f-emp').value,
    status:document.getElementById('f-status').value,
    search:document.getElementById('f-search').value.trim()
  };
}
function saveFilterState(){
  try{localStorage.setItem(FILTER_STORAGE_KEY,JSON.stringify(filterState()));}catch(_){/* storage can be blocked */}
}
function optionExists(id,value){return [...document.getElementById(id).options].some(option=>option.value===value);}
function preserveSelectValue(id,value){
  const select=document.getElementById(id);
  if(value!=='all'&&!optionExists(id,value))select.add(new Option(value,value));
  select.value=value;
}
function restoreFilterState(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(FILTER_STORAGE_KEY)||'{}')||{};}catch(_){saved={};}
  fDept=optionExists('f-dept',saved.dept)?saved.dept:'all';
  fMonth=optionExists('f-month',saved.month)?saved.month:'all';
  fEmp=optionExists('f-emp',saved.emp)?saved.emp:'all';
  fStatus=optionExists('f-status',saved.status)?saved.status:'all';
  fSearch=String(saved.search||'');
  document.getElementById('f-dept').value=fDept;
  document.getElementById('f-month').value=fMonth;
  document.getElementById('f-emp').value=fEmp;
  document.getElementById('f-status').value=fStatus;
  document.getElementById('f-search').value=fSearch;
}
function refreshFiltersAfterDataChange(){
  const saved=filterStateFromControls();
  populateFilters();
  fDept=saved.dept;
  fMonth=saved.month;
  fEmp=saved.emp;
  fStatus=saved.status;
  fSearch=saved.search;
  preserveSelectValue('f-dept',fDept);
  preserveSelectValue('f-month',fMonth);
  preserveSelectValue('f-emp',fEmp);
  preserveSelectValue('f-status',fStatus);
  document.getElementById('f-search').value=fSearch;
  saveFilterState();
  applyFilters();
}

function importKey(task){
  const clean=value=>importHeader(value);
  return `${clean(task.dept)}|${clean(task.title)}`;
}
function importHeader(value){return String(value??'').normalize('NFKC').replace(/[\u064B-\u065F\u0670\u0640]/g,'').replace(/[أإآ]/g,'ا').replace(/ى/g,'ي').replace(/[^\p{L}\p{N}%]/gu,'').toLowerCase();}
const IMPORT_COLUMNS={
  title:['المهمة','اسمالمهمة','عنوانالمهمة','وصفالمهمة','المهام','العمل','الاعمال','العملالمطلوب','الموضوع','موضوع','الاجراءالمطلوب','المبادرة','التكليف','التكليفات','البند','بنودالعمل','النشاط','الانشطة','task','tasks','title','description','activity','item'],
  dept:['القسم','القسمالمسؤول','القسمالمختص','الجههالمسؤولة','الجهةالمسؤولة','الجهةالمختصة','الدائرة','الدائرةالمسؤولة','الادارة','الادارةالمسؤولة','الفريقالمسؤول','الوحدةالمسؤولة','الجهةالمنفذة','الجهةالمالكة','القطاع','department','dept','unit','division','team','section'],
  emp:['الموظف','اسمالموظف','الموظفون','الموظفالمسؤول','الموظفالمكلف','المكلف','المسؤول','المسؤولعنالتنفيذ','المكلفبالتنفيذ','المعني','منفذالمهمة','صاحبالمهمة','المسنداليه','مسندالى','القائمبالعمل','employee','owner','assignee','assignedto','responsibleperson'],
  tech:['الملاحظاتوالموقفالتنفيذي','الموقفالتنفيذي','التفاصيل','التحديث','الاجراءالمتخذ','الاجراءاتالمتخذة','الملاحظات','ملاحظات','التعليق','notes','details','update'],
  action:['الاجراءالمطلوب','العملالمطلوب','المطلوب','requiredaction'],
  status:['الحالة','حالةالمهمة','حالةالعمل','حالةالتنفيذ','منجزقيدالاجراء','الموقف','الموقفالحالي','وضعالمهمة','وضعالعمل','الوضع','status','state','stage'],
  pct:['نسبةالانجاز','الانجاز%','نسبةالاكتمال','نسبةالتنفيذ','معدلالانجاز','الانجاز','نسبةالتقدم','التقدم%','progress','completion','pct','percentcomplete'],
  received:['تاريخالاستلام','تاريخالبدء','received','startdate'],
  due:['موعدالتسليم','تاريخالتسليم','تاريخالاستحقاق','الموعدالنهائي','duedate','deadline','due']
};
function importColumnIndexes(header){
  const normalized=header.map(importHeader),columns={};
  for(const [field,aliases] of Object.entries(IMPORT_COLUMNS)){
    columns[field]=normalized.findIndex(value=>value&&aliases.some(alias=>importHeader(alias)===value));
    if(columns[field]<0)columns[field]=normalized.findIndex(value=>value&&aliases.some(alias=>value.startsWith(importHeader(alias))&&value.length-importHeader(alias).length<16));
  }
  return columns;
}
function importSheetContext(name,tasks=DATA,preamble=[]){
  const known=[...new Set(tasks.map(task=>task.dept).filter(Boolean))];
  const lines=[name,...preamble.flat().filter(value=>String(value??'').trim()&&String(value).length<200)];
  return known.find(dept=>lines.some(line=>importHeader(line).includes(importHeader(dept))))||'';
}
function importStatus(value){
  const v=importHeader(value);
  if(!v)return null;
  if(/منجز|مكتمل|مكتمله|منتهي|تمالانجاز|done|completed|finished|closed/.test(v))return 'منجز';
  if(/متاخر|متعثر|overdue|late|delayed/.test(v))return 'متأخر';
  if(/قيد|جار|جاري|مستمر|جديد|لميبدا|مفتوح|تحتالاجراء|ongoing|progress|pending|open|active/.test(v))return 'قيد الإجراء';
  return null;
}
function parseDelimited(text){
  const line=String(text).replace(/^\uFEFF/,'').split(/\r?\n/,1)[0];
  const delimiter=['\t',';',','].sort((a,b)=>line.split(b).length-line.split(a).length)[0];
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(ch==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(ch===delimiter&&!quoted){row.push(cell);cell='';}
    else if((ch==='\n'||ch==='\r')&&!quoted){if(ch==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>String(v).trim()))rows.push(row);row=[];cell='';}
    else cell+=ch;
  }
  row.push(cell);if(row.some(v=>String(v).trim()))rows.push(row);
  return rows;
}
function importTitleSimilarity(left,right){
  const a=importHeader(left),b=importHeader(right);
  if(a===b)return 1;
  const short=Math.min(a.length,b.length),long=Math.max(a.length,b.length);
  if(short<8||short/long<.68)return 0;
  if(short>=14&&(a.includes(b)||b.includes(a)))return .86;
  if(short/long<.8)return 0;
  let previous=Array.from({length:b.length+1},(_,index)=>index);
  for(let i=1;i<=a.length;i++){
    const next=[i];
    for(let j=1;j<=b.length;j++)next[j]=Math.min(previous[j]+1,next[j-1]+1,previous[j-1]+(a[i-1]===b[j-1]?0:1));
    previous=next;
  }
  return 1-previous[b.length]/long;
}
function extractNewTasks(rows,filename,sheetName='',tasks=DATA,layout=null){
  const scanned=rows.slice(0,30).map((row,index)=>({index,cols:importColumnIndexes(row)}));
  const header=layout?{index:layout.header,cols:layout.cols}:scanned.filter(({cols})=>cols.title>=0).sort((a,b)=>{
    const score=x=>['dept','emp','status','pct','tech','due'].filter(field=>x.cols[field]>=0).length;
    return score(b)-score(a)||a.index-b.index;
  })[0];
  if(!header)throw new Error('تعذّر تحديد عمود المهمة في هذه الورقة. اجعل عنوان العمود دالًا على المهمة أو العمل أو الموضوع.');
  const context=layout?.dept||importSheetContext(`${sheetName} ${filename}`,tasks,rows.slice(0,header.index));
  const cols=header.cols,existing=new Map(),changes=new Map(),additions=[],skipped=[];
  tasks.forEach((task,index)=>{const key=importKey(task);if(!existing.has(key))existing.set(key,[]);existing.get(key).push(index)});
  const candidateTasks=tasks.map((task,index)=>({index,task,dept:importHeader(task.dept)}));
  const sheetKeys=rows.slice(header.index+1).map(row=>importKey({title:cols.title<0?'':row[cols.title],dept:cols.dept<0?context:row[cols.dept]||context}));
  const repeated=new Set(sheetKeys.filter((key,index)=>key.split('|')[1]&&sheetKeys.indexOf(key)!==index));
  const pctValues=rows.slice(header.index+1).map(row=>cols.pct<0?'':String(row[cols.pct]??'').trim()).filter(value=>value&&!/[٪%]/.test(value)).map(value=>Number(value.replace('٫','.').replace(',','.'))).filter(Number.isFinite);
  const fractionalPct=pctValues.length>0&&pctValues.every(value=>value>=0&&value<=1);
  let previousTask=null;
  rows.slice(header.index+1).forEach((row,offset)=>{
    if(!row.some(value=>String(value??'').trim()))return;
    const get=field=>cols[field]<0?'':String(row[cols[field]]??'').trim();
    const title=get('title'),dept=get('dept')||context,line=header.index+offset+2;
    if(!title&&get('tech')&&previousTask?.line===line-1&&!get('emp')&&!get('action')){
      if(previousTask.index>=0){
        const base=changes.get(previousTask.key)?.task||tasks[previousTask.index];
        const tech=[base.tech,`الموقف التنفيذي: ${get('tech')}`].filter(Boolean).join('\n');
        changes.set(previousTask.key,{index:previousTask.index,task:{...base,tech},changed:['tech'],title:base.title,dept:base.dept});
      }else if(previousTask.additionIndex>=0){
        const task=additions[previousTask.additionIndex];task.tech=[task.tech,`الموقف التنفيذي: ${get('tech')}`].filter(Boolean).join('\n');
      }
      return;
    }
    if(!title&&!get('emp')&&!get('status')&&!get('pct')&&!get('tech')&&!get('action'))return;
    if(!title||!dept){skipped.push(`${sheetName||'الملف'} · الصف ${line}: تعذّر تحديد المهمة أو القسم المسؤول`);return;}
    if(importColumnIndexes(row).title>=0&&importHeader(title)===importHeader(rows[header.index][cols.title]))return;
    const key=importKey({title,dept}),statusRaw=get('status'),status=importStatus(statusRaw);
    if(repeated.has(key)){skipped.push(`${sheetName||'الملف'} · الصف ${line}: العنوان مكرر في الورقة ويحتاج تمييز المهمة قبل اعتمادها`);return;}
    if(statusRaw&&!status){skipped.push(`${sheetName||'الملف'} · الصف ${line}: حالة غير معروفة «${statusRaw}»`);return;}
    let matchKey=key;
    if(!existing.has(key)){
      const similar=candidateTasks.filter(item=>item.dept===importHeader(dept)).map(item=>({...item,score:importTitleSimilarity(title,item.task.title)})).filter(item=>item.score>=.82).sort((a,b)=>b.score-a.score);
      if(similar.length){
        const best=similar[0],candidateKey=importKey(best.task);
        if(best.score>=.96&&(!similar[1]||similar[1].score<.86)&&existing.get(candidateKey)?.length===1)matchKey=candidateKey;
        else{skipped.push(`${sheetName||'الملف'} · الصف ${line}: قد تطابق «${best.task.title}» في السجل؛ راجعها قبل إضافة مهمة جديدة`);return;}
      }
    }
    const pctSource=get('pct'),pctRaw=pctSource.replace(/[٪%]/g,'').replace('٫','.').replace(/,/g,'.'),numeric=Number(pctRaw)*(fractionalPct&&!/[٪%]/.test(pctSource)?100:1);
    if(pctRaw&&(!Number.isFinite(numeric)||numeric<0||numeric>100)){skipped.push(`${sheetName||'الملف'} · الصف ${line}: نسبة إنجاز غير صالحة`);return;}
    if(status&&status!=='منجز'&&pctRaw&&numeric===100){skipped.push(`${sheetName||'الملف'} · الصف ${line}: الحالة «${status}» تتعارض مع إنجاز 100%؛ راجعها قبل الاعتماد`);return;}
    const fields={};
    for(const field of ['emp','received','due'])if(get(field))fields[field]=field==='emp'?normalizeEmployees(get(field)):get(field);
    const action=cols.action===cols.title?'':get('action'),note=get('tech');
    if(action||note)fields.tech=[action?`الإجراء المطلوب: ${action}`:'',note?`الموقف التنفيذي: ${note}`:''].filter(Boolean).join('\n');
    if(status)fields.status=status;
    if(pctRaw)fields.pct=numeric;
    if(fields.status==='منجز')fields.pct=100;
    if(fields.pct===100&&!fields.status)fields.status='منجز';
    if(fields.status)fields.overdue=fields.status==='متأخر';
    if(fields.due)fields.date=fields.due;
    if(!existing.has(matchKey)&&(!fields.emp||!fields.status||fields.pct==null)){
      skipped.push(`${sheetName||'الملف'} · الصف ${line}: المهمة الجديدة تحتاج الموظف والحالة ونسبة الإنجاز؛ راجع الملف قبل الإضافة`);return;
    }
    if(existing.has(matchKey)){
      if(existing.get(matchKey).length>1){skipped.push(`${sheetName||'الملف'} · الصف ${line}: توجد عدة مهام مطابقة في السجل؛ حدّد المهمة المطلوبة يدويًا`);return;}
      const index=existing.get(matchKey)[0],base=changes.get(matchKey)?.task||tasks[index],task={...base,...fields};
      const changed=Object.keys(fields).filter(field=>String(base[field]??'')!==String(task[field]??''));
      if(changed.length)changes.set(matchKey,{index,task,changed,title,dept});
      else skipped.push(`${sheetName||'الملف'} · الصف ${line}: لا يوجد تغيير في المهمة`);
      previousTask={line,key:matchKey,index};
    }else{
      const repeated=additions.findIndex(task=>importKey(task)===key);
      const task={id:`import-${globalThis.crypto?.randomUUID?.()||`${Date.now()}-${line}`}`,title,dept,emp:'',tech:'',status:'قيد الإجراء',pct:null,received:null,due:null,date:null,overdue:false,...fields,source_file:filename,imported_at:new Date().toISOString()};
      if(repeated>=0)additions[repeated]={...additions[repeated],...fields,source_file:filename};else additions.push(task);
      previousTask={line,key,additionIndex:repeated>=0?repeated:additions.length-1};
    }
  });
  return {additions,updates:[...changes.values()],skipped};
}
function taskImportDragEnter(event){event.preventDefault();event.currentTarget.classList.add('is-dragging');}
function taskImportDragOver(event){event.preventDefault();event.dataTransfer.dropEffect='copy';event.currentTarget.classList.add('is-dragging');}
function taskImportDragLeave(event){if(!event.currentTarget.contains(event.relatedTarget))event.currentTarget.classList.remove('is-dragging');}
function taskImportDrop(event){
  event.preventDefault();event.currentTarget.classList.remove('is-dragging');
  previewTaskImport(event.dataTransfer?.files);
}
async function readTaskImportSheets(file){
  if(/\.(csv|tsv)$/i.test(file.name))return [[file.name,parseDelimited(await file.text())]];
  if(/\.(xlsx|xls)$/i.test(file.name)){
    if(!window.XLSX)throw new Error('تعذر تحميل قارئ Excel. أعد فتح الصفحة أو احفظ الملفات بصيغة CSV.');
    const workbook=XLSX.read(await file.arrayBuffer(),{type:'array',cellDates:true});
    return workbook.SheetNames.map(name=>[name,XLSX.utils.sheet_to_json(workbook.Sheets[name],{header:1,defval:'',raw:false})]);
  }
  throw new Error('الصيغة غير مدعومة؛ اختر Excel أو CSV فقط.');
}
const IMPORT_REQUIRED=['title','emp','dept','status','pct'];
const IMPORT_LABELS={title:'المهمة',emp:'الموظف',dept:'القسم',status:'الحالة',pct:'نسبة الإنجاز'};
function taskSheetLayout(file,name,rows){
  const scanned=rows.slice(0,50).map((row,index)=>({index,cols:importColumnIndexes(row)}));
  const found=scanned.sort((a,b)=>{
    const score=x=>IMPORT_REQUIRED.filter(field=>x.cols[field]>=0).length*10+['tech','received','due'].filter(field=>x.cols[field]>=0).length;
    return score(b)-score(a)||a.index-b.index;
  })[0];
  const header=found?.index??0,cols=found?.cols||importColumnIndexes(rows[0]||[]);
  const dept=importSheetContext(`${name} ${file}`,DATA,rows.slice(0,header));
  return {file,name,rows,header,cols,dept,ignored:false,manual:false};
}
function taskLayoutReady(layout){
  const required=IMPORT_REQUIRED.map(field=>layout.cols[field]);
  if(required.slice(0,2).some(index=>index<0)||required[3]<0||required[4]<0||required[2]<0&&!layout.dept)return false;
  if(new Set(required.filter(index=>index>=0)).size!==required.filter(index=>index>=0).length)return false;
  if(layout.manual)return true;
  const values=layout.rows.slice(layout.header+1,layout.header+12).map(row=>String(row[layout.cols.status]??'').trim()).filter(Boolean);
  return values.length>0&&values.some(value=>importStatus(value));
}
function taskImportMappingChange(index,field,value){
  const layout=importSheetLayouts[index];if(!layout)return;
  if(field==='header'){
    layout.header=Number(value);layout.cols=importColumnIndexes(layout.rows[layout.header]||[]);
  }else if(field==='dept')layout.dept=value.trim();
  else if(field==='ignored')layout.ignored=!layout.ignored;
  else layout.cols[field]=Number(value);
  layout.manual=true;renderTaskImportResults();
}
function renderTaskImportMappings(){
  const target=document.getElementById('import-mappings');
  target.innerHTML=importSheetLayouts.map((layout,index)=>{
    if(layout.ignored)return `<div class="import-mapping">${esc(layout.file)} · ${esc(layout.name)} — ورقة متجاهلة <button type="button" class="btn-secondary" onclick="taskImportMappingChange(${index},'ignored','')">إدراج الورقة</button></div>`;
    const headerOptions=layout.rows.slice(0,Math.min(layout.rows.length,50)).map((row,i)=>`<option value="${i}" ${i===layout.header?'selected':''}>${i+1}: ${esc(row.filter(v=>String(v??'').trim()).slice(0,3).join(' · ').slice(0,90)||'صف فارغ')}</option>`).join('');
    const maxCols=Math.max(...layout.rows.slice(layout.header,layout.header+8).map(row=>row.length),0);
    const fields=IMPORT_REQUIRED.map(field=>{
      const choices=Array.from({length:maxCols},(_,col)=>{
        const label=String(layout.rows[layout.header]?.[col]??'').trim().slice(0,45)||`عمود ${col+1}`;
        const sample=layout.rows.slice(layout.header+1,layout.header+5).map(row=>row[col]).find(v=>String(v??'').trim());
        return `<option value="${col}" ${layout.cols[field]===col?'selected':''}>${esc(`${col+1}: ${label}${sample?` — ${String(sample).slice(0,34)}`:''}`)}</option>`;
      }).join('');
      return `<label>${IMPORT_LABELS[field]}<select aria-label="عمود ${IMPORT_LABELS[field]} في ${esc(layout.name)}" onchange="taskImportMappingChange(${index},'${field}',this.value)"><option value="-1">اختر العمود</option>${choices}</select></label>`;
    }).join('');
    return `<details class="import-mapping" ${!taskLayoutReady(layout)||layout.manual?'open':''}><summary>${esc(layout.file)} · ${esc(layout.name)} — ${taskLayoutReady(layout)?'الأعمدة محددة؛ اضغط للمراجعة':'حدد الأعمدة المطلوبة'}</summary><p>اختر الأعمدة من عينة الورقة، ثم راجع التغييرات أدناه.</p><div class="import-mapping-grid"><label>صف عناوين الأعمدة<select onchange="taskImportMappingChange(${index},'header',this.value)">${headerOptions}</select></label>${fields}<label>اسم القسم إذا كان في اسم الورقة أو خارج الجدول<input value="${esc(layout.dept)}" placeholder="اكتب القسم إن لم يوجد عمود" onchange="taskImportMappingChange(${index},'dept',this.value)"></label></div><button type="button" class="btn-secondary" onclick="taskImportMappingChange(${index},'ignored','')">تجاهل هذه الورقة</button></details>`;
  }).join('');
}
async function previewTaskImport(selectedFiles){
  const files=Array.from(selectedFiles||[]),input=document.getElementById('tasks-import-file');
  if(input)input.value=''; // Allow selecting the same files again after a correction.
  if(!files.length||importReadInFlight||taskMutationInFlight)return;
  const feedback=document.getElementById('import-feedback'),preview=document.getElementById('import-preview'),confirmButton=document.getElementById('confirm-task-import'),fileList=document.getElementById('import-file-list');
  pendingTaskImport=null;importSheetLayouts=[];confirmButton.hidden=true;preview.innerHTML='';document.getElementById('import-mappings').innerHTML='';
  if(!isOwner){feedback.textContent='يلزم دخول المالك قبل قراءة ملفات المهام.';return;}
  importReadInFlight=true;
  fileList.innerHTML=`${files.length} ${files.length===1?'ملف محدد':'ملفات محددة'}: ${files.slice(0,10).map(file=>`<span>${esc(file.name)}</span>`).join('')}${files.length>10?'…':''}`;
  feedback.textContent='جارٍ قراءة الملفات وتجميع التغييرات…';
  try{
    const errors=[];
    for(const file of files){
      try{
        const sheets=await readTaskImportSheets(file);
        for(const [name,rows] of sheets){
          if(!rows.some(row=>row.some(value=>String(value??'').trim())))continue;
          importSheetLayouts.push(taskSheetLayout(file.name,name,rows));
        }
        if(!sheets.length||sheets.every(([,rows])=>!rows.length))errors.push(`${file.name}: الملف فارغ`);
      }catch(error){errors.push(`${file.name}: ${error.message}`)}
    }
    renderTaskImportResults(errors);
  }catch(error){feedback.textContent=error.message||'تعذر قراءة الملفات.';}
  finally{importReadInFlight=false;}
}
function renderTaskImportResults(errors=[]){
  const feedback=document.getElementById('import-feedback'),preview=document.getElementById('import-preview'),confirmButton=document.getElementById('confirm-task-import');
  pendingTaskImport=null;confirmButton.hidden=true;renderTaskImportMappings();
  const working=DATA.slice(),originalById=new Map(DATA.map((task,index)=>[String(task.id),index])),originalKeys=new Set(DATA.map(importKey)),sources=new Map(),skipped=[...errors];
  const waiting=importSheetLayouts.filter(layout=>!layout.ignored&&!taskLayoutReady(layout));
  for(const layout of importSheetLayouts){
    if(layout.ignored||!taskLayoutReady(layout))continue;
    try{
      const result=extractNewTasks(layout.rows,layout.file,layout.name,working,layout);
      for(const change of result.updates){working[change.index]=change.task;const key=importKey(change.task);if(!sources.has(key))sources.set(key,new Set());sources.get(key).add(layout.file)}
      for(const task of result.additions){working.push(task);const key=importKey(task);if(!sources.has(key))sources.set(key,new Set());sources.get(key).add(layout.file)}
      skipped.push(...result.skipped.map(message=>`${layout.file} · ${message}`));
    }catch(error){skipped.push(`${layout.file} · ${layout.name}: ${error.message}`)}
  }
  try{
    const additions=[],updates=[];
    for(const task of working){
      const key=importKey(task),index=originalById.get(String(task.id)),filesForTask=[...(sources.get(key)||[])].join('، ');
      if(index===undefined){if(!originalKeys.has(key))additions.push({...task,source_file:filesForTask||task.source_file});continue;}
      const changed=['emp','tech','status','pct','received','due','date','overdue'].filter(field=>String(DATA[index][field]??'')!==String(task[field]??''));
      if(changed.length)updates.push({index,task,changed,files:filesForTask});
    }
    pendingTaskImport=waiting.length?null:{additions,updates};
    feedback.textContent=`${waiting.length?`تحتاج ${waiting.length} ورقة إلى تحديد الأعمدة قبل النشر. `:''}${additions.length} مهمة جديدة و${updates.length} مهمة ستُحدّث؛ ${skipped.length} صف أو ملف بحاجة مراجعة. راجع المعاينة قبل النشر.`;
    const items=[...updates.map(change=>({type:'تحديث',...change.task,changed:change.changed.join('، '),files:change.files})),...additions.map(task=>({type:'إضافة',...task,changed:'—',files:[...(sources.get(importKey(task))||[])].join('، ')}))];
    preview.innerHTML=(items.length?`<table><thead><tr><th>الإجراء</th><th>المهمة</th><th>القسم</th><th>الموظف</th><th>الحالة</th><th>نسبة الإنجاز</th><th>الملف</th><th>الحقول المتغيرة</th></tr></thead><tbody>${items.map(task=>`<tr><td>${esc(task.type)}</td><td>${esc(task.title)}</td><td>${esc(task.dept)}</td><td>${esc(task.emp)}</td><td>${esc(task.status)}</td><td>${task.pct==null?'—':`${esc(task.pct)}%`}</td><td>${esc(task.files)}</td><td>${esc(task.changed)}</td></tr>`).join('')}</tbody></table>`:'')+(skipped.length?`<details class="import-skipped"><summary>عرض جميع الصفوف التي تحتاج مراجعة (${skipped.length})</summary><ol>${skipped.map(message=>`<li>${esc(message)}</li>`).join('')}</ol></details>`:'');
    confirmButton.hidden=!items.length||!!waiting.length;
  }catch(error){feedback.textContent=error.message||'تعذر تحليل الأوراق.';}
}
async function confirmTaskImport(){
  if(!isOwner||taskMutationInFlight||!pendingTaskImport||(!pendingTaskImport.additions.length&&!pendingTaskImport.updates.length))return;
  const button=document.getElementById('confirm-task-import'),feedback=document.getElementById('import-feedback');
  taskMutationInFlight=true;
  button.disabled=true;feedback.textContent='جارٍ نشر تحديثات المهام وإضافاتها…';
  const previous=DATA,{additions,updates}=pendingTaskImport,copy=DATA.slice();
  for(const change of updates)copy[change.index]=change.task;
  const existing=new Set(copy.map(importKey)),newTasks=additions.filter(task=>!existing.has(importKey(task)));
  DATA=[...copy,...newTasks];
  try{
    await saveTasks();pendingTaskImport=null;document.getElementById('tasks-import-file').value='';document.getElementById('import-file-list').innerHTML='';button.hidden=true;
    feedback.textContent=`تم نشر ${updates.length} تحديث و${newTasks.length} مهمة جديدة. ستظهر للجميع بعد اكتمال نشر المنصة.`;
    refreshFiltersAfterDataChange();
  }catch(error){DATA=previous;feedback.textContent=error.message||'تعذر نشر الملف. لم تتغير البيانات المنشورة.';}
  finally{button.disabled=false;taskMutationInFlight=false;}
}
function monthOf(str){
  if(!str) return null;
  const m = str.match(/[\u0600-\u06FF]+$/);
  return m ? m[0] : null;
}
function pctColor(p){
  if(p == null) return 'var(--ink-faint)';
  if(p >= 100) return 'var(--good)';
  if(p >= 75) return 'var(--navy)';
  if(p >= 50) return 'var(--warn)';
  return 'var(--bad)';
}
function statusPill(r){
  if(r.status === 'منجز') return `<span class="pill pill-good"><span class="pill-dot"></span>منجز</span>`;
  if(r.status === 'متأخر') return `<span class="pill pill-bad"><span class="pill-dot"></span>متأخر</span>`;
  return `<span class="pill pill-warn"><span class="pill-dot"></span>قيد الإجراء</span>`;
}

// ═══════════════════════════════════════════════
// FILTER POPULATION
// ═══════════════════════════════════════════════
const MONTH_ORDER = ['فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر'];
function populateFilters(){
  const deptSel = document.getElementById('f-dept');
  const depts = [...new Set(DATA.map(r=>r.dept))].sort((a,b)=>a.localeCompare(b,'ar'));
  deptSel.innerHTML = '<option value="all">كل الأقسام</option>' + depts.map(d=>`<option value="${esc(d)}">${esc(d)}</option>`).join('');

  const monthSel = document.getElementById('f-month');
  const monthsPresent = new Set(DATA.map(r=>monthOf(r.date)).filter(Boolean));
  let mopts = '<option value="all">كل الأشهر</option>';
  MONTH_ORDER.forEach(m=>{ if(monthsPresent.has(m)) mopts += `<option value="${m}">${m}</option>`; });
  monthSel.innerHTML = mopts;

  const empSel = document.getElementById('f-emp');
  const empSet = new Set();
  DATA.forEach(r=>splitEmps(r.emp).forEach(n=>empSet.add(n)));
  const emps = [...empSet].sort((a,b)=>a.localeCompare(b,'ar'));
  empSel.innerHTML = '<option value="all">كل الموظفين</option>' + emps.map(n=>`<option value="${esc(n)}">${esc(n)}</option>`).join('');
}

// ═══════════════════════════════════════════════
// FILTERING
// ═══════════════════════════════════════════════
function applyFilters(){
  filtered = DATA.filter(r=>{
    const s = fStatus==='all' || r.status===fStatus;
    const d = fDept==='all' || r.dept===fDept;
    const mo = fMonth==='all' || monthOf(r.date)===fMonth;
    const e = fEmp==='all' || splitEmps(r.emp).includes(fEmp);
    const q = !fSearch || r.title.includes(fSearch) || r.emp.includes(fSearch) || (r.dept||'').includes(fSearch);
    return s && d && mo && e && q;
  });
  page=1;
  renderAll();
}
function onFilterChange(){
  fDept = document.getElementById('f-dept').value;
  fMonth = document.getElementById('f-month').value;
  fEmp = document.getElementById('f-emp').value;
  fStatus = document.getElementById('f-status').value;
  saveFilterState();
  applyFilters();
}
function onSearchInput(){
  clearTimeout(searchDebounce);
  searchDebounce = setTimeout(()=>{
    fSearch = document.getElementById('f-search').value.trim();
    saveFilterState();
    applyFilters();
  },220);
}
function resetFilters(){
  fDept='all'; fMonth='all'; fEmp='all'; fStatus='all'; fSearch='';
  document.getElementById('f-dept').value='all';
  document.getElementById('f-month').value='all';
  document.getElementById('f-emp').value='all';
  document.getElementById('f-status').value='all';
  document.getElementById('f-search').value='';
  saveFilterState();
  applyFilters();
}
function setStatusFilter(s){
  fStatus = s;
  document.getElementById('f-status').value = s;
  saveFilterState();
  applyFilters();
}
function filterByDept(d){
  fDept = d;
  document.getElementById('f-dept').value = d;
  switchTab('table');
  saveFilterState();
  applyFilters();
}
function filterByEmp(n){
  fEmp = n;
  document.getElementById('f-emp').value = n;
  switchTab('table');
  saveFilterState();
  applyFilters();
}

// ═══════════════════════════════════════════════
// TABS
// ═══════════════════════════════════════════════
function switchTab(name){
  currentTab = name;
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===name));
  document.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('panel-'+name).classList.add('active');
  if(name==='overview') renderOverview();
  if(name==='table') renderTable();
  if(name==='perf') renderPerf();
  if(name==='dq') renderDQ();
}

// ═══════════════════════════════════════════════
// KPI / HERO
// ═══════════════════════════════════════════════
function renderHero(){
  const total = DATA.length;
  const done = DATA.filter(r=>r.status==='منجز').length;
  const prog = DATA.filter(r=>r.status==='قيد الإجراء').length;
  const late = DATA.filter(r=>r.status==='متأخر').length;
  const rate = total ? Math.round(done/total*100) : 0;
  const depts = new Set(DATA.map(r=>r.dept)).size;
  const empSet = new Set(); DATA.forEach(r=>splitEmps(r.emp).forEach(n=>empSet.add(n)));

  document.getElementById('hero-rate').innerHTML = rate + '<span class="unit">%</span>';
  document.querySelector('.hero-figure').style.setProperty('--rate', rate);
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-prog').textContent = prog;
  document.getElementById('stat-late').textContent = late;
  document.getElementById('stat-depts').textContent = depts;
  document.getElementById('stat-emps').textContent = empSet.size;
  document.getElementById('context-total').textContent = `${DATA.length} بندًا تشغيليًا`;
  document.getElementById('context-depts').textContent = `${new Set(DATA.map(r=>r.dept)).size} أقسام`;

  document.getElementById('filter-count').textContent = `عرض ${filtered.length} من أصل ${DATA.length} مهمة`;
}

function renderAll(){
  renderHero();
  if(currentTab==='overview') renderOverview();
  if(currentTab==='table') renderTable();
  if(currentTab==='perf') renderPerf();
  if(currentTab==='dq') renderDQ();
}

// ═══════════════════════════════════════════════
// OVERVIEW TAB
// ═══════════════════════════════════════════════
function renderOverview(){
  const done = filtered.filter(r=>r.status==='منجز').length;
  const prog = filtered.filter(r=>r.status==='قيد الإجراء').length;
  const late = filtered.filter(r=>r.status==='متأخر').length;

  const ctx = document.getElementById('donut').getContext('2d');
  if(donutChart) donutChart.destroy();
  donutChart = new Chart(ctx,{
    type:'doughnut',
    data:{
      labels:['منجز','قيد الإجراء','متأخر'],
      datasets:[{data:[done,prog,late], backgroundColor:['#28775B','#C59A52','#8E2948'], borderWidth:0, hoverOffset:7}]
    },
    options:{cutout:'68%', plugins:{legend:{display:false}, tooltip:{rtl:true}}}
  });
  const total = done+prog+late || 1;
  document.getElementById('donut-legend').innerHTML = [
    ['منجز','#1E7B4D',done],['قيد الإجراء','#B7791F',prog],['متأخر','#B23A3A',late]
  ].map(([name,color,val])=>`
    <div class="legend-row">
      <span class="legend-dot" style="background:${color}"></span>
      <span class="name">${name}</span>
      <span class="val">${val} (${Math.round(val/total*100)}%)</span>
    </div>`).join('');

  // attention list: late items + near-done items (>=85% not done)
  const late_ = filtered.filter(r=>r.status==='متأخر');
  const nearDone = filtered.filter(r=>r.status==='قيد الإجراء' && r.pct!=null && r.pct>=85);
  const items = [...late_, ...nearDone].slice(0,8);
  const el = document.getElementById('attn-list');
  if(!items.length){
    el.innerHTML = '<div class="empty-note">لا توجد بنود تحتاج انتباهاً حالياً ضمن الفلاتر المحددة.</div>';
  } else {
    el.innerHTML = items.map(r=>{
      const idx = DATA.indexOf(r);
      const isLate = r.status==='متأخر';
      return `<div class="attn-item" onclick="openTaskDrawer(${idx})">
        <span class="attn-dot" style="background:${isLate?'var(--bad)':'var(--warn)'}"></span>
        <span class="attn-title">${r.title}</span>
        <span class="attn-meta">${isLate?'متأخر':(r.pct+'%')}</span>
      </div>`;
    }).join('');
  }

  // dept completion bars
  const deptMap = {};
  filtered.forEach(r=>{ (deptMap[r.dept]=deptMap[r.dept]||[]).push(r); });
  const rows = Object.entries(deptMap).map(([d,items])=>{
    const done = items.filter(r=>r.status==='منجز').length;
    return {d, total:items.length, done, pct: Math.round(done/items.length*100)};
  }).sort((a,b)=>b.total-a.total);
  document.getElementById('deptbar-list').innerHTML = rows.map(r=>`
    <div class="deptbar-row" onclick="filterByDept('${r.d.replace(/'/g,"\\'")}')">
      <div class="deptbar-top"><span class="name">${r.d}</span><span class="pct">${r.pct}% <span style="color:var(--ink-faint);font-weight:400;">(${r.done}/${r.total})</span></span></div>
      <div class="deptbar-track"><div class="deptbar-fill" style="width:${r.pct}%;background:${pctColor(r.pct)}"></div></div>
    </div>`).join('') || '<div class="empty-note">لا توجد بيانات ضمن الفلاتر المحددة.</div>';
}

// ═══════════════════════════════════════════════
// TABLE TAB
// ═══════════════════════════════════════════════
function renderTable(){
  const tbody = document.getElementById('tbody');
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  if(page>totalPages) page=totalPages;
  const start = (page-1)*PAGE_SIZE;
  const pageItems = filtered.slice(start, start+PAGE_SIZE);

  if(!pageItems.length){
    tbody.innerHTML = `<tr><td colspan="6" class="empty-note">لا توجد نتائج مطابقة للفلاتر المحددة.</td></tr>`;
  } else {
    tbody.innerHTML = pageItems.map(r=>{
      const idx = DATA.indexOf(r);
      const p = r.pct!=null ? r.pct : null;
      const w = p!=null ? p : 0;
      const c = pctColor(p);
      return `<tr onclick="openTaskDrawer(${idx})">
        <td class="cell-title">${esc(r.title)}</td>
        <td>${esc(r.dept)}</td>
        <td class="cell-emp">${esc(r.emp)}</td>
        <td><div class="pct-mini"><div class="track"><div class="fill" style="width:${w}%;background:${c}"></div></div><span class="num">${p!=null?p+'%':'—'}</span></div></td>
        <td>${esc(r.date || '—')}</td>
        <td>${statusPill(r)}</td>
      </tr>`;
    }).join('');
  }
  document.getElementById('pager-info').textContent = `صفحة ${page} من ${totalPages} — ${filtered.length} مهمة`;
  document.getElementById('pg-prev').disabled = page<=1;
  document.getElementById('pg-next').disabled = page>=totalPages;
}
function changePage(delta){
  page += delta;
  renderTable();
}

// ═══════════════════════════════════════════════
// PERFORMANCE TAB
// ═══════════════════════════════════════════════
function setPerfMode(mode){
  perfMode = mode;
  document.querySelectorAll('.perf-toggle button').forEach(b=>b.classList.toggle('active', b.dataset.mode===mode));
  renderPerf();
}
function calcEff(items){
  const total = items.length;
  const done = items.filter(r=>r.status==='منجز').length;
  if(!total) return {score:100,total:0,done:0};
  return {score: Math.round(done/total*100), total, done};
}
function renderPerf(){
  const grid = document.getElementById('perf-grid');
  const overall = calcEff(filtered);
  let html = `<div class="perf-card is-total">
    <div class="perf-name">الدائرة كاملة (ضمن الفلاتر)</div>
    <div class="perf-score">${overall.score}%</div>
    <div class="perf-track"><div class="perf-fill" style="width:${overall.score}%;background:var(--gold-bright);"></div></div>
    <div class="perf-sub">${overall.done} منجز من ${overall.total} مهمة</div>
  </div>`;

  if(perfMode==='dept'){
    const map={};
    filtered.forEach(r=>{ (map[r.dept]=map[r.dept]||[]).push(r); });
    Object.entries(map).sort((a,b)=>calcEff(b[1]).total-calcEff(a[1]).total).forEach(([name,items])=>{
      const e = calcEff(items);
      html += perfCard(name, e, `filterByDept('${name.replace(/'/g,"\\'")}')`);
    });
  } else {
    const map={};
    filtered.forEach(r=>{ splitEmps(r.emp).forEach(name=>{ (map[name]=map[name]||[]).push(r); }); });
    Object.entries(map).sort((a,b)=>calcEff(a[1]).score-calcEff(b[1]).score).forEach(([name,items])=>{
      const e = calcEff(items);
      html += perfCard(name, e, `filterByEmp('${name.replace(/'/g,"\\'")}')`);
    });
  }
  grid.innerHTML = html;
}
function perfCard(name, e, onclick){
  return `<div class="perf-card" onclick="${onclick}">
    <div class="perf-name">${name}</div>
    <div class="perf-score" style="color:${e.score>=80?'var(--good)':e.score>=60?'var(--warn)':'var(--bad)'}">${e.score}%</div>
    <div class="perf-track"><div class="perf-fill" style="width:${e.score}%;background:${e.score>=80?'var(--good)':e.score>=60?'var(--warn)':'var(--bad)'};"></div></div>
    <div class="perf-sub">${e.done} منجز من ${e.total} مهمة</div>
  </div>`;
}

// ═══════════════════════════════════════════════
// DATA QUALITY TAB
// ═══════════════════════════════════════════════
function renderDQ(){
  document.getElementById('dq-fixed').innerHTML = DQ_FIXED.map(f=>`
    <div class="dq-item">
      <div class="dq-icon fixed">✓</div>
      <div class="dq-body">
        <div class="dq-title">${f.title}</div>
        <div class="dq-detail">${f.detail}</div>
      </div>
    </div>`).join('');
  document.getElementById('dq-flags').innerHTML = DQ_FLAGS.length ? DQ_FLAGS.map(f=>`
    <div class="dq-item">
      <div class="dq-icon flag">!</div>
      <div class="dq-body">
        <div class="dq-title">${f.title}</div>
        <div class="dq-detail">${f.detail}</div>
        <div class="dq-nums">${f.nums}</div>
      </div>
    </div>`).join('') : '<div class="empty-note">لا توجد بنود معلّقة تحتاج مراجعتك حالياً.</div>';
}
document.getElementById('dq-badge').textContent = DQ_FLAGS.length;

// ═══════════════════════════════════════════════
// DRAWER
// ═══════════════════════════════════════════════
function openDrawer(){
  document.getElementById('overlay').classList.add('open');
  document.getElementById('drawer').classList.add('open');
}
function closeDrawer(){
  document.getElementById('overlay').classList.remove('open');
  document.getElementById('drawer').classList.remove('open');
}
function esc(value){return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));}
function syncTaskStatusProgress(form){
  const pctInput=form?.elements?.pct;
  if(form?.elements?.status?.value==='منجز'&&pctInput)pctInput.value='100';
}
function taskForm(r,idx,isNew=false){
  const pct=r.status==='منجز'?100:(r.pct==null?'':r.pct);
  return `<form class="drawer-form" id="task-edit-form" onsubmit="saveTaskEdit(event,${idx},${isNew})">
    <label>عنوان المهمة<input name="title" required value="${esc(r.title)}"></label>
    <label>القسم<input name="dept" required list="dept-options" value="${esc(r.dept)}"><datalist id="dept-options">${[...new Set(DATA.map(x=>x.dept))].map(d=>`<option value="${esc(d)}">`).join('')}</datalist></label>
    <label>الموظف أو الفريق<input name="emp" value="${esc(r.emp)}"></label>
    <div class="drawer-form-grid">
      <label>الحالة<select name="status" onchange="syncTaskStatusProgress(this.form)"><option${r.status==='منجز'?' selected':''}>منجز</option><option${r.status==='قيد الإجراء'?' selected':''}>قيد الإجراء</option><option${r.status==='متأخر'?' selected':''}>متأخر</option></select></label>
      <label>نسبة الإنجاز<input name="pct" type="number" min="0" max="100" step="1" value="${esc(pct)}" placeholder="0–100"></label>
    </div>
    <div class="drawer-form-grid"><label>تاريخ الاستلام<input name="received" value="${esc(r.received)}" placeholder="مثال: 17 سبتمبر"></label><label>التاريخ / موعد التسليم<input name="due" value="${esc(r.due||r.date)}" placeholder="مثال: 30 سبتمبر"></label></div>
    <label>التفاصيل والموقف التنفيذي<textarea name="tech">${esc(r.tech)}</textarea></label>
    <div class="drawer-actions"><button class="btn-primary" type="submit">حفظ وتحديث المؤشرات</button>${isNew?'':`<button class="btn-danger" type="button" onclick="deleteTask(${idx})">حذف المهمة</button>`}<button class="btn-secondary" type="button" onclick="closeDrawer()">إلغاء</button></div>
    <div class="save-note" id="task-save-note"></div>
  </form>`;
}
function taskDetails(r){
  return `<div class="dfield"><div class="k">الحالة</div><div class="v">${statusPill(r)}</div></div>
    <div class="dfield"><div class="k">القسم</div><div class="v">${esc(r.dept)}</div></div>
    <div class="dfield"><div class="k">الموظف أو الفريق</div><div class="v">${esc(r.emp||'—')}</div></div>
    <div class="dfield"><div class="k">نسبة الإنجاز</div><div class="v">${r.pct==null?'—':`${r.pct}%`}</div></div>
    <div class="dfield"><div class="k">التاريخ / موعد التسليم</div><div class="v">${esc(r.due||r.date||'—')}</div></div>
    <div class="dfield"><div class="k">التفاصيل والموقف التنفيذي</div><div class="v">${esc(r.tech||'—')}</div></div>`;
}
function openTaskDrawer(idx){
  const r=DATA[idx];if(!r)return;
  document.getElementById('drawer-title').textContent=isOwner?'تحديث تفاصيل المهمة':'تفاصيل المهمة';
  document.getElementById('drawer-body').innerHTML=isOwner?taskForm(r,idx,false):taskDetails(r);
  openDrawer();
}
function openNewTaskDrawer(){
  if(!isOwner){alert('يلزم دخول المالك لإضافة مهمة.');return;}
  const r={title:'',dept:'',emp:'',tech:'',pct:0,received:'',due:'',status:'قيد الإجراء',overdue:false};
  document.getElementById('drawer-title').textContent='إضافة مهمة جديدة';
  document.getElementById('drawer-body').innerHTML=taskForm(r,-1,true);
  openDrawer();
}
async function saveTaskEdit(event,idx,isNew){
  event.preventDefault();
  if(!isOwner||taskMutationInFlight)return;
  taskMutationInFlight=true;
  const form=event.currentTarget,submit=form.querySelector('[type="submit"]');
  if(submit)submit.disabled=true;
  const fd=new FormData(form);
  const rawPct=String(fd.get('pct')||'').trim();
  const selectedStatus=String(fd.get('status')||'قيد الإجراء');
  const task={
    ...(isNew?{}:DATA[idx]),
    id:isNew?`task-${Date.now()}`:(DATA[idx].id||`task-${Date.now()}`),
    title:String(fd.get('title')||'').trim(),dept:String(fd.get('dept')||'').trim(),emp:normalizeEmployees(fd.get('emp')),
    status:selectedStatus,pct:selectedStatus==='منجز'?100:(rawPct===''?null:Math.max(0,Math.min(100,Number(rawPct)))),
    received:String(fd.get('received')||'').trim()||null,due:String(fd.get('due')||'').trim()||null,
    date:String(fd.get('due')||'').trim()||null,tech:String(fd.get('tech')||'').trim(),overdue:selectedStatus==='متأخر'
  };
  if(!task.title||!task.dept){taskMutationInFlight=false;if(submit)submit.disabled=false;return;}
  const previous=DATA.map(item=>({...item}));
  if(isNew)DATA.push(task);else DATA[idx]=task;
  const note=document.getElementById('task-save-note');if(note)note.textContent='جارٍ نشر التحديث إلى GitHub…';
  try{
    await saveTasks();refreshFiltersAfterDataChange();closeDrawer();
  }catch(error){DATA=previous;refreshFiltersAfterDataChange();if(note)note.textContent=error.message||'تعذر نشر التحديث';}
  finally{taskMutationInFlight=false;if(submit)submit.disabled=false;}
}
async function deleteTask(idx){
  if(!isOwner){alert('يلزم دخول المالك للحذف.');return;}
  if(taskMutationInFlight)return;
  const r=DATA[idx];if(!r||!confirm(`حذف المهمة «${r.title}»؟`))return;
  taskMutationInFlight=true;
  const previous=DATA.map(item=>({...item}));DATA.splice(idx,1);refreshFiltersAfterDataChange();
  try{await saveTasks();closeDrawer();}catch(error){DATA=previous;refreshFiltersAfterDataChange();alert(error.message||'تعذر نشر الحذف');}
  finally{taskMutationInFlight=false;}
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
async function init(){
  DATA=await loadTasks();
  populateFilters();
  restoreFilterState();
  const fmt = new Intl.DateTimeFormat('ar', {day:'numeric', month:'long', year:'numeric'});
  document.getElementById('last-update-tag').innerHTML = `<span class="live-dot"></span>آخر تحديث: ${fmt.format(new Date())}`;
  applyFilters();
  publishSummary();
  await restoreOwnerSession();
}
init();

