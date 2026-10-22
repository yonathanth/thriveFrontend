import type { Metadata } from "next";
import { shareMeta } from "@/lib/seo";
import { SchemaComponent } from "@/lib/schema-component";
import { breadcrumbSchema, faqSchema } from "@/lib/schemas";
import { faqContent } from "@/lib/faq-content";
import { BUSINESS_AREA, SITE_BASE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: `FAQ | ${SITE_NAME} | Memberships, payments, hours`,
  description: `Answers about ${SITE_NAME} in ${BUSINESS_AREA}: opening hours, location, memberships, payments and trainers.`,
  ...shareMeta({
    title: `FAQ | ${SITE_NAME}`,
    description: "Memberships, payments, trainers and opening hours.",
    path: "/faq",
  }),
  alternates: { canonical: `${SITE_BASE_URL}/faq` },
};

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const faqSchemaData = faqSchema(
    faqContent.map((f) => ({ question: f.question, answer: f.answer }))
  );

  return (
    <>
      <SchemaComponent
        schema={breadcrumbSchema([
          { name: "Home", url: SITE_BASE_URL },
          { name: "FAQ", url: `${SITE_BASE_URL}/faq` },
        ])}
      />
      <SchemaComponent schema={faqSchemaData} />
      {children}
    </>
  );
}
