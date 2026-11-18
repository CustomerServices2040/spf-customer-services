const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('overrides/assets/work-tracker.html','utf8'),data=JSON.parse(fs.readFileSync('overrides/assets/tasks-data.json','utf8'));
const nodes=new Map(),node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',hidden:false,disabled:false,scrollIntoView(){},classList:{toggle(){}},querySelector(){return node('child')}});return nodes.get(id)};
const local=new Map();const ctx={console,DATA:data.tasks,crypto:require('node:crypto').webcrypto,document:{getElementById:node,querySelector:()=>node('query'),querySelectorAll:()=>[]},localStorage:{getItem:k=>local.get(k)||null,setItem:(k,v)=>local.set(k,v),removeItem:k=>local.delete(k)},setTimeout,clearTimeout,confirm:()=>true,alert(){},taskMutationInFlight:false,refreshFiltersAfterDataChange(){},esc:s=>String(s??'').replaceAll('<','&lt;').replaceAll('"','&quot;'),setTaskEntryMode(){}};vm.createContext(ctx);
vm.runInContext(html.slice(html.indexOf('const EMPLOYEE_ALIASES='),html.indexOf('async function loadTasks()'))+html.slice(html.indexOf('function importKey('),html.indexOf('const IMPORT_COLUMNS'))+html.slice(html.indexOf('const TEXT_TASK_STOP_WORDS'),html.indexOf('async function readTaskImportSheets')),ctx);
(async()=>{
 ctx.rows=[{title:'اختبار يدوي',details:'بيانات يدوية',dept:'التنسيق والمتابعة',emp:'لمى',status:'قيد الإجراء',pct:35,received:'18/11/2026',selected:true,reviewed:true,action:'new'},{title:'صف غير محدد',details:'',dept:'',emp:'',status:'',selected:false,reviewed:false,action:'new'}];
 vm.runInContext("pendingTextTasks=rows;reviewSource='نص الاختبار';activeTextDraftId='draft-test';textReviewDrafts=[{id:'draft-test',entries:rows,source_text:reviewSource}];",ctx);node('task-text-lines').value='نص الاختبار';const count=ctx.DATA.length;
 ctx.saveTasks=async()=>{throw Error('409 تعارض في النسخة')};await ctx.saveTextTasks();assert.equal(ctx.DATA.length,count);assert.match(node('task-text-feedback').textContent,/احتفظنا/);assert.equal(vm.runInContext('pendingTextTasks[0].details',ctx),'بيانات يدوية');assert(local.has('spf-text-review-v2'));
 let calls=0;ctx.saveTasks=async options=>{calls++;assert.equal(options.consumeTextDraft,'draft-test');assert.equal(options.remainingTextRows.length,1);assert.equal(ctx.DATA.at(-1).tech,'بيانات يدوية');};await ctx.saveTextTasks();assert.equal(calls,1);assert.equal(ctx.DATA.length,count+1);assert.equal(vm.runInContext('pendingTextTasks.length',ctx),1);assert.equal(vm.runInContext('textReviewDrafts[0].entries.length',ctx),1);assert.match(node('task-text-feedback').textContent,/تم حفظ 1/);
 vm.runInContext('pendingTextTasks[0].selected=true',ctx);await ctx.saveTextTasks();assert.equal(calls,1);assert.match(node('task-text-feedback').textContent,/تعذر النشر/);
 node('task-text-lines').value='نص مختلف';await ctx.saveTextTasks();assert.equal(calls,1);assert.match(node('task-text-feedback').textContent,/تغير النص/);
 // Publishing an already saved row must still consume the shared draft.
 node('task-text-lines').value='نص الاختبار';
 ctx.rows=[{...ctx.rows[0]}];
 vm.runInContext("pendingTextTasks=rows;reviewSource='نص الاختبار';activeTextDraftId='draft-repeat';textReviewDrafts=[{id:'draft-repeat',entries:rows}];",ctx);
 let consumed=false;ctx.saveTasks=async options=>{consumed=options.consumeTextDraft==='draft-repeat';assert.equal(options.remainingTextRows.length,0)};
 await ctx.saveTextTasks();assert(consumed);assert.equal(ctx.DATA.length,count+1);assert.equal(vm.runInContext('textReviewDrafts.length',ctx),0);
 // Do not announce a deployed release before the matching manifest is served.
 ctx.location={href:'https://example.test/legacy/assets/work-tracker.html'};ctx.URL=URL;
 ctx.setTimeout=resolve=>{resolve();return 0};let polls=0;
 ctx.fetch=async()=>({ok:true,json:async()=>({revision:++polls===1?'old':'abcdef123456'})});
 node('publication').textContent='تم الحفظ. جار التحقق من النشر…';
 await ctx.monitorTaskPublication({commit:'abcdef1234567890',updatedAt:'2026-11-18T08:00:00Z'},node('publication'));
 assert.equal(polls,2);assert.match(node('publication').textContent,/اكتمل النشر/);
 ctx.fetch=async()=>{throw Error('offline')};
 await ctx.monitorTaskPublication({commit:'different',updatedAt:'2026-11-18T08:00:00Z'},node('publication'));
 assert.match(node('publication').textContent,/لم نتأكد/);
 console.log('Save integration passed: manual edits retained, failed-save rollback, no reparse on save, partial draft preservation, invalid rows blocked');
})().catch(error=>{console.error(error);process.exitCode=1});
