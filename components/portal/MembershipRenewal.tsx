import { CreditCard } from 'lucide-react';

export default function MembershipRenewal() {
  return (
    <div className="mt-6 border-t border-white/10 pt-5">
      <p className="text-sm text-orange-300">Your membership has ended.</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" disabled aria-describedby="renewal-help" className="inline-flex h-10 items-center gap-2 bg-primary px-5 opacity-70">
          <CreditCard size={17} aria-hidden="true" />Pay now
        </button>
        <p id="renewal-help" className="text-xs leading-relaxed text-white/60">Online payments coming soon. Visit the front desk to renew for now.</p>
      </div>
    </div>
  );
}
