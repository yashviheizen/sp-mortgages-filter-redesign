export type Status = "Submitted" | "Assigned" | "In Progress" | "Waiting for Client";

export type Category =
  | "Application in Progress"
  | "Settlement"
  | "Construction Loan"
  | "Borrowing Capacity"
  | "Valuation"
  | "Interest Rate"
  | "Credit Report"
  | "Bank fee"
  | "Any other - General";

export type Query = {
  id: string;
  subject: string;
  client: string;
  category: Category;
  assignee: string; // "Unassigned" when nobody owns it
  due: string; // YYYY-MM-DD
  status: Status;
  unread: boolean;
};

export const STATUSES: Status[] = ["Submitted", "Assigned", "In Progress", "Waiting for Client"];

export const CATEGORIES: Category[] = [
  "Application in Progress",
  "Settlement",
  "Construction Loan",
  "Borrowing Capacity",
  "Valuation",
  "Interest Rate",
  "Credit Report",
  "Bank fee",
  "Any other - General",
];

export const ASSIGNEES = ["Unassigned", "Ajay", "Om Unadkat", "Priya Sharma", "Rajesh"];

// Fixed "today" so the prototype's due-date buckets stay stable for review.
export const TODAY = "2026-10-08";

export const QUERIES: Query[] = [
  { id: "TKT-2026-00037", subject: "Application in Progress", client: "Dayanand Bejjarapu", category: "Application in Progress", assignee: "Unassigned", due: "2026-10-11", status: "Submitted", unread: true },
  { id: "TKT-2026-00036", subject: "Application in Progress", client: "Manikdeep Singh", category: "Application in Progress", assignee: "Priya Sharma", due: "2026-10-11", status: "In Progress", unread: true },
  { id: "TKT-2026-00035", subject: "Settlement date", client: "Manikdeep Singh", category: "Settlement", assignee: "Om Unadkat", due: "2026-10-10", status: "Assigned", unread: true },
  { id: "TKT-2026-00034", subject: "Application in Progress", client: "Sudhir Kumar Singh", category: "Application in Progress", assignee: "Unassigned", due: "2026-10-10", status: "Submitted", unread: true },
  { id: "TKT-2026-00033", subject: "Borrowing Capacity Check", client: "Gurpreet Singh Benipal", category: "Borrowing Capacity", assignee: "Ajay", due: "2026-10-10", status: "Assigned", unread: false },
  { id: "TKT-2026-00032", subject: "Borrowing Capacity Check", client: "Kulwinder Singh Kular", category: "Borrowing Capacity", assignee: "Ajay", due: "2026-10-10", status: "Assigned", unread: true },
  { id: "TKT-2026-00031", subject: "Application in Progress", client: "Kulwinder Singh Kular", category: "Application in Progress", assignee: "Unassigned", due: "2026-10-10", status: "Submitted", unread: true },
  { id: "TKT-2026-00030", subject: "Application in Progress", client: "Himanshu Chauhan", category: "Application in Progress", assignee: "Om Unadkat", due: "2026-10-09", status: "Waiting for Client", unread: false },
  { id: "TKT-2026-00029", subject: "Construction loan drawdown", client: "Harpreet Kaur", category: "Construction Loan", assignee: "Ajay", due: "2026-10-08", status: "In Progress", unread: false },
  { id: "TKT-2026-00028", subject: "Property valuation follow-up", client: "Ankit Verma", category: "Valuation", assignee: "Rajesh", due: "2026-10-07", status: "Waiting for Client", unread: true },
  { id: "TKT-2026-00027", subject: "Fixed vs variable rate", client: "Simranjeet Gill", category: "Interest Rate", assignee: "Priya Sharma", due: "2026-10-14", status: "Assigned", unread: false },
  { id: "TKT-2026-00026", subject: "Credit report discrepancy", client: "Rohit Malhotra", category: "Credit Report", assignee: "Unassigned", due: "2026-10-06", status: "Submitted", unread: false },
  { id: "TKT-2026-00025", subject: "Bank fee clarification", client: "Navdeep Sandhu", category: "Bank fee", assignee: "Om Unadkat", due: "2026-10-17", status: "In Progress", unread: false },
];

/* ---------- Due date helpers ---------- */

export type DueKey = "overdue" | "today" | "tomorrow" | "week" | "later";

export const DUE_PRESETS: { key: DueKey; label: string }[] = [
  { key: "overdue", label: "Overdue" },
  { key: "today", label: "Due today" },
  { key: "tomorrow", label: "Due tomorrow" },
  { key: "week", label: "Next 7 days" },
  { key: "later", label: "Later" },
];

export const dueLabel = (k: DueKey) => DUE_PRESETS.find((p) => p.key === k)!.label;

export function daysFromToday(iso: string) {
  return Math.round((Date.parse(iso) - Date.parse(TODAY)) / 86_400_000);
}

export function matchesDue(q: Query, key: DueKey) {
  const d = daysFromToday(q.due);
  switch (key) {
    case "overdue": return d < 0;
    case "today": return d === 0;
    case "tomorrow": return d === 1;
    case "week": return d >= 0 && d <= 7;
    case "later": return d > 7;
  }
}

export function formatDue(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/* ---------- Search ---------- */

export function matchesSearch(q: Query, term: string) {
  const t = term.trim().toLowerCase();
  if (!t) return true;
  return [q.id, q.subject, q.client, q.category, q.assignee, q.status].some((v) => v.toLowerCase().includes(t));
}

/* ---------- Shared filter model (Options 1 & 3) ---------- */

export type Filters = {
  status: Status[];
  assignee: string[];
  category: Category[];
  due: DueKey[];
  from: string; // custom range (Option 3 only); "" when unset
  to: string;
};

export const EMPTY_FILTERS: Filters = { status: [], assignee: [], category: [], due: [], from: "", to: "" };

export function applyFilters(q: Query, f: Filters) {
  if (f.status.length && !f.status.includes(q.status)) return false;
  if (f.assignee.length && !f.assignee.includes(q.assignee)) return false;
  if (f.category.length && !f.category.includes(q.category)) return false;
  if (f.due.length && !f.due.some((k) => matchesDue(q, k))) return false;
  if (f.from && q.due < f.from) return false;
  if (f.to && q.due > f.to) return false;
  return true;
}

export function activeCount(f: Filters) {
  return f.status.length + f.assignee.length + f.category.length + f.due.length + (f.from || f.to ? 1 : 0);
}

/* ---------- Condition model (Option 2) ---------- */

export type Field = "status" | "assignee" | "category" | "due";
export type Operator = "is" | "is not";
export type Condition = { id: string; field: Field; op: Operator; values: string[] };

export const FIELDS: { key: Field; label: string; options: { value: string; label: string }[] }[] = [
  { key: "status", label: "Status", options: STATUSES.map((s) => ({ value: s, label: s })) },
  { key: "assignee", label: "Assigned to", options: ASSIGNEES.map((s) => ({ value: s, label: s })) },
  { key: "category", label: "Category", options: CATEGORIES.map((s) => ({ value: s, label: s })) },
  { key: "due", label: "Due date", options: DUE_PRESETS.map((p) => ({ value: p.key, label: p.label })) },
];

export const fieldDef = (k: Field) => FIELDS.find((f) => f.key === k)!;

export function applyConditions(q: Query, conds: Condition[]) {
  return conds.every((c) => {
    if (!c.values.length) return true; // incomplete conditions don't filter
    const hit =
      c.field === "due"
        ? c.values.some((v) => matchesDue(q, v as DueKey))
        : c.values.includes(q[c.field]);
    return c.op === "is" ? hit : !hit;
  });
}
