import type { Response } from "express";
import crypto from "crypto";

const secure = (process.env.COOKIE_SECURE || "false") === "true";
const sameSite = (process.env.COOKIE_SAMESITE || "lax") as "lax" | "strict" | "none";

export const ACCESS_COOKIE = "htct_access";
export const REFRESH_COOKIE = "htct_refresh";
export const CSRF_COOKIE = "htct_csrf";

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  res.cookie(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  });

  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure,
    sameSite,
    path: "/api/auth",
  });

  // Double-submit CSRF token
  const csrfToken = crypto.randomBytes(16).toString("hex");
  res.cookie(CSRF_COOKIE, csrfToken, {
    httpOnly: false,
    secure,
    sameSite,
    path: "/",
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { path: "/" });
  res.clearCookie(REFRESH_COOKIE, { path: "/api/auth" });
  res.clearCookie(CSRF_COOKIE, { path: "/" });
}
