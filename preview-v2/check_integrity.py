#!/usr/bin/env python3
"""Static preservation checks; this is not a browser or publishing test.

Usage: python preview-v2/check_integrity.py --dist dist
Optional --remaps remaps.json accepts an explicit {original_url: preview_url}
mapping for preview-local document links; mappings are included in the result.
"""
from __future__ import annotations
import argparse
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
BASE_COMMIT = 'fcd2fe2f350c33af119c7909cd0c0dc6d73cfba4'
REPORT_MOTION_AUDITS = {}

def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()

def restore_report_motion(path: Path):
    """Invert only the asserted presentation anchors, with a byte-exact proof.

    The Node module parses but never executes the report's browser scripts.
    Audit JSON is checked against the actual artifact and a fresh transform,
    rather than trusting its boolean claims or excluding all inline JavaScript.
    """
    module = ROOT/'preview-v2/report-motion.js'
    audit_path = Path(str(path)+'.motion-audit.json')
    if not module.is_file() or not audit_path.is_file():
        raise ValueError('Report motion transform requires its source module and artifact audit JSON')
    verification = r'''
const fs=require('node:fs'), crypto=require('node:crypto');
const [modulePath,targetPath,auditPath]=process.argv.slice(1);
const {inverseReport,transformReport}=require(modulePath);
const enhanced=fs.readFileSync(targetPath,'utf8');
const audit=JSON.parse(fs.readFileSync(auditPath,'utf8'));
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
const restored=inverseReport(enhanced);
const loader=/<!--BUSOLA_REPORT_MOTION_START--><script src="([^"]+)"><\/script><!--BUSOLA_REPORT_MOTION_END-->/g;
const loaders=[...enhanced.matchAll(loader)];
if(loaders.length!==1)throw Error('Invalid report-motion loader');
const replay=transformReport(restored,loaders[0][1]);
for(const key of ['byte_exact_inverse','non_script_bytes_unchanged','embedded_assets_unchanged']){
  if(audit[key]!==true || replay.audit[key]!==true)throw Error('Report-motion invariant failed: '+key);
}
if(audit.source_sha256!==hash(restored) || audit.reversed_sha256!==hash(restored) || audit.enhanced_sha256!==hash(enhanced))throw Error('Report-motion artifact/source hash mismatch');
if(replay.html!==enhanced)throw Error('Report-motion replay is not byte-exact');
if(JSON.stringify(audit)!==JSON.stringify(replay.audit))throw Error('Report-motion anchor/script audit differs from fresh replay');
process.stdout.write(JSON.stringify({restored,audit:{source_sha256:audit.source_sha256,enhanced_sha256:audit.enhanced_sha256,reversed_sha256:audit.reversed_sha256,byte_exact_inverse:true,byte_exact_replay:true,non_script_bytes_unchanged:true,embedded_assets_unchanged:true,modified_script_ids:audit.modified_script_ids}}));
'''
    result = subprocess.run(['node','-e',verification,str(module),str(path),str(audit_path)], capture_output=True, text=True, cwd=ROOT)
    if result.returncode:
        # Node's error concerns hashes/anchors; never emit original script payloads.
        first = next((line.strip() for line in result.stderr.splitlines() if line.startswith('Error:')), 'Report motion verification failed')
        raise ValueError(first)
    data = json.loads(result.stdout)
    restored, audit = data['restored'], data['audit']
    # Exact inverse of prepare.py's known presentation decoration, not a broad
    # HTML normalizer. Any extra source/script/text change remains detectable.
    marker = ' class="vt-next" data-vt-page="dakhiliyah"'
    if restored.count(marker) != 1:
        raise ValueError('Report preview root marker mismatch')
    original = restored.replace(marker, '', 1)
    prelude = re.compile(
        r'(<head\b[^>]*>)\n<script src="/assets/review-isolation\.js"></script>\n'
        r'(?:<link rel="stylesheet" href="/assets/vt/[a-zA-Z0-9_.-]+\.css">\n)+'
        r'<script defer src="/assets/vt/experience\.js"></script>\n'
    )
    original, removed = prelude.subn(lambda m:m.group(1), original, count=1)
    if removed != 1:
        raise ValueError('Report preview head prelude mismatch')
    audit['restored_original_sha256'] = hashlib.sha256(original.encode()).hexdigest()
    REPORT_MOTION_AUDITS[str(path)] = audit
    return restored

def injected(tag, attrs):
    value = dict(attrs)
    ref = value.get('src', '') if tag == 'script' else value.get('href', '')
    path = urlsplit(ref).path
    return tag in {'script', 'link'} and (
        '/assets/vt/' in '/' + path.lstrip('/')
        or path.endswith('/review-isolation.js')
        or (tag == 'link' and path.endswith('/visual-pilot.css'))
        or (tag == 'script' and path.endswith('/visual-pilot.js'))
    )

