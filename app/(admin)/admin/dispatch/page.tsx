import { OrderQueue } from "@/components/admin/OrderQueue";
import { DISPATCH_STAGE_STATUSES, DISPATCH_TRANSITIONS, ORDER_STATUS_LABELS } from "@/types/order";

const DISPATCH_STATUS_OPTIONS = DISPATCH_STAGE_STATUSES.map((status) => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
}));

export default function DispatchQueuePage() {
  return (
    <OrderQueue
      title="Dispatch"
      description="Orders confirmed by Admin, ready to pack and hand off — marking an order dispatched moves it on toward delivery."
      statusOptions={DISPATCH_STATUS_OPTIONS}
      transitions={DISPATCH_TRANSITIONS}
      stage="dispatch"
    />
  );
}
