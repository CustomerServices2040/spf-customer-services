/* Standalone visual review only. Synthetic records, no server, no outbound messages. */
window.ARRIVAL_OFFLINE=true;
(()=>{
const key='busola-arrival-review-platform-v2';
function seed(){return {open:true,rows:Array.from({length:9},(_,i)=>({id:'demo-'+i,name:i===8?'سجل تجريبي مكرر':'مشارك تجريبي '+(i+1),nickname:'ضيفنا '+(i+1),division:'التقسيم التجريبي '+(i%3+1),governorate:['مسقط','الداخلية','ظفار'][i%3],phone:'+9689900000'+(i===8?8:i+1),day1:'',day2:'',version:1,arrived_at:i>=4&&i<=6?new Date(Date.now()-(i-3)*60000).toISOString():null,message_status:null,message_id:'message-'+i}))}}
let memory;function read(){try{return JSON.parse(localStorage.getItem(key))||seed()}catch{return memory||seed()}}function write(d){memory=d;try{localStorage.setItem(key,JSON.stringify(d))}catch{}}
let logged=false,challenge=null,ticket=null;
const normal=s=>{s=String(s).trim().replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/[\s()\-]/g,'').replace(/^\+968|^00968|^968(?=\d{8}$)/,'');if(!/^[279]\d{7}$/.test(s))throw Error('أدخل رقما عمانيا صحيحا من 8 أرقام أو مسبوقا بـ +968');return '+968'+s};
window.offlineAPI=async(path,b)=>{
 await new Promise(r=>setTimeout(r,180));const d=read();
 if(path==='config')return {demo:true,open:d.open,whatsapp_enabled:false,platform_only:true};
 if(path==='login'){if(b.username!=='reviewer'||b.password!=='Review-Only-2026')throw Error('بيانات حساب التجربة غير صحيحة');logged=true;return {csrf:'demo-only',role:'organizer'}}
 if(path==='logout'){logged=false;return {ok:true}}
 if(path==='challenge'){if(!d.open)throw Error('تسجيل الوصول مغلق حاليا. يرجى مراجعة فريق الاستقبال');const p=d.rows.filter(x=>x.phone===normal(b.phone));if(p.length>1)throw Error('يتطلب هذا الرقم التحقق لدى فريق الاستقبال. لن يتم اختيار سجل تلقائيا');if(!p.length)throw Error('تعذر العثور على رقم الهاتف ضمن قائمة المدعوين. يرجى التأكد من الرقم المدخل وإعادة المحاولة، أو مراجعة فريق الاستقبال للمساعدة');ticket=p[0].id;return {ticket,participant:{},platform_only:true}}
 if(path==='verify'){if(b.challenge!==challenge||b.code!=='246810')throw Error('رمز التحقق غير صحيح أو انتهت صلاحيته');ticket=challenge;challenge=null;const p=d.rows.find(r=>r.id===ticket);return {ticket,participant:p,arrived_at:p.arrived_at}}
 function arrive(p,consent){if(!d.open)throw Error('تسجيل الوصول مغلق حاليا');if(!p)throw Error('انتهت صلاحية التحقق');const duplicate=!!p.arrived_at;if(!duplicate){p.arrived_at=new Date().toISOString();p.message_status=null;write(d)}return {duplicate,name:p.nickname||p.name,arrived_at:p.arrived_at}}
 if(path==='arrive'){if(!ticket||ticket!==b.ticket)throw Error('انتهت صلاحية التحقق');return arrive(d.rows.find(r=>r.id===ticket),b.consent)}
 if(path.startsWith('admin/')){if(!logged){const e=Error('سجل دخولك بحساب المنظم');e.status=401;throw e}
 if(path==='admin/session')return {csrf:'demo-only',role:'organizer'};
 if(path==='admin/roster')return {rows:d.rows,open:d.open,role:'organizer',whatsapp_enabled:false,platform_only:true};
 if(path==='admin/open'){d.open=b.open;write(d);return {open:d.open}}
 if(path==='admin/qr')return {url:null,open:d.open};
 if(path==='admin/arrive'){if(!b.verified)throw Error('تحقق من هوية المشارك');return arrive(d.rows.find(r=>r.id===b.id),b.consent)}
 if(path==='admin/participant'){b.phone=b.phone?normal(b.phone):'';if(!b.name)throw Error('الاسم مطلوب');if(b.id){const p=d.rows.find(r=>r.id===b.id);if(p.version!==b.version)throw Error('تغير السجل. أعد تحميله');if(p.arrived_at&&p.phone!==b.phone)throw Error('لا يمكن تغيير رقم الهاتف بعد تسجيل الوصول');Object.assign(p,b,{version:p.version+1})}else d.rows.push({...b,id:crypto.randomUUID(),version:1,message_id:crypto.randomUUID()});write(d);return {ok:true}}
 if(path==='admin/retry'){const p=d.rows.find(r=>r.message_id===b.id);if(!p||p.message_status!=='failed')throw Error('تتاح الإعادة للفشل المؤكد فقط');p.message_status='pending';write(d);return {ok:true}}
 }throw Error('هذه العملية غير متاحة في المعاينة المحلية');
};
// Excel 2003 XML is readable by Excel; operational server exports native .xlsx.
window.offlineExport=rows=>{
 const xml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]));
 const data=[['الاسم','التقسيم الإداري','الهاتف','حالة الوصول','وقت الوصول بتوقيت عمان'],...rows.map(r=>[r.name,r.division,r.phone,r.arrived_at?'وصل':'لم يصل',r.arrived_at?new Intl.DateTimeFormat('ar-OM',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Muscat'}).format(new Date(r.arrived_at)):''])];
 const content='<?xml version="1.0" encoding="UTF-8"?><?mso-application progid="Excel.Sheet"?><Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"><Worksheet ss:Name="تجربة الوصول"><Table>'+data.map(r=>'<Row>'+r.map(v=>'<Cell><Data ss:Type="String">'+xml(v)+'</Data></Cell>').join('')+'</Row>').join('')+'</Table></Worksheet></Workbook>';
 const a=document.createElement('a'),url=URL.createObjectURL(new Blob([content],{type:'application/vnd.ms-excel'}));a.href=url;a.download='arrival-demo.xml';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
})();
