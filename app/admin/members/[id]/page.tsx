'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  membersApi,
  attendanceApi,
  transactionsApi,
  healthMetricsApi,
  Member,
  Attendance,
  Transaction,
  HealthMetric,
  MemberDetails,
  PaginatedResponse,
} from '@/lib/api';
import { formatDesktopDate, humanize, num, str } from '@/lib/desktop';
import SmsSendModal from '@/components/admin/SmsSendModal';
import { useAuth } from '@/contexts/AuthContext';
import FinanceFromTag from '@/components/admin/FinanceFromTag';

interface Props {
  params: Promise<{ id: string }>;
}

export default function MemberDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();
  const [member, setMember] = useState<Member | null>(null);
  const [attendance, setAttendance] = useState<PaginatedResponse<Attendance> | null>(null);
  const [transactions, setTransactions] = useState<PaginatedResponse<Transaction> | null>(null);
  const [healthMetrics, setHealthMetrics] = useState<PaginatedResponse<HealthMetric> | null>(null);
  const [details, setDetails] = useState<MemberDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'attendance' | 'transactions' | 'health'>('overview');
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchMemberData() {
      try {
        setIsLoading(true);
        const memberId = parseInt(id);
        const [memberData, attendanceData, transactionsData, healthMetricsData, detailsData] = await Promise.all([
          membersApi.getOne(memberId),
          attendanceApi.getByMember(memberId, { limit: 10 }),
          // Payments are admin-only; managers skip them.
          isAdmin ? transactionsApi.getByMember(memberId, { limit: 10 }) : Promise.resolve(null),
          healthMetricsApi.getByMember(memberId, { limit: 10 }),
          // The page still works without these extras, e.g. against an older API.
          membersApi.getDetails(memberId).catch((err) => {
            console.error('Failed to fetch member details:', err);
            return null;
          }),
        ]);
        setMember(memberData);
        setAttendance(attendanceData);
        setTransactions(transactionsData);
        setHealthMetrics(healthMetricsData);
        setDetails(detailsData);
      } catch (err) {
        console.error('Failed to fetch member:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMemberData();
  }, [id, isAdmin]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
      frozen: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      expired: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border capitalize ${
          styles[status] || styles.inactive
        }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-surface-dark-lighter rounded w-48 animate-pulse" />
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="size-20 rounded-full bg-surface-dark-lighter" />
            <div className="space-y-2">
              <div className="h-6 bg-surface-dark-lighter rounded w-48" />
              <div className="h-4 bg-surface-dark-lighter rounded w-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-4xl text-white/40 mb-2">
          person_off
        </span>
        <p className="text-white/60">Member not found</p>
        <Link
          href="/admin/members"
          className="mt-4 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Back to Members
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
      >
        <span className="material-symbols-outlined">arrow_back</span>
        <span>Back to Members</span>
      </button>

      {/* Member Header */}
      <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="size-20 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-4xl">person</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h1 className="text-white text-2xl font-bold">{member.fullName}</h1>
              {getStatusBadge(member.status)}
            </div>
            <p className="text-white/40 mt-1">Member ID: {member.memberId}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-dark-lighter">
        <nav className="flex gap-6">
          {(['overview', 'history', 'attendance', 'transactions', 'health'] as const)
            .filter((tab) => tab !== 'transactions' || isAdmin)
            .map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'text-primary border-primary'
                  : 'text-white/60 border-transparent hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Contact Info */}
          <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">contact_phone</span>
              Contact Information
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="material-symbols-outlined text-white/40">phone</span>
                  <div>
                    <p className="text-white/40 text-xs">Phone</p>
                    <p className="text-white">{member.phone || '-'}</p>
                  </div>
                </div>
                {member.phone && (
                  <button
                    onClick={() => setIsSmsModalOpen(true)}
                    className="px-3 py-1.5 bg-primary text-black rounded-lg hover:bg-primary/90 text-sm font-medium flex items-center gap-2"
                    title="Send SMS"
                  >
                    <span className="material-symbols-outlined text-sm">sms</span>
                    Send SMS
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">email</span>
                <div>
                  <p className="text-white/40 text-xs">Email</p>
                  <p className="text-white">{member.email || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">emergency</span>
                <div>
                  <p className="text-white/40 text-xs">Emergency Contact</p>
                  <p className="text-white">{member.emergencyContact || '-'}</p>
                </div>
              </div>
              {member.telegramUsername && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/40">send</span>
                  <div>
                    <p className="text-white/40 text-xs">Telegram</p>
                    <p className="text-white">{member.telegramUsername}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Information */}
          {(member.age || member.height || member.gender || member.bloodType || member.objective) && (
            <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">person</span>
                Profile Information
              </h2>
              <div className="space-y-4">
                {member.age && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/40">cake</span>
                    <div>
                      <p className="text-white/40 text-xs">Age</p>
                      <p className="text-white">{member.age}</p>
                    </div>
                  </div>
                )}
                {member.height && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/40">height</span>
                    <div>
                      <p className="text-white/40 text-xs">Height</p>
                      <p className="text-white">{member.height}</p>
                    </div>
                  </div>
                )}
                {member.gender && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/40">wc</span>
                    <div>
                      <p className="text-white/40 text-xs">Gender</p>
                      <p className="text-white">{member.gender}</p>
                    </div>
                  </div>
                )}
                {member.bloodType && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/40">bloodtype</span>
                    <div>
                      <p className="text-white/40 text-xs">Blood Type</p>
                      <p className="text-white">{member.bloodType}</p>
                    </div>
                  </div>
                )}
                {member.objective && (
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/40">target</span>
                    <div>
                      <p className="text-white/40 text-xs">Objective</p>
                      <p className="text-white">{member.objective}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Membership Info */}
          <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
            <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">card_membership</span>
              Membership Details
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">category</span>
                <div>
                  <p className="text-white/40 text-xs">Service Type</p>
                  <p className="text-white">{member.serviceType || '-'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">event</span>
                <div>
                  <p className="text-white/40 text-xs">Start Date</p>
                  <p className="text-white">
                    {member.startDate ? formatDate(member.startDate) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">event_busy</span>
                <div>
                  <p className="text-white/40 text-xs">End Date</p>
                  <p className="text-white">
                    {member.endDate ? formatDate(member.endDate) : '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-white/40">calendar_today</span>
                <div>
                  <p className="text-white/40 text-xs">Registered</p>
                  <p className="text-white">{formatDate(member.registrationDate)}</p>
                </div>
              </div>
              {details?.trainer && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/40">sports</span>
                  <div>
                    <p className="text-white/40 text-xs">Trainer</p>
                    <p className="text-white">{details.trainer.fullName}</p>
                  </div>
                </div>
              )}
              {details?.group && (
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-white/40">groups</span>
                  <div>
                    <p className="text-white/40 text-xs">Group</p>
                    <p className="text-white">
                      {details.group.name}
                      {details.group.joinedAt && (
                        <span className="text-white/40 text-sm"> • since {formatDesktopDate(details.group.joinedAt)}</span>
                      )}
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Linked members */}
          {details && details.relations.length > 0 && (
            <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">family_restroom</span>
                Linked Members
              </h2>
              <div className="space-y-3">
                {details.relations.map((r, i) => (
                  <div key={i} className="flex items-center justify-between">
                    {r.member ? (
                      <Link href={`/admin/members/${r.member.id}`} className="text-white hover:text-primary">
                        {r.member.fullName}
                      </Link>
                    ) : (
                      <span className="text-white/40">Member not synced</span>
                    )}
                    <span className="text-white/60 text-sm">
                      {humanize(r.relation)}
                      {r.note ? ` • ${r.note}` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {member.notes && (
            <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 lg:col-span-2">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">notes</span>
                Notes
              </h2>
              <p className="text-white/80">{member.notes}</p>
            </div>
          )}

          {/* Remark */}
          {member.remark && (
            <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-6 lg:col-span-2">
              <h2 className="text-white font-semibold mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">comment</span>
                Remark
              </h2>
              <p className="text-white/80">{member.remark}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          {!details ? (
            <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter p-8 text-center text-white/40">
              History is not available yet. It appears once the desktop app has synced with this version of the website.
            </div>
          ) : (
            <>
              {/* Add-ons */}
              <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
                <div className="p-4 border-b border-surface-dark-lighter">
                  <h2 className="text-white font-semibold">Add-ons</h2>
                  <p className="text-white/40 text-sm">{details.addons.length} subscriptions</p>
                </div>
                {details.addons.length === 0 ? (
                  <div className="p-8 text-center text-white/40">No add-ons</div>
                ) : (
                  <div className="divide-y divide-surface-dark-lighter">
                    {details.addons.map((a) => {
                      const status = num(a.frozen) ? 'frozen' : str(a.status) ?? '-';
                      return (
                        <div key={a.id} className="p-4 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-white">
                              {a.addonName ?? 'Add-on'}
                              {a.variantName && <span className="text-white/40"> • {a.variantName}</span>}
                            </p>
                            <p className="text-white/40 text-sm">
                              {formatDesktopDate(a.start_date)} – {formatDesktopDate(a.end_date)}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium capitalize bg-white/5 text-white/70">
                              {status}
                            </span>
                            {num(a.price_paid) != null && (
                              <p className="text-white/60 text-sm mt-1">{formatCurrency(num(a.price_paid) ?? 0)}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Membership periods */}
              <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
                <div className="p-4 border-b border-surface-dark-lighter">
                  <h2 className="text-white font-semibold">Membership Periods</h2>
                  <p className="text-white/40 text-sm">{details.planHistory.length} periods</p>
                </div>
                {details.planHistory.length === 0 ? (
                  <div className="p-8 text-center text-white/40">No periods recorded</div>
                ) : (
                  <div className="divide-y divide-surface-dark-lighter">
                    {details.planHistory.map((p) => (
                      <div key={p.id} className="p-4 flex items-center justify-between">
                        <p className="text-white">{str(p.service_name) ?? 'Membership'}</p>
                        <p className="text-white/60 text-sm">
                          {formatDesktopDate(p.start_date)} – {formatDesktopDate(p.end_date)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Freezes */}
              <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
                <div className="p-4 border-b border-surface-dark-lighter">
                  <h2 className="text-white font-semibold">Freezes</h2>
                  <p className="text-white/40 text-sm">{details.freezeHistory.length} freezes</p>
                </div>
                {details.freezeHistory.length === 0 ? (
                  <div className="p-8 text-center text-white/40">Never frozen</div>
                ) : (
                  <div className="divide-y divide-surface-dark-lighter">
                    {details.freezeHistory.map((f) => (
                      <div key={f.id} className="p-4 flex items-center justify-between gap-4">
                        <div>
                          <p className="text-white">
                            {str(f.plan_name) ?? humanize(f.kind)}
                            <span className="text-white/40 text-sm"> • {humanize(f.kind)}</span>
                          </p>
                          {str(f.reason) && <p className="text-white/40 text-sm">{str(f.reason)}</p>}
                        </div>
                        <p className="text-white/60 text-sm text-right">
                          {formatDesktopDate(f.start_date)} –{' '}
                          {f.ended_at
                            ? formatDesktopDate(f.ended_at)
                            : f.planned_until
                              ? `until ${formatDesktopDate(f.planned_until)}`
                              : 'ongoing'}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Drop-ins */}
              {details.dropIns.length > 0 && (
                <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
                  <div className="p-4 border-b border-surface-dark-lighter">
                    <h2 className="text-white font-semibold">Drop-in Visits</h2>
                    <p className="text-white/40 text-sm">{details.dropIns.length} visits</p>
                  </div>
                  <div className="divide-y divide-surface-dark-lighter">
                    {details.dropIns.map((d) => (
                      <div key={d.id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-white">
                            {d.serviceName ?? 'Drop-in'}
                            {(num(d.quantity) ?? 1) > 1 && <span className="text-white/40"> × {num(d.quantity)}</span>}
                          </p>
                          <p className="text-white/40 text-sm">
                            {formatDesktopDate(d.usage_date)}
                            {str(d.trainer_name) ? ` • ${str(d.trainer_name)}` : ''}
                          </p>
                        </div>
                        <span className="text-white/80">{formatCurrency(num(d.total_amount) ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          <div className="p-4 border-b border-surface-dark-lighter">
            <h2 className="text-white font-semibold">Recent Check-ins</h2>
            <p className="text-white/40 text-sm">
              {attendance?.meta.total || 0} total records
            </p>
          </div>
          <div className="divide-y divide-surface-dark-lighter">
            {attendance?.data.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">
                  event_busy
                </span>
                No attendance records
              </div>
            ) : (
              attendance?.data.map((record) => (
                <div
                  key={record.id}
                  className="p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                      <span className="material-symbols-outlined">login</span>
                    </div>
                    <div>
                      <p className="text-white">
                        {new Date(record.date).toLocaleDateString('en-GB', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p className="text-white/40 text-sm">
                        Check-in:{' '}
                        {new Date(record.date).toLocaleTimeString('en-GB', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {record.updatedAt &&
                          ` • Check-out: ${new Date(record.updatedAt).toLocaleTimeString(
                            'en-GB',
                            { hour: '2-digit', minute: '2-digit' }
                          )}`}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'transactions' && isAdmin && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          <div className="p-4 border-b border-surface-dark-lighter">
            <h2 className="text-white font-semibold">Transaction History</h2>
            <FinanceFromTag />
            <p className="text-white/40 text-sm">
              {transactions?.meta.total || 0} total transactions
            </p>
          </div>
          <div className="divide-y divide-surface-dark-lighter">
            {transactions?.data.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">
                  receipt_long
                </span>
                No transactions
              </div>
            ) : (
              transactions?.data.map((transaction) => {
                const isInflow =
                  transaction.type === 'income' || transaction.type === 'positive_return';
                const typeLabel =
                  transaction.type === 'positive_return'
                    ? 'Positive Return'
                    : transaction.type === 'negative_return'
                      ? 'Negative Return'
                      : transaction.type === 'income'
                        ? 'Income'
                        : 'Expense';
                return (
                  <div
                    key={transaction.id}
                    className="p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center ${
                          isInflow ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                        }`}
                      >
                        <span className="material-symbols-outlined">
                          {isInflow ? 'arrow_downward' : 'arrow_upward'}
                        </span>
                      </div>
                      <div>
                        <p className="text-white">
                          {transaction.description || transaction.category}
                        </p>
                        <p className="text-white/40 text-sm">
                          {typeLabel} • {formatDate(transaction.transactionDate)} •{' '}
                          {transaction.paymentMethod || 'N/A'}
                          {transaction.discountAmount
                            ? ` • ${formatCurrency(transaction.discountAmount)} off${
                                transaction.discountCode ? ` (${transaction.discountCode})` : ''
                              }`
                            : ''}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`font-semibold ${
                        isInflow ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isInflow ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'health' && (
        <div className="bg-surface-dark rounded-xl border border-surface-dark-lighter overflow-hidden">
          <div className="p-4 border-b border-surface-dark-lighter">
            <h2 className="text-white font-semibold">Health Metrics History</h2>
            <p className="text-white/40 text-sm">
              {healthMetrics?.meta.total || 0} total records
            </p>
          </div>
          <div className="divide-y divide-surface-dark-lighter">
            {healthMetrics?.data.length === 0 ? (
              <div className="p-8 text-center text-white/40">
                <span className="material-symbols-outlined text-4xl mb-2 block opacity-50">
                  monitoring
                </span>
                No health metrics recorded
              </div>
            ) : (
              healthMetrics?.data.map((metric) => {
                const hasMetrics = [
                  metric.weight,
                  metric.bmi,
                  metric.bodyFatPercent,
                  metric.muscleMass,
                  metric.leanBodyMass,
                  metric.boneMass,
                  metric.skeletalMuscleMass,
                  metric.visceralFat,
                  metric.subcutaneousFatPercent,
                  metric.proteinPercent,
                  metric.bmr,
                  metric.bodyAge,
                  metric.heartRate,
                ].some(v => v !== null && v !== undefined);

                return (
                  <div
                    key={metric.id}
                    className="p-6 border-b border-surface-dark-lighter last:border-b-0"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-white font-medium">
                          {new Date(metric.measuredAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                          {new Date(metric.measuredAt).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    {hasMetrics && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {metric.weight !== null && metric.weight !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Weight</p>
                            <p className="text-white font-semibold">{metric.weight.toFixed(1)} kg</p>
                          </div>
                        )}
                        {metric.bmi !== null && metric.bmi !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">BMI</p>
                            <p className="text-white font-semibold">{metric.bmi.toFixed(1)}</p>
                          </div>
                        )}
                        {metric.bodyFatPercent !== null && metric.bodyFatPercent !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Body Fat</p>
                            <p className="text-white font-semibold">{metric.bodyFatPercent.toFixed(1)}%</p>
                          </div>
                        )}
                        {metric.muscleMass !== null && metric.muscleMass !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Muscle Mass</p>
                            <p className="text-white font-semibold">{metric.muscleMass.toFixed(1)} kg</p>
                          </div>
                        )}
                        {metric.leanBodyMass !== null && metric.leanBodyMass !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Lean Body Mass</p>
                            <p className="text-white font-semibold">{metric.leanBodyMass.toFixed(1)} kg</p>
                          </div>
                        )}
                        {metric.boneMass !== null && metric.boneMass !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Bone Mass</p>
                            <p className="text-white font-semibold">{metric.boneMass.toFixed(1)} kg</p>
                          </div>
                        )}
                        {metric.skeletalMuscleMass !== null && metric.skeletalMuscleMass !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Skeletal Muscle</p>
                            <p className="text-white font-semibold">{metric.skeletalMuscleMass.toFixed(1)} kg</p>
                          </div>
                        )}
                        {metric.visceralFat !== null && metric.visceralFat !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Visceral Fat</p>
                            <p className="text-white font-semibold">{metric.visceralFat}</p>
                          </div>
                        )}
                        {metric.subcutaneousFatPercent !== null && metric.subcutaneousFatPercent !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Subcutaneous Fat</p>
                            <p className="text-white font-semibold">{metric.subcutaneousFatPercent.toFixed(1)}%</p>
                          </div>
                        )}
                        {metric.proteinPercent !== null && metric.proteinPercent !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Protein</p>
                            <p className="text-white font-semibold">{metric.proteinPercent.toFixed(1)}%</p>
                          </div>
                        )}
                        {metric.bmr !== null && metric.bmr !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">BMR</p>
                            <p className="text-white font-semibold">{metric.bmr} kcal</p>
                          </div>
                        )}
                        {metric.bodyAge !== null && metric.bodyAge !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Body Age</p>
                            <p className="text-white font-semibold">{metric.bodyAge} years</p>
                          </div>
                        )}
                        {metric.heartRate !== null && metric.heartRate !== undefined && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Heart Rate</p>
                            <p className="text-white font-semibold">{metric.heartRate} bpm</p>
                          </div>
                        )}
                        {metric.bodyType && (
                          <div className="bg-surface-dark-lighter/30 rounded-lg p-3 border border-surface-dark-lighter/50">
                            <p className="text-white/40 text-xs mb-1">Body Type</p>
                            <p className="text-white font-semibold">{metric.bodyType}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* SMS Modal */}
      <SmsSendModal
        isOpen={isSmsModalOpen}
        onClose={() => setIsSmsModalOpen(false)}
        initialPhone={member.phone}
        initialMemberId={member.id}
      />
    </div>
  );
}





