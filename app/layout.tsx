import type { Metadata, Viewport } from "next";
import { shareMeta } from "@/lib/seo";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { MultipleSchemaComponent } from "@/lib/schema-component";
import { organizationSchema, localBusinessSchema } from "@/lib/schemas";
import { BUSINESS_AREA, SITE_BASE_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

// Landing design: light grotesk for headlines and copy, mono for small labels.
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_BASE_URL),
  title: {
    default: `${SITE_NAME} | Gym in ${BUSINESS_AREA}`,
    template: `%s`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    SITE_NAME,
    "gym Ayat Noah",
    "gym Meskelegna",
    "gym Addis Ababa",
    "fitness Addis Ababa",
    "gym membership",
  ],
  robots: "index, follow",
  authors: [{ name: SITE_NAME }],
  ...shareMeta({ title: `${SITE_NAME} | Train without limits`, description: SITE_DESCRIPTION }),
  alternates: {
    canonical: SITE_BASE_URL,
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon/favicon.ico?v=thrive-design" },
      { url: "/favicon/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/favicon/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#f5f4ee",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${geist.variable} ${geistMono.variable}`}
    >
      <head>
        {/* Material Symbols Font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
        {/* JSON-LD Structured Data */}
        <MultipleSchemaComponent
          schemas={[organizationSchema(), localBusinessSchema()]}
        />
      </head>
      <body
        className={`bg-background text-on-background overflow-x-hidden antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
