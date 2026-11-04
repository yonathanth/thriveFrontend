'use client';

import ProgressView from '@/components/progress/ProgressView';

export default function MemberProgressPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-white text-2xl font-bold">My progress</h1>
        <p className="text-white/60 mt-1">Your measurements over time, your goals and your photos.</p>
      </div>
      <ProgressView memberId="me" />
    </div>
  );
}
