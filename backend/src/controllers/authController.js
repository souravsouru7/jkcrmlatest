import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const emailNorm = String(email).toLowerCase().trim();
  if (emailNorm !== config.seedEmail || password !== config.seedPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = { email: config.seedEmail, role: "admin", name: "Sales Admin" };
  const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiry });

  return res.json({ token, user });
}
