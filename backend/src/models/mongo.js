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

export const LeadModel = mongoose.models.Lead || mongoose.model("Lead", leadSchema, "leads");
export const FollowUpModel = mongoose.models.FollowUp || mongoose.model("FollowUp", followUpSchema, "followUps");
