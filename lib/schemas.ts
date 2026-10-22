/**
 * JSON-LD structured data (schema.org) for search engines. Everything here is built
 * from lib/site.ts and synced data; no ratings or reviews are claimed that the gym
 * does not have.
 */
import type { CatalogPlan } from "@/lib/catalog";
import { formatPeriod } from "@/lib/catalog";
import {
  ADDRESS_SCHEMA,
  CURRENCY,
  GEO,
  GOOGLE_MAPS_URL,
  OPENING_HOURS_SCHEMA,
  PHONE_E164,
  SITE_BASE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SOCIAL_LINKS,
} from "@/lib/site";

const address = {
  "@type": "PostalAddress",
  streetAddress: ADDRESS_SCHEMA.streetAddress,
  addressLocality: ADDRESS_SCHEMA.addressLocality,
  addressCountry: ADDRESS_SCHEMA.addressCountry,
};

/** The business itself. */
export const organizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_BASE_URL}/#organization`,
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_BASE_URL,
  logo: `${SITE_BASE_URL}/logo.png`,
  image: `${SITE_BASE_URL}/og-image.png`,
  sameAs: SOCIAL_LINKS.map((s) => s.href),
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: PHONE_E164,
    areaServed: "ET",
  },
  address,
});

/** The gym as a place: location, hours, phone. */
export const localBusinessSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  "@id": `${SITE_BASE_URL}/#gym`,
  name: SITE_NAME,
  image: `${SITE_BASE_URL}/og-image.png`,
  logo: `${SITE_BASE_URL}/logo.png`,
  description: SITE_DESCRIPTION,
  url: SITE_BASE_URL,
  telephone: PHONE_E164,
  hasMap: GOOGLE_MAPS_URL,
  address,
  geo: {
    "@type": "GeoCoordinates",
    latitude: GEO.latitude,
    longitude: GEO.longitude,
  },
  openingHoursSpecification: OPENING_HOURS_SCHEMA.map((h) => ({
    "@type": "OpeningHoursSpecification",
    dayOfWeek: Array.isArray(h.dayOfWeek) ? [...h.dayOfWeek] : h.dayOfWeek,
    opens: h.opens,
    closes: h.closes,
  })),
  currenciesAccepted: CURRENCY,
  sameAs: SOCIAL_LINKS.map((s) => s.href),
});

/** Navigation path. */
export const breadcrumbSchema = (items: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

/** Questions and answers. */
export const faqSchema = (faqs: Array<{ question: string; answer: string }>) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
});

/** The membership price list, from the synced plans. */
export const offerCatalogSchema = (plans: CatalogPlan[]) => ({
  "@context": "https://schema.org",
  "@type": "OfferCatalog",
  name: `${SITE_NAME} memberships`,
  url: `${SITE_BASE_URL}/services`,
  itemListElement: plans.map((p) => ({
    "@type": "Offer",
    name: `${p.name} (${formatPeriod(p.periodDays)})`,
    ...(p.description ? { description: p.description } : {}),
    price: p.price.toFixed(2),
    priceCurrency: CURRENCY,
    url: `${SITE_BASE_URL}/register?plan=${p.id}`,
    seller: { "@id": `${SITE_BASE_URL}/#gym` },
  })),
});
