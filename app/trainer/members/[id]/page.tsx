'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Pagination } from '@/components/admin/DataTable';
import ProgressView from '@/components/progress/ProgressView';
import { trainerApi, AssignedMemberProfile, CheckIn, ApiError } from '@/lib/api';
import {
  Card,
  Detail,
  ErrorNote,
  FreezeHistory,
  MembershipBadge,
  PlanHistory,
  formatDate,
} from '@/components/portal/membership';


export default function TrainerMemberPage() {
  const { id } = useParams<{ id: string }>();
  const memberId = Number(id);
  const [member, setMember] = useState<AssignedMemberProfile | null>(null);
  const [attendance, setAttendance] = useState<CheckIn[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalVisits, setTotalVisits] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    trainerApi
      .member(memberId)
      .then(setMember)
      .catch((err) =>
        setError(
          err instanceof ApiError && err.status === 404
            ? 'This member is not assigned to you.'
            : err instanceof Error
              ? err.message
              : 'Failed to load',
        ),
      );
  }, [memberId]);

  useEffect(() => {
    let cancelled = false;
    trainerApi
      .memberAttendance(memberId, page, 15)
      .then((res) => {
        if (cancelled) return;
        setAttendance(res.data);
        setTotalPages(Math.max(1, res.totalPages));
        setTotalVisits(res.total);
      })
      .catch(() => {
        if (!cancelled) setAttendance([]);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId, page]);

  if (error) {
    return (
      <div className="space-y-4">
        <Link href="/trainer" className="text-white/60 hover:text-white text-sm">
          ← My members
        </Link>
        <ErrorNote message={error} />
      </div>
    );
  }

  if (!member) {
    return <div className="h-40 bg-surface-dark rounded-xl border border-surface-dark-lighter animate-pulse" />;
  }


  return (
    <div className="space-y-6">
      <Link href="/trainer" className="text-white/60 hover:text-white text-sm">
        ← My members
      </Link>

      <div className="flex items-center gap-4">
        <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary overflow-hidden">
          {member.profileImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.profileImageUrl} alt="" className="size-full object-cover" />
          ) : (
            <span className="material-symbols-outlined text-3xl">person</span>
          )}
        </div>
        <div>
          <h1 className="text-white text-2xl font-bold">{member.fullName}</h1>
          <div className="mt-1 flex items-center gap-2">
            <MembershipBadge m={member} />
            <span className="text-white/60 text-sm">{member.plan ?? 'No plan'}</span>
          </div>
        </div>
      </div>

      <Card title="Membership">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Detail label="Days left" value={member.daysRemaining} />
          <Detail label="Started" value={formatDate(member.startDate)} />
          <Detail label="Ends" value={formatDate(member.endDate)} />
          <Detail
            label="Visits"
            value={member.visitsAllowed ? `${member.visitsUsed} / ${member.visitsAllowed}` : member.visitsUsed}
          />
          {member.isFrozen && (
            <Detail
              label="Frozen"
              value={`${formatDate(member.frozenStartDate)} → ${formatDate(member.frozenUntilDate)}`}
            />
          )}
          <Detail label="Gender" value={member.gender} />
          <Detail label="Age" value={member.age} />
          <Detail label="Height" value={member.height} />
        </div>
        {(member.goals || member.objective) && (
          <div className="mt-6 grid md:grid-cols-2 gap-6">
            {member.objective && <Detail label="Objective" value={member.objective} />}
            {member.goals && <Detail label="Goals" value={member.goals} />}
          </div>
        )}
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title={`Attendance (${totalVisits})`}>
          {attendance.length === 0 ? (
            <p className="text-white/40 text-sm">No check-ins yet.</p>
          ) : (
            <ul className="divide-y divide-surface-dark-lighter">
              {attendance.map((a) => (
                <li key={a.id} className="py-2 text-white">
                  {formatDate(a.date, true)}
                </li>
              ))}
            </ul>
          )}
          {totalPages > 1 && (
            <div className="mt-4">
              <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          )}
        </Card>

        <Card title="Progress">
          <ProgressView memberId={memberId} />
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card title="Freezes">
          <FreezeHistory rows={member.freezeHistory} />
        </Card>
        <Card title="Plan history">
          <PlanHistory rows={member.planHistory} />
        </Card>
      </div>
    </div>
  );
}
