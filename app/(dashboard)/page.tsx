import { redirect } from "next/navigation";

// This file must exist to avoid orphaned layout.tsx, but the actual
// dashboard is at /dashboard — redirect there.
export default function DashboardGroupIndex() {
  redirect("/dashboard");
}
