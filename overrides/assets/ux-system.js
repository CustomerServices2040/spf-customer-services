(function () {
  "use strict";

  const TASKS_URL = "assets/tasks-data.json";
  const NAV_GROUPS = [
    ["الملخص التنفيذي", ["overview", "performance", "achievements"]],
    ["المتعامل والقنوات", ["methodology", "coverage", "channels", "tajawob"]],
    ["التنفيذ", ["operational-plan", "work-tracker", "risk-register"]],
    ["الحوكمة والمبادرات", ["directorate", "committees", "projects", "community-line"]],
    ["المعرفة والتقارير", ["media-center"]]
  ];

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => Array.from(context.querySelectorAll(selector));

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, character => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
    })[character]);
  }

  function buildGroupedNavigation() {
    const source = $(".top-navigation");
    if (!source || $(".ux-nav-groups")) return;

    const originalLinks = new Map(
      $$("a[href^='#']", source).map(link => [link.getAttribute("href").slice(1), link])
    );
    const navigation = document.createElement("nav");
    navigation.className = "ux-nav-groups";
    navigation.setAttribute("aria-label", "التنقل المختصر بين أقسام المنصة");

    NAV_GROUPS.forEach(([label, ids]) => {
      const available = ids.filter(id => originalLinks.has(id));
      if (!available.length) return;
      const details = document.createElement("details");
      details.dataset.sections = available.join(" ");
      details.innerHTML = `<summary>${escapeHtml(label)}<span aria-hidden="true">⌄</span></summary><div class="ux-nav-menu"></div>`;
      const menu = $(".ux-nav-menu", details);
      available.forEach(id => {
        const original = originalLinks.get(id);
        const link = document.createElement("a");
        link.href = `#${id}`;
        link.textContent = original.textContent.trim();
        link.addEventListener("click", event => {
          event.preventDefault();
          original.click();
          details.open = false;
        });
        menu.appendChild(link);
      });
      navigation.appendChild(details);
    });

    source.after(navigation);
    document.documentElement.classList.add("ux-enhanced");
    const closeOthers = event => {
      const opened = event.target.closest("details");
      if (!opened?.open) return;
      $$("details", navigation).forEach(item => { if (item !== opened) item.open = false; });
    };
    navigation.addEventListener("toggle", closeOthers, true);
    document.addEventListener("click", event => {
      if (!event.target.closest(".ux-nav-groups")) $$("details[open]", navigation).forEach(item => { item.open = false; });
    });

    const sync = () => {
      const activeId = (location.hash || "#overview").slice(1);
      $$("details", navigation).forEach(group => {
        const active = group.dataset.sections.split(" ").includes(activeId);
        group.classList.toggle("active", active);
        $$("a", group).forEach(link => {
          const current = link.getAttribute("href") === `#${activeId}`;
          link.classList.toggle("active", current);
          if (current) link.setAttribute("aria-current", "page"); else link.removeAttribute("aria-current");
        });
      });
      const skip = $(".ux-skip-link");
      if (skip) skip.href = `#${activeId}`;
    };
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    source.addEventListener("click", () => setTimeout(sync, 0));
    sync();
  }

  function addAccessibilityAids() {
    if (!$(".ux-skip-link")) {
      const skip = document.createElement("a");
      skip.className = "ux-skip-link";
      skip.href = location.hash || "#overview";
      skip.textContent = "تجاوز إلى محتوى القسم";
      skip.addEventListener("click", () => {
        const section = $(skip.getAttribute("href"));
        if (section) {
          section.tabIndex = -1;
          setTimeout(() => section.focus({ preventScroll: true }), 0);
        }
      });
      document.body.prepend(skip);
    }

    $$("img:not([loading])").forEach((image, index) => {
      if (index > 2 && !image.closest("#overview")) image.loading = "lazy";
    });
  }

  function arabicDate(iso) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("ar-OM-u-nu-latn", {
      day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Muscat"
    }).format(date);
  }

  function taskSummary(tasks) {
    const summary = { total: tasks.length, done: 0, active: 0, late: 0, risk: 0, progress: 0, pending: 0 };
    tasks.forEach(task => {
      if (task.status === "منجز") { summary.done += 1; return; }
      summary.active += 1;
      const pct = Number(task.pct);
      if (task.overdue) summary.late += 1;
      else if (!Number.isFinite(pct) || pct <= 0) summary.pending += 1;
      else if (pct < 50) summary.risk += 1;
      else summary.progress += 1;
    });
    summary.rate = summary.total ? Math.round(summary.done / summary.total * 100) : 0;
    return summary;
  }

  function departmentSummary(tasks) {
    const result = new Map();
    tasks.forEach(task => {
      const name = String(task.dept || "غير محدد").trim();
      if (!result.has(name)) result.set(name, { total: 0, done: 0 });
      const row = result.get(name);
      row.total += 1;
      if (task.status === "منجز") row.done += 1;
    });
    result.forEach(row => { row.rate = row.total ? Math.round(row.done / row.total * 100) : 0; });
    return result;
  }

  function setText(selector, value, context = document) {
    const element = $(selector, context);
    if (!element) return;
    element.removeAttribute("data-edit-key");
    element.textContent = String(value);
  }

  function updateDepartmentCards(departments) {
    $$("#work-tracker .tracker-departments article").forEach(card => {
      const label = $("span", card)?.textContent.trim();
      const row = departments.get(label);
      if (!row) return;
      setText(".tracker-dept-ratio", `${row.done} / ${row.total}`, card);
      const bar = $("i em", card);
      if (bar) bar.style.width = `${row.rate}%`;
      setText("small", `${row.rate}% من البنود منجزة`, card);
    });

    $$('[data-board-dept]').forEach(card => {
      const label = $("span", card)?.textContent.trim();
      const row = departments.get(label);
      if (row) setText("strong", `${row.rate}%`, card);
    });
  }

  function updateKanban(summary) {
    const values = { late: summary.late, risk: summary.risk, progress: summary.progress, pending: summary.pending, done: summary.done };
    Object.entries(values).forEach(([className, count]) => {
      const column = $(`#trackerKanban .tracker-kanban-column.${className}`);
      if (!column) return;
      const title = $("h4 span", column)?.textContent.replace(/^[!△◷○✓]\s*/, "").trim() || "الحالة";
      setText("h4 strong", count, column);
      column.setAttribute("aria-label", `${title}: ${count} مهام`);
    });
  }

  function addIntegrityNote(summary, updatedAt) {
    const head = $("#trackerKanban .tracker-kanban-head");
    if (!head) return;
    let note = $(".ux-integrity-note", head);
    if (!note) {
      note = document.createElement("p");
      note.className = "ux-integrity-note";
      note.setAttribute("role", "status");
      head.appendChild(note);
    }
    note.textContent = `الأرقام محسوبة مباشرة من السجل المركزي · ${summary.total} بندًا · ${arabicDate(updatedAt)}`;
  }

  function addGlobalFreshness(updatedAt) {
    const actions = $(".top-actions");
    if (!actions) return;
    let status = $(".ux-data-status", actions);
    if (!status) {
      status = document.createElement("span");
      status.className = "ux-data-status";
      actions.prepend(status);
    }
    status.textContent = `تحديث المهام: ${arabicDate(updatedAt)}`;
  }

  function applyTaskData(payload) {
    const tasks = Array.isArray(payload?.tasks) ? payload.tasks : [];
    if (!tasks.length) return;
    const summary = taskSummary(tasks);
    const departments = departmentSummary(tasks);

    setText("#trackerRate", `${summary.rate}%`);
    setText("#trackerRateSummary", `${summary.done} من أصل ${summary.total} بندًا`);
    const rateBar = $("#trackerRateBar");
    if (rateBar) rateBar.style.width = `${summary.rate}%`;
    setText("#trackerTotalCount", summary.total);
    setText("#trackerDoneCount", summary.done);
    setText("#trackerProgressCount", summary.active);
    setText("#trackerCountSummary", `${departments.size} أقسام تشغيلية`);

    setText("#boardRate", `${summary.rate}%`);
    setText("#boardDone", `${summary.done} منجزًا`);
    setText("#boardProgressCount", `${summary.active} قيد الإجراء`);
    setText("#boardDeptCount strong", departments.size);
    setText("#boardTotalItems strong", summary.total);
    const boardBar = $("#boardRateBar");
    if (boardBar) boardBar.style.width = `${summary.rate}%`;

    const note = $("#work-tracker .section-note");
    if (note) {
      note.removeAttribute("data-edit-key");
      note.textContent = `آخر تحديث أسبوعي · ${arabicDate(payload.updated_at)}`;
    }
    updateDepartmentCards(departments);
    updateKanban(summary);
    addIntegrityNote(summary, payload.updated_at);
    addGlobalFreshness(payload.updated_at);
  }

  async function loadTaskData() {
    try {
      const response = await fetch(`${TASKS_URL}?v=${Date.now()}`, { cache: "no-store" });
      if (!response.ok) throw new Error("تعذر تحميل سجل الأعمال");
      applyTaskData(await response.json());
    } catch (error) {
      const head = $("#trackerKanban .tracker-kanban-head");
      if (head && !$(".ux-integrity-note", head)) {
        const note = document.createElement("p");
        note.className = "ux-integrity-note error";
        note.textContent = "تعذر التحقق من تطابق مؤشرات الأعمال مع السجل المركزي";
        head.appendChild(note);
      }
    }
  }

  function boot() {
    buildGroupedNavigation();
    addAccessibilityAids();
    loadTaskData();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
  window.addEventListener("pageshow", loadTaskData);
})();
