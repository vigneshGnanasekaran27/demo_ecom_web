// Matches app/serializers/order_serializer.rb / order_item_serializer.rb.
export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  unit_price_cents: number;
  quantity: number;
  discount_cents: number;
  line_total_cents: number;
}

export interface OrderShipping {
  name: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  landmark: string | null;
  country: string;
}

export type OrderStatus =
  | "pending_payment"
  | "confirmed"
  | "processing"
  | "packed"
  | "dispatched"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "successful" | "failed" | "refunded";

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  items: OrderItem[];
  subtotal_cents: number;
  discount_cents: number;
  delivery_charge_cents: number;
  total_cents: number;
  shipping: OrderShipping;
  razorpay_order_id: string | null;
  placed_at: string | null;
  confirmed_at: string | null;
  delivered_at: string | null;
  created_at: string;
  status_history: OrderStatusHistoryEntry[];
}

// Matches app/serializers/admin_order_list_serializer.rb.
export interface AdminOrderListItem {
  id: number;
  order_number: string;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  total_cents: number;
  customer_name: string;
  item_count: number;
  created_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending_payment: "Pending Payment",
  confirmed: "Confirmed",
  processing: "Processing",
  packed: "Packed",
  dispatched: "Dispatched",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

// Mirrors app/services/orders/update_status.rb's TRANSITIONS table — the
// full set of legal transitions, usable by an admin who isn't restricted.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["packed", "cancelled"],
  packed: ["dispatched", "cancelled"],
  dispatched: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// DECISION-032: only one internal role (admin) exists now — the Dispatch
// table's narrower transition set below is purely a UX curation (it only
// offers the "move it forward" actions relevant to that stage, not
// cancellation), not a permission boundary. The backend's only real gate
// is Orders::UpdateStatus's own state-machine legality check.
// The plain (unscoped) Orders tab's own job is reviewing/confirming and
// cancelling — the pack -> dispatch -> deliver chain is offered from the
// Dispatch/Delivery tabs instead, so an order never has two different tabs
// each offering the same "advance status" action for the same step.
export const ORDERS_TAB_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["confirmed", "cancelled"],
  confirmed: ["cancelled"],
  processing: ["cancelled"],
  packed: ["cancelled"],
  dispatched: [],
  out_for_delivery: [],
  delivered: [],
  cancelled: [],
};

export const DISPATCH_STAGE_STATUSES: OrderStatus[] = ["confirmed", "processing", "packed"];
export const DISPATCH_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  confirmed: ["processing"],
  processing: ["packed"],
  packed: ["dispatched"],
  dispatched: [],
  out_for_delivery: [],
  delivered: [],
  cancelled: [],
};

export const DELIVERY_STAGE_STATUSES: OrderStatus[] = ["dispatched", "out_for_delivery"];
export const DELIVERY_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: [],
  confirmed: [],
  processing: [],
  packed: [],
  dispatched: ["out_for_delivery"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

// A synthetic status the admin order filter offers alongside the real
// OrderStatus values — matches Api::V1::Admin::OrdersController's
// `status=payment_failed` special case (pending_payment orders where a
// real payment attempt was made and rejected, as opposed to a checkout
// nobody ever tried to pay for — see ORDER_STATUS_FILTERS below).
export type AdminOrderStatusFilter = OrderStatus | "payment_failed";

export const ORDER_STATUS_FILTERS: { value: AdminOrderStatusFilter; label: string }[] = [
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "packed", label: "Packed" },
  { value: "dispatched", label: "Dispatched" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "cancelled", label: "Cancelled" },
];

// Matches app/serializers/admin_order_detail_serializer.rb — everything
// Order has, plus who the customer really is and the real payment
// record(s). Only reachable via the admin endpoints.
export interface AdminOrderCustomer {
  type: "account" | "guest";
  id: number | null;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface AdminOrderPayment {
  id: number;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  amount_cents: number;
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  created_at: string;
}

export interface AdminOrderDetail extends Order {
  customer: AdminOrderCustomer;
  payments: AdminOrderPayment[];
}

// Only present on the POST /orders response (order creation), not on later
// order reads — the razorpay order is only ever created once.
export interface OrderWithRazorpay extends Order {
  razorpay: {
    key_id: string;
    order_id: string;
    amount: number;
    currency: string;
  };
}

export interface ShippingDetailsInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal_code: string;
  landmark?: string;
  country?: string;
}
