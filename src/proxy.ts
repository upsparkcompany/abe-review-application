import { NextRequest, NextResponse } from "next/server";
import { createSupabaseProxyClient } from "./lib/supabase/proxy";

import { getAuthRouteIdentity } from "./lib/auth/route-identity";
import { protectedRoutes, authRoutes } from "./lib/auth/route-protection";
import {
  hasSupabaseAuthCookie,
  SESSION_EXPIRED_REQUEST_HEADER,
} from "./lib/auth/session-expiry";
import {
  AUTH_NOTICES,
  AUTH_NOTICE_QUERY_PARAMETER,
} from "./features/app/layout/constants/authNotices";

const REDIRECT_LOOP_COUNT_COOKIE = "abe_auth_redirect_count";
const REDIRECT_LOOP_STARTED_AT_COOKIE = "abe_auth_redirect_started_at";
const REDIRECT_LOOP_RECOVERY_COOKIE = "abe_auth_redirect_recovery";
const REDIRECT_LOOP_RECOVERY_QUERY_PARAMETER = "auth_recovered";
const REDIRECT_LOOP_WINDOW_MILLISECONDS = 10_000;
const REDIRECT_LOOP_MAX_REDIRECTS = 4;

function isAuthRecoveryRequest(request: NextRequest) {
  return (
    request.nextUrl.pathname === "/login" &&
    (request.nextUrl.searchParams.get(
      REDIRECT_LOOP_RECOVERY_QUERY_PARAMETER,
    ) === "1" ||
      request.cookies.get(REDIRECT_LOOP_RECOVERY_COOKIE)?.value === "1")
  );
}

function getNextRedirectLoopState(request: NextRequest) {
  const currentTime = Date.now();
  const startedAt = Number(
    request.cookies.get(REDIRECT_LOOP_STARTED_AT_COOKIE)?.value ?? 0,
  );
  const count = Number(
    request.cookies.get(REDIRECT_LOOP_COUNT_COOKIE)?.value ?? 0,
  );
  const isInsideWindow =
    Number.isFinite(startedAt) &&
    startedAt > 0 &&
    currentTime - startedAt <= REDIRECT_LOOP_WINDOW_MILLISECONDS;

  return {
    count: isInsideWindow && Number.isFinite(count) ? count + 1 : 1,
    startedAt: isInsideWindow ? startedAt : currentTime,
  };
}

function setRedirectLoopCookies(
  response: NextResponse,
  count: number,
  startedAt: number,
) {
  const cookieOptions = {
    httpOnly: true,
    maxAge: Math.ceil(REDIRECT_LOOP_WINDOW_MILLISECONDS / 1000),
    path: "/",
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
  };

  response.cookies.set(
    REDIRECT_LOOP_COUNT_COOKIE,
    String(count),
    cookieOptions,
  );
  response.cookies.set(
    REDIRECT_LOOP_STARTED_AT_COOKIE,
    String(startedAt),
    cookieOptions,
  );
}

function clearRedirectLoopCookies(response: NextResponse) {
  response.cookies.delete(REDIRECT_LOOP_COUNT_COOKIE);
  response.cookies.delete(REDIRECT_LOOP_STARTED_AT_COOKIE);
}

function createRedirectResponse(
  request: NextRequest,
  redirectUrl: URL,
  supabaseResponse: NextResponse,
) {
  const redirectLoopState = getNextRedirectLoopState(request);
  const shouldRecover =
    redirectLoopState.count >= REDIRECT_LOOP_MAX_REDIRECTS &&
    redirectUrl.pathname !== "/login";
  const finalRedirectUrl = shouldRecover
    ? new URL("/login", request.url)
    : redirectUrl;

  if (shouldRecover) {
    finalRedirectUrl.searchParams.set(
      REDIRECT_LOOP_RECOVERY_QUERY_PARAMETER,
      "1",
    );
  }

  const redirectResponse = NextResponse.redirect(finalRedirectUrl);

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie);
  });

  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = supabaseResponse.headers.get(header);
    if (value) redirectResponse.headers.set(header, value);
  });

  if (shouldRecover) {
    clearRedirectLoopCookies(redirectResponse);
    redirectResponse.cookies.set(REDIRECT_LOOP_RECOVERY_COOKIE, "1", {
      httpOnly: true,
      maxAge: 30,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  } else {
    setRedirectLoopCookies(
      redirectResponse,
      redirectLoopState.count,
      redirectLoopState.startedAt,
    );
  }

  return redirectResponse;
}

function createSessionExpiredResponse(
  request: NextRequest,
  supabaseResponse: NextResponse,
) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(SESSION_EXPIRED_REQUEST_HEADER, "1");

  const sessionExpiredResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  supabaseResponse.cookies.getAll().forEach((cookie) => {
    sessionExpiredResponse.cookies.set(cookie);
  });

  ["cache-control", "expires", "pragma"].forEach((header) => {
    const value = supabaseResponse.headers.get(header);
    if (value) sessionExpiredResponse.headers.set(header, value);
  });

  clearRedirectLoopCookies(sessionExpiredResponse);

  return sessionExpiredResponse;
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const hasAuthCookie = hasSupabaseAuthCookie(request.cookies.getAll());

  const { supabase, getResponse } = createSupabaseProxyClient(
    request,
    response,
  );

  const pathname = request.nextUrl.pathname;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isAcceptInviteRoute = pathname.startsWith("/auth/accept-invite");
  const isRecoveryRequest = isAuthRecoveryRequest(request);

  const identity = await getAuthRouteIdentity(supabase);
  const supabaseResponse = getResponse();

  // 🔒 App protection
  if (
    !identity.isAuthenticated &&
    !isAuthRoute &&
    !isAcceptInviteRoute &&
    pathname !== "/unauthorized"
  ) {
    if (hasAuthCookie) {
      return createSessionExpiredResponse(request, supabaseResponse);
    }

    return createRedirectResponse(
      request,
      new URL("/login", request.url),
      supabaseResponse,
    );
  }

  // ✅ Already logged in, redirect to designated dashboard
  if (
    isAuthRoute &&
    identity.isAuthenticated &&
    identity.assignedDashboardPath &&
    !isRecoveryRequest
  ) {
    const authNotice = pathname.startsWith("/auth/forgot-password")
      ? AUTH_NOTICES.forgotPasswordAlreadyLoggedIn
      : pathname.startsWith("/auth/reset-password")
        ? AUTH_NOTICES.resetPasswordAlreadyLoggedIn
        : AUTH_NOTICES.alreadyLoggedIn;
    const redirectUrl = new URL(
      identity.assignedDashboardPath,
      request.url,
    );
    redirectUrl.searchParams.set(
      AUTH_NOTICE_QUERY_PARAMETER,
      authNotice,
    );

    return createRedirectResponse(request, redirectUrl, supabaseResponse);
  }

  // Role authorization detection
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (pathname.startsWith(route)) {
      const authorized = allowedRoles.some((role) =>
        identity.roles.includes(role),
      );

      if (!authorized) {
        return createRedirectResponse(
          request,
          new URL("/unauthorized", request.url),
          supabaseResponse,
        );
      }
    }
  }

  clearRedirectLoopCookies(supabaseResponse);

  if (isRecoveryRequest && pathname === "/login") {
    supabaseResponse.cookies.delete(REDIRECT_LOOP_RECOVERY_COOKIE);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/",
    "/auth/accept-invite",
    "/auth/forgot-password",
    "/auth/reset-password",
    "/login",
    "/unauthorized",
    "/admin/:path*",
    "/reviewee/:path*",
  ],
};
