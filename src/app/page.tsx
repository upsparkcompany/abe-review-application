import { getAuthRouteAccess } from "@/lib/auth/session-expiry";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerComponentClient();
  const authRouteAccess = await getAuthRouteAccess(
    supabase,
    cookieStore.getAll(),
  );

  if (authRouteAccess.status !== "verified-session") redirect("/login");

  const identity = authRouteAccess.identity;

  if (identity.assignedDashboardPath) {
    redirect(identity.assignedDashboardPath);
  }

  redirect("/unauthorized");
}
