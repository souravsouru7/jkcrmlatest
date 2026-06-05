import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { verifyUserCredentials } from "../models/users.js";

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const user = await verifyUserCredentials(email, password);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign(user, config.jwtSecret, { expiresIn: config.jwtExpiry });

  return res.json({ token, user });
}
