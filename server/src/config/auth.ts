import * as jose from "jose";
import { config } from "./env.js";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export async function createAccessToken(
  payload: TokenPayload,
): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.accessTokenExpiry)
    .sign(new TextEncoder().encode(config.jwt.secret));
}

export async function createRefreshToken(
  payload: TokenPayload,
): Promise<string> {
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(config.jwt.refreshTokenExpiry)
    .sign(new TextEncoder().encode(config.jwt.refreshSecret));
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(config.jwt.secret),
  );
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jose.jwtVerify(
    token,
    new TextEncoder().encode(config.jwt.refreshSecret),
  );
  return payload as TokenPayload;
}
