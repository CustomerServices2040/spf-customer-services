/* Loaded only in the main dashboard. All existing access checks remain with its router. */
(() => {
  'use strict';
  if (window.top !== window.self) return;
  const assetBase = new URL(document.currentScript.src);
  const doc = document.documentElement;
  const forum = document.documentElement.hasAttribute('data-forum-appearance');
  const key = forum ? 'busola.forum.welcome.v1' : 'busola.welcome.v1';
  const host = document.getElementById('busola-welcome-host');
  const fallback = host.firstElementChild.cloneNode(true);
  const eligible = doc.hasAttribute('data-busola-intro');
  let loading, instance, generation = 0, editing = false;

  function settings() {
    try { return JSON.parse(localStorage.getItem(key)) || {}; }
    catch { return {}; }
  }

  function presentation() {
    return !!document.fullscreenElement || doc.matches('.presentation-fullscreen,.bs-focus-active') || document.body.classList.contains('presenting');
  }

  function loadAsset(tag, name) {
    const url = new URL(name, assetBase);
    url.search = assetBase.search;
    return new Promise((resolve, reject) => {
      const node = document.createElement(tag);
      node.onload = () => resolve(node);
      node.onerror = () => { node.remove(); reject(new Error(name)); };
      if (tag === 'link') { node.rel = 'stylesheet'; node.href = url.href; }
      else node.src = url.href;
      document.head.append(node);
    });
  }

  function assets() {
    if (!loading) loading = Promise.all([
      loadAsset('link', 'welcome.css'), loadAsset('script', 'welcome.js')
    ]).catch(error => { loading = null; throw error; });
    return loading;
  }

  function close() {
    generation++;
    instance?.destroy();
    instance = null;
    editing = false;
    host.close();
    delete doc.dataset.busolaIntro;
  }

  function enter() {
    close();
    const link = document.querySelector(forum ? '.main-nav [data-page="arrival-reception"]' : '.top-navigation a[href="#overview"]');
    if (link) link.click();
    else location.hash = forum ? 'arrival-reception' : 'overview';
    requestAnimationFrame(() => {
      const heading = document.querySelector(forum ? '#arrival-title' : '#overview h2, #overview');
      if (heading) { heading.setAttribute('tabindex','-1'); heading.focus({preventScroll:true}); }
    });
  }

  async function show(admin = false) {
    if (host.open || (admin && presentation())) return;
    if (!admin && settings().enabled === false) return;
    const ticket = ++generation;
    editing = admin;
    doc.dataset.busolaIntro = '';
    host.replaceChildren(fallback.cloneNode(true));
    host.showModal();
    try {
      const [stylesheet] = await assets();
      if (ticket !== generation || !host.open) return;
      // A shadow root keeps the platform-wide card classifier and typography
      // overrides away from the welcome's compass, while retaining its theme.
      const shell = document.createElement('div');
      const surface = shell.attachShadow({mode:'open'});
      const styles = stylesheet.cloneNode();
      const styled = new Promise((resolve, reject) => {
        styles.onload = resolve;
        styles.onerror = reject;
      });
      surface.append(styles);
      host.append(shell);
      await styled;
      if (ticket !== generation || !host.open) return;
      host.querySelector('.bw-fallback')?.remove();
      instance = window.BusolaWelcome.mount(surface, {
        theme: window.BusolaAppearance?.get()?.theme || doc.dataset.busolaTheme || 'original',
        context: forum ? 'forum' : 'main', settings: settings(), admin, onEnter: enter,
        onSave: value => {
          if (!admin || presentation()) throw new Error('أدوات التحرير غير متاحة في وضع العرض.');
          localStorage.setItem(key, JSON.stringify(value));
          refreshEntry();
        }
      });
      if (admin) instance.edit();
      else (surface.querySelector('[autofocus]') || surface.querySelector('button,a'))?.focus({preventScroll:true});
    } catch {
      if (ticket === generation) {
        host.replaceChildren(fallback.cloneNode(true));
        host.querySelector('a').focus();
      }
    }
  }

  host.addEventListener('click', e => {
    if (e.target.closest('.bw-fallback a')) { e.preventDefault(); enter(); }
  });
  // The dashboard also uses arrow keys for chapter navigation.
  host.addEventListener('keydown', event => event.stopPropagation());
  host.addEventListener('cancel', e => { e.preventDefault(); if (editing) close(); });
  // Ignore the dashboard's initial default-section update. Browser traversal still
  // takes precedence over a visible welcome when returning to a bookmarked tab.
  window.navigation?.addEventListener('navigate', event => {
    if (event.navigationType === 'traverse' && event.destination.sameDocument &&
        host.open && new URL(event.destination.url).hash) close();
  });

  function refreshEntry() {
    const disabled = settings().enabled === false;
    const logo = document.querySelector('.topbar .top-logo');
    if (logo && !logo.closest('.bw-return')) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'bw-return';
      button.setAttribute('aria-label', 'العودة إلى ترحيب بوصلة المتعامل');
      button.addEventListener('click', () => show());
      logo.before(button); button.append(logo);
    }
    const button = document.querySelector('.bw-return');
    if (button) button.disabled = disabled;
    const panels = forum ? ['#busola-visual-editor', '#editor-toolbar'] : ['#busola-visual-editor'];
    for (const selector of panels) {
      const panel = document.querySelector(selector);
      if (!panel || panel.querySelector('[data-welcome-editor]')) continue;
      const edit = document.createElement('button');
      edit.id = selector === '#editor-toolbar' ? 'bw-forum-editor-entry' : 'bw-editor-entry';
      edit.dataset.welcomeEditor = '';
      edit.type = 'button'; edit.textContent = 'تحرير الصفحة الترحيبية';
      edit.addEventListener('click', () => {
        if (presentation() || panel.hidden) return;
        panel.querySelector('#bv-close')?.click();
        show(true);
      });
      panel.append(edit);
    }
  }

  function boot() {
    refreshEntry();
    // Both the logo and editor are mounted asynchronously by their existing modules.
    const observer = new MutationObserver(() => {
      refreshEntry();
      if (document.querySelector('#bw-editor-entry') && (forum || document.querySelector('.bw-return .bs-gold-logo'))) observer.disconnect();
    });
    observer.observe(document.body, {childList:true, subtree:true});
    if (eligible && doc.hasAttribute('data-busola-intro')) show();
  }
  function checkPresentation() { if (editing && presentation()) close(); }
  document.addEventListener('fullscreenchange', checkPresentation);
  new MutationObserver(checkPresentation).observe(doc, {attributes:true, attributeFilter:['class']});
  window.addEventListener('storage', e => { if (e.key === key || e.key === null) refreshEntry(); });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, {once:true});
  else boot();
})();
