import "dotenv/config";

export const env = {
  port: process.env.PORT ?? 3000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dsw_secret_token_key_2026",
};
