"use client";

import { useMemo, useState } from "react";
import {
  EMPTY_FILTERS, QUERIES, applyConditions, applyFilters, matchesSearch,
  type Condition, type Filters,
} from "@/lib/queries";
import { Header, Sidebar } from "@/components/shell";
import { QueriesTable } from "@/components/queries-table";
import { Option1Linear } from "@/components/filters/option1-linear";
import { Option2Notion } from "@/components/filters/option2-notion";
import { Option3Unified } from "@/components/filters/option3-unified";

const OPTIONS = [
  { id: 1, name: "Compact dropdowns", note: "Linear-style, instant results" },
  { id: 2, name: "Filter builder", note: "Notion-style conditions" },
  { id: 3, name: "Unified popover", note: "One panel, apply to commit" },
] as const;

export default function QueriesPage() {
  const [option, setOption] = useState<1 | 2 | 3>(1);
  const [search, setSearch] = useState("");
  // Each variation keeps its own filter state so switching tabs never loses work.
  const [f1, setF1] = useState<Filters>(EMPTY_FILTERS);
  const [c2, setC2] = useState<Condition[]>([]);
  const [f3, setF3] = useState<Filters>(EMPTY_FILTERS);

  const base = useMemo(() => QUERIES.filter((q) => matchesSearch(q, search)), [search]);
  const rows = useMemo(() => {
    if (option === 1) return base.filter((q) => applyFilters(q, f1));
    if (option === 2) return base.filter((q) => applyConditions(q, c2));
    return base.filter((q) => applyFilters(q, f3));
  }, [base, option, f1, c2, f3]);

  const current = OPTIONS.find((o) => o.id === option)!;

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col">
        <Header />
        <div className="flex-1 overflow-y-auto px-[14px] pt-3 pb-6">
          {/* Prototype-only: variation switcher */}
          <div className="mb-3 flex items-center gap-3">
            <div role="tablist" className="inline-flex rounded-md bg-gray-100 p-0.5">
              {OPTIONS.map((o) => (
                <button
                  key={o.id}
                  role="tab"
                  aria-selected={option === o.id}
                  onClick={() => setOption(o.id)}
                  className={`h-6 rounded-[5px] px-2.5 text-[12px] transition-colors ${
                    option === o.id ? "bg-white font-medium text-gray-900 shadow-[0_1px_2px_rgba(15,31,51,0.08)]" : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Option {o.id}
                </button>
              ))}
            </div>
            <span className="text-[12px] text-gray-500">
              <span className="font-medium text-gray-700">{current.name}</span> · {current.note}
            </span>
          </div>

          <div className="mb-3">
            {option === 1 && <Option1Linear base={base} search={search} onSearch={setSearch} filters={f1} onChange={setF1} />}
            {option === 2 && <Option2Notion search={search} onSearch={setSearch} conditions={c2} onChange={setC2} />}
            {option === 3 && <Option3Unified search={search} onSearch={setSearch} filters={f3} onChange={setF3} />}
          </div>

          <QueriesTable rows={rows} total={QUERIES.length} />
        </div>
      </main>
    </div>
  );
}
