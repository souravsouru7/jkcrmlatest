"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import type {
  ScopeSheet,
  RoomScope,
  KitchenScope,
  BedroomScope,
  SiteVisit,
} from "@/lib/types";

// ── Option Lists (from PDF) ───────────────────────────────────────────────────

const SERVICES = [
  "Full Home Renovation",
  "Interior Fit-Out",
  "Civil + Interior Turnkey",
  "Online Design Only",
  "Material Selection Support",
  "Project Management",
  "Furniture + Styling",
  "Vastu Consultation",
];

const DELIVERABLES = [
  "2D Layouts",
  "Furniture Layout",
  "Electrical Layout",
  "Plumbing Layout",
  "Ceiling Layout",
  "Tile Layout",
  "Working Drawings",
  "3D Renders",
  "Material Boards",
  "BOQ",
  "Site Visits",
  "Vendor Coordination",
  "Procurement Support",
  "Final Styling",
  "Photoshoot",
];

const CIVIL_ITEMS = [
  "Demolition of Flooring",
  "Demolition of Walls",
  "New Partitions / Wall Shifting",
  "Floor Leveling / Screeding",
  "New Flooring Installation",
  "Skirting Installation",
  "Beam / Column Covering",
  "Window Enlargement / Reduction",
  "Door Shifting / Door Enlargement / Add Extra Door",
];

const FALSE_CEILING = ["POP", "Wooden", "Stretch", "Grid"];
const COVES = ["Outside Only", "Inside Only", "Inside + Outside"];
const CEILING_DESIGN = ["Grooves", "Mouldings", "Beam Hiding"];
const FLOOR_COVERING = ["Gloss Tile", "Matt Tile", "Marble", "Granite"];
const SOFT_FURNISHINGS = [
  "Curtains (Sheer)",
  "Curtains (Blackout)",
  "Curtains (Both)",
  "Blinds",
  "Rug",
  "Upholstery Requirements",
];
const BALCONY_RAILING = [
  "Brick",
  "Glass",
  "Aluminium + Glass",
  "SS",
  "MS",
  "Other",
];
const BALCONY_DOOR = ["Sliding", "Hinged Single", "Hinged Double", "Fixed"];
const WINDOW_TYPES = ["Sliding", "Openable", "Fixed"];
const CONSTRUCTION_TYPES = [
  "On-site Carpenter",
  "Carcass On-site + Factory Made Shutters",
  "Full Modular Factory Made Kitchen",
];
const CARCASS_MATERIAL = [
  "HDHMR",
  "BWP Below Sink Only",
  "BWP Entire Kitchen",
  "Plywood (BWR / BWP)",
];
const SHUTTER_FINISH_KIT = ["Laminate", "Acrylic", "PU", "Veneer", "Glass"];
const HARDWARE_LEVELS_KIT = [
  "Basic (Local)",
  "Mid (Hettich India / Ozone / Inox)",
  "Premium (Hafele / Hettich Germany)",
  "Ultra Premium (Blum)",
];
const COUNTER = ["Granite", "Quartz", "Marble"];
const WALL_PANEL_MATERIAL = [
  "POP",
  "Laminate",
  "Veneer",
  "PU",
  "MDF",
  "Fabric",
  "Glass",
  "Acrylic",
  "Stone",
];
const WARDROBE_TYPE = ["Normal Wardrobe", "Walk-in Wardrobe"];
const WARDROBE_HEIGHT = ["Full Height", "8ft", "8ft + Loft"];
const INTERNAL_LAYOUT = [
  "Hanging Rod",
  "Hanging Pullout",
  "Shelves",
  "Drawers",
  "Shoe Rack",
  "Trouser Pullout",
  "Tie Rack",
  "Jewellery Tray",
  "Mirror Inside",
  "Sensor Light",
];
const SHUTTER_FINISH_BED = ["Laminate", "Veneer", "PU", "Acrylic", "Glass"];
const HARDWARE_LEVELS_BED = ["Basic", "Mid", "Premium", "Ultra Premium"];
const OTHER_CARPENTRY = [
  "Bed (King)",
  "Bed (Queen)",
  "Headboard",
  "Side Table",
  "Study Table",
  "Dressing Table",
  "TV Panel",
  "Bookshelf",
];
const LIGHTS = [
  "COB",
  "Downlight",
  "Panel Light",
  "Profile Light",
  "Cove Light",
];
const AC_TYPES = ["Split", "Cassette", "Ductable"];
const WASHROOM_CIVIL = [
  "Waterproofing",
  "Replace Fittings Only",
  "Full Demolition",
  "Drain Pipe Change",
  "Supply Pipe Change",
];
const WASHROOM_WALL = ["Tile", "Marble", "Granite", "Feature Tile"];
const WASHROOM_FLOOR = ["Anti-skid Tile", "Marble", "Granite"];
const BASIN_TYPE = [
  "Over-Counter",
  "Under-Counter",
  "Table-Top",
  "Integrated",
  "Wall-Mounted",
];
const SHOWER_TYPE = [
  "Wall-Mounted",
  "Ceiling-Mounted",
  "Shower Panel",
  "Body Jets",
];
const WASHROOM_ELEC = ["Mirror Light", "Ceiling Light", "Exhaust Fan", "Geyser"];

