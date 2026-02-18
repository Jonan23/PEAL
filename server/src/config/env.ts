import { config as dotenvConfig } from "dotenv";
import { existsSync } from "fs";
import { resolve, join } from "path";

const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  dotenvConfig({ path: envPath });
}

export const config = {
  database: {
    url: process.env.DATABASE_URL || "file:./dev.db",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "your-super-secret-key",
    refreshSecret: process.env.JWT_REFRESH_SECRET || "your-refresh-secret",
    accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || "15m",
    refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || "7d",
  },
  app: {
    nodeEnv: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT || "3000"),
    frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  },
  storage: {
    provider: process.env.STORAGE_PROVIDER || "local",
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
    supabaseBucket: process.env.SUPABASE_STORAGE_BUCKET || "uploads",
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
  },
  websocket: {
    port: parseInt(process.env.WEBSOCKET_PORT || "3001"),
  },
};
