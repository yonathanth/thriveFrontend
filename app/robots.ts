import type { MetadataRoute } from "next";
import { SITE_BASE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin/", "/member/", "/trainer/", "/login", "/change-password", "/forgot-password", "/api/"] },
    sitemap: `${SITE_BASE_URL}/sitemap.xml`,
  };
}
