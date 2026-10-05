import { createCipheriv, pbkdf2Sync, randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const siteRoot = resolve(process.argv[2] || "_site");
const platformPassword = process.env.PLATFORM_PASSWORD || "";
const privateTabsPassword = process.env.PRIVATE_TABS_PASSWORD || "";
const iterations = 310_000;
const protectedTabs = ["operational-plan", "work-tracker", "committees"];

if (platformPassword.length < 12 || privateTabsPassword.length < 12) {
  throw new Error("Both deployment passwords must contain at least 12 characters.");
}
if (platformPassword === privateTabsPassword) {
  throw new Error("The platform and private-tabs passwords must be different.");
}

const b64url = value => Buffer.from(value).toString("base64url");
const deriveKey = (password, salt) => pbkdf2Sync(password, salt, iterations, 32, "sha256");

function encrypt(text, key, aad) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  cipher.setAAD(Buffer.from(aad, "utf8"));
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final(), cipher.getAuthTag()]);
  return { iv: b64url(iv), data: b64url(encrypted), aad };
}

function sectionRange(html, id) {
  const opener = new RegExp(`<section\\b[^>]*\\bid=["']${id}["'][^>]*>`, "i").exec(html);
  if (!opener) throw new Error(`Protected section not found: ${id}`);
  const token = /<\/?section\b[^>]*>/gi;
  token.lastIndex = opener.index;
  let depth = 0;
  let match;
  while ((match = token.exec(html))) {
    depth += /^<section\b/i.test(match[0]) ? 1 : -1;
    if (depth === 0) return { start: opener.index, end: token.lastIndex };
  }
  throw new Error(`Unclosed protected section: ${id}`);
}

function privateTabsBootstrap(config) {
  const json = JSON.stringify(config).replace(/</g, "\\u003c");
  return `<script data-spf-secure-tabs>(function(){
    if(window.__SPF_TABS_UNLOCKED__)return;
    const config=${json};
    const encoder=new TextEncoder();
    const from64=value=>{const normalized=value.replace(/-/g,"+").replace(/_/g,"/");const binary=atob(normalized);return Uint8Array.from(binary,char=>char.charCodeAt(0))};
    async function keyFor(password){const material=await crypto.subtle.importKey("raw",encoder.encode(password),"PBKDF2",false,["deriveKey"]);return crypto.subtle.deriveKey({name:"PBKDF2",salt:from64(config.salt),iterations:config.iterations,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["decrypt"])}
    async function decrypt(item,key){const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:from64(item.iv),additionalData:encoder.encode(item.aad),tagLength:128},key,from64(item.data));return new TextDecoder().decode(plain)}
    function modal(){let box=document.getElementById("spfPrivateTabsGate");if(box)return box;box=document.createElement("div");box.id="spfPrivateTabsGate";box.className="spf-secure-modal";box.setAttribute("aria-hidden","true");box.innerHTML='<div class="spf-secure-dialog" role="dialog" aria-modal="true" aria-labelledby="spfTabsTitle"><button type="button" class="spf-secure-close" aria-label="إغلاق">×</button><span class="spf-secure-mark">المحتوى الداخلي</span><h2 id="spfTabsTitle">تبويب محمي</h2><p>أدخل كلمة المرور الثانية للاطلاع على الخطة التشغيلية ومتابعة الأعمال واللجان والفرق.</p><form><label for="spfTabsPassword">كلمة مرور التبويبات</label><input id="spfTabsPassword" type="password" autocomplete="current-password" required><button type="submit">فتح التبويبات المحمية</button><small role="status"></small></form></div>';document.body.appendChild(box);box.querySelector(".spf-secure-close").onclick=()=>close();box.addEventListener("click",event=>{if(event.target===box)close()});box.querySelector("form").addEventListener("submit",submit);return box}
    function open(id){window.__SPF_PENDING_SECURE_TAB__=id;const box=modal();box.classList.add("open");box.setAttribute("aria-hidden","false");setTimeout(()=>box.querySelector("input").focus(),30)}
    function close(){const box=document.getElementById("spfPrivateTabsGate");if(box){box.classList.remove("open");box.setAttribute("aria-hidden","true")}}
    async function submit(event){event.preventDefault();const form=event.currentTarget,input=form.querySelector("input"),status=form.querySelector("small"),button=form.querySelector("button[type=submit]");button.disabled=true;status.textContent="جارٍ التحقق…";try{const key=await keyFor(input.value);const parser=new DOMParser();const source=window.__SPF_SECURE_SOURCE__;if(!source)throw new Error("missing-source");const parsed=parser.parseFromString(source,"text/html");for(const item of config.items){const plaintext=await decrypt(item,key);const holder=parsed.getElementById(item.id);if(!holder)throw new Error("missing-section");const template=parsed.createElement("template");template.innerHTML=plaintext.trim();holder.replaceWith(template.content.firstElementChild)}window.__SPF_TABS_UNLOCKED__=true;const target=window.__SPF_PENDING_SECURE_TAB__||config.items[0].id;const unlocked='<!doctype html>\\n'+parsed.documentElement.outerHTML;window.__SPF_SECURE_SOURCE__=unlocked;document.open();document.write(unlocked);document.close();setTimeout(()=>{location.hash=target},80)}catch(_){status.textContent="كلمة المرور الثانية غير صحيحة";input.select();button.disabled=false}}
    document.addEventListener("click",event=>{const link=event.target.closest('a[href^="#"]');if(!link)return;const id=link.getAttribute("href").slice(1);if(config.items.some(item=>item.id===id)){event.preventDefault();open(id)}});
    document.addEventListener("DOMContentLoaded",()=>{const id=location.hash.slice(1);if(config.items.some(item=>item.id===id))open(id)});
  })();</script>`;
}

