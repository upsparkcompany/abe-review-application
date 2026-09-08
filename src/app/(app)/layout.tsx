import AppLayoutClient from "@/components/AppLayoutClient";
import type { AppRole } from "@/features/app/layout/types/appRole";
import { getAuthRouteIdentity } from "@/lib/auth/route-identity";
import { SESSION_EXPIRED_REQUEST_HEADER } from "@/lib/auth/session-expiry";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const isSessionExpired =
    requestHeaders.get(SESSION_EXPIRED_REQUEST_HEADER) === "1";

  if (isSessionExpired) {
    return (
      <AppLayoutClient initialIsInactive={false} initialSessionExpired role={null}>
        {null}
      </AppLayoutClient>
    );
  }

  const supabase = await createSupabaseServerComponentClient();
  const identity = await getAuthRouteIdentity(supabase);

  if (!identity.isAuthenticated || !identity.userId) redirect("/login");

  const role: AppRole | null = identity.assignedRole;

  const { data: account, error: accountError } = await supabase
    .from("users")
    .select("status, account_setup_completed_at")
    .eq("user_id", identity.userId)
    .maybeSingle();

  if (accountError || !account) {
    throw new Error("Unable to verify your account status");
  }

  if (
    account.status.toLowerCase() === "pending" ||
    !account.account_setup_completed_at
  ) {
    redirect("/auth/accept-invite");
  }

  const isInactive = account.status.toLowerCase() !== "active";

  return (
    <AppLayoutClient
      initialIsInactive={isInactive}
      initialSessionExpired={false}
      role={role}
    >
      {children}
    </AppLayoutClient>
  );
}
