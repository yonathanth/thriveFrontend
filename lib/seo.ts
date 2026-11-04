/**
 * Share (Open Graph) settings for a page. Next replaces the whole openGraph object
 * when a page sets its own, so every page builds it here and none loses the image.
 */
import type { Metadata } from "next";
import { SITE_BASE_URL, SITE_NAME } from "@/lib/site";

export const SHARE_IMAGE = {
  url: "/og-image.png",
  type: "image/png",
  width: 1200,
  height: 630,
  alt: `${SITE_NAME} logo`,
};

export function shareMeta({
  title,
  description,
  path = "",
}: {
  title: string;
  description: string;
  path?: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  return {
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_US",
      url: `${SITE_BASE_URL}${path}`,
      title,
      description,
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}
