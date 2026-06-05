import bcrypt from "bcryptjs";
import { config } from "../config/env.js";
import { UserModel } from "./mongo.js";

export async function seedAdminUser() {
  const email = config.seedEmail;
  const now = new Date().toISOString();
  const existing = await UserModel.findOne({ email });

  if (existing) {
    let changed = false;
    if (!existing.passwordHash) {
      existing.passwordHash = await bcrypt.hash(config.seedPassword, 10);
      changed = true;
    }
    if (!existing.name) {
      existing.name = "Sales Admin";
      changed = true;
    }
    if (!existing.role) {
      existing.role = "admin";
      changed = true;
    }
    if (existing.active === undefined) {
      existing.active = true;
      changed = true;
    }
    if (changed) {
      existing.updatedAt = now;
      await existing.save();
    }
    return existing;
  }

  return UserModel.create({
    email,
    passwordHash: await bcrypt.hash(config.seedPassword, 10),
    name: "Sales Admin",
    role: "admin",
    active: true,
    createdAt: now,
    updatedAt: now,
  });
}

export async function verifyUserCredentials(email, password) {
  const emailNorm = String(email || "").toLowerCase().trim();
  const user = await UserModel.findOne({ email: emailNorm, active: true }).lean();
  if (!user) return null;

  const ok = await bcrypt.compare(String(password || ""), user.passwordHash || "");
  if (!ok) return null;

  return {
    email: user.email,
    role: user.role || "admin",
    name: user.name || "Sales Admin",
  };
}
