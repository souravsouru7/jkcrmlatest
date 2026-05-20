import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jk-sales-crm",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiry: "8h",
  seedEmail: (process.env.SEED_EMAIL || "admin@jkinteriors.com").toLowerCase().trim(),
  seedPassword: process.env.SEED_PASSWORD || "Jk@12345",
  nodeEnv: process.env.NODE_ENV || "development",
  publicApiKey: process.env.PUBLIC_API_KEY || "jk-public-2026",
};