class CanonicalHTML(HTMLParser):
    """Compare structure/text/script payloads, excluding approved preview assets."""
    def __init__(self, remaps=None):
        super().__init__(convert_charrefs=False)
        self.tokens = []
        self.skip_script = False
        self.remaps = remaps or {}
        self.stack = []

    def handle_starttag(self, tag, attrs):
        if injected(tag, attrs):
            if tag == 'script':
                self.skip_script = True
            return
        if self.skip_script:
            return
        clean = []
        for key, value in attrs:
            if tag == 'html' and key.startswith('data-vt-'):
                continue
            if tag == 'html' and key == 'class':
                value = ' '.join(x for x in (value or '').split() if x not in {'vt-next', 'vp-pilot'})
                if not value:
                    continue
            if key in {'src', 'href'} and value in self.remaps:
                value = self.remaps[value]
            clean.append((key, value))
        self.tokens.append(('start', tag, tuple(sorted(clean))))
        if tag not in {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if self.skip_script:
            if tag == 'script':
                self.skip_script = False
            return
        self.tokens.append(('end', tag))
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)

    def handle_data(self, data):
        if self.skip_script or not data.strip():
            return
        # Script/style/pre contents remain exact, including encrypted ciphertext.
        value = data if self.stack and self.stack[-1] in {'script','style','pre','textarea'} else re.sub(r'\s+', ' ', data).strip()
        self.tokens.append(('data', value))

    def handle_entityref(self, name):
        if not self.skip_script:
            self.tokens.append(('entity', name))

    def handle_charref(self, name):
        if not self.skip_script:
            self.tokens.append(('char', name))

    def handle_comment(self, data):
        # Build comments have no rendered or executable content.
        pass

def canonical(path, remaps=None):
    parser = CanonicalHTML(remaps)
    html = path.read_text()
    if '<!--BUSOLA_REPORT_MOTION_START-->' in html:
        html = restore_report_motion(path)
    parser.feed(html)
    return parser.tokens

def compare_html(source, target, remaps):
    if not target.is_file():
        return {'path': str(target.relative_to(ROOT)) if target.is_relative_to(ROOT) else str(target), 'status':'missing'}
    try:
        a, b = canonical(source, remaps), canonical(target)
    except ValueError as error:
        return {'path':str(target), 'status':'failed-presentation-transform', 'reason':str(error)}
    result = {'path': str(target), 'status':'pass' if a == b else 'changed', 'source_sha256':digest(source), 'target_sha256':digest(target), 'tokens_original':len(a), 'tokens_preview':len(b)}
    if str(target) in REPORT_MOTION_AUDITS:
        proof = REPORT_MOTION_AUDITS[str(target)]
        result['audited_presentation_transform'] = proof
        if proof['restored_original_sha256'] != digest(source):
            result['status'] = 'failed-original-byte-restoration'
    if a != b:
        first = next((i for i, pair in enumerate(zip(a, b)) if pair[0] != pair[1]), min(len(a), len(b)))
        # Report location/type only; avoid emitting protected payloads or user data.
        result['first_difference_token'] = first
        result['original_token_type'] = a[first][0] if first < len(a) else 'end'
        result['preview_token_type'] = b[first][0] if first < len(b) else 'end'
    return result

class References(HTMLParser):
    def __init__(self):
        super().__init__()
        self.items = []
        self.css = []
        self.in_style = False
    def handle_starttag(self, tag, attrs):
        d = dict(attrs)
        key = 'href' if tag in {'link','a','image','use'} else 'src' if tag in {'script','img','iframe','video','audio','source'} else None
        if key and d.get(key): self.items.append(d[key])
        if tag == 'video' and d.get('poster'): self.items.append(d['poster'])
        if d.get('style'): self.css.append(d['style'])
        if tag == 'style': self.in_style = True
        if tag == 'meta' and d.get('http-equiv', '').lower() == 'refresh':
            match = re.search(r'(?:^|;)\s*url\s*=\s*(.+)$', d.get('content', ''), re.I)
            if match: self.items.append(match.group(1).strip('"\''))
    def handle_endtag(self, tag):
        if tag == 'style': self.in_style = False
    def handle_data(self, value):
        if self.in_style: self.css.append(value)

def css_urls(value):
    # Quoted and unquoted URLs; data URIs, fragments and remote schemes are
    # discarded later, before they are ever emitted into the audit result.
    result = [next(item for item in match if item) for match in re.findall(
        r'url\(\s*(?:"([^"]*)"|\'([^\']*)\'|([^\)\s]*))\s*\)', value, re.I
    ) if any(match)]
    result += re.findall(r'@import\s+["\']([^"\']+)["\']', value, re.I)
    return result

def local_target(dist, owner, ref):
    parsed = urlsplit(ref.strip())
    if parsed.scheme or parsed.netloc or not parsed.path:
        return None
    path = unquote(parsed.path)
    return dist/path.lstrip('/') if path.startswith('/') else owner.parent/path

