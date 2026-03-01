import type { Handle } from "@sveltejs/kit";
import { sequence } from "@sveltejs/kit/hooks";

const authGuard: Handle = async ({ event, resolve }) => {
  const accessToken = event.cookies.get("accessToken");
  const refreshToken = event.cookies.get("refreshToken");

  const publicRoutes = [
    "/login",
    "/register",
    "/forgot-password",
    "/",
    "/onboarding",
  ];
  const protectedRoutes = [
    "/dashboard",
    "/feed",
    "/mentor-match",
    "/requests",
    "/success",
    "/messages",
    "/profile",
    "/events",
    "/goals",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) =>
      event.url.pathname === route || event.url.pathname.startsWith("/api/"),
  );

  const isProtectedRoute = protectedRoutes.some((route) =>
    event.url.pathname.startsWith(route),
  );

  if (accessToken) {
    event.locals.accessToken = accessToken;
  }

  if (refreshToken) {
    event.locals.refreshToken = refreshToken;
  }

  if (accessToken || refreshToken) {
    event.locals.isAuthenticated = true;
  }

  if (isProtectedRoute && !accessToken && !refreshToken) {
    return new Response(null, {
      status: 302,
      headers: {
        location: "/login",
      },
    });
  }

  return resolve(event);
};

const setSecurityHeaders: Handle = async ({ event, resolve }) => {
  const response = await resolve(event);

  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");

  return response;
};

export const handle = sequence(authGuard, setSecurityHeaders);
