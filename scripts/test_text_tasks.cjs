const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('overrides/assets/work-tracker.html','utf8');
const data=JSON.parse(fs.readFileSync('overrides/assets/tasks-data.json','utf8'));
const ctx={DATA:data.tasks,crypto:require('node:crypto').webcrypto};vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('const EMPLOYEE_ALIASES='),html.indexOf('async function loadTasks()'))+html.slice(html.indexOf('function importKey('),html.indexOf('const IMPORT_COLUMNS'))+html.slice(html.indexOf('const TEXT_TASK_STOP_WORDS'),html.indexOf('function analyzeTextTasks()'))+html.slice(html.indexOf('function mergeTextTaskEntries'),html.indexOf('async function saveTextTasks')),ctx);
const parse=t=>ctx.parseFreeTextTasks(t);
let e=parse('إدارة وتطوير الخدمات\n١. إعداد التقرير\nالتفاصيل: مراجعة البيانات\n٢. تحديث الدليل\nالحالة: غير منجز\nالإنجاز: ٦٠٪');
assert.equal(e.length,2);assert.match(e[0].details,/مراجعة البيانات/);assert.equal(e[1].pct,60);assert.equal(e[1].status,'قيد الإجراء');
e=parse('المهمة: إعداد التقرير\nالموظف: عزان\nالحالة: منجز\n\nالمهمة: مراجعة الدليل\nالتفاصيل: نسخة جديدة');assert.equal(e.length,2);assert.equal(e[0].emp,'عزان');assert.equal(e[0].pct,100);
e=parse('إدارة وتطوير الخدمات\nالموضوع | الموظف المسؤول | الإجراء المطلوب | الملاحظات والموقف التنفيذي | منجز/ قيد الاجراء | نسبة الإنجاز\n1 | مهمة تجريبية | عزان | جاري العمل | تم تسليم المسودة | منجز | 1\n2 | مهمة أخرى | أحمد | مراجعة | قيد الاجراء | 0.6');assert.equal(e.length,2);assert.equal(e[0].status,'منجز');assert.equal(e[1].pct,60);assert.equal(e[1].received,null);
assert.equal(ctx.inferTextTaskStatus('غير منجز بنسبة ٤٠٪').status,'قيد الإجراء');
assert.equal(parse('الموقف التنفيذي الاسبوعي لقسم (إدارة وتطوير الخدمات)\nالموضوع | الموظف المسؤول | الحالة\n1\n2').length,0);
let plan=ctx.mergeTextTaskEntries([],e);assert.equal(plan.added,2);assert.equal(ctx.mergeTextTaskEntries(plan.tasks,e).added,0);
assert.equal(ctx.mergeTextTaskEntries(plan.tasks,[{...e[0],details:'تحديث جديد'}]).updated,1);
if(data.text_import_audit){
 const counts=[0,155,5,0,17,15,15,6,4,19,8,19,62];
 data.text_import_audit.source_records.forEach((source,i)=>{const entries=parse(source.title+'\n'+source.tech);assert.equal(entries.length,counts[i],source.title);if(i===9)assert.match(entries[9].details,/أنظمة.*UPS/);if(i===1){assert.equal(entries[0].emp,'حسناء / سعيد الشبلي / سعادة الصارخية');assert.match(entries[13].details,/اللقاء الرمضاني/);}});
 assert.equal(data.text_import_audit.parsed_entries,325);
 assert(!data.tasks.some(t=>/^تجميع نصي|^ملحق من ملف|^تحديث أسبوعي:|^ملخص الطلبات الواردة/.test(t.title)));
 assert.equal(data.tasks.filter(t=>/^طلب \d+ –/.test(t.title)).length,62);
 const ids=data.tasks.map(t=>t.id);assert.equal(new Set(ids).size,ids.length);
}
console.log('Text task parsing, field extraction, continuation, repeat-import and repair coverage passed');
