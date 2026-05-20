import { seedLeads, seedFollowUps, seedVisits, seedQuotations } from "../data/seed.js";

// In-memory store. Replace each array with a Mongoose model in Phase 2.
const store = {
  leads: seedLeads.map((l) => ({ ...l })),
  followUps: seedFollowUps.map((f) => ({ ...f })),
  visits: seedVisits.map((v) => ({ ...v })),
  quotations: seedQuotations.map((q) => ({ ...q })),
};

export default store;
