import { readFileSync, writeFileSync } from 'node:fs';

// Remove stale positional display overrides, never the underlying award records.
const path = process.argv[2] || 'overrides/assets/dashboard-edits.json';
const payload = JSON.parse(readFileSync(path, 'utf8'));
const before = Object.keys(payload.edits).length;
payload.edits = Object.fromEntries(Object.entries(payload.edits).filter(
  ([key]) => !/^#(?:service-achievements|recognitions)(?:>|$)/.test(key)
));
writeFileSync(path, JSON.stringify(payload, null, 2) + '\n');
console.log(`Removed ${before - Object.keys(payload.edits).length} stale catalog overrides; source records untouched.`);
