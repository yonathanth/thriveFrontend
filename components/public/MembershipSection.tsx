'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { membershipPeriods, membershipTypes } from '@/lib/public/memberships';
import { formatBirr } from '@/lib/public/pricing';

export default function MembershipSection() {
  const [membershipType, setMembershipType] = useState<keyof typeof membershipTypes>('standard');
  const selectedMembership = membershipTypes[membershipType];
  return (
<section id="memberships" className="tm-plans tm-plans-direct" aria-label="Gym memberships">
          <div className="landing-container">
            <div className="tm-membership-selector" role="group" aria-label="Membership access type">{(Object.keys(membershipTypes) as Array<keyof typeof membershipTypes>).map((type) => <button type="button" key={type} aria-pressed={membershipType === type} aria-controls="membership-options" onClick={() => setMembershipType(type)}>{membershipTypes[type].label}</button>)}</div>
            <div className="tm-membership-explainer" aria-live="polite"><p>{selectedMembership.description}</p></div>
            <div id="membership-options" className="tm-plan-grid">
              {membershipPeriods.map((plan) => <article key={plan.name} className="tm-plan">
                <h3>{plan.name}</h3>
                <div className="tm-plan-amount"><strong key={`${membershipType}-${plan.months}`}>{formatBirr(plan.prices[membershipType])}</strong><span>birr <span>/ {plan.description}</span></span></div>
                <div className="tm-plan-details">
                  <ul className="tm-plan-features">
                    <li>{selectedMembership.access}</li>
                    <li>Free weights & strength machines</li>
                    <li>Cardio & conditioning equipment</li>
                    <li>Space for your own routine</li>
                  </ul>
                  <dl className="tm-plan-terms"><div><dt>Duration</dt><dd>{plan.description}</dd></div><div><dt>Access</dt><dd>{membershipType === 'standard' ? 'Any time, every day' : 'Designated off-peak hours'}</dd></div></dl>
                </div>
                <Link href={`/join?offering=gym&access=${membershipType}&period=${plan.months}`} className="tm-plan-action" aria-label={`Choose ${plan.name.toLowerCase()} ${selectedMembership.label.toLowerCase()} membership`}>Choose plan<ArrowUpRight size={18} aria-hidden="true" /></Link>
              </article>)}
            </div>
            <p className="tm-plan-help">Need a hand choosing? <a href="tel:+251913814546">Call 091 381 4546<ArrowUpRight size={14} aria-hidden="true" /></a></p>
          </div>
        </section>
  );
}

