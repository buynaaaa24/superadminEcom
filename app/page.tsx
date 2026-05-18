import { redirect } from "next/navigation";

// Redirect root to the dashboard page.
// The actual dashboard lives at /dashboard (app/(dashboard)/dashboard/page.tsx).
export default function RootPage() {
  redirect("/dashboard");
}
