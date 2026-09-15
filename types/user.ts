// Matches app/models/user.rb's role enum (AUTH-02) exactly.
export type Role = "customer" | "admin" | "manager" | "warehouse" | "dispatch" | "delivery";

// Matches app/serializers/user_serializer.rb.
export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: Role;
  active: boolean;
}
