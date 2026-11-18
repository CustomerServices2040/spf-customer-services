const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('overrides/assets/work-tracker.html','utf8'),data=JSON.parse(fs.readFileSync('overrides/assets/tasks-data.json','utf8'));
const ctx={DATA:data.tasks,crypto:require('node:crypto').webcrypto};vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('const EMPLOYEE_ALIASES='),html.indexOf('async function loadTasks()'))+html.slice(html.indexOf('function importKey('),html.indexOf('const IMPORT_COLUMNS'))+html.slice(html.indexOf('const TEXT_TASK_STOP_WORDS'),html.indexOf('let textTaskAnalysisTimer'))+html.slice(html.indexOf('function taskDateValue'),html.indexOf('function renderTable')),ctx);
const draft=data.text_review_drafts.find(d=>d.id==='text-review-2026-11-18');
if(draft){const p=ctx.prepareTextReview(draft.source_text);assert.equal(p.rows.length,53);assert.equal(p.repeated,14);assert.equal(p.rows.filter(r=>!r.emp).length,2);assert.equal(p.rows.filter(r=>r.dept==='التنسيق والمتابعة').length,13);assert(p.rows.every(r=>!r.status));assert.equal(p.rows.find(r=>r.title.startsWith('إطار التميز')).pct,40);assert.equal(p.rows.find(r=>r.title==='ملتقى الإدارة').pct,80);assert(p.rows.every(r=>!r.title.includes('**')&&!r.title.includes('المسؤول:')));assert.equal(ctx.validateTextReview(p.rows).length,53)}
const row={title:'مهمة اختبار',dept:'التنسيق والمتابعة',emp:'لمى',details:'تفاصيل اختبار',status:'قيد الإجراء',pct:50,action:'new',reviewed:true,selected:true};
assert.equal(ctx.buildReviewedTaskPlan([], [{...row,emp:'',status:'غير محدد'}]).tasks[0].emp,'');assert.throws(()=>ctx.buildReviewedTaskPlan([], [{...row,status:'',reviewed:false}]),/أكمل/);assert.throws(()=>ctx.buildReviewedTaskPlan([], [{...row,pct:100}]),/أكمل/);
const first=ctx.buildReviewedTaskPlan([], [row], '2026-11-18T06:00:00Z');assert.equal(first.added,1);assert.equal(first.tasks[0].pct,50);assert.equal(ctx.buildReviewedTaskPlan(first.tasks,[row]).added,0);
const edit={...row,action:'update',target_id:first.tasks[0].id,details:'تعديل يدوي',status:'منجز',pct:20};const changed=ctx.buildReviewedTaskPlan(first.tasks,[edit]);assert.equal(changed.updated,1);assert.equal(changed.tasks[0].tech,'تعديل يدوي');assert.equal(changed.tasks[0].pct,100);assert.equal(first.tasks[0].tech,'تفاصيل اختبار');
assert.equal(ctx.buildReviewedTaskPlan([], [{...row,selected:false}]).tasks.length,0);assert.throws(()=>ctx.buildReviewedTaskPlan([], [{...row,action:'update',target_id:'missing'}]),/لم تعد موجودة/);
const items=[{id:'old',created_at:'2026-11-01T00:00:00Z',updated_at:'2026-12-01T00:00:00Z'},{id:'new',created_at:'2026-11-18T00:00:00Z',received:'1/1/2020'},{id:'import',imported_at:'2026-11-10T00:00:00Z'},{id:'legacy',received:'1/1/2030'},{id:'lastLegacy'}];
assert.equal(ctx.sortTasksChronologically(items).map(t=>t.id).join(','),'new,import,old,lastLegacy,legacy');
assert.equal(ctx.sortTasksChronologically(items,false).map(t=>t.id).join(','),'old,import,new,legacy,lastLegacy');
assert.equal(items[0].id,'old');assert.equal(ctx.taskDateValue('31/2/2026'),null);
const legacyEdit=ctx.buildReviewedTaskPlan([{...first.tasks[0],created_at:undefined,imported_at:undefined}],[edit]);
assert.equal(legacyEdit.tasks[0].imported_at,undefined);
assert(html.includes('sortTasksChronologically(filtered,true).slice'));
const app=fs.readFileSync('overrides/assets/app.js','utf8');assert.equal(app.slice(app.indexOf('function taskDateValue'),app.indexOf('  function renderTrackerKanban')).trim(),html.slice(html.indexOf('function taskDateValue'),html.indexOf('function renderTable')).trim());
assert(app.includes('sortTasksChronologically(tasks.filter(task=>classify(task)===group.code),true)'));
console.log('Review flow passed: 53 tasks, explicit missing fields, manual edit payload, validation, selective save, idempotence, chronological ordering');

