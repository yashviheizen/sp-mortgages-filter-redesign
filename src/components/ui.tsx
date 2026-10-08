"use client";

import { Check, Search, X } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

/** Close on outside click / Escape. */
export function useDismiss(ref: RefObject<HTMLElement | null>, open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [ref, open, onClose]);
}

/** Trigger + floating panel, anchored left or right. */
export function Popover({
  trigger, children, align = "left", className = "", open, onOpenChange,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: ReactNode | ((close: () => void) => ReactNode);
  align?: "left" | "right";
  className?: string;
  open?: boolean;
  onOpenChange?: (o: boolean) => void;
}) {
  const [inner, setInner] = useState(false);
  const isOpen = open ?? inner;
  const set = onOpenChange ?? setInner;
  const ref = useRef<HTMLDivElement>(null);
  const close = () => set(false);
  useDismiss(ref, isOpen, close);
  return (
    <div ref={ref} className="relative">
      {trigger({ open: isOpen, toggle: () => set(!isOpen) })}
      {isOpen && (
        <div
          className={`pop-in absolute top-[calc(100%+6px)] z-30 rounded-lg border border-gray-200 bg-white shadow-[0_4px_16px_-4px_rgba(15,31,51,0.12)] ${
            align === "right" ? "right-0" : "left-0"
          } ${className}`}
        >
          {typeof children === "function" ? children(close) : children}
        </div>
      )}
    </div>
  );
}

export function Checkbox({ checked }: { checked: boolean }) {
  return (
    <span
      className={`grid h-3.5 w-3.5 shrink-0 place-items-center rounded-[4px] border transition-colors ${
        checked ? "border-navy-900 bg-navy-900 text-white" : "border-gray-300 bg-white"
      }`}
    >
      {checked && <Check className="h-2.5 w-2.5" strokeWidth={3.5} />}
    </span>
  );
}

/** A clickable row with a checkbox, label and optional trailing count. */
export function CheckRow({
  checked, onToggle, children, count,
}: { checked: boolean; onToggle: () => void; children: ReactNode; count?: number }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center gap-2.5 rounded-md px-2 py-[6px] text-left text-[12.5px] text-gray-800 hover:bg-gray-100/80"
    >
      <Checkbox checked={checked} />
      <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{children}</span>
      {count != null && <span className="text-[11px] text-gray-400 tabular-nums">{count}</span>}
    </button>
  );
}

export function SearchInput({
  value, onChange, trailing,
}: { value: string; onChange: (v: string) => void; trailing?: ReactNode }) {
  return (
    <div className="flex h-9 min-w-0 flex-auto items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 focus-within:border-gray-400">
      <Search className="h-4 w-4 shrink-0 text-gray-400" strokeWidth={1.75} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by ticket ID, subject, client name, or keywords..."
        className="h-full min-w-0 flex-1 bg-transparent text-[13px] text-gray-900 outline-none placeholder:text-gray-400"
      />
      {value && (
        <button onClick={() => onChange("")} className="rounded p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600" aria-label="Clear search">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {trailing}
    </div>
  );
}

/** Removable chip used by Options 2 & 3. */
export function Chip({ children, onRemove, onClick }: { children: ReactNode; onRemove: () => void; onClick?: () => void }) {
  return (
    <span className="inline-flex h-7 items-center rounded-md border border-gray-200 bg-gray-50 text-[12px] text-gray-700">
      <button type="button" onClick={onClick} className={`pl-2.5 pr-1 ${onClick ? "hover:text-gray-900" : "cursor-default"}`}>
        {children}
      </button>
      <button type="button" onClick={onRemove} className="mr-1 rounded p-0.5 text-gray-400 hover:bg-gray-200 hover:text-gray-700" aria-label="Remove filter">
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export function ClearAll({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="h-7 px-1.5 text-[12px] text-gray-500 hover:text-gray-900">
      Clear all
    </button>
  );
}

export function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}
