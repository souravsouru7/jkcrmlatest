import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import { connectDB } from "./config/db.js";

import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import leadRoutes from "./routes/leads.js";
import followUpRoutes from "./routes/followUps.js";
import siteVisitRoutes from "./routes/siteVisits.js";
import quotationRoutes from "./routes/quotations.js";
import dashboardRoutes from "./routes/dashboard.js";
import reminderRoutes from "./routes/reminders.js";

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

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

app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

connectDB()
  .then(() => {
    app.listen(config.port, () => {
      console.log(`JK Sales CRM backend → http://localhost:${config.port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
    process.exit(1);
  });
