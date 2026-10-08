"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  ASSIGNEES, CATEGORIES, DUE_PRESETS, EMPTY_FILTERS, STATUSES, activeCount, dueLabel, formatDue,
  type Filters, type Status,
} from "@/lib/queries";
import { StatusDot } from "@/components/queries-table";
import { CheckRow, Chip, ClearAll, Popover, SearchInput, toggle } from "@/components/ui";

function Section({ title, onClear, children, className = "" }: {
  title: string;
  onClear?: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={className}>
      <div className="mb-1 flex h-5 items-center justify-between px-2">
        <h3 className="text-[10.5px] font-medium tracking-[0.06em] text-gray-500 uppercase">{title}</h3>
        {onClear && (
          <button type="button" onClick={onClear} className="text-[11px] text-gray-400 hover:text-gray-700">
            Clear
          </button>
        )}
      </div>
      {children}
    </section>
  );
}

function DateInput({ label, value, onChange, min, max }: {
  label: string; value: string; onChange: (v: string) => void; min?: string; max?: string;
}) {
  return (
    <label className="flex h-7 flex-1 items-center gap-2 rounded-md border border-gray-200 px-2 text-[12px] focus-within:border-gray-400">
      <span className="text-gray-500">{label}</span>
      <input
        type="date"
        value={value}
        min={min}
        max={max}
        onChange={(e) => onChange(e.target.value)}
        className={`min-w-0 flex-1 bg-transparent outline-none ${value ? "text-gray-900" : "text-gray-400"}`}
      />
    </label>
  );
}

export function Option3Unified({
  search, onSearch, filters, onChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Filters>(filters);
  const count = activeCount(filters);
  const draftCount = activeCount(draft);

  const openWith = (o: boolean) => {
    if (o) setDraft(filters); // start each session from what's applied
    setOpen(o);
  };
  const d = <K extends keyof Filters>(k: K, v: Filters[K]) => setDraft((prev) => ({ ...prev, [k]: v }));

  const chips: { key: string; label: ReactNode; remove: () => void }[] = [
    ...filters.status.map((v) => ({ key: `s-${v}`, label: <>Status: <b className="font-medium text-gray-900">{v}</b></>, remove: () => onChange({ ...filters, status: filters.status.filter((x) => x !== v) }) })),
    ...filters.assignee.map((v) => ({ key: `a-${v}`, label: <>Assigned to: <b className="font-medium text-gray-900">{v}</b></>, remove: () => onChange({ ...filters, assignee: filters.assignee.filter((x) => x !== v) }) })),
    ...filters.category.map((v) => ({ key: `c-${v}`, label: <>Category: <b className="font-medium text-gray-900">{v}</b></>, remove: () => onChange({ ...filters, category: filters.category.filter((x) => x !== v) }) })),
    ...filters.due.map((v) => ({ key: `d-${v}`, label: <>Due: <b className="font-medium text-gray-900">{dueLabel(v)}</b></>, remove: () => onChange({ ...filters, due: filters.due.filter((x) => x !== v) }) })),
    ...(filters.from || filters.to
      ? [{
          key: "range",
          label: <>Due: <b className="font-medium text-gray-900">{filters.from ? formatDue(filters.from) : "…"} – {filters.to ? formatDue(filters.to) : "…"}</b></>,
          remove: () => onChange({ ...filters, from: "", to: "" }),
        }]
      : []),
  ];

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={onSearch} />
        <Popover
          align="right"
          open={open}
          onOpenChange={openWith}
          className="w-[520px]"
          trigger={({ open: isOpen, toggle: t }) => (
            <button
              type="button"
              onClick={t}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors ${
                count || isOpen ? "border-gray-300 bg-gray-50 text-gray-900" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
              Filters
              {count > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded bg-navy-900 px-1 text-[10px] font-medium text-white">{count}</span>
              )}
            </button>
          )}
        >
          <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-2.5">
            <div className="flex flex-col gap-3">
              <Section title="Status" onClear={draft.status.length ? () => d("status", []) : undefined}>
                {STATUSES.map((s) => (
                  <CheckRow key={s} checked={draft.status.includes(s)} onToggle={() => d("status", toggle(draft.status, s))}>
                    <StatusDot status={s as Status} />
                    {s}
                  </CheckRow>
                ))}
              </Section>
              <Section title="Assigned to" onClear={draft.assignee.length ? () => d("assignee", []) : undefined}>
                {ASSIGNEES.map((a) => (
                  <CheckRow key={a} checked={draft.assignee.includes(a)} onToggle={() => d("assignee", toggle(draft.assignee, a))}>
                    {a}
                  </CheckRow>
                ))}
              </Section>
            </div>
            <Section title="Category" onClear={draft.category.length ? () => d("category", []) : undefined}>
              {CATEGORIES.map((c) => (
                <CheckRow key={c} checked={draft.category.includes(c)} onToggle={() => d("category", toggle(draft.category, c))}>
                  {c}
                </CheckRow>
              ))}
            </Section>
            <Section
              title="Due date"
              className="col-span-2 border-t border-gray-100 pt-3"
              onClear={draft.due.length || draft.from || draft.to ? () => setDraft((p) => ({ ...p, due: [], from: "", to: "" })) : undefined}
            >
              <div className="flex flex-wrap gap-1.5 px-2">
                {DUE_PRESETS.map((p) => {
                  const on = draft.due.includes(p.key);
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => d("due", toggle(draft.due, p.key))}
                      className={`h-7 rounded-md border px-2.5 text-[12px] transition-colors ${
                        on ? "border-navy-900 bg-navy-900 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-2 flex gap-2 px-2">
                <DateInput label="From" value={draft.from} max={draft.to || undefined} onChange={(v) => d("from", v)} />
                <DateInput label="To" value={draft.to} min={draft.from || undefined} onChange={(v) => d("to", v)} />
              </div>
            </Section>
          </div>
          <div className="flex items-center justify-between border-t border-gray-100 px-3 py-2">
            <button
              type="button"
              onClick={() => setDraft(EMPTY_FILTERS)}
              disabled={!draftCount}
              className="h-8 text-[12.5px] text-gray-500 hover:text-gray-900 disabled:pointer-events-none disabled:opacity-40"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => { onChange(draft); setOpen(false); }}
              className="h-8 rounded-md bg-navy-900 px-3.5 text-[12.5px] font-medium text-white hover:bg-navy-800"
            >
              Apply filters{draftCount ? ` (${draftCount})` : ""}
            </button>
          </div>
        </Popover>
      </div>

      {chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {chips.map((c) => (
            <Chip key={c.key} onRemove={c.remove}>{c.label}</Chip>
          ))}
          <ClearAll onClick={() => onChange(EMPTY_FILTERS)} />
        </div>
      )}
    </div>
  );
}
