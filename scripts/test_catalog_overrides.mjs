import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { execFileSync } from 'node:child_process';

const source = readFileSync('overrides/assets/app.js', 'utf8');
const oldEdits = {
  '#service-achievements>div:1>div:2>div:1>strong:1':'15',
  '#service-achievements>div:3>article:8>div:1>div:2>h3:1':'ظفار',
  '#recognitions>div:1>div:2>div:1>span:1':'إجمالي الإنجازات والشهادات',
};
const updated = JSON.parse(readFileSync('overrides/assets/dashboard-edits.json', 'utf8')).edits;
const elements = [
  {key:'#service-achievements>div:1>div:2>div:1>strong:1', text:'17'},
  {key:'#service-achievements>div:3>article:8>div:1>div:2>h3:1', text:'مسقط'},
  {key:'#recognitions>div:1>div:2>div:1>span:1', text:'إجمالي الشهادات والدروع والتكريمات'},
].map(({key,text})=>({dataset:{editKey:key},textContent:text,closest:()=>true}));
const sandbox = {Object, document:{dispatchEvent(){}}, Event:class {}, defaultValues:new Map(), $$:()=>elements};
vm.createContext(sandbox);
// Run the production functions against actual stale saved data.
vm.runInContext(source.slice(source.indexOf('  function sanitizeGlobalEdits'),source.indexOf('  async function loadGlobalEdits')), sandbox);
vm.runInContext(source.slice(source.indexOf('  function applyValues'),source.indexOf('  function setEditing')), sandbox);
assert.equal(oldEdits[elements[0].dataset.editKey], '15', 'fixture reproduces reported old total');
assert.equal(oldEdits[elements[2].dataset.editKey], 'إجمالي الإنجازات والشهادات');
const cleaned = sandbox.sanitizeGlobalEdits(oldEdits);
assert(!Object.keys(cleaned).some(k=>/^#(?:recognitions|service-achievements)(?:>|$)/.test(k)));
sandbox.applyValues(oldEdits);
assert.deepEqual(elements.map(e=>e.textContent), ['17','مسقط','إجمالي الشهادات والدروع والتكريمات']);
for (const [key,value] of Object.entries(oldEdits)) {
  if (!/^#(?:recognitions|service-achievements)(?:>|$)/.test(key)) assert.deepEqual(updated[key], value);
}
assert.equal(execFileSync('git',['diff','--','overrides/assets/recognitions.json'],{encoding:'utf8'}),'');
console.log('PASS: stale total, Muscat card, certificate label, unrelated edits and source records.');

// Introductory sections must not detach approved headline values from their cards.
const migrated = sandbox.sanitizeGlobalEdits({
  'div:1>main:1>div:2>section:2>article:1>strong:1': '681,015',
  'div:1>main:1>div:2>section:2>article:2>strong:1': '3,439',
  'div:1>main:1>div:2>section:3>div:3>article:1>strong:1': '1,243,351.62',
  '#community-line>div:2>article:1>strong:1': '316'
});
assert.equal(migrated['#heroMetrics>article:1>strong:1'], '681,015');
assert.equal(migrated['#heroMetrics>article:2>strong:1'], '3,439');
assert.equal(migrated['#operationalBudget>div:3>article:1>strong:1'], '1,243,351.62');
assert.equal(migrated['#community-line>div:2>article:1>strong:1'], '316');
console.log('PASS: headline and budget edits survive introductory layout changes.');
