"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { PHONE_DISPLAY, PHONE_E164, SITE_NAME } from "@/lib/site";
import Icon from '@/components/ui/Icon';

const navItems = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Membership" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

/** One floating bar: name, links, phone, join. Near-solid dark so it reads on any photo. */
export function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setOpen(false), 0);
    return () => clearTimeout(id);
  }, [pathname]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    // The header box spans the page and includes the hidden mobile menu, so it must not
    // catch taps itself; only the bar, and the menu while open, take pointer events.
    <header
      className="pointer-events-none fixed inset-x-0 top-4 z-50 px-4 md:top-6"
      style={{ fontFamily: "var(--font-sans-v2)" }}
    >
      <nav
        className="nav-bar pointer-events-auto mx-auto flex h-[3.5rem] w-full max-w-[64rem] items-center justify-between gap-2 py-1.5 pr-1.5 pl-2"
        aria-label="Main"
      >
        <Link
          href="/"
          className="flex shrink-0 items-center rounded-[0.75rem] px-3 py-1"
          aria-label={`${SITE_NAME} home`}
        >
          {/* The nav uses the "Thrive" wordmark; the full logo is in the footer and icons. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/thrive-logo.png" alt={SITE_NAME} width={67} height={24} className="h-6 w-auto object-contain" />
        </Link>

        <div className="hidden items-center gap-0.5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`mono rounded-[0.6rem] px-3.5 py-2 !text-[0.76rem] transition-colors ${isActive(item.href) ? "bg-white/15 text-white" : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex h-full shrink-0 items-center gap-1.5">
          <a
            href={`tel:${PHONE_E164}`}
            className="hidden h-full items-center gap-2 rounded-[0.75rem] px-3 text-[0.9rem] text-white transition-colors hover:bg-white/10 xl:flex"
          >
            <Icon name="call" className="text-[18px] text-lime" />
            {PHONE_DISPLAY}
          </a>
          <Link
            href="/login"
            className="hidden h-full items-center rounded-[0.75rem] px-3 text-[0.9rem] text-white transition-colors hover:bg-white/10 sm:flex"
          >
            Sign in
          </Link>
          <Link href="/register" className="cta hidden h-full px-5 text-[0.9rem] sm:inline-flex">
            Join now
          </Link>
          <button
            type="button"
            className="flex h-full w-11 items-center justify-center rounded-[0.75rem] text-white hover:bg-white/10 lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} className="text-[24px]" />
          </button>
        </div>
      </nav>

      {/* Mobile and tablet menu */}
      <div
        className={`nav-bar mx-auto mt-2 w-full max-w-[64rem] origin-top p-2 text-white transition-all duration-200 lg:hidden ${open ? "pointer-events-auto scale-100 opacity-100" : "pointer-events-none scale-95 opacity-0"
          }`}
      >
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`mono flex items-center justify-between rounded-[0.75rem] px-4 py-4 !text-[0.82rem] ${isActive(item.href) ? "bg-white/15 text-white" : "text-white/90"
              }`}
          >
            {item.label}
            <span className="text-white/40">→</span>
          </Link>
        ))}
        <Link
          href="/login"
          onClick={() => setOpen(false)}
          className="flex items-center justify-between rounded-[0.75rem] px-4 py-3 text-white/90"
        >
          Member sign in
          <span className="text-white/40">→</span>
        </Link>
        <div className="mt-2 grid grid-cols-2 gap-2 p-1">
          <a href={`tel:${PHONE_E164}`} className="cta cta-ghost justify-center py-3 after:hidden">
            <span className="flex flex-col items-center leading-tight">
              <span className="mono text-white/60">Call</span>
              <span className="whitespace-nowrap">{PHONE_DISPLAY}</span>
            </span>
          </a>
          <Link href="/register" onClick={() => setOpen(false)} className="cta justify-center py-3.5">
            Join now
          </Link>
        </div>
      </div>
    </header>
  );
}
