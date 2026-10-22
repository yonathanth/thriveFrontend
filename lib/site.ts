/**
 * Everything about the gym the public pages show, in one place. Change the name,
 * domain, contact details or hours here and every page, the footer, SEO tags and
 * structured data follow.
 */

export const SITE_NAME = "Thrive Gym";
/** Short form for tight spots (nav on small screens, PWA name). */
export const SITE_SHORT_NAME = "Thrive";
// TODO: domain not decided yet.
export const SITE_BASE_URL = "https://thrivegym.com";

export const SITE_TAGLINE = "Train like a hybrid. Built for strength, made for everyone.";
export const SITE_DESCRIPTION =
  "Thrive Health & Fitness in Addis Ababa: gym memberships, strength training, martial arts and personal coaching, open 24/7.";

export const BUSINESS_LOCATION_LINE =
  "Cheers meskelegna / Ayat Noah";
export const BUSINESS_AREA = "Ayat Noah, Addis Ababa";
export const BUSINESS_CITY = "Addis Ababa";

export const GEO = { latitude: 9.010670927637438, longitude: 38.87770681154753 } as const;
export const GOOGLE_MAPS_URL =
  "https://maps.google.com/?cid=2794173722916044271";
export const GOOGLE_MAPS_DIRECTIONS_URL =
  "https://www.google.com/maps/dir/?api=1&destination=Thrive+Health+%26+Fitness%2C+Cheers+meskelegna%2C+Ayat+Noah%2C+Addis+Ababa";
/** Google Maps embed of the Thrive Gym listing itself (pin and name), not just coordinates. */
export const GOOGLE_MAPS_EMBED_URL =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3693.721137117307!2d38.87770681154753!3d9.010670927637438!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b9b356c51b3d5%3A0x26c6e63263243def!2sThrive%20Health%20%26%20Fitness!5e0!3m2!1sen!2set!4v1792592141508!5m2!1sen!2set";

export const PHONE_DISPLAY = "091 381 4546";
export const PHONE_E164 = "+251913814546";

/** Only networks with a real link are shown anywhere on the site. */
export const SOCIAL_LINKS: ReadonlyArray<{ label: string; href: string; icon: string }> = [
  { label: "TikTok", href: "https://www.tiktok.com/@thrive.gym", icon: "music_note" },
];

// Public hours carried over from thrive design.
/** Rows as shown on the site, in order. */
export const OPENING_HOURS: ReadonlyArray<{ days: string; hours: string }> = [
  { days: "Every day", hours: "24 hours" },
];
export const OPENING_HOURS_SUMMARY = "Open 24 hours, every day";
export const CLOSING_TIME_SHORT = "Open 24/7";

export const OPENING_HOURS_SCHEMA = [
  {
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    opens: "00:00",
    closes: "23:59",
  },
] as const;

export const ADDRESS_SCHEMA = {
  streetAddress: BUSINESS_LOCATION_LINE,
  addressLocality: BUSINESS_CITY,
  addressCountry: "ET",
} as const;

export const CURRENCY = "ETB";
