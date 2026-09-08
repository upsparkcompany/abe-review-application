"use client";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const SESSION_EXPIRED_REDIRECT_DELAY_MILLISECONDS = 4_000;

export const useSessionExpiredModal = (isOpen: boolean) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    const redirectTimeout = window.setTimeout(async () => {
      queryClient.clear();

      try {
        await supabase.auth.signOut({ scope: "local" });
      } finally {
        router.replace("/login");
        router.refresh();
      }
    }, SESSION_EXPIRED_REDIRECT_DELAY_MILLISECONDS);

    return () => window.clearTimeout(redirectTimeout);
  }, [isOpen, queryClient, router]);

};
