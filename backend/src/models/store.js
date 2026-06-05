import { seedLeads, seedFollowUps, seedVisits, seedQuotations } from "../data/seed.js";
import { FollowUpModel, LeadModel } from "./mongo.js";

const store = {
  leads: seedLeads.map((l) => ({ ...l })),
  followUps: seedFollowUps.map((f) => ({ ...f })),
  visits: seedVisits.map((v) => ({ ...v })),
  quotations: seedQuotations.map((q) => ({ ...q })),
};

function cleanDoc(doc) {
  const { _id, __v, ...rest } = doc;
  return rest;
}

export async function hydrateStoreFromMongo() {
  const [leads, followUps] = await Promise.all([
    LeadModel.find({}).sort({ createdAt: -1, id: -1 }).lean(),
    FollowUpModel.find({}).sort({ due: 1, id: -1 }).lean(),
  ]);

  if (leads.length > 0) {
    store.leads = leads.map(cleanDoc);
  }

  if (followUps.length > 0) {
    store.followUps = followUps.map(cleanDoc);
  }

  console.log(`Mongo data loaded -> ${store.leads.length} leads, ${store.followUps.length} follow-ups`);
}

export async function persistLead(lead) {
  await LeadModel.updateOne({ id: lead.id }, { $set: lead }, { upsert: true });
}

export async function persistFollowUp(followUp) {
  await FollowUpModel.updateOne({ id: followUp.id }, { $set: followUp }, { upsert: true });
}

export async function deletePersistedLead(id) {
  await LeadModel.deleteOne({ id: Number(id) });
}

export default store;
