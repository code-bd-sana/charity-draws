import { HowItWorksStep } from "../../types/how-it-works.types";

/**
 * Step content lists for 'I Want to Enter Draws' (entrants)
 */
export const entrantSteps: HowItWorksStep[] = [
  {
    id: "entrant-step-1",
    stepNumber: 1,
    title: "Create a Free Account",
    description: "Sign up in under 60 seconds — no card required. Just an email and password and you're ready to browse.",
  },
  {
    id: "entrant-step-2",
    stepNumber: 2,
    title: "Browse Live Draws",
    description: "Explore the competitions. Filter by your favourite host, category, price, or closing time to find the draw that's right for you.",
  },
  {
    id: "entrant-step-3",
    stepNumber: 3,
    title: "Select Your Tickets",
    description: "Choose your quantity, use quick-select buttons for 5, 10, or 25 tickets.",
  },
  {
    id: "entrant-step-4",
    stepNumber: 4,
    title: "Complete Secure Payment",
    description: "Pay safely via Visa, Mastercard. All payments are encrypted and processed through our 3DS payment platform.",
  },
  {
    id: "entrant-step-5",
    stepNumber: 5,
    title: "Await the Draw Result",
    description: "Once the draw closes, the winner is selected live on Charity Draws Instagram. You'll be notified by email instantly if you win.",
  },
];

/**
 * Step content lists for 'We Are a Registered Charity' (Charities hosting draws)
 */
export const charitySteps: HowItWorksStep[] = [
  {
    id: "charity-step-1",
    stepNumber: 1,
    title: "Register Registered Charity Account",
    description: "Create your verified charity account with your official Charity Commission, OSCR, or CCNI registration number.",
  },
  {
    id: "charity-step-2",
    stepNumber: 2,
    title: "Complete Charity Profile",
    description: "Add your official brand, logo, mission statement, and cause description. A verified profile builds instant trust with supporters.",
  },
  {
    id: "charity-step-3",
    stepNumber: 3,
    title: "Choose Charity Plan",
    description: "Select our dedicated charity plan with zero setup barriers and tailored commission rates maximizing your fundraising return.",
  },
  {
    id: "charity-step-4",
    stepNumber: 4,
    title: "Submit Competition for Admin Review",
    description: "Fill in the draw details: prize, ticket price, total tickets, and closing date. Our UK compliance team reviews and verifies within 24h.",
  },
  {
    id: "charity-step-5",
    stepNumber: 5,
    title: "Go Live on the Public Board",
    description: "Once approved, your charity draw is published to the public competition board and visible to thousands of eager entrants nationwide.",
  },
  {
    id: "charity-step-6",
    stepNumber: 6,
    title: "Live Draw & Guaranteed Payout",
    description: "Charity Draws conducts the draw live via compliant RNG. Winner details are processed securely and your net fundraising proceeds are paid out the next working day.",
  },
];

/**
 * Step content lists for 'I Am a Promoter' (Promoters running draws in Host A Draw group)
 */
export const promoterSteps: HowItWorksStep[] = [
  {
    id: "promoter-step-1",
    stepNumber: 1,
    title: "Register as an Official Promoter",
    description: "Create your promoter account to host compliant prize competitions supporting registered UK charities.",
  },
  {
    id: "promoter-step-2",
    stepNumber: 2,
    title: "Nominate Beneficiary Charity",
    description: "Partner with an existing registered charity from our directory or nominate your chosen registered good cause.",
  },
  {
    id: "promoter-step-3",
    stepNumber: 3,
    title: "Set Up Prize & Competition Details",
    description: "Define your prize, ticket quantity, pricing, and draw date. All ticket funds are held in secure escrow protection.",
  },
  {
    id: "promoter-step-4",
    stepNumber: 4,
    title: "Fast Compliance Review",
    description: "Our legal and admin team reviews your draw structure to ensure full UK Gambling Act 2005 regulatory compliance within 24 hours.",
  },
  {
    id: "promoter-step-5",
    stepNumber: 5,
    title: "Launch & Drive Ticket Sales",
    description: "Promote your live draw across your website and social channels while tracking ticket volume in real time from your dashboard.",
  },
  {
    id: "promoter-step-6",
    stepNumber: 6,
    title: "Live Draw & Streamlined Distribution",
    description: "Charity Draws conducts the live stream random draw. The winner receives the prize and agreed charity donations are disbursed transparently.",
  },
];

// Alias for backwards compatibility
export const hostSteps = charitySteps;
