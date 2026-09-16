import { OrderQueue } from "@/components/admin/OrderQueue";
import { ORDER_STATUS_FILTERS, ORDERS_TAB_TRANSITIONS } from "@/types/order";

export default function AdminOrdersPage() {
  return (
    <OrderQueue
      title="Orders"
      description="Successful, confirmed, and failed orders — unpaid checkouts live under Abandoned Carts. Pack/dispatch/deliver from their own tabs."
      statusOptions={ORDER_STATUS_FILTERS}
      transitions={ORDERS_TAB_TRANSITIONS}
    />
  );
}
