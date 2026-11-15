/* Presentation-only chrome. Reuses navigation and fullscreen handlers. */
(() => {
  'use strict';
  function boot() {
    const root = document.documentElement;
    const leadership = !!document.querySelector('#platform');
    const bar = document.querySelector('.topbar');
    if ((!bar && !leadership) || document.getElementById('bs-focus-toggle')) return;
    const logo = bar?.querySelector('img.top-logo');
    if (logo) {
      const mark = document.createElement('span');
      mark.className = 'top-logo bs-gold-logo';
      mark.setAttribute('role', 'img');
      mark.setAttribute('aria-label', logo.alt);
      mark.style.setProperty('--bs-logo-url', `url("${logo.src}")`);
      logo.replaceWith(mark);
    }
    const toggle = document.createElement('button');
    toggle.id = 'bs-focus-toggle'; toggle.type = 'button';
    toggle.textContent = '☰ أدوات العرض'; toggle.hidden = true;
    toggle.setAttribute('aria-controls', 'bs-focus-panel');
    toggle.setAttribute('aria-expanded', 'false');
    const panel = document.createElement('div');
    panel.id = 'bs-focus-panel'; panel.hidden = true;
    panel.setAttribute('role', 'region'); panel.setAttribute('aria-label', 'أدوات العرض');
    const select = document.createElement('select');
    select.setAttribute('aria-label', 'الانتقال إلى قسم');
    const source = leadership ? document.querySelector('#contents') : document.querySelector('.top-navigation');
    function refresh() {
      const items = leadership ? [...source.options] : [...source.querySelectorAll('a[href^="#"]')];
      select.replaceChildren(...items.map(item => {
        const option = document.createElement('option');
        option.value = leadership ? item.value : item.getAttribute('href');
        option.textContent = item.textContent.trim();
        return option;
      }));
      select.value = leadership ? source.value : (source.querySelector('a.active')?.getAttribute('href') || location.hash);
    }
    if (!source) return;
    function button(text, action) {
      const b = document.createElement('button'); b.type = 'button'; b.textContent = text;
      b.addEventListener('click', action); panel.append(b); return b;
    }
    button('→ السابق', () => { document.querySelector(leadership ? '#prev' : '#previousChapter')?.click(); refresh(); schedule(); });
    panel.append(select);
    button('التالي ←', () => { document.querySelector(leadership ? '#next' : '#nextChapter')?.click(); refresh(); schedule(); });
    select.addEventListener('change', () => {
      if (leadership) { source.value = select.value; source.dispatchEvent(new Event('change', {bubbles:true})); }
      else [...source.querySelectorAll('a')].find(a => a.getAttribute('href') === select.value)?.click();
      close(); toggle.focus();
    });
    let pinned = false, timer, active = false;
    const pin = button('تثبيت الأدوات', () => { pinned = !pinned; pin.setAttribute('aria-pressed', String(pinned)); pin.textContent = pinned ? 'إلغاء التثبيت' : 'تثبيت الأدوات'; schedule(); });
    pin.setAttribute('aria-pressed', 'false');
    button('إنهاء الشاشة الكاملة', () => document.querySelector(leadership ? '#full' : '#fullscreenViewButton')?.click());
    button('إخفاء', () => { close(); toggle.focus(); });
    function close() { clearTimeout(timer); panel.hidden = true; toggle.setAttribute('aria-expanded', 'false'); }
    function schedule() {
      clearTimeout(timer);
      if (!pinned) timer = setTimeout(() => {
        if (panel.contains(document.activeElement) || panel.matches(':hover')) { schedule(); return; }
        close();
      }, 3000);
    }
    function open() { refresh(); panel.hidden = false; toggle.setAttribute('aria-expanded', 'true'); schedule(); }
    toggle.addEventListener('click', () => panel.hidden ? open() : close());
    panel.addEventListener('pointerenter', () => clearTimeout(timer));
    panel.addEventListener('pointerleave', schedule);
    panel.addEventListener('focusout', schedule);
    function sync() {
      const next = !!(document.fullscreenElement || document.webkitFullscreenElement || root.classList.contains('presentation-fullscreen'));
      if (next === active) return;
      active = next; root.classList.toggle('bs-focus-active', active);
      toggle.hidden = !active;
      if (active) open(); else close();
    }
    document.body.append(toggle, panel);
    new MutationObserver(sync).observe(root, {attributes:true, attributeFilter:['class']});
    document.addEventListener('fullscreenchange', sync);
    document.addEventListener('webkitfullscreenchange', sync);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
    window.addEventListener('hashchange', () => { if (!panel.hidden) refresh(); });
    sync();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(boot, 50));
  else setTimeout(boot, 50);
})();
