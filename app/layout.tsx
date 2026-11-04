import type { Metadata, Viewport } from "next";
import { shareMeta } from "@/lib/seo";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { MultipleSchemaComponent } from "@/lib/schema-component";
import { organizationSchema, localBusinessSchema, websiteSchema } from "@/lib/schemas";
import { BUSINESS_AREA, SITE_ALTERNATE_NAMES, SITE_BASE_URL, SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import Icon from '@/components/ui/Icon';

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
    ...SITE_ALTERNATE_NAMES,
    "gym in Ayat",
    "gym Ayat Noah",
    "gym Meskelegna",
    "gym in Addis Ababa",
    "fitness Addis Ababa",
    "24/7 gym Addis Ababa",
    "Muay Thai Addis Ababa",
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
        {/* JSON-LD Structured Data */}
        <MultipleSchemaComponent
          schemas={[websiteSchema(), organizationSchema(), localBusinessSchema()]}
        />
      </head>
      <body
        className={`bg-background text-on-background overflow-x-hidden antialiased`}
      >
        {/* One sign-in state for the whole site, so moving between areas never re-checks it. */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
