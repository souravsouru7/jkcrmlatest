import mongoose from "mongoose";

const flexibleOptions = {
  strict: false,
  versionKey: false,
};

const leadSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
}, flexibleOptions);

const followUpSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true, index: true },
  leadId: { type: Number, index: true },
}, flexibleOptions);

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "Sales Admin" },
  role: { type: String, default: "admin" },
  active: { type: Boolean, default: true },
  createdAt: { type: String },
  updatedAt: { type: String },
}, flexibleOptions);

export const LeadModel = mongoose.models.Lead || mongoose.model("Lead", leadSchema, "leads");
export const FollowUpModel = mongoose.models.FollowUp || mongoose.model("FollowUp", followUpSchema, "followUps");
export const UserModel = mongoose.models.User || mongoose.model("User", userSchema, "users");