function secureTabs(html) {
  const salt = randomBytes(16);
  const key = deriveKey(privateTabsPassword, salt);
  const items = [];
  for (const id of [...protectedTabs].reverse()) {
    const { start, end } = sectionRange(html, id);
    const plaintext = html.slice(start, end);
    const payload = encrypt(plaintext, key, `spf:private-tab:${id}:v1`);
    items.unshift({ id, ...payload });
    const replacement = `<section class="section-block spf-encrypted-tab" id="${id}" data-secure-tab="true"><div class="spf-encrypted-tab-card"><span>محتوى داخلي</span><h2>هذا التبويب محمي</h2><p>يلزم إدخال كلمة المرور الثانية للاطلاع على محتواه.</p><button type="button" data-open-secure-tab="${id}">فتح التبويب</button></div></section>`;
    html = html.slice(0, start) + replacement + html.slice(end);
  }
  html = html.replace(/<script\b[^>]*src=["'][^"']*privacy-lock\.js[^"']*["'][^>]*><\/script>/gi, "");
  html = html.replace("</head>", `<style>#privacyLockButton,#privacyLockModal{display:none!important}.spf-encrypted-tab{display:grid;min-height:360px;place-items:center}.spf-encrypted-tab-card{max-width:520px;padding:34px;text-align:center;border:1px solid rgba(58,86,76,.14);border-radius:22px;background:linear-gradient(145deg,#fff,#eef3ef);box-shadow:0 16px 36px rgba(35,75,61,.09)}.spf-encrypted-tab-card span,.spf-secure-mark{color:#a77d3d;font-size:11px;font-weight:900}.spf-encrypted-tab-card h2{margin:6px 0;color:#315f4d}.spf-encrypted-tab-card p{color:#65776f;font-size:13px}.spf-encrypted-tab-card button{padding:11px 18px;border:0;border-radius:12px;background:#315f4d;color:#fff;font:inherit;font-weight:800}.spf-secure-modal{position:fixed;z-index:10000;inset:0;display:none;place-items:center;padding:20px;background:rgba(22,43,35,.72);backdrop-filter:blur(9px)}.spf-secure-modal.open{display:grid}.spf-secure-dialog{position:relative;width:min(470px,100%);padding:34px;border-radius:24px;background:#fff;box-shadow:0 28px 80px rgba(0,0,0,.28)}.spf-secure-dialog h2{margin:5px 0;color:#315f4d}.spf-secure-dialog p{color:#64756d;font-size:13px;line-height:1.8}.spf-secure-dialog label{display:block;margin:17px 0 6px;color:#315f4d;font-size:12px;font-weight:800}.spf-secure-dialog input{width:100%;padding:13px;border:1px solid #cfd9d3;border-radius:11px;font:inherit}.spf-secure-dialog form>button{width:100%;margin-top:12px;padding:13px;border:0;border-radius:11px;background:#315f4d;color:#fff;font:inherit;font-weight:900}.spf-secure-dialog small{display:block;min-height:22px;margin-top:8px;color:#993d57}.spf-secure-close{position:absolute;top:14px;left:14px;border:0;background:#edf1ee;color:#315f4d;width:34px;height:34px;border-radius:50%;font-size:22px;cursor:pointer}</style></head>`);
  html = html.replace("</body>", `${privateTabsBootstrap({ salt: b64url(salt), iterations, items })}</body>`);
  html = html.replace(/data-open-secure-tab=["']([^"']+)["']/g, 'onclick="window.__SPF_PENDING_SECURE_TAB__=\'$1\';document.querySelector(\'a[href=\\\"#$1\\\"]\').click()"');
  return html;
}

function loaderPage(plaintext, label) {
  const salt = randomBytes(16);
  const key = deriveKey(platformPassword, salt);
  const payload = encrypt(plaintext, key, `spf:platform:${label}:v1`);
  const config = JSON.stringify({ salt: b64url(salt), iterations, ...payload }).replace(/</g, "\\u003c");
  const logoPath = label === "legacy" ? "assets/spf-logo.png" : "legacy/assets/spf-logo.png";
  return `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#315f4d"><title>بوصلة المتعامل · دخول آمن</title><style>*{box-sizing:border-box}body{margin:0;min-height:100vh;display:grid;place-items:center;padding:22px;background:radial-gradient(circle at 15% 20%,rgba(204,168,98,.2),transparent 28%),linear-gradient(145deg,#244b3e,#3a6656);font-family:Tahoma,"Segoe UI",Arial,sans-serif;color:#274b3f}.gate{width:min(480px,100%);padding:38px;border-radius:28px;background:#fff;box-shadow:0 30px 90px rgba(7,30,21,.35)}.brand{display:flex;align-items:center;gap:14px;padding-bottom:22px;border-bottom:1px solid #e5ebe7}.logo{display:block;width:64px;height:64px;padding:5px;border:1px solid #e1e8e3;border-radius:17px;background:#fff;object-fit:contain;box-shadow:0 6px 16px rgba(35,75,61,.1)}.brand b{display:block;font-size:18px}.brand span,.gate p{color:#687a72;font-size:12px}.secure{display:inline-flex;margin-top:23px;padding:5px 9px;border-radius:999px;background:#f4ead5;color:#805d29;font-size:10px;font-weight:900}.gate h1{margin:8px 0 6px;font-size:25px}.gate p{margin:0 0 19px;line-height:1.8}.gate label{display:block;margin-bottom:7px;font-size:12px;font-weight:900}.gate input{width:100%;padding:14px;border:1px solid #ccd8d1;border-radius:12px;font:inherit;outline:none}.gate input:focus{border-color:#315f4d;box-shadow:0 0 0 3px rgba(49,95,77,.12)}.gate button{width:100%;margin-top:12px;padding:14px;border:0;border-radius:12px;background:#315f4d;color:#fff;font:inherit;font-weight:900;cursor:pointer}.gate button:disabled{opacity:.6}.status{display:block;min-height:24px;margin-top:9px;color:#9b3857;font-size:11px}.note{margin-top:15px!important;padding-top:14px;border-top:1px solid #e7ece9;font-size:10px!important}</style></head><body><main class="gate"><div class="brand"><img class="logo" src="${logoPath}" alt="شعار صندوق الحماية الاجتماعية"><div><b>بوصلة المتعامل</b><span>صندوق الحماية الاجتماعية · سلطنة عُمان</span></div></div><span class="secure">دخول محمي ومشفّر</span><h1>مرحباً بك</h1><p>أدخل كلمة مرور المنصة للوصول إلى المحتوى. لا تُحفظ كلمة المرور على الجهاز.</p><form><label for="platformPassword">كلمة مرور المنصة</label><input id="platformPassword" type="password" autocomplete="current-password" required autofocus><button type="submit">الدخول إلى المنصة</button><small class="status" role="status"></small></form><p class="note">التبويبات الداخلية المحددة تتطلب كلمة مرور ثانية مستقلة.</p></main><script>(function(){const config=${config},encoder=new TextEncoder(),form=document.querySelector("form"),input=document.querySelector("input"),button=document.querySelector("button"),status=document.querySelector(".status");const from64=value=>{const normalized=value.replace(/-/g,"+").replace(/_/g,"/");const binary=atob(normalized);return Uint8Array.from(binary,char=>char.charCodeAt(0))};form.addEventListener("submit",async event=>{event.preventDefault();button.disabled=true;status.textContent="جارٍ التحقق…";try{const material=await crypto.subtle.importKey("raw",encoder.encode(input.value),"PBKDF2",false,["deriveKey"]);const key=await crypto.subtle.deriveKey({name:"PBKDF2",salt:from64(config.salt),iterations:config.iterations,hash:"SHA-256"},material,{name:"AES-GCM",length:256},false,["decrypt"]);const plain=await crypto.subtle.decrypt({name:"AES-GCM",iv:from64(config.iv),additionalData:encoder.encode(config.aad),tagLength:128},key,from64(config.data));const html=new TextDecoder().decode(plain);window.__SPF_SECURE_SOURCE__=html;document.open();document.write(html);document.close()}catch(_){status.textContent="كلمة مرور المنصة غير صحيحة";input.select();button.disabled=false}})})();</script></body></html>`;
}

const legacyPath = resolve(siteRoot, "legacy/index.html");
const rootPath = resolve(siteRoot, "index.html");
const legacyPlain = secureTabs(readFileSync(legacyPath, "utf8"));
const rootPlain = readFileSync(rootPath, "utf8");
writeFileSync(legacyPath, loaderPage(legacyPlain, "legacy"));
writeFileSync(rootPath, loaderPage(rootPlain, "root"));

for (const [path, forbidden] of [[legacyPath, "صوت المتعامل في مسار قابل للقياس"], [rootPath, "المنصة التنفيذية"]]) {
  if (readFileSync(path, "utf8").includes(forbidden)) throw new Error(`Plaintext remained in ${path}`);
}
console.log(`Encrypted ${rootPath} and ${legacyPath}; protected tabs: ${protectedTabs.join(", ")}`);
