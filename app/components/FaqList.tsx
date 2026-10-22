import type { FaqItem } from "@/lib/faq-content";

/** Questions as an open list with hairlines; native <details>, so it works without JavaScript. */
export function FaqList({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="border-t border-night/12">
      {items.map((f, i) => (
        <details key={f.id} className="group border-b border-night/12">
          <summary className="flex cursor-pointer list-none items-start gap-5 py-6 [&::-webkit-details-marker]:hidden">
            <span className="mono w-8 shrink-0 pt-1.5 text-night/40">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-xl font-light tracking-tight md:text-2xl">{f.question}</span>
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-night text-white transition-transform group-open:rotate-45 group-open:bg-lime group-open:text-night">
              <span className="material-symbols-outlined text-[20px]">add</span>
            </span>
          </summary>
          <p className="pb-7 pl-13 text-night/65 md:max-w-2xl">{f.answer}</p>
        </details>
      ))}
    </div>
  );
}
