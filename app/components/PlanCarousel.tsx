import type { CatalogPlan } from "@/lib/catalog";
import { Carousel } from "./Carousel";
import { PlanCard } from "./PlanCard";

/**
 * Lays a list out from the centre: the first item in the middle, the next ones
 * alternating right and left, so the featured plan opens centred with plans on both sides.
 */
function centreOut<T>(items: T[]): { list: T[]; start: number } {
  const left: T[] = [];
  const right: T[] = [];
  items.slice(1).forEach((item, i) => (i % 2 === 0 ? right : left).push(item));
  return { list: [...left.reverse(), ...items.slice(0, 1), ...right], start: left.length };
}

/** Membership plans as a centred carousel; the first plan given is the featured one. */
export function PlanCarousel({ plans }: { plans: CatalogPlan[] }) {
  const { list, start } = centreOut(plans);
  return (
    <Carousel startIndex={start}>
      {list.map((p) => (
        <div key={p.id} data-card className="flex w-[78vw] max-w-[22rem] shrink-0 sm:w-[20rem]">
          <PlanCard plan={p} className="w-full" />
        </div>
      ))}
    </Carousel>
  );
}
