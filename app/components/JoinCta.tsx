import Link from "next/link";
import { PHONE_DISPLAY, PHONE_E164 } from "@/lib/site";

/** Closing call to action: a framed photo with the headline and join button. */
export function JoinCta({
  title = "Your first session starts here",
  body = "Register online in a minute and we’ll call you to finish signing up. Or just walk in.",
}: {
  title?: string;
  body?: string;
}) {
  return (
    <section className="bg-mist p-2 md:p-3" style={{ fontFamily: "var(--font-sans-v2)" }}>
      <div className="relative overflow-hidden rounded-[1.25rem] bg-night text-white md:rounded-[1.5rem]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/page-hero.jpg" alt="" className="photo absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-night via-night/70 to-transparent" />
        <div className="relative grid gap-10 px-6 py-16 md:grid-cols-12 md:items-end md:px-12 md:py-24">
          <div className="md:col-span-7">
            <p className="mono text-lime">Start today</p>
            <h2 className="mt-4 text-4xl leading-[1.05] font-light tracking-tight md:text-6xl">{title}</h2>
          </div>
          <div className="md:col-span-5">
            <p className="mono max-w-sm text-white/65">{body}</p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:gap-3">
              <Link href="/register" className="cta cta-lg justify-center gap-2 px-2.5 text-[0.88rem] whitespace-nowrap sm:gap-3 sm:px-[1.6rem] sm:text-[1.02rem]">
                Join now
              </Link>
              <a
                href={`tel:${PHONE_E164}`}
                className="cta cta-lg cta-ghost justify-center gap-2 px-2.5 text-[0.88rem] whitespace-nowrap sm:gap-3 sm:px-[1.6rem] sm:text-[1.02rem]"
              >
                {PHONE_DISPLAY}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
