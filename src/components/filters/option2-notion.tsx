"use client";

import { ChevronDown, ListFilter, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FIELDS, fieldDef, type Condition, type Field, type Operator, type Status } from "@/lib/queries";
import { StatusDot } from "@/components/queries-table";
import { CheckRow, Chip, ClearAll, Popover, SearchInput, toggle } from "@/components/ui";

const OPERATORS: Operator[] = ["is", "is not"];
let seq = 0;
const newId = () => `c${++seq}`;

/** Small inline dropdown used for field / operator / value pickers inside the builder. */
function InlineSelect({ label, muted, width = "w-auto", children, panelClass = "w-44", align = "left" }: {
  label: string;
  align?: "left" | "right";
  muted?: boolean;
  width?: string;
  children: (close: () => void) => React.ReactNode;
  panelClass?: string;
}) {
  return (
    <Popover
      align={align}
      className={`p-1 ${panelClass}`}
      trigger={({ open, toggle: t }) => (
        <button
          type="button"
          onClick={t}
          className={`flex h-7 ${width} items-center justify-between gap-1 rounded-md border px-2 text-[12px] transition-colors ${
            open ? "border-gray-300 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
          } ${muted ? "text-gray-400" : "text-gray-800"}`}
        >
          <span className="truncate">{label}</span>
          <ChevronDown className="h-3 w-3 shrink-0 text-gray-400" />
        </button>
      )}
    >
      {children}
    </Popover>
  );
}

function MenuItem({ active, onClick, children }: { active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center rounded-md px-2 py-[6px] text-left text-[12.5px] hover:bg-gray-100/80 ${
        active ? "font-medium text-gray-900" : "text-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

function valueSummary(c: Condition) {
  const def = fieldDef(c.field);
  if (!c.values.length) return "Select…";
  const first = def.options.find((o) => o.value === c.values[0])!.label;
  return c.values.length === 1 ? first : `${first} +${c.values.length - 1}`;
}

function ConditionRow({ c, index, onChange, onRemove, usedFields }: {
  c: Condition;
  index: number;
  onChange: (c: Condition) => void;
  onRemove: () => void;
  usedFields: Field[];
}) {
  const def = fieldDef(c.field);
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-11 shrink-0 text-right text-[12px] text-gray-500">{index === 0 ? "Where" : "and"}</span>
      <InlineSelect label={def.label} width="w-[104px]">
        {(close) =>
          FIELDS.map((f) => (
            <MenuItem
              key={f.key}
              active={f.key === c.field}
              onClick={() => {
                if (f.key !== c.field) onChange({ ...c, field: f.key, values: [] });
                close();
              }}
            >
              {f.label}
              {f.key !== c.field && usedFields.includes(f.key) && <span className="ml-auto text-[11px] text-gray-400">in use</span>}
            </MenuItem>
          ))
        }
      </InlineSelect>
      <InlineSelect label={c.op} width="w-[72px]" panelClass="w-28">
        {(close) =>
          OPERATORS.map((op) => (
            <MenuItem key={op} active={op === c.op} onClick={() => { onChange({ ...c, op }); close(); }}>
              {op}
            </MenuItem>
          ))
        }
      </InlineSelect>
      <div className="min-w-0 flex-1">
        <InlineSelect label={valueSummary(c)} muted={!c.values.length} width="w-full" panelClass="w-56" align="right">
          {() => (
            <div className="max-h-60 overflow-y-auto">
              {def.options.map((o) => (
                <CheckRow key={o.value} checked={c.values.includes(o.value)} onToggle={() => onChange({ ...c, values: toggle(c.values, o.value) })}>
                  {c.field === "status" && <StatusDot status={o.value as Status} />}
                  <span className="truncate">{o.label}</span>
                </CheckRow>
              ))}
            </div>
          )}
        </InlineSelect>
      </div>
      <button type="button" onClick={onRemove} className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700" aria-label="Remove condition">
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function Option2Notion({
  search, onSearch, conditions, onChange,
}: {
  search: string;
  onSearch: (v: string) => void;
  conditions: Condition[];
  onChange: (c: Condition[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const applied = conditions.filter((c) => c.values.length);
  const used = conditions.map((c) => c.field);

  const add = () => {
    const field = FIELDS.find((f) => !used.includes(f.key))?.key ?? "status";
    onChange([...conditions, { id: newId(), field, op: "is", values: [] }]);
  };
  const update = (c: Condition) => onChange(conditions.map((x) => (x.id === c.id ? c : x)));
  const remove = (id: string) => onChange(conditions.filter((x) => x.id !== id));

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center gap-2">
        <SearchInput value={search} onChange={onSearch} />
        <Popover
          align="right"
          open={open}
          onOpenChange={(o) => {
            // Opening an empty builder starts with one blank condition.
            if (o && conditions.length === 0) add();
            // Closing drops conditions that never got a value.
            if (!o) onChange(conditions.filter((c) => c.values.length));
            setOpen(o);
          }}
          className="w-[460px] p-2"
          trigger={({ open: isOpen, toggle: t }) => (
            <button
              type="button"
              onClick={t}
              className={`flex h-9 items-center gap-1.5 rounded-lg border px-3 text-[13px] transition-colors ${
                applied.length || isOpen ? "border-gray-300 bg-gray-50 text-gray-900" : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <ListFilter className="h-4 w-4" strokeWidth={1.75} />
              Filter
              {applied.length > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded bg-navy-900 px-1 text-[10px] font-medium text-white">{applied.length}</span>
              )}
            </button>
          )}
        >
          <div className="flex flex-col gap-1.5 px-1 pt-1">
            {conditions.map((c, i) => (
              <ConditionRow key={c.id} c={c} index={i} onChange={update} onRemove={() => remove(c.id)} usedFields={used} />
            ))}
            {conditions.length === 0 && <div className="px-1 py-2 text-[12px] text-gray-400">No filters applied</div>}
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-gray-100 px-1 pt-1.5">
            <button type="button" onClick={add} className="flex h-7 items-center gap-1 rounded-md px-1.5 text-[12px] text-gray-600 hover:bg-gray-100 hover:text-gray-900">
              <Plus className="h-3.5 w-3.5" /> Add filter
            </button>
            {conditions.length > 0 && (
              <button type="button" onClick={() => onChange([])} className="h-7 rounded-md px-1.5 text-[12px] text-gray-500 hover:bg-gray-100 hover:text-gray-900">
                Delete all
              </button>
            )}
          </div>
        </Popover>
      </div>

      {applied.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          {applied.map((c) => (
            <Chip key={c.id} onClick={() => setOpen(true)} onRemove={() => remove(c.id)}>
              <span className="font-medium text-gray-900">{fieldDef(c.field).label}</span>{" "}
              <span className="text-gray-500">{c.op}</span>{" "}
              <span className="text-gray-900">
                {c.values.map((v) => fieldDef(c.field).options.find((o) => o.value === v)!.label).join(", ")}
              </span>
            </Chip>
          ))}
          <ClearAll onClick={() => onChange([])} />
        </div>
      )}
    </div>
  );
}
