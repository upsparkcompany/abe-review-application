import { getAuthRouteIdentity, type AuthRouteIdentity } from "@/lib/auth/route-identity";
import type { Database } from "@/types/database.types";
import type { SupabaseClient } from "@supabase/supabase-js";

export const SESSION_EXPIRED_REQUEST_HEADER = "x-abe-session-expired";

const SUPABASE_AUTH_COOKIE_SUFFIX = "-auth-token";

type CookieWithName = {
  name: string;
};

export type AuthRouteAccess =
  | {
      identity: null;
      status: "missing-auth-cookie";
    }
  | {
      identity: AuthRouteIdentity;
      status: "verified-session";
    }
  | {
      identity: AuthRouteIdentity;
      status: "invalid-auth-cookie";
    };

export const getSupabaseAuthCookieName = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) return null;

  try {
    const projectReference = new URL(supabaseUrl).hostname.split(".")[0];

    return projectReference
      ? `sb-${projectReference}${SUPABASE_AUTH_COOKIE_SUFFIX}`
      : null;
  } catch {
    return null;
  }
};

export const hasSupabaseAuthCookie = (cookies: CookieWithName[]) => {
  const authCookieName = getSupabaseAuthCookieName();

  if (!authCookieName) return false;

  return cookies.some(
    ({ name }) => name === authCookieName || name.startsWith(`${authCookieName}.`),
  );
};

export const getAuthRouteAccess = async (
  supabase: SupabaseClient<Database>,
  cookies: CookieWithName[],
): Promise<AuthRouteAccess> => {
  if (!hasSupabaseAuthCookie(cookies)) {
    return {
      identity: null,
      status: "missing-auth-cookie",
    };
  }

  const identity = await getAuthRouteIdentity(supabase);

  return identity.isAuthenticated
    ? { identity, status: "verified-session" }
    : { identity, status: "invalid-auth-cookie" };
};
