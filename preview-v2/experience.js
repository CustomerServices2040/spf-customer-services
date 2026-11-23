/* Presentation adapter only: preserves authored text, values, navigation,
   data sources, storage, permissions and the existing motion engine. */
(() => {
  'use strict';
  const root = document.documentElement;
  root.classList.add('vt-next');
  const source = document.currentScript?.src;
  const sectionStyles = source ? new URL('sections.css', source).href : '/assets/vt/sections.css';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const observed = new WeakSet();
  const chartSelector = '.semester-visual[aria-label],.primary-kpi-trend[aria-label],.score-ring[aria-label],.component-ring[aria-label],.target-ring[aria-label]';
  const headingSelector = '.section-heading,.section-header,.section-head,.gov-header,.inspector-title';
  const mapSelector = '[data-governorate],.map-pin[data-gov]';
  const editable = node => node.closest('[contenteditable="true"],.editing,.forum-editing');
  const reveal = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.setAttribute('data-vt-visible', '');
      reveal.unobserve(entry.target);
    });
  }, {threshold: 0.12}) : null;

  function syncMotion() {
    root.dataset.vtReducedMotion = String(reduced.matches);
    if (reduced.matches) document.querySelectorAll('[data-vt-reveal]').forEach(node => {
      node.setAttribute('data-vt-visible', '');
      reveal?.unobserve(node);
    });
  }
  function syncChapter() {
    const link = document.querySelector('.top-navigation a[aria-current="page"]');
    const current = link?.getAttribute('href')?.slice(1)
      || document.querySelector('main > .page.active,.comm-main > .page.active')?.id
      || root.dataset.vtPage || '';
    if (root.dataset.vtChapter !== current) root.dataset.vtChapter = current;
  }
  function syncMap(node) {
    const selected = node.getAttribute('aria-pressed') === 'true' || node.classList.contains('active');
    node.dataset.vtMapSelected = String(selected);
  }
  const mapState = new MutationObserver(records => records.forEach(record => syncMap(record.target)));
  function enhanceCharts(scope) {
    scope.querySelectorAll(chartSelector).forEach(chart => {
      if (editable(chart) || chart.querySelector('a,button,input,select,textarea,[contenteditable="true"]')) return;
      chart.dataset.vtTooltip = chart.getAttribute('aria-label');
      if (!chart.hasAttribute('tabindex')) chart.tabIndex = 0;
    });
  }
  function prepareShadow() {
    const host = document.getElementById('communications-app');
    const shadow = host?.shadowRoot;
    if (!shadow) return;
    host.dataset.vt = 'true';
    if (!shadow.querySelector('link[data-vt-asset="sections"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = sectionStyles;
      link.dataset.vtAsset = 'sections';
      shadow.appendChild(link);
    }
  }
  function prepare(scope = document) {
    enhanceCharts(scope);
    scope.querySelectorAll(headingSelector).forEach(node => {
      if (observed.has(node) || editable(node) || node.matches('.motion-reveal,[data-motion-reveal]')) return;
      observed.add(node);
      node.setAttribute('data-vt-reveal', '');
      if (reduced.matches || !reveal) node.setAttribute('data-vt-visible', '');
      else reveal.observe(node);
    });
    scope.querySelectorAll(mapSelector).forEach(node => {
      if (observed.has(node)) return;
      observed.add(node);
      syncMap(node);
      mapState.observe(node, {attributes:true, attributeFilter:['class','aria-pressed']});
    });
    prepareShadow();
    syncChapter();
  }
  let pending = false;
  function queuePrepare() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; prepare(); });
  }
  function start() {
    const headers = [...document.querySelectorAll('.topbar,.ux-nav-groups')];
    if (headers.length && 'ResizeObserver' in window) {
      const measureHeader = () => root.style.setProperty('--vt-header-offset', (headers.reduce((n, el) => n + el.getBoundingClientRect().height, 0) + 24) + 'px');
      const headerSize = new ResizeObserver(measureHeader);
      headers.forEach(el => headerSize.observe(el));
      measureHeader();
    }
    syncMotion();
    prepare();
    // Numeric animation changes text nodes. Ignore those mutations entirely.
    new MutationObserver(records => {
      if (records.some(record => [...record.addedNodes].some(node => node.nodeType === 1))) queuePrepare();
    }).observe(document.body, {subtree:true, childList:true});
    const navigation = document.querySelector('.top-navigation');
    if (navigation) new MutationObserver(syncChapter).observe(navigation, {
      subtree:true, attributes:true, attributeFilter:['aria-current']
    });
    document.querySelectorAll('main > .page,.comm-main > .page').forEach(page => {
      new MutationObserver(syncChapter).observe(page, {attributes:true, attributeFilter:['class']});
    });
  }
  reduced.addEventListener('change', syncMotion);
  window.addEventListener('hashchange', syncChapter);
  window.addEventListener('popstate', syncChapter);
  window.addEventListener('spf:communications-ready', prepareShadow);
  document.addEventListener('spf:content-applied', queuePrepare);
  document.addEventListener('forum:content-applied', queuePrepare);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
