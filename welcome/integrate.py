"""Add the welcome to the main dashboard before its existing encryption stage."""
import os
import re
import shutil
import sys
from html import escape
from pathlib import Path


ASSETS = ("welcome.js", "welcome.css", "human.webp", "human-small.webp", "spf-logo.webp", "plex.woff2", "bridge.js")
HEAD = """
<style>
#busola-welcome-host{position:fixed;inset:0;width:100%;height:100%;max-width:none;max-height:none;box-sizing:border-box;margin:0;padding:0;border:0;background:#172d27;color:#fff;overflow:auto;z-index:2147483646}
#busola-welcome-host:not([open]){display:none}
html[data-busola-intro] #busola-welcome-host{display:block}
html[data-busola-intro]{overflow:hidden}
html[data-busola-intro] body>:not(#busola-welcome-host):not(script):not(style):not(link){visibility:hidden!important}
#busola-welcome-host::backdrop{background:#172d27}
#busola-welcome-host .bw-fallback{min-height:100%;display:grid;align-content:center;justify-items:center;gap:1rem;padding:1.25rem;box-sizing:border-box;text-align:center;font-family:inherit}
.bw-fallback a{color:#ffe0a1;text-underline-offset:5px}
.topbar .bw-return{display:grid;align-items:center;justify-content:center;padding:0;margin:0;background:none;border:0;cursor:pointer;color:inherit;flex:none}
.bw-return:focus-visible{outline:3px solid #ffe0a1;outline-offset:3px}
html:fullscreen #bw-editor-entry,html.presentation-fullscreen #bw-editor-entry,html.bs-focus-active #bw-editor-entry{display:none!important}
</style>
<script>
(function(){
  if(window.top!==window.self || location.hash) return;
  try{if(JSON.parse(localStorage.getItem("busola.welcome.v1"))?.enabled===false) return;}catch{}
  document.documentElement.dataset.busolaIntro="";
})();
</script>
"""
HOST = """
<dialog id="busola-welcome-host" dir="rtl" aria-label="بوصلة المتعامل">
  <div class="bw-fallback"><strong>صندوق الحماية الاجتماعية</strong><span>المديرية العامة لخدمات المتعاملين</span><h1>بوصلة المتعامل</h1><p>الإنسان غايتنا، والتميز وجهتنا</p>
  <a href="#overview" onclick="document.documentElement.removeAttribute('data-busola-intro');this.closest('dialog').close()">بدء استعراض المنصة</a></div>
</dialog>
"""


def integrate(site, source, revision):
    dest = site / "welcome"
    dest.mkdir(exist_ok=True)
    for asset in ASSETS:
        shutil.copy2(source / asset, dest / asset)
    if (source / "plex-bold.woff2").is_file():
        shutil.copy2(source / "plex-bold.woff2", dest / "plex-bold.woff2")
    page = site / "index.html"
    text = page.read_text()
    if 'id="busola-welcome-host"' in text:
        return
    text, head_count = re.subn(r"(<head(?:\s[^>]*)?>)", lambda m: m[0] + HEAD, text, count=1, flags=re.I)
    text, body_count = re.subn(r"(<body(?:\s[^>]*)?>)", lambda m: m[0] + HOST, text, count=1, flags=re.I)
    hook = re.search(r'<script\b[^>]*\bsrc="[^"]*/ux-system\.js[^"]*"[^>]*>', text)
    if not head_count or not body_count or not hook:
        raise ValueError("Expected dashboard head, body and UX script")
    bridge = f'<script defer src="welcome/bridge.js?v={escape(revision, quote=True)}"></script>\n'
    page.write_text(text[:hook.start()] + bridge + text[hook.start():])


if __name__ == "__main__":
    integrate(Path(sys.argv[1]), Path(__file__).resolve().parent, os.environ.get("GITHUB_SHA", "preview")[:12])
