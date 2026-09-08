"use client";

import type { AppRole } from "@/features/app/layout/types/appRole";
import {
  clearIntentionalSignOut,
  markIntentionalSignOut,
} from "@/lib/auth/client-session-events";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

export const useNavbar = (role: AppRole | null) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [openAccountMenu, setOpenAccountMenu] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutEmail, setLogoutEmail] = useState("");
  const roleLabel = role === "admin" ? "Administrator" : role === "reviewee" ? "Reviewee" : "User";
  const email = isLoggingOut ? logoutEmail : user?.email ?? "";

  const handleToggleAccountMenu = () => {
    setOpenAccountMenu((isOpen) => !isOpen);
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;

    setLogoutEmail(user?.email ?? "");
    setIsLoggingOut(true);
    markIntentionalSignOut();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      queryClient.clear();
      router.replace("/login");
      router.refresh();
    } catch (error) {
      console.error(error);
      clearIntentionalSignOut();
      setIsLoggingOut(false);
    }
  };

  return {
    email,
    handleLogout,
    handleToggleAccountMenu,
    isLoggingOut,
    openAccountMenu,
    roleLabel,
  };
};
