import "dotenv/config";
import crypto from "crypto";
import jwt, { type SignOptions } from "jsonwebtoken";

/**
 * Keep JWT payload minimal to avoid stale data and exp/iat issues.
 * We store only adminId in both access & refresh tokens.
 */
export type AuthTokenPayload = { adminId: number };

const accessSecret = process.env.ACCESS_TOKEN_SECRET || "";
const refreshSecret = process.env.REFRESH_TOKEN_SECRET || "";

if (!accessSecret || !refreshSecret) {
  throw new Error("ACCESS_TOKEN_SECRET / REFRESH_TOKEN_SECRET missing in server/.env");
}

function assertPayload(decoded: unknown): AuthTokenPayload {
  if (!decoded || typeof decoded !== "object") throw new Error("Invalid token payload");

  const adminId = (decoded as any).adminId;
  if (typeof adminId !== "number" || !Number.isFinite(adminId)) {
    throw new Error("Invalid token payload: adminId");
  }

  return { adminId };
}

export function signAccessToken(payload: AuthTokenPayload) {
  const ttl = (process.env.ACCESS_TOKEN_TTL || "15m") as SignOptions["expiresIn"];
  // payload has NO exp/iat, so jsonwebtoken can safely apply expiresIn
  return jwt.sign(payload, accessSecret, { expiresIn: ttl });
}

export function signRefreshToken(payload: AuthTokenPayload) {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || "30");
  const ttl = `${days}d` as SignOptions["expiresIn"];
  return jwt.sign(
    { ...payload, jti: crypto.randomUUID() } as any,
    refreshSecret,
    { expiresIn: ttl }
  );
}


export function verifyAccessToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, accessSecret);
  return assertPayload(decoded);
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  const decoded = jwt.verify(token, refreshSecret);
  return assertPayload(decoded);
}

export function hashToken(raw: string) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export function refreshExpiresAt() {
  const days = Number(process.env.REFRESH_TOKEN_TTL_DAYS || "30");
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}
