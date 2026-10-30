import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGO_URI || "mongodb://127.0.0.1:27017/jk-sales-crm",
  jwtSecret: process.env.JWT_SECRET || "dev-secret-change-in-production",
  jwtExpiry: "8h",
  seedEmail: (process.env.SEED_EMAIL || "admin@jkinteriors.com").toLowerCase().trim(),
  seedPassword: process.env.SEED_PASSWORD || "Jk@12345",
  resetDemoData: String(process.env.RESET_DEMO_DATA || "").toLowerCase() === "true",
  seedDemoData: String(process.env.SEED_DEMO_DATA || "true").toLowerCase() !== "false",
  nodeEnv: process.env.NODE_ENV || "development",
  publicApiKey: process.env.PUBLIC_API_KEY || "jk-public-2026",
  sheetWebhookSecret: process.env.SHEET_WEBHOOK_SECRET || "jk-sheet-sync-2026",
  fbVerifyToken: process.env.FB_VERIFY_TOKEN || "",
  fbAppSecret: process.env.FB_APP_SECRET || "",
  fbPageToken: process.env.FB_PAGE_TOKEN || "",
  fbGraphVersion: process.env.FB_GRAPH_VERSION || "v21.0",
  fbPageId: process.env.FB_PAGE_ID || "",
  fbPollSeconds: Number(process.env.FB_POLL_SECONDS ?? 60),
  fbPollLookbackHours: Number(process.env.FB_POLL_LOOKBACK_HOURS ?? 24),
};
