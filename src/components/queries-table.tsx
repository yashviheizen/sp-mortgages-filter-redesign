import { MoreHorizontal } from "lucide-react";
import { daysFromToday, formatDue, type Query, type Status } from "@/lib/queries";

const STATUS_STYLE: Record<Status, string> = {
  Submitted: "bg-gray-100 text-gray-600 border-gray-200",
  Assigned: "bg-violet-50 text-violet-700 border-violet-200",
  "In Progress": "bg-sky-50 text-sky-700 border-sky-200",
  "Waiting for Client": "bg-orange-50 text-orange-700 border-orange-200",
};

export function StatusBadge({ status }: { status: Status }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2 py-[1px] text-[11px] font-medium ${STATUS_STYLE[status]}`}>
      <StatusDot status={status} />
      {status}
    </span>
  );
}

const DOT: Record<Status, string> = {
  Submitted: "bg-gray-400",
  Assigned: "bg-violet-500",
  "In Progress": "bg-sky-500",
  "Waiting for Client": "bg-orange-500",
};

export function StatusDot({ status }: { status: Status }) {
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${DOT[status]}`} />;
}

function DueCell({ due }: { due: string }) {
  const d = daysFromToday(due);
  const [label, cls] =
    d < 0 ? ["Overdue", "text-red-600"] : d === 0 ? ["Due today", "text-amber-600"] : ["On Track", "text-emerald-600"];
  return (
    <div className="leading-tight">
      <div className="text-[12.5px] text-gray-900">{formatDue(due)}</div>
      <div className={`text-[11px] ${cls}`}>{label}</div>
    </div>
  );
}

export function QueriesTable({ rows, total }: { rows: Query[]; total: number }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200">
      <div className="border-b border-gray-200 px-3.5 py-3 text-[12.5px] text-gray-600">
        {rows.length === total ? `${total} queries found` : `${rows.length} of ${total} queries`}
      </div>
      <table className="w-full table-fixed text-left">
        <colgroup>
          <col className="w-[23%]" />
          <col className="w-[17%]" />
          <col className="w-[18%]" />
          <col className="w-[11%]" />
          <col className="w-[10%]" />
          <col className="w-[16%]" />
          <col className="w-[5%]" />
        </colgroup>
        <thead>
          <tr className="border-b border-gray-200 text-[10.5px] font-medium tracking-[0.06em] text-gray-500 uppercase">
            <th className="px-3.5 py-2.5 font-medium">Ticket / Subject</th>
            <th className="px-3.5 py-2.5 font-medium">Client</th>
            <th className="px-3.5 py-2.5 font-medium">Category</th>
            <th className="px-3.5 py-2.5 font-medium">Assigned to</th>
            <th className="px-3.5 py-2.5 font-medium">Due date</th>
            <th className="px-3.5 py-2.5 font-medium">Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((q) => (
            <tr key={q.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/70">
              <td className="px-3.5 py-3">
                <div className="flex items-center gap-1.5">
                  {q.unread && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" aria-label="Unread" />}
                  <span className="truncate text-[12.5px] font-semibold text-gray-900">{q.subject}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-gray-500">{q.id}</div>
              </td>
              <td className="truncate px-3.5 py-3 text-[12.5px] text-gray-800">{q.client}</td>
              <td className="px-3.5 py-3">
                <span className="inline-block max-w-full truncate rounded-full border border-blue-200 bg-blue-50 px-2 py-[1px] text-[11px] font-medium text-blue-700">
                  {q.category}
                </span>
              </td>
              <td className={`truncate px-3.5 py-3 text-[12.5px] ${q.assignee === "Unassigned" ? "text-gray-400" : "text-gray-800"}`}>
                {q.assignee}
              </td>
              <td className="px-3.5 py-3"><DueCell due={q.due} /></td>
              <td className="px-3.5 py-3"><StatusBadge status={q.status} /></td>
              <td className="px-2 py-3 text-right">
                <button className="rounded p-1 text-gray-500 hover:bg-gray-100" aria-label="Row actions">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="px-3.5 py-14 text-center">
                <div className="text-[13px] font-medium text-gray-900">No queries match</div>
                <div className="mt-1 text-[12px] text-gray-500">Try a different search or remove some filters.</div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