// ── Empty State Factories ────────────────────────────────────────────────────

function emptyRoom(): RoomScope {
  return {
    length: "",
    width: "",
    ceilingHeight: "",
    windowCount: "",
    sillHeight: "",
    lintelHeight: "",
    balconyRailingMaterial: [],
    balconyRailingSize: "",
    balconyDoorType: [],
    balconyDoorWidth: "",
    balconyDoorHeight: "",
    civil: [],
    falseCeilingType: [],
    coves: [],
    ceilingDesign: [],
    floorCovering: [],
    softFurnishings: [],
  };
}

function emptyKitchen(): KitchenScope {
  return {
    ...emptyRoom(),
    constructionType: [],
    carcassMaterial: [],
    shutterFinish: [],
    hardwareLevel: "",
    counter: [],
    backsplashMaterial: "",
  };
}

function emptyBedroom(name: string): BedroomScope {
  return {
    name,
    length: "",
    width: "",
    ceilingHeight: "",
    windowCount: "",
    sillHeight: "",
    lintelHeight: "",
    balconyRailingMaterial: [],
    balconyRailingSize: "",
    balconyDoorType: [],
    balconyDoorWidth: "",
    balconyDoorHeight: "",
    civil: [],
    falseCeilingType: [],
    coves: [],
    ceilingDesign: [],
    floorCovering: [],
    constructionType: [],
    wallPanellingRequired: false,
    wallPanellingNumberOfWalls: "",
    wallPanellingMaterial: [],
    wardrobeType: [],
    wardrobeHeight: "",
    wardrobeWidth: "",
    wardrobeDepth: "",
    wardrobeLoftHeight: "",
    internalLayout: [],
    shutterFinish: [],
    hardwareLevel: "",
    otherCarpentry: [],
    lights: [],
    acType: [],
    washroomLength: "",
    washroomWidth: "",
    washroomCeilingHeight: "",
    washroomWindowSillLevel: "",
    washroomLintelLevel: "",
    washroomCivil: [],
    washroomWallCoverings: [],
    washroomFloorCoverings: [],
    washroomBasinType: [],
    washroomShowerType: [],
    washroomElectrical: [],
  };
}

const BEDROOM_NAMES = [
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Bedroom 4",
  "Bedroom 5",
];

