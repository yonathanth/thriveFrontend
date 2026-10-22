import Link from "next/link";
import {
  BUSINESS_CITY,
  BUSINESS_LOCATION_LINE,
  GOOGLE_MAPS_URL,
  OPENING_HOURS,
  PHONE_DISPLAY,
  PHONE_E164,
  SITE_NAME,
  SITE_TAGLINE,
  SOCIAL_LINKS,
} from "@/lib/site";

const footerLinks = [
  { href: "/services", label: "Membership" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
  { href: "/register", label: "Register" },
];

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-night text-white" style={{ fontFamily: "var(--font-sans-v2)" }}>
      <div className="frame px-5 pt-20 pb-8 md:px-10">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt={SITE_NAME} width={140} height={81} className="h-20 w-auto object-contain" />
            <p className="mono mt-4 max-w-xs text-white/45">{SITE_TAGLINE}</p>
          </div>

          <div className="md:col-span-2">
            <p className="mono text-lime">Pages</p>
            <ul className="mt-4 space-y-2">
              {footerLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-white/70 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="mono text-lime">Visit</p>
            <div className="mt-4 space-y-2 text-white/70">
              <a href={GOOGLE_MAPS_URL} target="_blank" rel="noopener noreferrer" className="block hover:text-white">
                {BUSINESS_LOCATION_LINE}, {BUSINESS_CITY}
              </a>
              {OPENING_HOURS.map((h) => (
                <p key={h.days}>
                  {h.days}, {h.hours}
                </p>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="mono text-lime">Contact</p>
            <div className="mt-4 space-y-2">
              <a href={`tel:${PHONE_E164}`} className="block text-white/70 hover:text-white">
                {PHONE_DISPLAY}
              </a>
              {SOCIAL_LINKS.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-white/70 hover:text-white"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mono mt-20 flex flex-col gap-3 border-t border-white/10 pt-6 text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {SITE_NAME}
          </p>
          <Link href="/admin/login" className="hover:text-white">
            Staff login ■
          </Link>
        </div>
      </div>
    </footer>
  );
}
