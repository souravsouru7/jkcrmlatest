// Questions copied from the client's consultation form. Shared by the public form page
// and the lead detail view so both show the same questions in the same order.

export type ConsultationQuestion = {
  id: string;
  label: string;
  type: "text" | "paragraph" | "radio" | "checkbox";
  options?: string[];
  other?: boolean;
  required?: boolean;
};

export type ConsultationAnswers = Record<string, string | string[]>;

export type ConsultationSubmission = {
  submittedAt: string;
  answers: ConsultationAnswers;
};

// Fixed public link (the Android app runs on https://localhost, so window.location can't be used).
export const CONSULTATION_URL = `${process.env.NEXT_PUBLIC_SITE_URL || "https://jkcrm.site"}/consultation/`;

export const CONSULTATION_TITLE = "Client Interior Design Consultation Form";

export const CONSULTATION_DESCRIPTION = "Thank you for choosing our studio.\nThis form helps us understand your preferred interior style, functional needs, budget expectations, and project timeline. Based on your responses, we will recommend the best design solution tailored to your lifestyle and investment range.";

export const CONSULTATION_QUESTIONS: ConsultationQuestion[] = [
  {
    id: "name",
    label: "1. Full Name",
    type: "text",
    required: true
  },
  {
    id: "phone",
    label: "2. Phone Number",
    type: "text",
    required: true
  },
  {
    id: "email",
    label: "3. Email Address",
    type: "text"
  },
  {
    id: "location",
    label: "4. Project Location",
    type: "text"
  },
  {
    id: "propertyType",
    label: "5. Type of Property",
    type: "checkbox",
    options: [
      "Apartment",
      "Independent House",
      "Villa",
      "Duplex",
      "Commercial Space",
      "Office",
      "Retail Store"
    ],
    other: true
  },
  {
    id: "spaces",
    label: "6. Which spaces need interior design?",
    type: "checkbox",
    options: [
      "Living Room",
      "Kitchen",
      "Master Bedroom",
      "Children’s Bedroom",
      "Guest Bedroom",
      "Dining Area",
      "TV Unit",
      "Wardrobes",
      "Bathroom",
      "Balcony",
      "Home office",
      "Complete Home",
      "Commercial Interior"
    ],
    other: true
  },
  {
    id: "style",
    label: "7. What interior style do you prefer?",
    type: "checkbox",
    options: [
      "Modern",
      "Minimalist",
      "Luxury Contemporary",
      "Scandinavian",
      "Classic",
      "Neo-Classical",
      "Industrial",
      "Japandi",
      "Traditional Indian",
      "Bohemian",
      "Not Sure (Need Guidance)"
    ],
    other: true
  },
  {
    id: "atmosphere",
    label: "8. What type of atmosphere do you want in your interiors?",
    type: "checkbox",
    options: [
      "Warm & Cozy",
      "Elegant & Luxurious",
      "Clean & Minimal",
      "Functional & Practical",
      "Premium Hotel-Like Feel",
      "Natural & Earthy",
      "Bright & Airy",
      "Dark & Moody"
    ],
    other: true
  },
  {
    id: "colorPalette",
    label: "9. Preferred Color Palette",
    type: "checkbox",
    options: [
      "Neutral Tones",
      "White & Beige",
      "Earthy Browns",
      "Black & Grey",
      "Pastel Colors",
      "Wooden Finish",
      "Bold & Vibrant",
      "Matte Finish",
      "Glossy Finish"
    ],
    other: true
  },
  {
    id: "budgetComfort",
    label: "10. Are you comfortable proceeding with the selected budget tier?",
    type: "radio",
    options: [
      "Yes, I am comfortable",
      "Maybe, depending on final quotation",
      "I would like to reduce the budget",
      "I would like premium upgrades"
    ]
  },
  {
    id: "styleSatisfaction",
    label: "11. Are you satisfied with the selected interior style/theme?",
    type: "radio",
    options: [
      "Yes, finalized",
      "Need design suggestions",
      "Want multiple concepts before finalizing"
    ]
  },
  {
    id: "budget",
    label: "12. What is your approximate project budget?",
    type: "radio",
    options: [
      "Below ₹3 Lakhs",
      "₹3L – ₹5L",
      "₹5L – ₹8L",
      "₹8L – ₹12L",
      "₹12L – ₹20L",
      "₹20L+"
    ],
    other: true
  },
  {
    id: "materialFinish",
    label: "13. Preferred Material Finish",
    type: "checkbox",
    options: [
      "Matte Laminate",
      "Gloss Laminate",
      "Acrylic Finish",
      "Veneer Finish",
      "PU Paint Finish",
      "Glass Finish",
      "Fluted Panels",
      "Stone Finish"
    ],
    other: true
  },
  {
    id: "kitchenType",
    label: "14. Preferred Kitchen Type",
    type: "checkbox",
    options: [
      "Open Kitchen",
      "Closed Kitchen",
      "Modern Modular Kitchen",
      "Luxury Kitchen",
      "Compact Functional Kitchen"
    ]
  },
  {
    id: "wardrobeType",
    label: "15. Preferred Wardrobe Type",
    type: "checkbox",
    options: [
      "Sliding Wardrobe",
      "Hinged Wardrobe",
      "Walk-in Wardrobe",
      "Glass Wardrobe",
      "Minimal Wardrobe"
    ],
    other: true
  },
  {
    id: "startTime",
    label: "16. When would you like to start the project?",
    type: "radio",
    options: [
      "Immediately (Within 1–2 Weeks)",
      "Within 1 Month",
      "Within 2–3 Months",
      "After 3 Months",
      "Just Exploring for Now"
    ]
  },
  {
    id: "completionTimeline",
    label: "17. Expected Project Completion Timeline",
    type: "radio",
    options: [
      "1 Month",
      "2 Months",
      "3 Months",
      "4–6 Months",
      "Flexible Timeline"
    ]
  },
  {
    id: "services",
    label: "18. Do you require the following services?",
    type: "checkbox",
    options: [
      "2D Planning",
      "3D Visualization",
      "Turnkey Execution",
      "False Ceiling Design",
      "Lighting Design",
      "Custom Furniture",
      "Smart Home Features",
      "Space Saving Solutions"
    ]
  },
  {
    id: "notes",
    label: "19. Additional Notes / Requirements",
    type: "paragraph"
  }
];
