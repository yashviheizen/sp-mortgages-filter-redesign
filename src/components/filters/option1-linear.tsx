"use client";

import { Calendar, ChevronDown, CircleDashed, Search, Tag, UserRound, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import {
  ASSIGNEES, CATEGORIES, DUE_PRESETS, STATUSES, applyFilters, dueLabel, matchesDue,
  type Filters, type Query, type Status,
} from "@/lib/queries";
import { StatusDot } from "@/components/queries-table";
import { CheckRow, ClearAll, Popover, SearchInput, toggle } from "@/components/ui";

type Opt = { value: string; label: string; count: number; leading?: ReactNode };

function FilterDropdown({
  label, icon, options, selected, onChange, searchable,
}: {
  label: string;
  icon: ReactNode;
  options: Opt[];
  selected: string[];
  onChange: (v: string[]) => void;
  searchable?: boolean;
}) {
  const [term, setTerm] = useState("");
  const active = selected.length > 0;
  const shown = options.filter((o) => o.label.toLowerCase().includes(term.trim().toLowerCase()));
  const summary =
    selected.length === 1
      ? options.find((o) => o.value === selected[0])?.label
      : `${selected.length} selected`;

  return (
    <Popover
      className="w-60 p-1"
      trigger={({ open, toggle: t }) => (
        <div
          className={`flex h-7 items-center rounded-md border text-[12px] transition-colors ${
            active
              ? "border-navy-900/15 bg-navy-900/[0.04] text-gray-900"
              : `border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 ${open ? "bg-gray-50 text-gray-900" : ""}`
          }`}
        >
          <button type="button" onClick={t} className="flex h-full items-center gap-1.5 pl-2 pr-1.5">
            <span className="text-gray-400">{icon}</span>
            <span className={active ? "text-gray-500" : ""}>{label}</span>
            {active && <span className="max-w-[160px] truncate font-medium text-gray-900">{summary}</span>}
            {!active && <ChevronDown className="h-3 w-3 text-gray-400" />}
          </button>
          {active && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="mr-1 rounded p-0.5 text-gray-400 hover:bg-gray-200/70 hover:text-gray-700"
              aria-label={`Clear ${label}`}
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      )}
    >
      {searchable && (
        <div className="mb-1 flex items-center gap-2 border-b border-gray-100 px-2 pb-1.5 pt-1">
          <Search className="h-3.5 w-3.5 text-gray-400" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder={`Filter ${label.toLowerCase()}…`}
            className="h-6 flex-1 bg-transparent text-[12.5px] outline-none placeholder:text-gray-400"
          />
        </div>
      )}
      <div className="max-h-64 overflow-y-auto">
        {shown.map((o) => (
          <CheckRow key={o.value} checked={selected.includes(o.value)} onToggle={() => onChange(toggle(selected, o.value))} count={o.count}>
            {o.leading}
            <span className="truncate">{o.label}</span>
          </CheckRow>
        ))}
        {shown.length === 0 && <div className="px-2 py-3 text-[12px] text-gray-400">No matches</div>}
      </div>
    </Popover>
  );
}

export function Option1Linear({
  base, search, onSearch, filters, onChange,
}: {
  base: Query[];
  search: string;
  onSearch: (v: string) => void;
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  // Facet counts: rows matching search + every *other* active filter.
  const facet = (key: keyof Filters) => base.filter((q) => applyFilters(q, { ...filters, [key]: [] }));
  const countBy = (key: keyof Filters, rows: Query[], v: string) =>
    rows.filter((q) => (key === "due" ? matchesDue(q, v as never) : q[key as "status"] === v)).length;

  const make = (key: keyof Filters, values: readonly string[], labelOf = (v: string) => v, leading?: (v: string) => ReactNode): Opt[] => {
    const rows = facet(key);
    return values.map((v) => ({ value: v, label: labelOf(v), count: countBy(key, rows, v), leading: leading?.(v) }));
  };

  const set = <K extends keyof Filters>(k: K) => (v: Filters[K]) => onChange({ ...filters, [k]: v });
  const any = filters.status.length + filters.assignee.length + filters.category.length + filters.due.length > 0;

  return (
    <div className="flex flex-col gap-2.5">
      <SearchInput value={search} onChange={onSearch} />
      <div className="flex flex-wrap items-center gap-1.5">
        <FilterDropdown
          label="Status"
          icon={<CircleDashed className="h-3.5 w-3.5" />}
          options={make("status", STATUSES, undefined, (v) => <StatusDot status={v as Status} />)}
          selected={filters.status}
          onChange={(v) => set("status")(v as Filters["status"])}
        />
        <FilterDropdown
          label="Assigned to"
          icon={<UserRound className="h-3.5 w-3.5" />}
          options={make("assignee", ASSIGNEES)}
          selected={filters.assignee}
          onChange={set("assignee")}
          searchable
        />
        <FilterDropdown
          label="Category"
          icon={<Tag className="h-3.5 w-3.5" />}
          options={make("category", CATEGORIES)}
          selected={filters.category}
          onChange={(v) => set("category")(v as Filters["category"])}
          searchable
        />
        <FilterDropdown
          label="Due date"
          icon={<Calendar className="h-3.5 w-3.5" />}
          options={make("due", DUE_PRESETS.map((p) => p.key), (v) => dueLabel(v as never))}
          selected={filters.due}
          onChange={(v) => set("due")(v as Filters["due"])}
        />
        {any && (
          <>
            <span className="mx-1 h-4 w-px bg-gray-200" />
            <ClearAll onClick={() => onChange({ ...filters, status: [], assignee: [], category: [], due: [] })} />
          </>
        )}
      </div>
    </div>
  );
}