const EMPTY_SCOPE: ScopeSheet = {
  projectAddress: "",
  clientName: "",
  propertyType: "",
  unitType: "",
  totalCarpetArea: "",
  generalCeilingHeight: "",
  floorToFloorHeight: "",
  foyerCeilingHeight: "",
  livingCeilingHeight: "",
  diningCeilingHeight: "",
  bedroom1CeilingHeight: "",
  bedroom2CeilingHeight: "",
  bedroom3CeilingHeight: "",
  bedroom4CeilingHeight: "",
  bedroom5CeilingHeight: "",
  storeRoomCeilingHeight: "",
  helpRoomCeilingHeight: "",
  windowCount: "",
  sillLevel: "",
  lintelLevel: "",
  windowType: [],
  servicesRequired: [],
  deliverables: [],
  livingRoom: emptyRoom(),
  diningArea: emptyRoom(),
  kitchen: emptyKitchen(),
  bedrooms: BEDROOM_NAMES.map(emptyBedroom),
  notes: "",
};

// ── Primitive UI helpers ──────────────────────────────────────────────────────

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 px-3 py-2 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";
const labelCls =
  "block text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest";

function SecTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold text-teal-400 uppercase tracking-widest mb-2 mt-5">
      {children}
    </p>
  );
}

function HR() {
  return <div className="border-t border-slate-800 my-4" />;
}

function TInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={inputCls}
      />
    </div>
  );
}

