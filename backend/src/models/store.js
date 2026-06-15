import { seedLeads, seedFollowUps, seedVisits, seedQuotations } from "../data/seed.js";
import { config } from "../config/env.js";
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

export async function seedDemoDataIfEmpty() {
  if (config.resetDemoData) {
    await Promise.all([
      LeadModel.deleteMany({}),
      FollowUpModel.deleteMany({}),
    ]);

    if (seedLeads.length > 0) await LeadModel.insertMany(seedLeads);
    if (seedFollowUps.length > 0) await FollowUpModel.insertMany(seedFollowUps);

    console.log(`Demo data reset -> ${seedLeads.length} leads, ${seedFollowUps.length} follow-ups`);
    return;
  }

  const leadCount = await LeadModel.countDocuments({});
  const followUpCount = await FollowUpModel.countDocuments({});

  if (leadCount === 0 && seedLeads.length > 0) {
    await LeadModel.insertMany(seedLeads);
    console.log(`Demo leads seeded -> ${seedLeads.length}`);
  }

  if (followUpCount === 0 && seedFollowUps.length > 0) {
    await FollowUpModel.insertMany(seedFollowUps);
    console.log(`Demo follow-ups seeded -> ${seedFollowUps.length}`);
  }
}

export async function persistLead(lead) {
  await LeadModel.updateOne({ id: lead.id }, { $set: lead }, { upsert: true });
}

export async function persistFollowUp(followUp) {
  await FollowUpModel.updateOne({ id: followUp.id }, { $set: followUp }, { upsert: true });
}

export async function deletePersistedLead(id) {
  await Promise.all([
    LeadModel.deleteOne({ id: Number(id) }),
    FollowUpModel.deleteMany({ leadId: Number(id) }),
  ]);
}

export async function deletePersistedFollowUpsForLead(id) {
  await FollowUpModel.deleteMany({ leadId: Number(id) });
}

export default store;
