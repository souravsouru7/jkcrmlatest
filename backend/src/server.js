import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";
import { hydrateStoreFromMongo, seedDemoDataIfEmpty } from "./models/store.js";
import { seedAdminUser } from "./models/users.js";
import { startFacebookLeadPolling } from "./controllers/publicController.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { buildMcpServer } from "./mcp/server.js";

import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import followUpRoutes from "./routes/followUps.js";
import siteVisitRoutes from "./routes/siteVisits.js";
import quotationRoutes from "./routes/quotations.js";
import dashboardRoutes from "./routes/dashboard.js";
import reminderRoutes from "./routes/reminders.js";

const app = express();

const corsBase = {
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-api-key", "x-sheet-secret"],
};

// /api/public stays open: the website enquiry form can be embedded on any domain.
// Everything else only answers browsers on the CRM's own origins.
app.use(cors((req, cb) => {
  const isPublic = req.path.startsWith("/api/public");
  cb(null, {
    ...corsBase,
    origin: isPublic ? "*" : (origin, done) => done(null, !origin || config.corsOrigins.includes(origin)),
  });
}));
// Keep the raw body so the Facebook webhook can verify Meta's signature.
app.use(express.json({ verify: (req, _res, buf) => { req.rawBody = buf; } }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "jk-sales-crm", env: config.nodeEnv });
});

app.use("/api/public", publicRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/leads", leadRoutes);
app.use("/api/follow-ups", followUpRoutes);
app.use("/api/site-visits", siteVisitRoutes);
app.use("/api/quotations", quotationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reminders", reminderRoutes);

// Claude connector (claude.ai web/iPhone and Claude Code). The secret in the URL is the auth,
// because claude.ai custom connectors can't send custom headers.
app.post("/mcp/:secret", async (req, res) => {
  if (!config.mcpSecret || req.params.secret !== config.mcpSecret) {
    return res.status(404).json({ error: "Route not found" });
  }
  const server = buildMcpServer();
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error("[MCP]", err);
    if (!res.headersSent) res.status(500).json({ error: "MCP error" });
  }
});

app.all("/mcp/:secret", (_req, res) => res.status(405).json({ error: "Method not allowed" }));

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

connectDB()
  .then(async () => {
    await seedAdminUser();
    await seedDemoDataIfEmpty();
    await hydrateStoreFromMongo();
    app.listen(config.port, () => {
      console.log(`JK Sales CRM backend -> http://localhost:${config.port}`);
    });
    startFacebookLeadPolling();
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