function CheckPills({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    onChange(
      value.includes(opt) ? value.filter((x) => x !== opt) : [...value, opt]
    );
  }
  return (
    <div className="mb-3">
      {label && <p className={labelCls}>{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
              value.includes(opt)
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700/80"
            }`}
          >
            {value.includes(opt) && (
              <svg
                viewBox="0 0 10 10"
                fill="none"
                className="w-2.5 h-2.5 flex-shrink-0"
              >
                <path
                  d="M1.5 5l2.5 2.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function RadioPills({
  label,
  options,
  value,
  onChange,
}: {
  label?: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="mb-3">
      {label && <p className={labelCls}>{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition ${
              value === opt
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700/80"
            }`}
          >
            {value === opt && (
              <svg
                viewBox="0 0 10 10"
                fill="none"
                className="w-2.5 h-2.5 flex-shrink-0"
              >
                <path
                  d="M1.5 5l2.5 2.5 4.5-4.5"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Shared room sub-sections ─────────────────────────────────────────────────

function RoomBasicAndBalcony({
  data,
  patch,
}: {
  data: {
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
  };
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <>
      <SecTitle>Basic Info</SecTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        <TInput
          label="Length"
          value={data.length}
          onChange={(v) => patch({ length: v })}
          placeholder="ft"
        />
        <TInput
          label="Width"
          value={data.width}
          onChange={(v) => patch({ width: v })}
          placeholder="ft"
        />
        <TInput
          label="Ceiling Height"
          value={data.ceilingHeight}
          onChange={(v) => patch({ ceilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Window Count"
          value={data.windowCount}
          onChange={(v) => patch({ windowCount: v })}
        />
        <TInput
          label="Sill Height"
          value={data.sillHeight}
          onChange={(v) => patch({ sillHeight: v })}
          placeholder="mm"
        />
        <TInput
          label="Lintel Height"
          value={data.lintelHeight}
          onChange={(v) => patch({ lintelHeight: v })}
          placeholder="mm"
        />
      </div>

      <SecTitle>Balcony Railing</SecTitle>
      <CheckPills
        label="Material"
        options={BALCONY_RAILING}
        value={data.balconyRailingMaterial}
        onChange={(v) => patch({ balconyRailingMaterial: v })}
      />
      <TInput
        label="Size (r.ft / sq.ft)"
        value={data.balconyRailingSize}
        onChange={(v) => patch({ balconyRailingSize: v })}
        placeholder="e.g. 12 r.ft"
      />

      <SecTitle>Balcony Door</SecTitle>
      <CheckPills
        label="Door Type"
        options={BALCONY_DOOR}
        value={data.balconyDoorType}
        onChange={(v) => patch({ balconyDoorType: v })}
      />
      <div className="grid grid-cols-2 gap-2.5 mt-1">
        <TInput
          label="Door Width"
          value={data.balconyDoorWidth}
          onChange={(v) => patch({ balconyDoorWidth: v })}
          placeholder="ft"
        />
        <TInput
          label="Door Height"
          value={data.balconyDoorHeight}
          onChange={(v) => patch({ balconyDoorHeight: v })}
          placeholder="ft"
        />
      </div>
    </>
  );
}

function RoomCivilAndCeiling({
  data,
  patch,
}: {
  data: {
    civil: string[];
    falseCeilingType: string[];
    coves: string[];
    ceilingDesign: string[];
    floorCovering: string[];
  };
  patch: (p: Record<string, unknown>) => void;
}) {
  return (
    <>
      <SecTitle>Civil & False Ceiling Works</SecTitle>
      <CheckPills
        label="Civil Works"
        options={CIVIL_ITEMS}
        value={data.civil}
        onChange={(v) => patch({ civil: v })}
      />
      <CheckPills
        label="False Ceiling Type"
        options={FALSE_CEILING}
        value={data.falseCeilingType}
        onChange={(v) => patch({ falseCeilingType: v })}
      />
      <CheckPills
        label="Coves"
        options={COVES}
        value={data.coves}
        onChange={(v) => patch({ coves: v })}
      />
      <CheckPills
        label="Ceiling Design"
        options={CEILING_DESIGN}
        value={data.ceilingDesign}
        onChange={(v) => patch({ ceilingDesign: v })}
      />
      <SecTitle>Floor Covering</SecTitle>
      <CheckPills
        options={FLOOR_COVERING}
        value={data.floorCovering}
        onChange={(v) => patch({ floorCovering: v })}
      />
    </>
  );
}

// ── Section tab components ───────────────────────────────────────────────────

function ProjectInfoTab({
  data,
  onChange,
}: {
  data: ScopeSheet;
  onChange: (p: Partial<ScopeSheet>) => void;
}) {
  return (
    <div>
      <SecTitle>Basic Info</SecTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
        <TInput
          label="Project Address"
          value={data.projectAddress}
          onChange={(v) => onChange({ projectAddress: v })}
          placeholder="Full address"
        />
        <TInput
          label="Client Name"
          value={data.clientName}
          onChange={(v) => onChange({ clientName: v })}
        />
        <TInput
          label="Total Carpet Area"
          value={data.totalCarpetArea}
          onChange={(v) => onChange({ totalCarpetArea: v })}
          placeholder="sq.ft"
        />
      </div>
      <RadioPills
        label="Property Type"
        options={["Apartment", "Villa", "Farmhouse"]}
        value={data.propertyType}
        onChange={(v) => onChange({ propertyType: v })}
      />
      <RadioPills
        label="Unit Type"
        options={["2BHK", "3BHK", "4BHK", "5BHK"]}
        value={data.unitType}
        onChange={(v) => onChange({ unitType: v })}
      />

      <HR />
      <SecTitle>Ceiling & Height Information</SecTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        <TInput
          label="General Ceiling Height"
          value={data.generalCeilingHeight}
          onChange={(v) => onChange({ generalCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Floor to Floor Height"
          value={data.floorToFloorHeight}
          onChange={(v) => onChange({ floorToFloorHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Foyer Ceiling Height"
          value={data.foyerCeilingHeight}
          onChange={(v) => onChange({ foyerCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Living Ceiling Height"
          value={data.livingCeilingHeight}
          onChange={(v) => onChange({ livingCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Dining Ceiling Height"
          value={data.diningCeilingHeight}
          onChange={(v) => onChange({ diningCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Bedroom 1 Ceiling Height"
          value={data.bedroom1CeilingHeight}
          onChange={(v) => onChange({ bedroom1CeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Bedroom 2 Ceiling Height"
          value={data.bedroom2CeilingHeight}
          onChange={(v) => onChange({ bedroom2CeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Bedroom 3 Ceiling Height"
          value={data.bedroom3CeilingHeight}
          onChange={(v) => onChange({ bedroom3CeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Bedroom 4 Ceiling Height"
          value={data.bedroom4CeilingHeight}
          onChange={(v) => onChange({ bedroom4CeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Bedroom 5 Ceiling Height"
          value={data.bedroom5CeilingHeight}
          onChange={(v) => onChange({ bedroom5CeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Store Room Ceiling Height"
          value={data.storeRoomCeilingHeight}
          onChange={(v) => onChange({ storeRoomCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Help Room Ceiling Height"
          value={data.helpRoomCeilingHeight}
          onChange={(v) => onChange({ helpRoomCeilingHeight: v })}
          placeholder="ft"
        />
      </div>

      <HR />
      <SecTitle>Window Information</SecTitle>
      <div className="grid grid-cols-3 sm:grid-cols-3 gap-2.5 mb-3">
        <TInput
          label="Window Count"
          value={data.windowCount}
          onChange={(v) => onChange({ windowCount: v })}
        />
        <TInput
          label="Sill Level"
          value={data.sillLevel}
          onChange={(v) => onChange({ sillLevel: v })}
          placeholder="mm"
        />
        <TInput
          label="Lintel Level"
          value={data.lintelLevel}
          onChange={(v) => onChange({ lintelLevel: v })}
          placeholder="mm"
        />
      </div>
      <CheckPills
        label="Window Type"
        options={WINDOW_TYPES}
        value={data.windowType}
        onChange={(v) => onChange({ windowType: v })}
      />
    </div>
  );
}

function ScopeTab({
  data,
  onChange,
}: {
  data: ScopeSheet;
  onChange: (p: Partial<ScopeSheet>) => void;
}) {
  return (
    <div>
      <SecTitle>Services Required</SecTitle>
      <CheckPills
        options={SERVICES}
        value={data.servicesRequired}
        onChange={(v) => onChange({ servicesRequired: v })}
      />
      <HR />
      <SecTitle>Project Deliverables</SecTitle>
      <CheckPills
        options={DELIVERABLES}
        value={data.deliverables}
        onChange={(v) => onChange({ deliverables: v })}
      />
    </div>
  );
}

function LivingRoomTab({
  data,
  onChange,
}: {
  data: RoomScope;
  onChange: (d: RoomScope) => void;
}) {
  function patch(p: Record<string, unknown>) {
    onChange({ ...data, ...(p as Partial<RoomScope>) });
  }
  return (
    <div>
      <RoomBasicAndBalcony data={data} patch={patch} />
      <HR />
      <RoomCivilAndCeiling data={data} patch={patch} />
      <SecTitle>Soft Furnishings</SecTitle>
      <CheckPills
        options={SOFT_FURNISHINGS}
        value={data.softFurnishings}
        onChange={(v) => patch({ softFurnishings: v })}
      />
    </div>
  );
}

function DiningAreaTab({
  data,
  onChange,
}: {
  data: RoomScope;
  onChange: (d: RoomScope) => void;
}) {
  function patch(p: Record<string, unknown>) {
    onChange({ ...data, ...(p as Partial<RoomScope>) });
  }
  return (
    <div>
      <RoomBasicAndBalcony data={data} patch={patch} />
      <HR />
      <RoomCivilAndCeiling data={data} patch={patch} />
      <SecTitle>Soft Furnishings</SecTitle>
      <CheckPills
        options={SOFT_FURNISHINGS}
        value={data.softFurnishings}
        onChange={(v) => patch({ softFurnishings: v })}
      />
    </div>
  );
}

function KitchenTab({
  data,
  onChange,
}: {
  data: KitchenScope;
  onChange: (d: KitchenScope) => void;
}) {
  function patch(p: Record<string, unknown>) {
    onChange({ ...data, ...(p as Partial<KitchenScope>) });
  }
  return (
    <div>
      <RoomBasicAndBalcony data={data} patch={patch} />
      <HR />
      <RoomCivilAndCeiling data={data} patch={patch} />

      <SecTitle>Construction Type</SecTitle>
      <CheckPills
        options={CONSTRUCTION_TYPES}
        value={data.constructionType}
        onChange={(v) => patch({ constructionType: v })}
      />

      <HR />
      <SecTitle>Carpentry — Carcass Material</SecTitle>
      <CheckPills
        options={CARCASS_MATERIAL}
        value={data.carcassMaterial}
        onChange={(v) => patch({ carcassMaterial: v })}
      />

      <SecTitle>Shutter Finish</SecTitle>
      <CheckPills
        options={SHUTTER_FINISH_KIT}
        value={data.shutterFinish}
        onChange={(v) => patch({ shutterFinish: v })}
      />

      <SecTitle>Hardware Level</SecTitle>
      <RadioPills
        options={HARDWARE_LEVELS_KIT}
        value={data.hardwareLevel}
        onChange={(v) => patch({ hardwareLevel: v })}
      />

      <SecTitle>Counter</SecTitle>
      <CheckPills
        options={COUNTER}
        value={data.counter}
        onChange={(v) => patch({ counter: v })}
      />
      <div className="mt-2">
        <TInput
          label="Backsplash Material"
          value={data.backsplashMaterial}
          onChange={(v) => patch({ backsplashMaterial: v })}
          placeholder="Write backsplash material here…"
        />
      </div>
    </div>
  );
}

function SingleBedroomTab({
  data,
  onChange,
}: {
  data: BedroomScope;
  onChange: (d: BedroomScope) => void;
}) {
  function patch(p: Record<string, unknown>) {
    onChange({ ...data, ...(p as Partial<BedroomScope>) });
  }

  return (
    <div>
      <div className="mb-3">
        <TInput
          label="Bedroom Name / Label"
          value={data.name}
          onChange={(v) => patch({ name: v })}
          placeholder="e.g. Master Bedroom"
        />
      </div>

      <RoomBasicAndBalcony data={data} patch={patch} />
      <HR />
      <RoomCivilAndCeiling data={data} patch={patch} />

      <SecTitle>Construction Type</SecTitle>
      <CheckPills
        options={CONSTRUCTION_TYPES}
        value={data.constructionType}
        onChange={(v) => patch({ constructionType: v })}
      />

      <HR />
      <SecTitle>Carpentry — Wall Panelling</SecTitle>
      <button
        type="button"
        onClick={() => patch({ wallPanellingRequired: !data.wallPanellingRequired })}
        className={`mb-3 px-3 py-1.5 rounded-md text-xs font-medium border transition ${
          data.wallPanellingRequired
            ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
            : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
        }`}
      >
        {data.wallPanellingRequired ? "✓ Required" : "Mark as Required"}
      </button>

      {data.wallPanellingRequired && (
        <>
          <RadioPills
            label="Number of Walls"
            options={["1", "2", "3"]}
            value={data.wallPanellingNumberOfWalls}
            onChange={(v) => patch({ wallPanellingNumberOfWalls: v })}
          />
          <CheckPills
            label="Wall Panelling Material"
            options={WALL_PANEL_MATERIAL}
            value={data.wallPanellingMaterial}
            onChange={(v) => patch({ wallPanellingMaterial: v })}
          />
        </>
      )}

      <SecTitle>Wardrobe</SecTitle>
      <CheckPills
        label="Wardrobe Type"
        options={WARDROBE_TYPE}
        value={data.wardrobeType}
        onChange={(v) => patch({ wardrobeType: v })}
      />
      <RadioPills
        label="Wardrobe Height"
        options={WARDROBE_HEIGHT}
        value={data.wardrobeHeight}
        onChange={(v) => patch({ wardrobeHeight: v })}
      />
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        <TInput
          label="Width"
          value={data.wardrobeWidth}
          onChange={(v) => patch({ wardrobeWidth: v })}
          placeholder="ft"
        />
        <TInput
          label="Depth"
          value={data.wardrobeDepth}
          onChange={(v) => patch({ wardrobeDepth: v })}
          placeholder="ft"
        />
        <TInput
          label="Loft Height"
          value={data.wardrobeLoftHeight}
          onChange={(v) => patch({ wardrobeLoftHeight: v })}
          placeholder="ft"
        />
      </div>

      <SecTitle>Wardrobe Internal Layout</SecTitle>
      <CheckPills
        options={INTERNAL_LAYOUT}
        value={data.internalLayout}
        onChange={(v) => patch({ internalLayout: v })}
      />

      <SecTitle>Shutter Finish</SecTitle>
      <CheckPills
        options={SHUTTER_FINISH_BED}
        value={data.shutterFinish}
        onChange={(v) => patch({ shutterFinish: v })}
      />

      <SecTitle>Hardware Level</SecTitle>
      <RadioPills
        options={HARDWARE_LEVELS_BED}
        value={data.hardwareLevel}
        onChange={(v) => patch({ hardwareLevel: v })}
      />

      <SecTitle>Other Carpentry</SecTitle>
      <CheckPills
        options={OTHER_CARPENTRY}
        value={data.otherCarpentry}
        onChange={(v) => patch({ otherCarpentry: v })}
      />

      <HR />
      <SecTitle>Electrical</SecTitle>
      <CheckPills
        label="Light Categories"
        options={LIGHTS}
        value={data.lights}
        onChange={(v) => patch({ lights: v })}
      />
      <CheckPills
        label="Air Conditioning Type"
        options={AC_TYPES}
        value={data.acType}
        onChange={(v) => patch({ acType: v })}
      />

      <HR />
      <SecTitle>Washroom</SecTitle>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mb-3">
        <TInput
          label="Length"
          value={data.washroomLength}
          onChange={(v) => patch({ washroomLength: v })}
          placeholder="ft"
        />
        <TInput
          label="Width"
          value={data.washroomWidth}
          onChange={(v) => patch({ washroomWidth: v })}
          placeholder="ft"
        />
        <TInput
          label="Ceiling Height"
          value={data.washroomCeilingHeight}
          onChange={(v) => patch({ washroomCeilingHeight: v })}
          placeholder="ft"
        />
        <TInput
          label="Window Sill Level"
          value={data.washroomWindowSillLevel}
          onChange={(v) => patch({ washroomWindowSillLevel: v })}
          placeholder="mm"
        />
        <TInput
          label="Lintel Level"
          value={data.washroomLintelLevel}
          onChange={(v) => patch({ washroomLintelLevel: v })}
          placeholder="mm"
        />
      </div>
      <CheckPills
        label="Civil Works"
        options={WASHROOM_CIVIL}
        value={data.washroomCivil}
        onChange={(v) => patch({ washroomCivil: v })}
      />
      <CheckPills
        label="Wall Coverings"
        options={WASHROOM_WALL}
        value={data.washroomWallCoverings}
        onChange={(v) => patch({ washroomWallCoverings: v })}
      />
      <CheckPills
        label="Floor Coverings"
        options={WASHROOM_FLOOR}
        value={data.washroomFloorCoverings}
        onChange={(v) => patch({ washroomFloorCoverings: v })}
      />
      <CheckPills
        label="Basin Type"
        options={BASIN_TYPE}
        value={data.washroomBasinType}
        onChange={(v) => patch({ washroomBasinType: v })}
      />
      <CheckPills
        label="Shower Type"
        options={SHOWER_TYPE}
        value={data.washroomShowerType}
        onChange={(v) => patch({ washroomShowerType: v })}
      />
      <CheckPills
        label="Electrical"
        options={WASHROOM_ELEC}
        value={data.washroomElectrical}
        onChange={(v) => patch({ washroomElectrical: v })}
      />
    </div>
  );
}

function BedroomsTab({
  data,
  onChange,
}: {
  data: BedroomScope[];
  onChange: (d: BedroomScope[]) => void;
}) {
  const [activeBed, setActiveBed] = useState(0);

  function updateBedroom(index: number, updated: BedroomScope) {
    const next = [...data];
    next[index] = updated;
    onChange(next);
  }

  return (
    <div>
      {/* Bedroom sub-tab switcher */}
      <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1 flex-wrap">
        {data.map((bed, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveBed(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
              activeBed === i
                ? "bg-teal-500/20 text-teal-300 border-teal-500/40"
                : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white"
            }`}
          >
            {bed.name || `Bedroom ${i + 1}`}
          </button>
        ))}
      </div>

      <SingleBedroomTab
        data={data[activeBed]}
        onChange={(updated) => updateBedroom(activeBed, updated)}
      />
    </div>
  );
}

// ── Tab definitions ──────────────────────────────────────────────────────────

const TABS = [
  { key: "projectInfo", label: "Project Info", short: "Info" },
  { key: "scope", label: "Scope & Deliverables", short: "Scope" },
  { key: "living", label: "Living Room", short: "Living" },
  { key: "dining", label: "Dining Area", short: "Dining" },
  { key: "kitchen", label: "Kitchen", short: "Kitchen" },
  { key: "bedrooms", label: "Bedrooms & Washrooms", short: "Bedrooms" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

// ── Main Modal ────────────────────────────────────────────────────────────────

export function ScopeSheetModal({
  visit,
  onClose,
  onSaved,
}: {
  visit: SiteVisit;
  onClose: () => void;
  onSaved: (sheet: ScopeSheet) => void;
}) {
  const [sheet, setSheet] = useState<ScopeSheet>(() =>
    visit.scopeSheet ? { ...EMPTY_SCOPE, ...visit.scopeSheet } : { ...EMPTY_SCOPE }
  );
  const [tab, setTab] = useState<TabKey>("projectInfo");
  const [saving, setSaving] = useState(false);

  function update(patch: Partial<ScopeSheet>) {
    setSheet((prev) => ({ ...prev, ...patch }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.updateScopeSheet(
        visit.id,
        sheet as unknown as Record<string, unknown>
      );
      onSaved(sheet);
      onClose();
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const filled = !!visit.scopeSheet;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-3">
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="relative bg-slate-900 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full shadow-2xl flex flex-col"
        style={{ maxWidth: 900, maxHeight: "95vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-800 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                Ultimate Scope Sheet
              </h2>
              {filled && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-400 border border-teal-500/30">
                  FILLED
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              JK Interiors — Site Survey & Scope Documentation
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition p-1.5 rounded-lg hover:bg-slate-800"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Tab navigation */}
        <div className="flex overflow-x-auto border-b border-slate-800 flex-shrink-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`flex-shrink-0 px-3 sm:px-4 py-2.5 sm:py-3 text-xs font-semibold transition border-b-2 whitespace-nowrap ${
                tab === t.key
                  ? "text-teal-400 border-teal-400 bg-teal-500/5"
                  : "text-slate-400 border-transparent hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <span className="sm:hidden">{t.short}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Scrollable tab content */}
        <div className="overflow-y-auto flex-1 px-3 sm:px-6 py-4 sm:py-5">
          {tab === "projectInfo" && (
            <ProjectInfoTab data={sheet} onChange={update} />
          )}
          {tab === "scope" && <ScopeTab data={sheet} onChange={update} />}
          {tab === "living" && (
            <LivingRoomTab
              data={sheet.livingRoom}
              onChange={(v) => update({ livingRoom: v })}
            />
          )}
          {tab === "dining" && (
            <DiningAreaTab
              data={sheet.diningArea}
              onChange={(v) => update({ diningArea: v })}
            />
          )}
          {tab === "kitchen" && (
            <KitchenTab
              data={sheet.kitchen}
              onChange={(v) => update({ kitchen: v })}
            />
          )}
          {tab === "bedrooms" && (
            <BedroomsTab
              data={sheet.bedrooms}
              onChange={(v) => update({ bedrooms: v })}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-800 flex-shrink-0 bg-slate-900/80">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition text-sm shadow-lg shadow-teal-900/30"
          >
            {saving ? "Saving…" : "Save Scope Sheet"}
          </button>
        </div>
      </div>
    </div>
  );
}
