import Link from "next/link";
import { formatPeriod, formatPrice, titleCase, type CatalogPlan } from "@/lib/catalog";
import { CURRENCY } from "@/lib/site";

/** One membership plan as a dark card. Used in the home carousel and the membership page. */
export function PlanCard({ plan, className = "" }: { plan: CatalogPlan; className?: string }) {
  const extras: string[] = [];
  if (plan.groupSize && plan.groupSize > 1) extras.push(`For ${plan.groupSize} people`);
  if (plan.maxUsageCount) extras.push(`${plan.maxUsageCount} visits included`);
  const benefits = [...(plan.benefits ?? []), ...extras];

  return (
    <article className={`flex flex-col rounded-[1.25rem] bg-night-2 p-6 text-white ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <p className="mono text-white/45">{titleCase(plan.category)}</p>
        <p className="mono shrink-0 text-lime">{formatPeriod(plan.periodDays)}</p>
      </div>
      <h3 className="mt-8 text-2xl leading-tight font-light tracking-tight">{plan.name}</h3>
      <p className="mt-2 text-4xl font-light tracking-tight">{formatPrice(plan.price, CURRENCY)}</p>

      {benefits.length > 0 && (
        <ul className="mt-5 space-y-2">
          {benefits.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-[0.92rem] text-white/75">
              <span aria-hidden className="mt-[0.45rem] h-1.5 w-1.5 shrink-0 bg-lime" />
              {b}
            </li>
          ))}
        </ul>
      )}
      {plan.description && <p className="mono mt-4 normal-case text-white/50">{plan.description}</p>}

      <div className="mt-auto pt-6">
        <Link href={`/register?plan=${plan.id}`} className="cta w-full justify-center py-3.5">
          Choose plan
        </Link>
      </div>
    </article>
  );
}
