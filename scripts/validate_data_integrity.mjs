import fs from "node:fs";

const path = process.argv[2];
if (!path) throw new Error("Usage: node validate_data_integrity.mjs <tasks-data.json>");
const payload = JSON.parse(fs.readFileSync(path, "utf8"));
if (!Array.isArray(payload.tasks) || !payload.tasks.length) throw new Error("tasks-data.json must contain a non-empty tasks array");

const tasks = payload.tasks;
const completed = tasks.filter(task => task.status === "منجز");
const active = tasks.filter(task => task.status !== "منجز");
const buckets = {
  late: active.filter(task => task.overdue),
  pending: active.filter(task => !task.overdue && (!Number.isFinite(Number(task.pct)) || Number(task.pct) <= 0)),
  risk: active.filter(task => !task.overdue && Number(task.pct) > 0 && Number(task.pct) < 50),
  progress: active.filter(task => !task.overdue && Number(task.pct) >= 50)
};

const classified = Object.values(buckets).reduce((sum, rows) => sum + rows.length, 0);
if (completed.length + active.length !== tasks.length) throw new Error("Status totals do not reconcile with task total");
if (classified !== active.length) throw new Error(`Kanban buckets classify ${classified} of ${active.length} active tasks`);
if (completed.some(task => Number(task.pct) !== 100)) throw new Error("Every completed task must have pct=100");
if (tasks.some(task => !task.id || !task.title || !task.dept)) throw new Error("Every task must contain id, title and dept");
if (new Set(tasks.map(task => task.id)).size !== tasks.length) throw new Error("Task ids must be unique");

console.log(JSON.stringify({
  updated_at: payload.updated_at,
  total: tasks.length,
  completed: completed.length,
  active: active.length,
  completion_rate: Math.round(completed.length / tasks.length * 100),
  kanban: Object.fromEntries(Object.entries(buckets).map(([key, rows]) => [key, rows.length]))
}, null, 2));
