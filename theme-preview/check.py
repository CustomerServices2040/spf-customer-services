from pathlib import Path
import re,json,hashlib,subprocess,gzip
R=Path(__file__).resolve().parents[1];D=R/'dist';P=R/'theme-preview'
paths=['index.html','forum/index.html','forum/join.html','forum/facilitator.html','assets/work-tracker.html','reports/dakhiliyah-june-2026.html']
results=[]
for path in paths:
 src=(P/'baseline.html' if path=='index.html' else R/'overrides'/path).read_text()
 out=(D/path).read_text()
 out=re.sub(r' data-bt-page="[^"]+"','',out,count=1)
 out=re.sub(r'<script src="/assets/(?:isolation|themes)\.js"></script>','',out)
 out=re.sub(r'<link rel="stylesheet" href="/assets/(?:themes|compiled-[^"]+)\.css">','',out)
 assert out==src,path
 results.append({'path':path,'content_script_structure_exact':True,'source_sha256':hashlib.sha256(src.encode()).hexdigest()})
changed=subprocess.check_output(['git','diff','--name-only','fcd2fe2f350c33af119c7909cd0c0dc6d73cfba4'],cwd=R,text=True).splitlines()
original=set(subprocess.check_output(['git','ls-tree','-r','--name-only','fcd2fe2f350c33af119c7909cd0c0dc6d73cfba4'],cwd=R,text=True).splitlines())
changed=[p for p in changed if p in original]
assert not changed,changed
out={'baseline':'fcd2fe2f350c33af119c7909cd0c0dc6d73cfba4','original_files_changed':changed,'entrypoints':results,'assets':[{'file':p.name,'bytes':p.stat().st_size,'gzip_bytes':len(gzip.compress(p.read_bytes()))}for p in P.glob('*') if p.suffix in ['.css','.js']],'limits':['Static preservation is not a complete end-to-end functional or WCAG audit.']}
(R/'docs/multi-theme/integrity.json').write_text(json.dumps(out,indent=2));print('PASS: original files unchanged, six original HTML/JS payloads byte-equivalent after removing theme hooks')
