import { OrderQueue } from "@/components/admin/OrderQueue";
import { ORDER_STATUS_FILTERS, ORDER_STATUS_TRANSITIONS } from "@/types/order";

export default function AdminOrdersPage() {
  return (
    <OrderQueue
      title="Orders"
      description="Successful, confirmed, and failed orders — unpaid checkouts live under Abandoned Carts."
      statusOptions={ORDER_STATUS_FILTERS}
      transitions={ORDER_STATUS_TRANSITIONS}
    />
  );
}
