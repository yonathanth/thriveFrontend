import type { ReactNode } from "react";

/**
 * The opening block of an inner page: label, headline and a short intro on white.
 * Only the home page opens with a full photo hero.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="frame px-5 pt-32 pb-10 md:px-10 md:pt-36 md:pb-12">
      <p className="mono flex items-center gap-2.5 text-night/60">
        <span aria-hidden className="h-2.5 w-2.5 bg-lime" />
        {eyebrow}
      </p>
      <div className="mt-5 grid gap-5 border-b border-night/12 pb-8 md:grid-cols-12 md:items-end md:pb-10">
        <h1 className="text-[2.2rem] leading-[1.05] font-light tracking-[-0.03em] sm:text-[2.75rem] md:col-span-8 lg:text-[3.6rem]">
          {title}
        </h1>
        {intro && (
          <p className="mono max-w-sm !text-[0.8rem] text-night/60 md:col-span-4 md:justify-self-end">{intro}</p>
        )}
      </div>
      {children}
    </section>
  );
}
