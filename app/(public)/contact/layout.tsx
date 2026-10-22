import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { SchemaComponent } from "@/lib/schema-component";
import { breadcrumbSchema } from "@/lib/schemas";
import { BUSINESS_AREA, BUSINESS_LOCATION_LINE, SITE_BASE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `Contact | ${SITE_NAME} | ${BUSINESS_AREA}`,
  description: `Call, message or visit ${SITE_NAME} at ${BUSINESS_LOCATION_LINE}, Addis Ababa. Opening hours and directions.`,
  ...shareMeta({
    title: `Contact | ${SITE_NAME}`,
    description: `Visit us at ${BUSINESS_LOCATION_LINE}.`,
    path: "/contact",
  }),
  alternates: { canonical: `${SITE_BASE_URL}/contact` },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SchemaComponent
        schema={breadcrumbSchema([
          { name: "Home", url: SITE_BASE_URL },
          { name: "Contact", url: `${SITE_BASE_URL}/contact` },
        ])}
      />
      {children}
    </>
  );
}
