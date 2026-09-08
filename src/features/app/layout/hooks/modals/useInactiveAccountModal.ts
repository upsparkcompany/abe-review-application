"use client";

import { useBodyScrollLock } from "@/hooks/useBodyScrollLock";
import {
  clearIntentionalSignOut,
  markIntentionalSignOut,
} from "@/lib/auth/client-session-events";
import { supabase } from "@/lib/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export const useInactiveAccountModal = (isOpen: boolean) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);
  const logoutButtonRef = useRef<HTMLButtonElement>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  useBodyScrollLock(isOpen);

  useEffect(() => {
    if (!isOpen) return;

    logoutButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        return;
      }

      if (event.key !== "Tab") return;

      event.preventDefault();
      logoutButtonRef.current?.focus();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");
    markIntentionalSignOut();

    const { error } = await supabase.auth.signOut();

    if (error) {
      clearIntentionalSignOut();
      setLogoutError("Unable to log out right now. Please try again.");
      setIsLoggingOut(false);
      return;
    }

    queryClient.clear();
    router.replace("/login");
    router.refresh();
  };

  return {
    dialogRef,
    handleLogout,
    isLoggingOut,
    logoutButtonRef,
    logoutError,
  };
};
