"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A row of cards with one card centred and highlighted at a time; its neighbours sit
 * smaller and dimmed on either side. When every card fits, they sit as a
 * centred group and the arrows hide. Otherwise the row scrolls sideways, the current
 * card snaps to the middle, and the arrows step one card at a time. Each card must
 * carry `data-card`.
 */
export function Carousel({
  children,
  tone = "light",
  startIndex = 0,
}: {
  children: ReactNode;
  tone?: "light" | "dark";
  /** The card shown in the centre first. */
  startIndex?: number;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [overflows, setOverflows] = useState(false);
  const [edgePad, setEdgePad] = useState(0);
  const [index, setIndex] = useState(startIndex);
  const started = useRef(false);
  const [count, setCount] = useState(0);

  const cards = useCallback(
    () => Array.from(track.current?.querySelectorAll<HTMLElement>("[data-card]") ?? []),
    [],
  );

  // Measure: does the row overflow, and how much side padding centres the end cards.
  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => {
      const list = cards();
      setCount(list.length);
      const first = list[0];
      const gap = 16;
      const content = list.reduce((w, c) => w + c.offsetWidth, 0) + gap * Math.max(0, list.length - 1);
      const over = content > el.clientWidth - 40;
      setOverflows(over);
      setEdgePad(over && first ? Math.max(20, (el.clientWidth - first.offsetWidth) / 2) : 0);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [cards]);

  // Open on the start card, centred, once the row has been measured.
  useEffect(() => {
    const el = track.current;
    if (!el || !overflows || started.current) return;
    const card = cards()[Math.min(startIndex, cards().length - 1)];
    if (!card) return;
    started.current = true;
    // The resulting scroll event sets the index (see below).
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "instant" });
  }, [overflows, edgePad, startIndex, cards]);

  // Keep the index in step with the card nearest the middle while the user swipes.
  useEffect(() => {
    const el = track.current;
    if (!el || !overflows) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const mid = el.scrollLeft + el.clientWidth / 2;
        let best = 0;
        let bestDist = Infinity;
        cards().forEach((c, i) => {
          const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
          if (d < bestDist) {
            bestDist = d;
            best = i;
          }
        });
        setIndex(best);
      });
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      el.removeEventListener("scroll", onScroll);
    };
  }, [overflows, cards]);

  // Mark the centred card so CSS can highlight it and dim the rest.
  useEffect(() => {
    cards().forEach((c, i) => {
      if (overflows && i === index) c.setAttribute("data-active", "");
      else c.removeAttribute("data-active");
    });
  }, [index, overflows, count, cards]);

  // A tap on a dimmed side card brings it to the centre instead of following its link.
  const onClickCapture = (e: React.MouseEvent) => {
    if (!overflows) return;
    const card = (e.target as HTMLElement).closest<HTMLElement>("[data-card]");
    if (!card || card.hasAttribute("data-active")) return;
    const i = cards().indexOf(card);
    if (i === -1) return;
    e.preventDefault();
    e.stopPropagation();
    goTo(i);
  };

  const goTo = (i: number) => {
    const el = track.current;
    const card = cards()[i];
    if (!el || !card) return;
    el.scrollTo({ left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2, behavior: "smooth" });
    setIndex(i);
  };

  const arrow =
    tone === "dark"
      ? "bg-white text-night hover:bg-lime disabled:bg-white/20 disabled:text-white/40"
      : "bg-night text-white hover:bg-lime hover:text-night disabled:bg-night/15 disabled:text-night/35";

  return (
    <div>
      <div
        ref={track}
        data-lenis-prevent-horizontal
        onClickCapture={onClickCapture}
        className={`no-scrollbar relative overflow-x-auto ${
          overflows
            ? "carousel-focus snap-x snap-mandatory py-4 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
            : ""
        }`}
      >
        <div
          className={`flex gap-4 ${overflows ? "w-max [&>[data-card]]:snap-center" : "mx-auto w-max px-5 md:px-10"}`}
          style={overflows ? { paddingInline: edgePad } : undefined}
        >
          {children}
        </div>
      </div>

      {overflows && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => goTo(Math.max(0, index - 1))}
            disabled={index === 0}
            aria-label="Previous"
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:cursor-default ${arrow}`}
          >
            <span className="material-symbols-outlined text-[22px]">chevron_left</span>
          </button>
          <span className={`mono w-14 text-center ${tone === "dark" ? "text-white/50" : "text-night/50"}`}>
            {index + 1} / {count}
          </span>
          <button
            type="button"
            onClick={() => goTo(Math.min(count - 1, index + 1))}
            disabled={index >= count - 1}
            aria-label="Next"
            className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors disabled:cursor-default ${arrow}`}
          >
            <span className="material-symbols-outlined text-[22px]">chevron_right</span>
          </button>
        </div>
      )}
    </div>
  );
}
