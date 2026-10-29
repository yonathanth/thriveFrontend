// API Client with typed responses for Gym API
// TODO: domain not decided yet. Set NEXT_PUBLIC_API_URL at build time.
import type { Role } from './roles';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'https://api.thrivefitnesseth.com').replace(/\/+$/, '');

// Types based on gym-api DTOs
export interface AdminProfile {
  id: number;
  email: string | null;
  name: string;
  role: Role;
  phone?: string | null;
  /** The password is temporary; only change-password works until it is replaced. */
  mustChangePassword?: boolean;
  contactEmail?: string | null;
  telegramUsername?: string | null;
  /** Linked to a member of staff in the gym app: they have payslips. */
  isStaff?: boolean;
}

export interface ProfileUpdate {
  email?: string;
  password?: string;
  currentPassword?: string;
  contactEmail?: string;
  telegramUsername?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AdminProfile;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface Member {
  id: number;
  memberId: string;
  fullName: string;
  phone: string;
  email?: string;
  gender?: string;
  status: string;
  serviceType?: string;
  startDate?: string;
  endDate?: string;
  registrationDate: string;
  emergencyContact?: string;
  notes?: string;
  membershipTier?: string;
  service?: Pick<Service, 'id' | 'name'> | null;
  goals?: string | null;
  bloodType?: string | null;
  age?: number | null;
  height?: string | null;
  telegramUsername?: string | null;
  remark?: string | null;
  objective?: string | null;
  /** Desktop staff id of the assigned trainer */
  trainerStaffId?: number | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * A row synced from a desktop table without its own endpoint (add-ons, drop-ins,
 * discounts, schedules, ...): the desktop's snake_case columns plus its desktop id.
 */
export type DesktopRow = { id: number } & Record<string, unknown>;

/** Desktop tables readable through /api/records/:entity */
export type RecordEntity =
  | 'additional_service'
  | 'additional_service_variant'
  | 'member_additional_subscription'
  | 'usage_service'
  | 'service_usage'
  | 'discount'
  | 'finance_cut'
  | 'member_group'
  | 'member_group_member'
  | 'freeze_history'
  | 'member_plan_history'
  | 'member_relation'
  | 'schedule'
  | 'schedule_item'
  | 'audit_log'
  | 'income_category'
  | 'expense_category'
  | 'staff_role'
  | 'subscription_correction'
  | 'member_plan_change'
  | 'member_queued_plan'
  | 'plan_change_policy'
  | 'health_metric_reminders'
  | 'health_metric_standards'
  | 'sms_message'
  | 'discount_target'
  | 'finance_cut_target'
  | 'member_addon_period'
  | 'door_event_log'
  | 'app_user'
  | 'system_settings'
  | 'device_terminal'
  | 'notification';

export interface MemberDetails {
  trainer: { id: number; fullName: string } | null;
  /** Add-on subscriptions, with addonName / variantName filled in */
  addons: (DesktopRow & { addonName: string | null; variantName: string | null })[];
  freezeHistory: DesktopRow[];
  planHistory: DesktopRow[];
  group: { id: number; name: string; joinedAt: string | null } | null;
  relations: { relation: string; note: string | null; member: { id: number; fullName: string } | null }[];
  /** Drop-in visits, with serviceName filled in */
  dropIns: (DesktopRow & { serviceName: string | null })[];
}

export interface MemberStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  newThisMonth: number;
  frozenMembers: number;
  pendingMembers: number;
}

export interface Attendance {
  id: number;
  localId: number;
  memberId: number;
  date: string;
  member?: Member;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  total: number;
  today: number;
  thisWeek: number;
  thisMonth: number;
  averageDaily: number;
  last7Days: Array<{ date: string; count: number }>;
}

export interface TodayAttendance {
  count: number;
  checkIns: Array<{
    id: number;
    memberId: number;
    memberName: string;
    checkInTime: string;
  }>;
}

export type TransactionType = 'income' | 'expense' | 'positive_return' | 'negative_return';

export type TransactionSource = 'membership' | 'addon' | 'drop_in' | 'inventory' | 'other';

export interface Transaction {
  id: number;
  memberId: number;
  amount: number;
  type: TransactionType;
  category: string;
  description?: string;
  paymentMethod?: string;
  paymentStatus?: string;
  /** What the payment was for */
  source?: TransactionSource;
  /** Membership, add-on or drop-in name */
  sourceName?: string;
  /** Price before discount */
  originalAmount?: number;
  discountAmount?: number;
  discountCode?: string;
  transactionDate: string;
  member?: Member;
  createdAt: string;
  /** Who took the payment in the gym app; only on a single transaction */
  recordedBy?: { username: string; role: string | null; auditId: number | null } | null;
}

export interface TransactionStats {
  totalIncome: number;
  totalOutflows: number;
  netProfit: number;
  thisMonthIncome: number;
  thisMonthOutflows: number;
  lastMonthIncome: number;
  lastMonthOutflows: number;
  last7Days?: { date: string; income: number; outflows: number }[];
}

export interface Service {
  id: number;
  name: string;
  category: string;
  description?: string;
  price: number;
  duration: number;
  durationUnit: 'days' | 'weeks' | 'months' | 'years';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceStats {
  total: number;
  active: number;
  inactive: number;
  categories: number;
  byCategory: { category: string; count: number }[];
}

export interface DashboardOverview {
  totalMembers: number;
  activeMembers: number;
  totalServices: number;
  attendanceToday: number;
  /** null for managers: money is admin-only. */
  totalRevenue: number | null;
  revenueThisMonth: number | null;
  newMembersThisMonth: number;
  averageDailyAttendance: number;
}

export interface RevenueBreakdown {
  thisMonth: number;
  lastMonth: number;
  monthOverMonthGrowth: number;
  thisYear: number;
  byMonth: { month: string; revenue: number }[];
  last7Days: { date: string; revenue: number }[];
  byCategory: { category: string; revenue: number }[];
}

export interface AttendanceTrends {
  today: number;
  thisWeek: number;
  thisMonth: number;
  averageDaily: number;
  last30Days: { date: string; count: number }[];
  byDayOfWeek: { dayOfWeek: string; average: number }[];
}

export interface MemberGrowth {
  total: number;
  newThisMonth: number;
  newLastMonth: number;
  monthOverMonthGrowth: number;
  byMonth: { month: string; newMembers: number; totalAtEndOfMonth: number }[];
}

// Query params types
export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface MemberQuery extends PaginationQuery {
  search?: string;
  status?: 'active' | 'inactive' | 'frozen' | 'pending' | 'expired';
  subscriptionStatus?: 'active' | 'pending' | 'inactive';
  serviceType?: string;
}

export interface AttendanceQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  memberId?: number;
}

export interface TransactionQuery extends PaginationQuery {
  startDate?: string;
  endDate?: string;
  transactionType?: TransactionType;
  source?: TransactionSource;
  category?: string;
}

export interface ServiceQuery extends PaginationQuery {
  isActive?: boolean;
  category?: string;
}

// Health Metrics Types
export interface HealthMetric {
  id: number;
  localId: number;
  memberId: number;
  measuredAt: string;
  weight?: number | null;
  bmi?: number | null;
  bodyFatPercent?: number | null;
  heartRate?: number | null;
  muscleMass?: number | null;
  leanBodyMass?: number | null;
  boneMass?: number | null;
  skeletalMuscleMass?: number | null;
  visceralFat?: number | null;
  subcutaneousFatPercent?: number | null;
  proteinPercent?: number | null;
  bmr?: number | null;
  bodyAge?: number | null;
  bodyType?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMetricQuery extends PaginationQuery {
  memberId?: number;
  startDate?: string;
  endDate?: string;
}

// SMS Types
export interface SmsResponse {
  messageId: string;
  status: string;
  message: string;
  to: string;
}

/** How a batch went; each failure reason is in the history. */
export interface SmsBatchResult {
  sent: number;
  failed: number;
  firstError: string | null;
}

export interface SmsHistory {
  id: number;
  phoneNumber: string;
  message: string;
  status: string;
  sentAt: Date | null;
  memberId?: number | null;
  /** Why a failed message failed */
  errorMessage?: string | null;
  createdAt: Date;
}

export interface SmsStatus {
  messageId: string;
  /** queued, sent, delivered or failed */
  status: string;
  segments: number | null;
}

export interface SmsTemplate {
  id: number;
  name: string;
  type: string;
  content: string;
  variables: string[];
  isActive: boolean;
}

export interface SmsHistoryQuery extends PaginationQuery {
  days?: number;
}

// API Error type
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/** Fired when the API rejects the stored token; AuthContext signs the user out. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

// Get auth token from localStorage
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
}

// Base fetch wrapper with auth
/** How long a request may take before it is given up on. */
const REQUEST_TIMEOUT_MS = 20_000;

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      // A request never waits forever: a sleeping server would otherwise leave the
      // page spinning with no way out.
      signal: options.signal ?? AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (err) {
    if (err instanceof DOMException && (err.name === 'TimeoutError' || err.name === 'AbortError')) {
      throw new ApiError(0, 'The server is taking too long to answer. Please try again in a moment.');
    }
    const message =
      err instanceof TypeError && err.message === 'Failed to fetch'
        ? `Cannot reach the API at ${API_URL}. Make sure the gym-api server is running (e.g. \`npm run start:dev\` in gym-api) and that NEXT_PUBLIC_API_URL matches its port.`
        : err instanceof Error
          ? err.message
          : 'Network error';
    throw new ApiError(0, message);
  }

