import { ORDER_STATUS_LABELS, type OrderStatusHistoryEntry } from "@/types/order";

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

/**
 * Renders the order's real recorded status transitions (ORDER-03) — not a
 * fixed 8-step roadmap, since a cancelled order or one still pending
 * payment never reaches most of those steps. Each entry is exactly what
 * Orders::UpdateStatus wrote to order_status_histories.
 */
export function OrderStatusTimeline({ history }: { history: OrderStatusHistoryEntry[] }) {
  if (history.length === 0) {
    return <p className="text-sm text-zinc-500 dark:text-zinc-400">Awaiting payment confirmation.</p>;
  }

  return (
    <ol className="relative border-l border-zinc-200 pl-6 dark:border-zinc-800">
      {history.map((entry, index) => (
        <li key={`${entry.status}-${entry.created_at}`} className={index === history.length - 1 ? "" : "pb-6"}>
          <span className="absolute -left-[7px] mt-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-brand-500 dark:border-zinc-950" />
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{ORDER_STATUS_LABELS[entry.status]}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{dateFormatter.format(new Date(entry.created_at))}</p>
          {entry.note && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{entry.note}</p>}
          {entry.changed_by && <p className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">by {entry.changed_by}</p>}
        </li>
      ))}
    </ol>
  );
}
