export const SESSION_EXPIRED_REQUEST_HEADER = "x-abe-session-expired";

const SUPABASE_AUTH_COOKIE_SUFFIX = "-auth-token";

type CookieWithName = {
  name: string;
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
