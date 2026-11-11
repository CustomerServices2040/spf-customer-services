from pathlib import Path
from html.parser import HTMLParser
import json,re,openpyxl,subprocess
R=Path(__file__).resolve().parents[1]
html=(R/'overrides/reports/community-communication-plan-2026.html').read_text()
data=json.loads(re.search(r'<script id="plan-source" type="application/json">(.*?)</script>',html,re.S).group(1))
s=openpyxl.load_workbook(R/'overrides/reports/community-communication-plan-2026.xlsx',data_only=True).active
expected=[{'row':row[0].row,'values':[c.value if c.value is None or isinstance(c.value,(str,float,int)) else str(c.value) for c in row[1:14]]} for row in s.iter_rows(min_row=6) if row[2].value is not None]
assert data['rows']==expected
assert len(expected)==83
assert [sum(r['values'][i] is not None for r in expected) for i in range(6,10)]==[25,17,16,22]
assert sum(r['values'][5] or 0 for r in expected)==79
assert sum(not any(x is not None for x in r['values'][6:10]) for r in expected)==3
assert all(c.value is None for row in s for c in list(row)[:1]+list(row)[14:])
for f in (R/'appearance-studio').glob('*.js'):subprocess.run(['node','--check',str(f)],check=True)
subprocess.run(['node','--check',str(R/'communications/integrated.js')],check=True)
# Operational assets and protection remain byte-identical to the branch base.
for file in ['overrides/assets/app.js','overrides/assets/data.js','overrides/assets/dashboard-edits.json','scripts/encrypt_two_layer.mjs']:
 p=R/file
 if p.exists():assert p.read_bytes()==subprocess.check_output(['git','show','HEAD:'+file],cwd=R),file
print('PASS: all 83 workbook rows and 13 fields exact; quarters 25/17/16/22; planned quantity 79; 3 unassigned. JS syntax and operational/protection integrity pass.')
