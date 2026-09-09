import { getAuthRouteAccess } from "@/lib/auth/session-expiry";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function RevieweeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const supabase = await createSupabaseServerComponentClient();
  const authRouteAccess = await getAuthRouteAccess(
    supabase,
    cookieStore.getAll(),
  );

  if (authRouteAccess.status === "missing-auth-cookie") {
    redirect("/login");
  }

  if (authRouteAccess.status === "invalid-auth-cookie") {
    return children;
  }

  const identity = authRouteAccess.identity;

  if (!identity.roles.includes("reviewee")) redirect("/unauthorized");

  return children;
}