def local_exists(target):
    # Static Sites canonically serve /foo.html at /foo. Directory entrypoints
    # and original .html URLs are both accepted, without accepting arbitrary files.
    return target.is_file() or (target/'index.html').is_file() or (not target.suffix and target.with_suffix('.html').is_file())

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--dist', type=Path, default=ROOT/'dist')
    ap.add_argument('--baseline', type=Path, default=ROOT/'preview/baseline.html')
    ap.add_argument('--remaps', type=Path)
    args = ap.parse_args()
    dist = args.dist.resolve()
    remaps = json.loads(args.remaps.read_text()) if args.remaps else {}
    if not isinstance(remaps, dict) or not all(isinstance(k, str) and isinstance(v, str) for k, v in remaps.items()):
        raise SystemExit('--remaps must be a JSON object of explicit original-to-preview URLs')

    original_files = set(subprocess.check_output(['git','ls-tree','-r','--name-only',BASE_COMMIT], cwd=ROOT, text=True).splitlines())
    changed = set(subprocess.check_output(['git','diff','--name-only',BASE_COMMIT], cwd=ROOT, text=True).splitlines())
    changed_original = sorted(original_files & changed)
    html_results = [compare_html(args.baseline, dist/'index.html', remaps)]
    assets, missing, modified = [], [], []
    for source in sorted((ROOT/'overrides').rglob('*')):
        if not source.is_file():
            continue
        relative = source.relative_to(ROOT/'overrides')
        target = dist/relative
        if source.suffix.lower() in {'.html', '.htm'}:
            html_results.append(compare_html(source, target, remaps))
        elif not target.is_file():
            missing.append(str(relative))
        elif digest(source) != digest(target):
            modified.append(str(relative))
        else:
            assets.append(str(relative))
    # Integration script is kept outside overrides in the source repository.
    for relative, target_relative in [('communications/integrated.js','assets/communications.js')]:
        source, target = ROOT/relative, dist/target_relative
        if not target.is_file():
            missing.append(target_relative)
        elif digest(source) != digest(target):
            modified.append(target_relative)
        else:
            assets.append(target_relative)

    missing_refs, missing_css_refs = [], []
    html_ref_count, css_ref_count = 0, 0
    pages = sorted(dist.rglob('*.html'))
    css_owners = []
    for page in pages:
        parser = References(); parser.feed(page.read_text())
        for ref in parser.items:
            target = local_target(dist, page, ref)
            if target is None: continue
            html_ref_count += 1
            if not local_exists(target):
                missing_refs.append({'page':str(page.relative_to(dist)), 'reference':ref})
        css_owners.extend((page, css) for css in parser.css)
    css_files = sorted(dist.rglob('*.css'))
    css_owners.extend((path, path.read_text()) for path in css_files)
    for owner, css in css_owners:
        for ref in css_urls(css):
            target = local_target(dist, owner, ref)
            if target is None: continue
            css_ref_count += 1
            if not local_exists(target):
                item = {'source':str(owner.relative_to(dist)), 'reference':ref}
                if item not in missing_css_refs: missing_css_refs.append(item)
    # No adapter is permitted to invoke application persistence or modify authored values.
    experience = (ROOT/'preview-v2/experience.js').read_text()
    forbidden = {name: bool(re.search(pattern, experience)) for name, pattern in {
        'network_write':r'\b(?:fetch|XMLHttpRequest|sendBeacon)\s*\(',
        'storage_write':r'(?:localStorage|sessionStorage)\s*\.',
        'text_replacement':r'\.(?:innerHTML|outerHTML|textContent|innerText|nodeValue)\s*=',
        'input_value_replacement':r'\.value\s*=',
        'navigation_rewrite':r'(?:location\.(?:href|hash)\s*=|history\.(?:pushState|replaceState)\s*\()'
    }.items()}
    result = {
        'type':'static-integrity-check', 'baseline_commit':BASE_COMMIT,
        'original_repository_files_changed':changed_original,
        'unchanged_asset_count':len(assets), 'missing_assets':missing, 'modified_assets':modified,
        'html_preservation':html_results, 'explicit_preview_link_remaps':remaps,
        'missing_local_html_asset_references':missing_refs,
        'local_reference_coverage':{'html_files':len(pages), 'css_files':len(css_files), 'html_references':html_ref_count, 'css_references':css_ref_count},
        'missing_local_css_asset_references':missing_css_refs,
        'adapter_forbidden_operations':forbidden,
        'limitations':['Does not execute application behavior or prove browser layout/accessibility.',
                      'HTML comparison excludes preview assets/root markers and explicit link remaps; the report motion transform is inverted and its audit/replay/original byte hashes must match. All original scripts and encrypted payloads remain compared.',
                      'Remote references and dynamic JavaScript-generated URLs require separate checks.',
                      'Authenticated publication and live forum operations are not exercised.']
    }
    result['passed'] = not (changed_original or missing or modified or missing_refs or missing_css_refs or any(forbidden.values()) or any(item['status'] != 'pass' for item in html_results))
    print(json.dumps(result, ensure_ascii=False, indent=2))
    raise SystemExit(0 if result['passed'] else 1)

if __name__ == '__main__':
    main()
