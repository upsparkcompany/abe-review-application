import AppLayoutClient from "@/components/AppLayoutClient";
import type { AppRole } from "@/features/app/layout/types/appRole";
import { getAuthRouteAccess } from "@/lib/auth/session-expiry";
import { createSupabaseServerComponentClient } from "@/lib/supabase/server-component";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function AppLayout({
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
    return (
      <AppLayoutClient initialIsInactive={false} initialSessionExpired role={null}>
        {null}
      </AppLayoutClient>
    );
  }

  const identity = authRouteAccess.identity;

  if (!identity.userId) {
    return (
      <AppLayoutClient initialIsInactive={false} initialSessionExpired role={null}>
        {null}
      </AppLayoutClient>
    );
  }

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