  if (!response.ok) {
    // An expired or revoked session (password changed or reset elsewhere): sign out.
    if (response.status === 401 && token && !endpoint.startsWith('/api/auth/')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    const errorData = await response.json().catch(() => ({}));

    // Extract error message from different response formats
    let errorMessage = `Request failed with status ${response.status}`;

    if (errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData.errors && Array.isArray(errorData.errors) && errorData.errors.length > 0) {
      // Handle array of errors (from SmsApiError)
      errorMessage = errorData.errors.join('; ');
    } else if (errorData.error) {
      errorMessage = typeof errorData.error === 'string'
        ? errorData.error
        : errorData.error.message || errorMessage;
    }

    throw new ApiError(response.status, errorMessage);
  }

  // 204 No Content has no body to parse
  if (response.status === 204) return undefined as T;
  return response.json();
}

// Build query string from params
function buildQueryString(params: Record<string, unknown>): string {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

// Auth API
export const authApi = {
  /** Admins may sign in by email; every account can sign in by phone. */
  login: (credentials: { email: string } | { phone: string }, password: string) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ ...credentials, password }),
    }),

  getProfile: () => apiFetch<AdminProfile>('/api/auth/profile'),

  updateProfile: (data: ProfileUpdate) =>
    apiFetch<AdminProfile>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  /** Returns a fresh session; other sessions are signed out. */
  changePassword: (currentPassword: string, newPassword: string) =>
    apiFetch<AuthResponse>('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

// Dashboard API
export const dashboardApi = {
  getOverview: () => apiFetch<DashboardOverview>('/api/dashboard/stats'),
  getRevenue: () => apiFetch<RevenueBreakdown>('/api/dashboard/revenue'),
  getAttendanceTrends: () => apiFetch<AttendanceTrends>('/api/dashboard/attendance-trends'),
  getMemberGrowth: () => apiFetch<MemberGrowth>('/api/dashboard/member-growth'),
};

// Members API
export const membersApi = {
  getAll: (query: MemberQuery = {}) =>
    apiFetch<PaginatedResponse<Member>>(`/api/members${buildQueryString(query as Record<string, unknown>)}`),

  getOne: (id: number) => apiFetch<Member>(`/api/members/${id}`),

  getStats: () => apiFetch<MemberStats>('/api/members/stats'),

  getDetails: (id: number) => apiFetch<MemberDetails>(`/api/members/${id}/details`),

  search: (q: string, limit = 10) =>
    apiFetch<Member[]>(`/api/members/search?q=${encodeURIComponent(q)}&limit=${limit}`),
};

// Attendance API
export const attendanceApi = {
  getAll: (query: AttendanceQuery = {}) =>
    apiFetch<PaginatedResponse<Attendance>>(`/api/attendance${buildQueryString(query as Record<string, unknown>)}`),

  getOne: (id: number) => apiFetch<Attendance>(`/api/attendance/${id}`),

  getStats: () => apiFetch<AttendanceStats>('/api/attendance/stats'),

  getToday: () => apiFetch<TodayAttendance>('/api/attendance/today'),

  getByMember: (memberId: number, query: AttendanceQuery = {}) =>
    apiFetch<PaginatedResponse<Attendance>>(
      `/api/attendance/member/${memberId}${buildQueryString(query as Record<string, unknown>)}`
    ),
};

// Staff (synced from desktop, read-only on web)
export interface Staff {
  id: number;
  localId: number;
  fullName: string;
  phoneNumber: string | null;
  role: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StaffAttendance {
  id: number;
  localId: number;
  staffId: number;
  staff?: Staff;
  scannedAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export const staffApi = {
  getAll: (query: StaffQuery = {}) =>
    apiFetch<PaginatedResponse<Staff>>(`/api/staff${buildQueryString(query as Record<string, unknown>)}`),
  getOne: (id: number) => apiFetch<Staff>(`/api/staff/${id}`),
  getAttendanceByStaff: (id: number, fromDate: string, toDate: string) =>
    apiFetch<StaffAttendance[]>(`/api/staff/${id}/attendance?fromDate=${encodeURIComponent(fromDate)}&toDate=${encodeURIComponent(toDate)}`),
  getAttendanceByDate: (date: string) =>
    apiFetch<StaffAttendance[]>(`/api/staff-attendance/by-date?date=${encodeURIComponent(date)}`),
};

// Potential Customer Types
export interface PotentialCustomer {
  id: number;
  fullName: string;
  phoneNumber: string;
  email?: string | null;
  registeredAt: string;
  status: 'pending' | 'converted' | 'ignored';
  convertedAt?: string | null;
  convertedToMemberId?: number | null;
  serviceId?: number | null;
  serviceName?: string | null;
  notes?: string | null;
  age?: number | null;
  height?: string | null;
  telegramUsername?: string | null;
  remark?: string | null;
  objective?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePotentialCustomerInput {
  fullName: string;
  phoneNumber: string;
  email?: string;
  serviceId?: number;
  notes?: string;
  age?: number;
  height?: string;
  telegramUsername?: string;
  remark?: string;
  objective?: string;
}

// Potential Customers API
export const potentialCustomersApi = {
  register: (input: CreatePotentialCustomerInput) =>
    apiFetch<PotentialCustomer>('/api/public/register', {
      method: 'POST',
      body: JSON.stringify(input),
    }),

  getPotentialCustomers: (
    status?: 'pending' | 'converted' | 'ignored',
    limit?: number,
    offset?: number
  ) =>
    apiFetch<{ data: PotentialCustomer[]; total: number }>(
      `/api/admin/potential-customers${buildQueryString({ status, limit, offset } as Record<string, unknown>)}`
    ),
};

// Transactions API
export const transactionsApi = {
  getAll: (query: TransactionQuery = {}) =>
    apiFetch<PaginatedResponse<Transaction>>(`/api/transactions${buildQueryString(query as Record<string, unknown>)}`),

  getOne: (id: number) => apiFetch<Transaction>(`/api/transactions/${id}`),

  getStats: (query: TransactionQuery = {}) =>
    apiFetch<TransactionStats>(`/api/transactions/stats${buildQueryString(query as Record<string, unknown>)}`),

  getByMember: (memberId: number, query: TransactionQuery = {}) =>
    apiFetch<PaginatedResponse<Transaction>>(
      `/api/transactions/member/${memberId}${buildQueryString(query as Record<string, unknown>)}`
    ),
};

// Inventory (synced from the desktop, read-only here). Quantities are base units.
export interface InventoryItem {
  localId: number;
  kind: 'sellable' | 'asset';
  name: string;
  sku: string | null;
  unitName: string;
  packName: string | null;
  unitsPerPack: number | null;
  unitPrice: number;
  packPrice: number | null;
  assetLocation: string | null;
  assetCondition: string | null;
  assetSerial: string | null;
  notes: string | null;
  isActive: boolean;
  storeQty: number;
  heldQty: number;
  pendingQty: number;
  soldQty: number;
}

/** What a quantity is counted in: enough to show it as packs and units. */
export interface InventoryUnits {
  unitName: string;
  packName: string | null;
  unitsPerPack: number | null;
}

export interface InventoryHolding extends InventoryUnits {
  itemLocalId: number;
  itemName: string;
  holderUserLocalId: number;
  holderName: string | null;
  qtyBase: number;
  updatedAt: string | null;
}

export type AssignmentStatus = 'pending' | 'accepted' | 'rejected' | 'cancelled';

export interface InventoryAssignment extends InventoryUnits {
  localId: number;
  itemLocalId: number;
  itemName: string;
  kind: 'assign' | 'transfer';
  qtyBase: number;
  fromName: string | null;
  toName: string | null;
  createdByName: string | null;
  status: AssignmentStatus;
  note: string | null;
  createdAt: string | null;
  respondedAt: string | null;
}

export interface InventoryMovement extends InventoryUnits {
  localId: number;
  itemLocalId: number;
  itemName: string;
  type: string;
  qtyBase: number;
  fromBucket: string;
  fromName: string | null;
  toBucket: string;
  toName: string | null;
  actorUsername: string | null;
  reason: string | null;
  /** Admins only; null for managers. */
  unitPrice: number | null;
  amount: number | null;
  createdAt: string | null;
}

export interface InventorySale extends InventoryUnits {
  localId: number;
  itemLocalId: number;
  itemName: string;
  holderName: string | null;
  expectedQtyBase: number;
  remainingQtyBase: number;
  soldQtyBase: number;
  unitPrice: number;
  packPrice: number | null;
  amount: number;
  paymentMethod: string | null;
  reportedAt: string | null;
  voidedAt: string | null;
  voidReason: string | null;
}

export type ReportGranularity = 'day' | 'month' | 'year';

export interface InventoryReport {
  granularity: ReportGranularity;
  totals: {
    revenue: number;
    refunded: number;
    net: number;
    soldQty: number;
    reports: number;
    allRevenue: number;
    share: number;
  };
  periods: { period: string; revenue: number; refunded: number; net: number; soldQty: number }[];
  byItem: (InventoryUnits & { itemLocalId: number; itemName: string; soldQty: number; amount: number; reports: number })[];
  byHolder: { holderUserLocalId: number; holderName: string | null; soldQty: number; amount: number; reports: number }[];
}

export interface InventoryRangeQuery extends PaginationQuery {
  itemId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export const inventoryApi = {
  items: (kind?: 'sellable' | 'asset') =>
    apiFetch<InventoryItem[]>(`/api/inventory/items${buildQueryString({ kind })}`),
  holdings: () => apiFetch<InventoryHolding[]>('/api/inventory/holdings'),
  assignments: (query: PaginationQuery & { status?: AssignmentStatus } = {}) =>
    apiFetch<PaginatedResponse<InventoryAssignment>>(
      `/api/inventory/assignments${buildQueryString(query as Record<string, unknown>)}`
    ),
  movements: (query: InventoryRangeQuery = {}) =>
    apiFetch<PaginatedResponse<InventoryMovement>>(
      `/api/inventory/movements${buildQueryString(query as Record<string, unknown>)}`
    ),
  integrity: () =>
    apiFetch<{ itemLocalId: number; itemName: string; ledger: number; balances: number }[]>('/api/inventory/integrity'),
  /** Admin only. */
  sales: (query: InventoryRangeQuery = {}) =>
    apiFetch<PaginatedResponse<InventorySale>>(`/api/inventory/sales${buildQueryString(query as Record<string, unknown>)}`),
  /** Admin only. */
  report: (query: { granularity?: ReportGranularity; startDate?: string; endDate?: string } = {}) =>
    apiFetch<InventoryReport>(`/api/inventory/report${buildQueryString(query as Record<string, unknown>)}`),
};

// Services API
export const servicesApi = {
  getAll: (query: ServiceQuery = {}) =>
    apiFetch<PaginatedResponse<Service>>(`/api/services${buildQueryString(query as Record<string, unknown>)}`),

  getOne: (id: number) => apiFetch<Service>(`/api/services/${id}`),

  getStats: () => apiFetch<ServiceStats>('/api/services/stats'),
};

// Synced desktop tables without their own endpoint
export const recordsApi = {
  list: (entity: RecordEntity, query: PaginationQuery & { memberId?: number } = {}) =>
    apiFetch<{ data: DesktopRow[]; total: number }>(
      `/api/records/${entity}${buildQueryString(query as Record<string, unknown>)}`
    ),
};

// Audit log: who changed what in the desktop app
export type AuditSource = 'app' | 'web';

export interface AuditEntry {
  /** Desktop app or website; ids are per source */
  source: AuditSource;
  /** Desktop audit_log id, or website audit id */
  id: number;
  actorUsername: string | null;
  actorRole: string | null;
  area: string;
  action: string;
  entityType: string | null;
  entityId: number | null;
  summary: string;
  /** Usually { field: { from, to } } for what changed */
  detail: unknown;
  createdAt: string | null;
  /** Website page of what it is about, when that is on the website */
  link: string | null;
}

export interface AuditQuery extends PaginationQuery {
  /** Only the desktop app's entries, or only the website's; both when omitted */
  source?: AuditSource;
  area?: string;
  action?: string;
  actor?: string;
  search?: string;
  entityType?: string;
  entityId?: number;
}

export const auditLogApi = {
  list: (query: AuditQuery = {}) =>
    apiFetch<{ data: AuditEntry[]; total: number; page: number; limit: number }>(`/api/audit-log${buildQueryString(query as Record<string, unknown>)}`),

  get: (id: number, source: AuditSource = 'app') =>
    apiFetch<AuditEntry>(`/api/audit-log/${id}${source === 'web' ? '?source=web' : ''}`),

  filters: () => apiFetch<{ areas: string[]; actions: string[]; actors: string[] }>('/api/audit-log/filters'),
};

// Notifications and Web Push. Admins and managers also get the gym's desk notifications;
// every account gets its own.
export type NotificationType =
  | 'payment'
  | 'package_changed'
  | 'start_date_changed'
  | 'expiring_summary'
  | 'payout_due'
  | 'message'
  | 'membership_expiring'
  | 'membership_expired'
  | 'payment_received'
  | 'plan_changed'
  | 'freeze_changed'
  | 'progress_check_due'
  | 'client_digest';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  payment: 'Payments',
  package_changed: 'Package changes',
  start_date_changed: 'Start date changes and renewals',
  expiring_summary: 'Memberships ending this week',
  payout_due: 'Staff pay due',
  message: 'Messages from the gym',
  membership_expiring: 'Membership ending soon',
  membership_expired: 'Membership ended',
  payment_received: 'Payments received',
  plan_changed: 'Plan changes and renewals',
  freeze_changed: 'Membership frozen or unfrozen',
  progress_check_due: 'Progress check reminders',
  client_digest: 'Clients to check on',
};

/** What each role can receive (the API enforces the same). */
export const NOTIFICATION_TYPES_BY_ROLE: Record<string, NotificationType[]> = {
  admin: ['payment', 'package_changed', 'start_date_changed', 'expiring_summary', 'payout_due', 'message'],
  manager: ['package_changed', 'start_date_changed', 'expiring_summary', 'message'],
  trainer: ['message', 'client_digest'],
  member: ['message', 'membership_expiring', 'membership_expired', 'payment_received', 'plan_changed', 'freeze_changed', 'progress_check_due'],
};

/** Who a message from staff can go to. */
export type MessageAudience =
  | 'all_members'
  | 'active_members'
  | 'expiring_members'
  | 'inactive_members'
  | 'trainers'
  | 'managers'
  | 'all_staff'
  | 'everyone';

export const MESSAGE_AUDIENCE_LABELS: Record<MessageAudience, string> = {
  all_members: 'All members',
  active_members: 'Active members',
  expiring_members: 'Members ending within 7 days',
  inactive_members: 'Inactive members',
  trainers: 'Trainers',
  managers: 'Managers',
  all_staff: 'All staff (admins, managers, trainers)',
  everyone: 'Everyone',
};

export interface AppNotification {
  id: number;
  type: NotificationType | string;
  title: string;
  body: string;
  occurredAt: string;
  read: boolean;
  /** Cloud member id, when the member is on the website */
  memberId: number | null;
  /** Page the notification leads to */
  url: string;
  data: Record<string, unknown>;
}

export interface NotificationList {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

export interface PushDevice {
  endpoint: string;
  types: NotificationType[];
  userAgent: string | null;
  createdAt: string;
  lastSuccessAt: string | null;
}

export const notificationsApi = {
  list: (query: PaginationQuery & { unread?: boolean; type?: NotificationType } = {}) =>
    apiFetch<NotificationList>(`/api/notifications${buildQueryString(query as Record<string, unknown>)}`),

  unreadCount: () => apiFetch<{ count: number }>('/api/notifications/unread-count'),

  markRead: (ids: number[]) =>
    apiFetch<void>('/api/notifications/read', { method: 'POST', body: JSON.stringify({ ids }) }),

  markAllRead: () => apiFetch<{ marked: number }>('/api/notifications/read-all', { method: 'POST' }),

  /** How many active accounts a message would reach (admins and managers). */
  audience: (audience: MessageAudience) =>
    apiFetch<{ count: number }>(`/api/notifications/audience${buildQueryString({ audience })}`),

  /** Sends a message, in-app and to devices (admins and managers). */
  send: (input: { title: string; body: string; audience: MessageAudience }) =>
    apiFetch<{ recipients: number }>('/api/notifications/send', { method: 'POST', body: JSON.stringify(input) }),
};

export const pushApi = {
  getConfig: () => apiFetch<{ enabled: boolean; publicKey: string | null }>('/api/push/config'),

  devices: () => apiFetch<PushDevice[]>('/api/push/subscriptions'),

  subscribe: (subscription: PushSubscriptionJSON, types?: NotificationType[]) =>
    apiFetch<{ endpoint: string; types: NotificationType[] }>('/api/push/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ ...subscription, types }),
    }),

  setTypes: (endpoint: string, types: NotificationType[]) =>
    apiFetch<{ endpoint: string; types: NotificationType[] }>('/api/push/subscriptions', {
      method: 'PATCH',
      body: JSON.stringify({ endpoint, types }),
    }),

  /** authToken: for sign-out, which clears the stored token before this finishes */
  unsubscribe: (endpoint: string, authToken?: string) =>
    apiFetch<void>('/api/push/subscriptions/remove', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
    }),

  test: (endpoint: string) =>
    apiFetch<{ sent: number; failed: number }>('/api/push/test', {
      method: 'POST',
      body: JSON.stringify({ endpoint }),
    }),
};

// Progress: measurements from the gym app, photos, goals and check reminders
export interface ProgressMeasurement {
  id: number;
  measuredAt: string;
  bodyType: string | null;
  weight: number | null;
  bmi: number | null;
  bodyFatPercent: number | null;
  heartRate: number | null;
  muscleMass: number | null;
  leanBodyMass: number | null;
  boneMass: number | null;
  skeletalMuscleMass: number | null;
  visceralFat: number | null;
  subcutaneousFatPercent: number | null;
  proteinPercent: number | null;
  bmr: number | null;
  bodyAge: number | null;
}

export interface ProgressPhoto {
  id: number;
  healthMetricId: number;
  createdAt: string;
  /** Only for the member's own photos */
  visibleToTrainer?: boolean;
  visibleToStaff?: boolean;
}

export interface ProgressData {
  member: { id: number; fullName: string; gender: string | null; age: number | null };
  measurements: ProgressMeasurement[];
  photos: ProgressPhoto[];
  goals: { metric: string; target: number; setByName: string | null }[];
  schedule: { intervalDays: number; setByName: string | null; nextDue: string | null } | null;
  standards: Record<string, unknown>[];
  canSetSchedule: boolean;
}

export const progressApi = {
  mine: () => apiFetch<ProgressData>('/api/progress/me'),
  ofMember: (memberId: number) => apiFetch<ProgressData>(`/api/progress/member/${memberId}`),
  /** target in the units shown (kg for masses); null removes the goal */
  setGoal: (memberId: number | 'me', metric: string, target: number | null) =>
    apiFetch<{ metric: string; target: number | null }>(
      memberId === 'me' ? '/api/progress/me/goal' : `/api/progress/member/${memberId}/goal`,
      { method: 'PUT', body: JSON.stringify({ metric, target }) },
    ),
  setSchedule: (memberId: number, intervalDays: number | null) =>
    apiFetch<{ intervalDays: number | null }>(`/api/progress/member/${memberId}/schedule`, {
      method: 'PUT',
      body: JSON.stringify({ intervalDays }),
    }),
  addPhoto: (input: { healthMetricId: number; image: string; thumb: string; visibleToTrainer: boolean; visibleToStaff: boolean }) =>
    apiFetch<{ id: number }>('/api/progress/photos', { method: 'POST', body: JSON.stringify(input) }),
  setVisibility: (id: number, visibleToTrainer: boolean, visibleToStaff: boolean) =>
    apiFetch<ProgressPhoto>(`/api/progress/photos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ visibleToTrainer, visibleToStaff }),
    }),
  deletePhoto: (id: number) => apiFetch<void>(`/api/progress/photos/${id}`, { method: 'DELETE' }),
  /** A photo as a local URL: images need the sign-in, so they are fetched, not linked. */
  photoUrl: async (id: number, size: 'thumb' | 'full'): Promise<string> => {
    const token = getToken();
    const response = await fetch(`${API_URL}/api/progress/photos/${id}/${size}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!response.ok) throw new ApiError(response.status, 'Could not load the photo');
    return URL.createObjectURL(await response.blob());
  },
};

// Website-only settings
export const siteSettingsApi = {
  /** The date website finances are counted from, or null (admins and managers). */
  financeStart: () => apiFetch<{ date: string | null }>('/api/site-settings/finance-start'),
  /** Sets (YYYY-MM-DD) or clears it (admins). */
  setFinanceStart: (date: string | null) =>
    apiFetch<{ date: string | null }>('/api/site-settings/finance-start', {
      method: 'PUT',
      body: JSON.stringify({ date: date ?? '' }),
    }),
};

// Payroll: set up, calculated and paid here by admins. The gym app books each payment
// as a "Salaries & commissions" expense.
export interface PayoutLine {
  kind: 'base' | 'deduction' | 'commission' | string;
  label: string;
  amount: number;
}

/** building: the period is running (an estimate); due: ended, waiting to be paid; paid: paid, figures frozen. */
export type PayoutStatus = 'building' | 'due' | 'paid';

export interface Payout {
  id: number;
  staffLocalId: number;
  staffName: string;
  periodStart: string;
  periodLast: string;
  status: PayoutStatus;
  calculatedAmount: number;
  lines: PayoutLine[];
  computedAt: string | null;
  payment: {
    paidAmount: number;
    paidDate: string;
    paymentMethod: string | null;
    note: string | null;
    paidByName: string;
    paidAt: string;
    /** The gym app has its copy of this payment */
    collected: boolean;
  } | null;
}

export interface PayPayoutInput {
  paidAmount: number;
  paidDate: string;
  paymentMethod?: string | null;
  note?: string | null;
}

export type BaseType = 'none' | 'monthly' | 'daily';
export type ShareScope = 'assigned_members' | 'addon_trainer' | 'drop_in_instructor' | 'service';
export type ShareTarget = 'plan' | 'addon' | 'drop_in';

export interface PaySetup {
  baseType: BaseType;
  baseAmount: number;
  /** monthly on the start day, or every cycleDays days */
  cycle: 'monthly' | 'days';
  cycleDays: number;
  /** YYYY-MM-DD */
  cycleStart: string;
  deductAbsence: boolean;
  /** ISO weekdays, 1 = Monday */
  workDays: number[];
  active: boolean;
}

export interface RevenueShare {
  id?: number | null;
  scope: ShareScope;
  targetKind: ShareTarget | null;
  targetLocalId: number | null;
  rateType: 'percent' | 'fixed';
  rate: number;
  /** In words, from the server */
  description?: string;
}

export interface StaffPay {
  staffLocalId: number;
  name: string;
  role: string | null;
  status: string | null;
  setup: (PaySetup & { updatedAt: string; updatedByName: string | null }) | null;
  shares: RevenueShare[];
  current: { periodStart: string; periodLast: string; amount: number } | null;
  due: { count: number; amount: number };
}

export type PayTargets = Record<ShareTarget, { id: number; name: string }[]>;

export const payrollApi = {
  /** Admins */
  staff: () => apiFetch<{ staff: StaffPay[]; targets: PayTargets }>('/api/payroll/staff'),
  save: (staffLocalId: number, body: { setup: PaySetup; shares: RevenueShare[] }) =>
    apiFetch<StaffPay>(`/api/payroll/staff/${staffLocalId}`, {
      method: 'PUT',
      body: JSON.stringify({
        // Only the setup itself: a saved setup also carries who changed it and when.
        setup: {
          baseType: body.setup.baseType,
          baseAmount: body.setup.baseAmount,
          cycle: body.setup.cycle,
          cycleDays: body.setup.cycleDays,
          cycleStart: body.setup.cycleStart,
          deductAbsence: body.setup.deductAbsence,
          workDays: body.setup.workDays,
          active: body.setup.active,
        },
        shares: body.shares.map(({ id, scope, targetKind, targetLocalId, rateType, rate }) => ({
          id: id ?? null,
          scope,
          targetKind,
          targetLocalId,
          rateType,
          rate,
        })),
      }),
    }),
  payouts: () => apiFetch<{ payouts: Payout[]; paymentMethods: string[] }>('/api/payroll/payouts'),
  pay: (id: number, input: PayPayoutInput) =>
    apiFetch<Payout>(`/api/payroll/payouts/${id}/pay`, {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  unpay: (id: number) => apiFetch<Payout>(`/api/payroll/payouts/${id}/unpay`, { method: 'POST' }),
  /** The signed-in staff member's own payslips */
  mine: () => apiFetch<Payout[]>('/api/payslips/me'),
};

// Sync API
export const syncApi = {
  getLastSync: () => apiFetch<{ lastSyncAt: string | null }>('/api/sync/last-sync'),
};

// Health Metrics API
export const healthMetricsApi = {
  getByMember: (memberId: number, query: HealthMetricQuery = {}) =>
    apiFetch<PaginatedResponse<HealthMetric>>(
      `/api/health-metrics/member/${memberId}${buildQueryString(query as Record<string, unknown>)}`
    ),

  getLatest: (memberId: number) =>
    apiFetch<HealthMetric | null>(`/api/health-metrics/member/${memberId}/latest`),
};

// SMS API (sent through SMS Ethiopia; the website only sends by hand)

/** Member lists to text: everyone, active, expiring soon, absent, or inactive. */
export type OutreachKind = 'all' | 'active' | 'expiring' | 'absent' | 'inactive';

export interface OutreachCandidate {
  /** Website member id */
  id: number;
  fullName: string;
  phoneNumber: string;
  serviceName: string | null;
  status: string;
  /** Local date the membership ends, YYYY-MM-DD */
  expiryDate: string | null;
  /** Days until the membership ends (negative once it has) */
  daysLeft: number | null;
  /** Days since last visit (absent), since the membership ended (inactive), or until it ends (others) */
  days: number;
}

export const smsOutreachApi = {
  /** Members on a list, with `days` between minDays and maxDays (each list has its own default). */
  candidates: (kind: OutreachKind, minDays?: number, maxDays?: number) =>
    apiFetch<OutreachCandidate[]>(`/api/sms/outreach${buildQueryString({ kind, minDays, maxDays })}`),

  /** Each chosen member gets the template with their own details filled in. */
  send: (kind: OutreachKind, memberIds: number[], minDays?: number, template?: string, maxDays?: number) =>
    apiFetch<SmsBatchResult & { skipped: number }>('/api/sms/outreach/send', {
      method: 'POST',
      body: JSON.stringify({ kind, memberIds, minDays, maxDays, template: template || undefined }),
    }),
};

export const smsApi = {
  sendSingle: (phone: string, message: string, memberId?: number) =>
    apiFetch<SmsResponse>('/api/sms/send', {
      method: 'POST',
      body: JSON.stringify({ phone, message, memberId }),
    }),

  sendBulk: (phones: string[], message: string) =>
    apiFetch<SmsBatchResult>('/api/sms/bulk', {
      method: 'POST',
      body: JSON.stringify({ phones, message }),
    }),

  sendPersonalized: (recipients: Array<{ phone: string; message: string; memberId?: number }>) =>
    apiFetch<SmsBatchResult>('/api/sms/personalized', {
      method: 'POST',
      body: JSON.stringify({ recipients }),
    }),

  getStatus: (messageId: string) =>
    apiFetch<SmsStatus>(`/api/sms/status/${encodeURIComponent(messageId)}`),

  getHistory: (query: SmsHistoryQuery = {}) =>
    apiFetch<PaginatedResponse<SmsHistory>>(`/api/sms/history${buildQueryString(query as Record<string, unknown>)}`),

  getTemplates: () => apiFetch<SmsTemplate[]>('/api/sms/templates'),
};





// Website accounts (admins: everyone; managers: trainer and member accounts)
export interface Account {
  id: number;
  name: string;
  role: Role;
  email: string | null;
  phone: string | null;
  isActive: boolean;
  /** Set when sync turned the account off (desktop record deleted, suspended, ...). */
  deactivatedReason: string | null;
  mustChangePassword: boolean;
  source: 'web' | 'desktop_sync';
  staffLocalId: number | null;
  memberLocalId: number | null;
  lastLoginAt: string | null;
  lockedUntil: string | null;
  createdAt: string;
  canResetPassword: boolean;
  canSetStatus: boolean;
}

export interface AccountQuery {
  role?: Role;
  status?: 'active' | 'inactive';
  search?: string;
  page?: number;
  limit?: number;
}

export interface AccountLinkConflict {
  id: number;
  kind: 'shared_phone' | 'admin_phone' | 'phone_taken' | 'invalid_phone';
  sourceType: 'member' | 'staff';
  sourceLocalId: number;
  phone: string | null;
  detail: string | null;
  status: 'open' | 'resolved';
  createdAt: string;
  resolvedAt: string | null;
}

export const accountsApi = {
  list: (query: AccountQuery = {}) =>
    apiFetch<{ data: Account[]; total: number; page: number; limit: number; totalPages: number }>(
      `/api/accounts${buildQueryString({ ...query })}`,
    ),
  get: (id: number) => apiFetch<Account>(`/api/accounts/${id}`),
  resetPassword: (id: number) =>
    apiFetch<Account>(`/api/accounts/${id}/reset-password`, { method: 'POST' }),
  setStatus: (id: number, isActive: boolean) =>
    apiFetch<Account>(`/api/accounts/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),
  createAdmin: (data: { name: string; phone: string; email?: string; password: string }) =>
    apiFetch<Account>('/api/accounts/admins', { method: 'POST', body: JSON.stringify(data) }),
  conflicts: (status: 'open' | 'resolved' = 'open') =>
    apiFetch<{ data: AccountLinkConflict[]; total: number }>(
      `/api/accounts/conflicts${buildQueryString({ status })}`,
    ),
  resolveConflict: (id: number) =>
    apiFetch<AccountLinkConflict>(`/api/accounts/conflicts/${id}/resolve`, { method: 'POST' }),
  reconcile: () =>
    apiFetch<{ created: number; updated: number; conflicts: number }>('/api/accounts/reconcile', {
      method: 'POST',
    }),
};

// Trainer and member portals
export interface MembershipSummary {
  id: number;
  fullName: string;
  profileImageUrl: string | null;
  plan: string | null;
  planCategory: string | null;
  status: string;
  subscriptionStatus: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isFrozen: boolean;
  frozenStartDate: string | null;
  frozenUntilDate: string | null;
  visitsUsed: number;
  visitsAllowed: number | null;
  goals: string | null;
  objective: string | null;
}

export interface Paged<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CheckIn {
  id: number;
  date: string;
}


export interface AssignedMemberProfile extends MembershipSummary {
  gender: string | null;
  age: number | null;
  height: string | null;
  freezeHistory: DesktopRow[];
  planHistory: DesktopRow[];
  healthMetrics: {
    id: number;
    measuredAt: string;
    weight: number | null;
    bmi: number | null;
    bodyFatPercent: number | null;
    muscleMass: number | null;
    heartRate: number | null;
    visceralFat: number | null;
  }[];
}

export interface TrainerStats {
  assigned: number;
  active: number;
  frozen: number;
  expiringIn7Days: number;
  expired: number;
  checkedInToday: number;
}

export interface TrainerSession {
  id: number;
  scheduleId: number | null;
  dayOfWeek: number | null;
  title: string | null;
  startTime: string | null;
  endTime: string | null;
  room: string | null;
  color: string | null;
  isMine: boolean;
}

export const trainerApi = {
  stats: () => apiFetch<TrainerStats>('/api/trainer/stats'),
  members: (query: { search?: string; page?: number; limit?: number } = {}) =>
    apiFetch<Paged<MembershipSummary>>(`/api/trainer/members${buildQueryString({ ...query })}`),
  member: (id: number) => apiFetch<AssignedMemberProfile>(`/api/trainer/members/${id}`),
  memberAttendance: (id: number, page = 1, limit = 20) =>
    apiFetch<Paged<CheckIn>>(`/api/trainer/members/${id}/attendance${buildQueryString({ page, limit })}`),
  today: () =>
    apiFetch<{ memberId: number; memberName: string; checkInTime: string }[]>('/api/trainer/attendance/today'),
  schedule: () =>
    apiFetch<{ schedules: { id: number; name: string | null; isMain: boolean }[]; sessions: TrainerSession[] }>(
      '/api/trainer/schedule',
    ),
  myAttendance: () => apiFetch<{ id: number; scannedAt: string }[]>('/api/trainer/me/attendance'),
};

export interface MyMembership extends MembershipSummary {
  phone: string;
  email: string | null;
  memberSince: string;
  frozenReason: string | null;
  trainer: { fullName: string } | null;
}

export interface MyHistory {
  planHistory: DesktopRow[];
  freezeHistory: DesktopRow[];
  /** Payments before this date (YYYY-MM-DD) are left out; null when all are shown */
  financeFrom: string | null;
  payments: {
    id: number;
    date: string;
    amount: number;
    type: string;
    description: string | null;
    plan: string | null;
    periodStart: string | null;
    periodEnd: string | null;
    paymentStatus: string;
  }[];
}

export interface RenewalOptions {
  canPay: boolean;
  /** Why online renewal is not possible right now */
  reason: string | null;
  currentPlanId: number | null;
  endDate: string;
  status: string;
  plans: {
    id: number;
    name: string;
    price: number;
    periodDays: number;
    description: string | null;
    current: boolean;
  }[];
}

export interface MyOnlinePayment {
  reference: string;
  plan: string;
  amount: number;
  /** initiated | paid | failed | cancelled | applied | rejected | refunded */
  status: string;
  paidVia: string | null;
  paidAt: string | null;
  createdAt: string;
  note: string | null;
}

export interface AdminOnlinePayment {
  reference: string;
  /** renewal (a member) | join (someone new, from the website) */
  kind: 'renewal' | 'join';
  /** Empty for a join until the gym registers them */
  memberLocalId: number | null;
  memberName: string;
  plan: string;
  amount: number;
  status: string;
  paidVia: string | null;
  phoneNumber: string | null;
  providerTxnId: string | null;
  paidAt: string | null;
  createdAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  note: string | null;
}

export interface AdminOnlinePayments {
  data: AdminOnlinePayment[];
  totals: { status: string; count: number; amount: number }[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/** Online renewal payments, read-only for managers; staff decide them in the gym app. */
export const onlinePaymentsApi = {
  list: (query: { status?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiFetch<AdminOnlinePayments>(`/api/online-payments${buildQueryString(query as Record<string, unknown>)}`),
};

export interface JoinPaymentStatus {
  reference: string;
  plan: string;
  amount: number;
  /** initiated | paid | failed | cancelled | applied | rejected | refunded */
  status: string;
  paidVia: string | null;
}

/**
 * Joining from the website without an account: pay for a first plan online, or leave
 * details for the front desk. The gym registers the member when it confirms.
 */
export const publicJoinApi = {
  available: () => apiFetch<{ available: boolean }>('/api/public/join/available'),
  startPayment: (body: { fullName: string; phoneNumber: string; email?: string; serviceLocalId: number; acceptedTerms: boolean }) =>
    apiFetch<{ reference: string; checkoutUrl: string }>('/api/public/join', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  payment: (reference: string) => apiFetch<JoinPaymentStatus>(`/api/public/join/${encodeURIComponent(reference)}`),
  /** Details only; the desk calls them and they pay there. `serviceId` is the catalog plan id. */
  register: (body: { fullName: string; phoneNumber: string; email?: string; serviceId?: number; notes?: string }) =>
    apiFetch<{ id: number }>('/api/public/register', {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};

export const meApi = {
  membership: () => apiFetch<MyMembership>('/api/me/membership'),
  renewalOptions: () => apiFetch<RenewalOptions>('/api/me/online-payments/options'),
  onlinePayments: () => apiFetch<MyOnlinePayment[]>('/api/me/online-payments'),
  onlinePayment: (reference: string) =>
    apiFetch<MyOnlinePayment>(`/api/me/online-payments/${encodeURIComponent(reference)}`),
  startRenewalPayment: (serviceLocalId: number, acceptedTerms: boolean) =>
    apiFetch<{ reference: string; checkoutUrl: string }>('/api/me/online-payments', {
      method: 'POST',
      body: JSON.stringify({ serviceLocalId, acceptedTerms }),
    }),
  attendance: (page = 1, limit = 20) =>
    apiFetch<Paged<CheckIn>>(`/api/me/attendance${buildQueryString({ page, limit })}`),
  history: () => apiFetch<MyHistory>('/api/me/history'),
};
