import { OrderQueue } from "@/components/admin/OrderQueue";
import { DELIVERY_STAGE_STATUSES, DELIVERY_TRANSITIONS, ORDER_STATUS_LABELS } from "@/types/order";

const DELIVERY_STATUS_OPTIONS = DELIVERY_STAGE_STATUSES.map((status) => ({
  value: status,
  label: ORDER_STATUS_LABELS[status],
}));

export default function DeliveryQueuePage() {
  return (
    <OrderQueue
      title="Delivery"
      description="Orders on their way — dispatched and out for delivery. Marking one delivered completes the order."
      statusOptions={DELIVERY_STATUS_OPTIONS}
      transitions={DELIVERY_TRANSITIONS}
      stage="delivery"
    />
  );
}
