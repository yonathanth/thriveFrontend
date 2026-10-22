"use client";

import { useEffect, useMemo, useState } from "react";
import { DAY_NAMES, formatTime, type CatalogClass } from "@/lib/catalog";

/** 1 = Monday ... 7 = Sunday, as the gym sees it (Addis Ababa time). */
function todayInAddis(): number {
  const name = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Africa/Addis_Ababa" }).format(
    new Date(),
  );
  const i = DAY_NAMES.indexOf(name as (typeof DAY_NAMES)[number]);
  return i === -1 ? 1 : i + 1;
}

/** The weekly class timetable from the desktop app's main schedule, one day at a time. */
export function ClassTimetable({ classes, tone = "dark" }: { classes: CatalogClass[]; tone?: "light" | "dark" }) {
  const daysWithClasses = useMemo(() => new Set(classes.map((c) => c.dayOfWeek)), [classes]);
  // Monday for the server render, then today once in the browser.
  const [day, setDay] = useState(1);

  useEffect(() => {
    const today = todayInAddis();
    const first = [...daysWithClasses].sort()[0] ?? today;
    const id = setTimeout(() => setDay(daysWithClasses.has(today) ? today : first), 0);
    return () => clearTimeout(id);
  }, [daysWithClasses]);

  const items = classes.filter((c) => c.dayOfWeek === day);
  const dark = tone === "dark";
  const line = dark ? "border-white/10" : "border-night/10";
  const dim = dark ? "text-white/45" : "text-night/50";

  return (
    <div style={{ fontFamily: "var(--font-sans-v2)" }}>
      <div className={`no-scrollbar flex overflow-x-auto border-b ${line}`} role="tablist" aria-label="Day">
        {DAY_NAMES.map((name, i) => {
          const n = i + 1;
          const active = n === day;
          const has = daysWithClasses.has(n);
          return (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setDay(n)}
              className={`mono relative flex shrink-0 flex-1 items-center justify-center gap-1.5 px-3 py-4 transition-colors ${
                active
                  ? dark
                    ? "text-white"
                    : "text-night"
                  : dark
                    ? "text-white/45 hover:text-white"
                    : "text-night/50 hover:text-night"
              }`}
            >
              {has && <span aria-hidden className="h-1 w-1 bg-lime" />}
              {name.slice(0, 3)}
              {active && <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-lime" />}
            </button>
          );
        })}
      </div>

      <ul role="tabpanel">
        {items.length === 0 ? (
          <li className={`mono py-10 text-center ${dim}`}>
            No classes on {DAY_NAMES[day - 1]}. The floor is open as usual
          </li>
        ) : (
          items.map((c) => (
            <li
              key={c.id}
              className={`grid grid-cols-[6.5rem_1fr] items-baseline gap-4 border-b py-5 sm:grid-cols-[9rem_1fr_auto] ${line}`}
            >
              <span className="mono tabular-nums">
                {formatTime(c.startTime)}
                <span className={`block ${dim}`}>– {formatTime(c.endTime)}</span>
              </span>
              <span className="text-xl font-light tracking-tight md:text-2xl">{c.title}</span>
              <span className={`mono col-start-2 sm:col-start-auto sm:text-right ${dim}`}>
                {[c.trainer, c.room].filter(Boolean).join(" · ") || " "}
              </span>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
