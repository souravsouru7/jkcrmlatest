export type Stage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Site Visit"
  | "Quotation"
  | "Negotiation"
  | "Won"
  | "Lost";

export type Priority = "Hot" | "Warm" | "Cold";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  source: string;
  project: string;
  budget: number;
  estimatedBudget?: string;
  sheetDate?: string;
  dob?: string;
  quality?: string;
  qualityType?: string;
  initialComments?: string;
  call1?: string;
  call2?: string;
  call3?: string;
  call4?: string;
  call5?: string;
  call6?: string;
  stage: Stage;
  priority: Priority;
  owner: string;
  nextFollowUp: string | null;
  lastActivity: string;
  notes: string;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FollowUp = {
  id: number;
  leadId: number;
  type: string;
  due: string;
  status: "Pending" | "Completed" | "Overdue";
  outcome: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
};

export type RoomScope = {
  length: string;
  width: string;
  ceilingHeight: string;
  windowCount: string;
  sillHeight: string;
  lintelHeight: string;
  balconyRailingMaterial: string[];
  balconyRailingSize: string;
  balconyDoorType: string[];
  balconyDoorWidth: string;
  balconyDoorHeight: string;
  civil: string[];
  falseCeilingType: string[];
  coves: string[];
  ceilingDesign: string[];
  floorCovering: string[];
  softFurnishings: string[];
};

export type KitchenScope = RoomScope & {
  constructionType: string[];
  carcassMaterial: string[];
  shutterFinish: string[];
  hardwareLevel: string;
  counter: string[];
  backsplashMaterial: string;
};

export type BedroomScope = {
  name: string;
  length: string;
  width: string;
  ceilingHeight: string;
  windowCount: string;
  sillHeight: string;
  lintelHeight: string;
  balconyRailingMaterial: string[];
  balconyRailingSize: string;
  balconyDoorType: string[];
  balconyDoorWidth: string;
  balconyDoorHeight: string;
  civil: string[];
  falseCeilingType: string[];
  coves: string[];
  ceilingDesign: string[];
  floorCovering: string[];
  constructionType: string[];
  wallPanellingRequired: boolean;
  wallPanellingNumberOfWalls: string;
  wallPanellingMaterial: string[];
  wardrobeType: string[];
  wardrobeHeight: string;
  wardrobeWidth: string;
  wardrobeDepth: string;
  wardrobeLoftHeight: string;
  internalLayout: string[];
  shutterFinish: string[];
  hardwareLevel: string;
  otherCarpentry: string[];
  lights: string[];
  acType: string[];
  washroomLength: string;
  washroomWidth: string;
  washroomCeilingHeight: string;
  washroomWindowSillLevel: string;
  washroomLintelLevel: string;
  washroomCivil: string[];
  washroomWallCoverings: string[];
  washroomFloorCoverings: string[];
  washroomBasinType: string[];
  washroomShowerType: string[];
  washroomElectrical: string[];
};

export type ScopeSheet = {
  // Section 1: Project Information
  projectAddress: string;
  clientName: string;
  propertyType: string;
  unitType: string;
  totalCarpetArea: string;
  generalCeilingHeight: string;
  floorToFloorHeight: string;
  foyerCeilingHeight: string;
  livingCeilingHeight: string;
  diningCeilingHeight: string;
  bedroom1CeilingHeight: string;
  bedroom2CeilingHeight: string;
  bedroom3CeilingHeight: string;
  bedroom4CeilingHeight: string;
  bedroom5CeilingHeight: string;
  storeRoomCeilingHeight: string;
  helpRoomCeilingHeight: string;
  windowCount: string;
  sillLevel: string;
  lintelLevel: string;
  windowType: string[];
  // Section 2: Services Required
  servicesRequired: string[];
  // Section 3: Project Deliverables
  deliverables: string[];
  // Section 4: Living Room
  livingRoom: RoomScope;
  // Section 5: Dining Area
  diningArea: RoomScope;
  // Section 6: Kitchen
  kitchen: KitchenScope;
  // Section 7: Bedrooms & Washrooms
  bedrooms: BedroomScope[];
  notes: string;
};

export type SiteVisit = {
  id: number;
  leadId: number;
  date: string;
  address: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled" | "No Show";
  notes: string;
  assignedTo: string;
  createdAt: string;
  scopeSheet?: ScopeSheet | null;
};

export type Quotation = {
  id: number;
  leadId: number;
  number: string;
  amount: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  validTill: string;
  discount: number;
  tax: number;
  terms: string;
  createdAt: string;
};

export type DashboardSummary = {
  totalLeads: number;
  activeLeads: number;
  pipelineValue: number;
  wonValue: number;
  quoteValue: number;
  overdue: number;
  pending: number;
  visitsToday: number;
  conversion: number;
};

export type User = {
  email: string;
  role: string;
  name: string;
};
