import { getAuthRouteIdentity } from "@/lib/auth/route-identity";
import { SESSION_EXPIRED_REQUEST_HEADER } from "@/lib/auth/session-expiry";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();

  if (requestHeaders.get(SESSION_EXPIRED_REQUEST_HEADER) === "1") {
    return children;
  }

  const supabase = await createSupabaseServerComponentClient();
  const identity = await getAuthRouteIdentity(supabase);

  if (!identity.isAuthenticated) redirect("/login");

  if (!identity.roles.includes("admin")) redirect("/unauthorized");

  return children;
}
