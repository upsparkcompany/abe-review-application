"use client";

import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import AuthenticationSuccessNotice from "@/features/app/layout/components/AuthenticationSuccessNotice";
import InactiveAccountModal from "@/features/app/layout/components/InactiveAccountModal";
import SessionExpiredModal from "@/features/app/layout/components/SessionExpiredModal";
import { useAccountAccess } from "@/features/app/layout/hooks/useAccountAccess";
import type { AppRole } from "@/features/app/layout/types/appRole";
import QueryProvider from "@/providers/QueryProvider";
import { GameSoundProvider } from "@/providers/GameSoundProvider";
import { Suspense, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { consumeIntentionalSignOut } from "@/lib/auth/client-session-events";

type AppLayoutClientProps = {
  children: React.ReactNode;
  initialIsInactive: boolean;
  initialSessionExpired: boolean;
  role: AppRole | null;
};

export default function AppLayoutClient({
  children,
  initialIsInactive,
  initialSessionExpired,
  role,
}: AppLayoutClientProps) {
  const { isInactive } = useAccountAccess(initialIsInactive);
  const [isSessionExpired, setIsSessionExpired] = useState(
    initialSessionExpired,
  );
  const isAppBlocked = isInactive || isSessionExpired;

  useEffect(() => {
    if (initialSessionExpired) return;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_OUT" || consumeIntentionalSignOut()) return;

      setIsSessionExpired(true);
    });

    return () => subscription.unsubscribe();
  }, [initialSessionExpired]);

  return (
    <QueryProvider>
      <GameSoundProvider>
        <div className="h-dvh overflow-hidden bg-primary-bg text-primary-text">
          <div
            aria-hidden={isAppBlocked || undefined}
            inert={isAppBlocked || undefined}
            className={`flex h-full flex-col transition-[filter] duration-200 ${
              isAppBlocked ? "pointer-events-none select-none blur-sm" : ""
            }`}
          >
            <Suspense fallback={null}>
              <AuthenticationSuccessNotice />
            </Suspense>
            <Navbar role={role} />
            <div className="mx-auto grid min-h-0 w-full max-w-[1200px] flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] px-5 md:grid-cols-[250px_1fr] md:grid-rows-1 md:gap-10">
              <Sidebar role={role} />
              <main
                className="relative min-h-0 min-w-0 mr-[calc(-1*var(--scroll-edge-space))] overflow-y-auto py-10 pr-[var(--scroll-edge-space)] [--scroll-edge-space:max(1.25rem,calc((100vw-1200px)/2+1.25rem))] md:-ml-10 md:pl-10"
                data-app-scroll-container
              >
                {children}
              </main>
            </div>
          </div>
          <InactiveAccountModal isOpen={isInactive} />
          <SessionExpiredModal isOpen={isSessionExpired} />
        </div>
      </GameSoundProvider>
    </QueryProvider>
  );
}
