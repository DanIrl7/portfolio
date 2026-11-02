// Apache-2.0, VXU Labs. This module is copied verbatim to .dip/tools/portable.mjs.
// It uses only Node built-ins and never executes repository verification commands.
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const identity = (value) => {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_-]{1,100}$/.test(value))
    throw new Error("Invalid record ID");
  return value;
};
const fields = [
  "title",
  "description",
  "acceptance",
  "scope",
  "dependencies",
  "kind",
  "status",
  "priority",
  "due",
  "resolution",
];
const redacted = (value) => {
  const text = String(value ?? "");
  if (/^\s*[\[{]/.test(text)) {
    try {
      return JSON.stringify(sanitize(JSON.parse(text)));
    } catch {}
  }
  return text
    .replace(
      /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
      "[REDACTED PRIVATE KEY]",
    )
    .replace(
      /\b(?:gh[pousr]_[A-Za-z0-9_]+|github_pat_[A-Za-z0-9_]+|sk-[A-Za-z0-9_-]{12,})\b/g,
      "[REDACTED]",
    )
    .replace(
      /((?:api[_-]?key|token|password|secret|authorization)\s*[=:]\s*)(?:"[^"]*"|'[^']*'|[^\s;,]+)/gi,
      "$1[REDACTED]",
    )
    .replace(/(Bearer\s+)[A-Za-z0-9._-]+/gi, "$1[REDACTED]")
    .replace(/(https?:\/\/)[^/@\s]+:[^/@\s]+@/gi, "$1[REDACTED]@");
};
const sanitize = (value) =>
  typeof value === "string"
    ? redacted(value)
    : Array.isArray(value)
      ? value.map(sanitize)
      : value && typeof value === "object"
        ? Object.fromEntries(
            Object.entries(value).map(([key, item]) => [
              key,
              /^(?:api[_-]?key|access[_-]?token|refresh[_-]?token|token|password|secret|authorization|private[_-]?key)$/i.test(
                key,
              )
                ? "[REDACTED]"
                : sanitize(item),
            ]),
          )
        : value;
function safe(root, relative, create = false) {
  const file = path.resolve(root, relative);
  if (!file.startsWith(root + path.sep))
    throw new Error("Path escapes project");
  let current = root;
  const segments = path.relative(root, file).split(path.sep);
  for (let i = 0; i < segments.length; i++) {
    current = path.join(current, segments[i]);
    try {
      if (fs.lstatSync(current).isSymbolicLink())
        throw new Error("Portable ledger paths must not be symbolic links");
    } catch (e) {
      if (e.code !== "ENOENT") throw e;
      if (create && i < segments.length - 1) {
        try {
          fs.mkdirSync(current);
        } catch (error) {
          if (error.code !== "EEXIST") throw error;
        }
        if (fs.lstatSync(current).isSymbolicLink())
          throw new Error("Portable ledger paths must not be symbolic links");
      }
    }
  }
  return file;
}
function rootAt(cwd) {
  let root = fs.realpathSync.native(cwd);
  if (!fs.statSync(root).isDirectory())
    throw new Error("Select a project directory");
  while (!fs.existsSync(path.join(root, ".git"))) {
    const parent = path.dirname(root);
    if (parent === root) throw new Error("Not inside a Git working tree");
    root = parent;
  }
  const config = JSON.parse(
    fs.readFileSync(safe(root, ".dip/config.json"), "utf8"),
  );
  if (config.schemaVersion !== 1) throw new Error("Unsupported project schema");
  return root;
}
function validatePatch(patch, historical = false) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch))
    throw new Error("Patch must be an object");
  if (
    !historical &&
    Object.keys(patch).some((k) => !fields.includes(k) || k === "resolution")
  )
    throw new Error("Unsupported portable intent field");
  for (const k of ["title", "description", "due"])
    if (patch[k] !== undefined && typeof patch[k] !== "string")
      throw new Error(`${k} must be text`);
  if (patch.title !== undefined && !patch.title.trim())
    throw new Error("Title is required");
  if (patch.kind !== undefined && !["work", "discussion"].includes(patch.kind))
    throw new Error("Unknown kind");
  if (
    patch.status !== undefined &&
    ![
      "backlog",
      "ready",
      "in_progress",
      "blocked",
      "implemented",
      "cancelled",
      "superseded",
      ...(historical ? ["verified", "done"] : []),
    ].includes(patch.status)
  )
    throw new Error("Portable intent cannot assert verified completion");
  for (const k of ["scope", "dependencies", "acceptance"])
    if (
      patch[k] !== undefined &&
      (!Array.isArray(patch[k]) || patch[k].some((v) => typeof v !== "string"))
    )
      throw new Error(`${k} must be strings`);
  for (const scope of patch.scope || [])
    if (
      path.isAbsolute(scope) ||
      /^(?:[a-z]:|\\)/i.test(scope) ||
      scope.split(/[\\/]/).includes("..")
    )
      throw new Error("Scope must be project relative");
  for (const dep of patch.dependencies || []) identity(dep);
  if (
    patch.priority !== undefined &&
    (!Number.isInteger(patch.priority) ||
      patch.priority < 1 ||
      patch.priority > 5)
  )
    throw new Error("Priority must be 1..5");
  if (patch.resolution !== undefined && patch.resolution !== null) {
    const r = patch.resolution;
    if (
      !r ||
      !["answered", "implemented", "superseded", "cancelled"].includes(
        r.outcome,
      ) ||
      typeof r.summary !== "string" ||
      !r.summary.trim() ||
      r.summary.length > 2000 ||
      !Array.isArray(r.replacedBy) ||
      r.replacedBy.length > 20
    )
      throw new Error("Invalid finish resolution");
    r.replacedBy.forEach(identity);
  }
  if (
    patch.due &&
    (!/^\d{4}-\d{2}-\d{2}$/.test(patch.due) ||
      !Number.isFinite(Date.parse(patch.due + "T00:00:00Z")) ||
      new Date(patch.due + "T00:00:00Z").toISOString().slice(0, 10) !==
        patch.due)
  )
    throw new Error("Invalid due date");
}
function history(root, id) {
  identity(id);
  const directory = safe(root, `.dip/events/${id}`),
    events = [];
  if (!fs.existsSync(directory)) throw new Error("Task not found");
  for (const name of fs.readdirSync(directory).sort()) {
    if (!name.endsWith(".json") || name.startsWith("._")) continue;
    try {
      const file = safe(root, `.dip/events/${id}/${name}`);
      if (fs.statSync(file).size > 8 * 1024 * 1024)
        throw new Error("Event too large");
      const e = JSON.parse(fs.readFileSync(file, "utf8"));
      if (
        e.schemaVersion !== 1 ||
        e.taskId !== id ||
        `${identity(e.eventId)}.json` !== name ||
        !Array.isArray(e.parents) ||
        !e.payload ||
        typeof e.payload !== "object" ||
        Array.isArray(e.payload) ||
        typeof e.type !== "string" ||
        typeof e.actor !== "string" ||
        typeof e.createdAt !== "string"
      )
        throw new Error("Invalid event schema");
      e.parents.forEach(identity);
      if (["task.create", "task.update", "task.resolve"].includes(e.type))
        validatePatch(e.payload, true);
      if (e.type === "task.create" && !e.payload.title?.trim())
        throw new Error("Creation requires a title");
      if (
        e.type === "task.plan" &&
        (!e.payload.input ||
          typeof e.payload.input !== "object" ||
          typeof e.payload.tool !== "string")
      )
        throw new Error("Invalid plan");
      events.push(e);
    } catch (e) {
      throw new Error(`Corrupt task history ${id}/${name}: ${e.message}`);
    }
  }
  const map = new Map(events.map((e) => [e.eventId, e])),
    ancestors = new Map(),
    visiting = new Set();
  const visit = (id) => {
    if (ancestors.has(id)) return ancestors.get(id);
    if (visiting.has(id)) throw new Error("Cyclic history");
    const e = map.get(id);
    if (!e) throw new Error("Missing causal parent");
    visiting.add(id);
    const result = new Set();
    for (const parent of e.parents) {
      result.add(parent);
      for (const p of visit(parent)) result.add(p);
    }
    visiting.delete(id);
    ancestors.set(id, result);
    return result;
  };
  events.forEach((e) => visit(e.eventId));
  if (!events.some((e) => e.type === "task.create"))
    throw new Error("Task creation missing");
  const state = {
      id,
      title: "",
      description: "",
      scope: [],
      acceptance: [],
      dependencies: [],
      kind: "work",
      status: "backlog",
      resolution: null,
      conflicts: [],
      verification: "not_assessed",
    },
    writes = new Map();
  events.sort(
    (a, b) =>
      ancestors.get(a.eventId).size - ancestors.get(b.eventId).size ||
      a.eventId.localeCompare(b.eventId),
  );
  for (const e of events) {
    if (["task.create", "task.update", "task.resolve"].includes(e.type))
      for (const k of fields)
        if (e.payload[k] !== undefined) {
          writes.set(k, [
            ...(writes.get(k) || []).filter(
              (w) => !ancestors.get(e.eventId).has(w.eventId),
            ),
            e,
          ]);
          state[k] = e.payload[k];
        }
    if (e.type === "task.plan") state.plan = { ...e.payload, at: e.createdAt };
    if (e.type === "task.checkpoint")
      state.checkpoint = { ...e.payload, at: e.createdAt };
  }
  for (const [field, w] of writes)
    if (new Set(w.map((e) => JSON.stringify(e.payload[field]))).size > 1)
      state.conflicts.push({ field, eventIds: w.map((e) => e.eventId) });
  if (state.conflicts.length) state.status = "conflict";
  const parents = new Set(events.flatMap((e) => e.parents)),
    heads = events.filter((e) => !parents.has(e.eventId)).map((e) => e.eventId);
  return { state, heads };
}
function write(root, id, type, payload, actor, parents) {
  payload = sanitize(payload);
  const eventId = randomUUID(),
    event = {
      schemaVersion: 1,
      eventId,
      taskId: id,
      type,
      payload,
      actor: redacted(actor || "portable"),
      createdAt: new Date().toISOString(),
      parents,
      branch: "portable",
    };
  const file = safe(root, `.dip/events/${identity(id)}/${eventId}.json`, true),
    tmp = file + ".tmp";
  const fd = fs.openSync(tmp, "wx", 0o600);
  try {
    fs.writeFileSync(fd, JSON.stringify(event, null, 2) + "\n");
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  try {
    fs.renameSync(tmp, file);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
  return {
    id,
    eventId,
    persisted: true,
    coordination: "portable intent only; no live leases or automatic capture",
    verification: "not_assessed",
  };
}
export function portable(action, args = {}, cwd = process.cwd()) {
  const root = rootAt(cwd),
    limit = Number(args.limit ?? 20),
    offset = Number(args.offset ?? 0);
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 100 ||
    !Number.isInteger(offset) ||
    offset < 0
  )
    throw new Error("Use limit 1..100 and nonnegative offset");
  if (action === "list" || action === "context") {
    const directory = safe(root, ".dip/events"),
      tasks = [],
      errors = [];
    for (const id of (fs.existsSync(directory)
      ? fs.readdirSync(directory)
      : []
    ).sort()) {
      if (
        id === "_activity" ||
        !fs.statSync(safe(root, `.dip/events/${id}`)).isDirectory()
      )
        continue;
      try {
        const { state } = history(root, id);
        if (
          args.all ||
          !(
            ["verified", "implemented", "cancelled", "superseded"].includes(
              state.status,
            ) || state.kind === "discussion"
          )
        )
          tasks.push(state);
      } catch (e) {
        errors.push({ id, error: e.message });
      }
    }
    return {
      root,
      total: tasks.length,
      tasks: tasks.slice(offset, offset + limit).map((t) => ({
        id: t.id,
        title: t.title.slice(0, 300),
        status: t.status,
        kind: t.kind,
        conflicts: t.conflicts,
      })),
      nextOffset: tasks.length > offset + limit ? offset + limit : null,
      errors,
      verification:
        "Recorded statuses only; current code proof requires the installed runtime",
    };
  }
  if (
    !["get"].includes(action) &&
    JSON.parse(fs.readFileSync(safe(root, ".dip/config.json"), "utf8")).mode ===
      "strict"
  )
    throw new Error(
      "Strict mode requires the installed runtime and ownership token",
    );
  if (action === "create") {
    const patch = {
      title: args.title,
      description: redacted(args.description || ""),
      kind: args.kind || "work",
      scope: args.scope || [],
      acceptance: [],
      dependencies: [],
      status: "backlog",
    };
    validatePatch(patch);
    patch.title = redacted(patch.title);
    return write(
      root,
      "task_" + randomUUID(),
      "task.create",
      patch,
      args.actor,
      [],
    );
  }
  const { state, heads } = history(root, args.id);
  if (action === "get")
    return {
      ...state,
      title: state.title.slice(0, 300),
      titleTruncated: state.title.length > 300,
      description: state.description.slice(0, 6000),
      descriptionTruncated: state.description.length > 6000,
      acceptance: state.acceptance.slice(0, 30).map((v) => v.slice(0, 1000)),
      acceptanceCount: state.acceptance.length,
      acceptanceTruncated:
        state.acceptance.length > 30 ||
        state.acceptance.some((v) => v.length > 1000),
      scope: state.scope.slice(0, 30),
      scopeCount: state.scope.length,
      dependencies: state.dependencies.slice(0, 30),
      dependencyCount: state.dependencies.length,
      conflicts: state.conflicts.slice(0, 20),
      conflictCount: state.conflicts.length,
      checkpoint: state.checkpoint
        ? {
            summary: String(state.checkpoint.summary || "").slice(0, 2000),
            next: String(state.checkpoint.next || "").slice(0, 1000),
            at: state.checkpoint.at,
          }
        : null,
      plan: state.plan
        ? {
            text: String(state.plan.input?.text || "").slice(0, 2000),
            truncated: String(state.plan.input?.text || "").length > 2000,
          }
        : null,
    };
  if (state.conflicts.length && action !== "resolve")
    throw new Error("Resolve competing intent explicitly before writing");
  if (action === "update" || action === "resolve") {
    const patch = args.patch || {};
    validatePatch(patch);
    for (const key of ["title", "description"])
      if (typeof patch[key] === "string") patch[key] = redacted(patch[key]);
    if (
      ["verified", "implemented", "cancelled", "superseded"].includes(
        state.status,
      ) &&
      !patch.status
    )
      throw new Error(
        "Explicitly reopen completed work before changing intent",
      );
    if (
      patch.status !== undefined ||
      (patch.kind === "work" && state.resolution?.outcome === "answered")
    )
      patch.resolution = null;
    return write(
      root,
      args.id,
      action === "resolve" ? "task.resolve" : "task.update",
      patch,
      args.actor,
      heads,
    );
  }
  if (action === "plan" || action === "checkpoint") {
    const text = action === "plan" ? args.text : args.summary;
    if (typeof text !== "string" || !text.trim() || text.length > 20000)
      throw new Error("Supply nonempty text of at most 20,000 characters");
    return write(
      root,
      args.id,
      action === "plan" ? "task.plan" : "task.checkpoint",
      action === "plan"
        ? { tool: "portable", input: { text: redacted(text) } }
        : { summary: redacted(text), next: redacted(args.next || "") },
      args.actor,
      heads,
    );
  }
  throw new Error(
    "Portable commands: list, get, create, update, resolve, plan, checkpoint. Verification and leases require installed DIP.",
  );
}
if (
  process.argv[1] &&
  fs.existsSync(process.argv[1]) &&
  fs.realpathSync.native(process.argv[1]) ===
    fs.realpathSync.native(fileURLToPath(import.meta.url))
) {
  try {
    const { positionals, values } = parseArgs({
      allowPositionals: true,
      options: Object.fromEntries(
        [
          "root",
          "id",
          "title",
          "description",
          "kind",
          "actor",
          "text",
          "summary",
          "next",
          "limit",
          "offset",
          "patch",
        ]
          .map((k) => [k, { type: "string" }])
          .concat([
            ["all", { type: "boolean" }],
            ["help", { type: "boolean" }],
            ["scope", { type: "string", multiple: true }],
          ]),
      ),
    });
    if (values.help || !positionals[0])
      console.log(
        'DIP portable intent (Node 20+). Review cloned code before executing.\nnode .dip/tools/portable.mjs list\nnode .dip/tools/portable.mjs create --title "Future idea"\nnode .dip/tools/portable.mjs plan --id ID --text "Plan"\nnode .dip/tools/portable.mjs checkpoint --id ID --summary "Remaining work"\nupdate/resolve accept --patch JSON; reads accept --limit/--offset/--all. No automatic capture, leases or verified completion.',
      );
    else
      console.log(
        JSON.stringify(
          portable(
            positionals[0],
            {
              ...values,
              ...(values.patch ? { patch: JSON.parse(values.patch) } : {}),
            },
            values.root || process.cwd(),
          ),
          null,
          2,
        ),
      );
  } catch (e) {
    console.error(`DIP portable: ${e.message}`);
    process.exitCode = 1;
  }
}
