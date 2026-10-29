/**
 * FAQ content, shared by the FAQ page, the services page and their FAQPage JSON-LD.
 *
 * TODO: placeholder answers. Confirm each with the gym (payment methods, freezing,
 * registration fee, parking) before launch.
 */
import {
  BUSINESS_CITY,
  BUSINESS_LOCATION_LINE,
  OPENING_HOURS,
  PHONE_DISPLAY,
  SITE_NAME,
} from "@/lib/site";

export type FaqCategory = "membership" | "trainers" | "payments" | "timings";

export interface FaqItem {
  id: number;
  category: FaqCategory;
  question: string;
  answer: string;
}

const hours = OPENING_HOURS.map((h) => `${h.days}: ${h.hours}`).join("; ");

export const faqContent: readonly FaqItem[] = [
  {
    id: 1,
    category: "timings",
    question: "What are your opening hours?",
    answer: `${SITE_NAME} is open ${hours}.`,
  },
  {
    id: 2,
    category: "timings",
    question: "Where are you located?",
    answer: `We're at ${BUSINESS_LOCATION_LINE}, ${BUSINESS_CITY}. Tap "Get Directions" on the contact page to open it in Google Maps.`,
  },
  {
    id: 3,
    category: "membership",
    question: "How do I join?",
    answer: `Pick a package on the prices page and press Join now. You can pay online with Telebirr, CBE Birr or your bank, or leave your details and pay at the front desk. You can also call ${PHONE_DISPLAY} or just come in.`,
  },
  {
    id: 4,
    category: "membership",
    question: "Can I freeze my membership?",
    answer:
      "Yes, memberships can be frozen for a set period. Speak to the front desk to arrange a freeze.",
  },
  {
    id: 5,
    category: "membership",
    question: "Can I switch plans later?",
    answer:
      "Yes. You can change to a different plan. Visit the front desk or call us to update your membership.",
  },
  {
    id: 6,
    category: "payments",
    question: "What payment methods do you accept?",
    answer:
      "Cash and bank transfer are accepted. The front desk can tell you the available options.",
  },
  {
    id: 7,
    category: "payments",
    question: "Are there any extra fees?",
    answer:
      "The plan price is what you pay. Ask the front desk about any one-time registration fee.",
  },
  {
    id: 8,
    category: "trainers",
    question: "Do you offer personal training?",
    answer:
      "Our staff are on the floor to help with technique and programmes. Ask at the front desk about personal training.",
  },
  {
    id: 9,
    category: "trainers",
    question: "I'm a beginner. Is that okay?",
    answer:
      "Absolutely. Everyone starts somewhere. Our staff will show you around and help you get started safely.",
  },
];

/** The short list shown under the prices on the services page. */
export const servicesFaq: readonly FaqItem[] = faqContent.filter((f) => [4, 5, 7].includes(f.id));
