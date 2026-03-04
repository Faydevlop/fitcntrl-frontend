import { apiRequest, normalizeUser, setAuthTokens } from "@/lib/api";
import type { TableQueryPayload } from "@/hooks/useServerTableControls";

export interface TableResult<T> {
  totalCount: number;
  page: number;
  itemsPerPage: number;
  sortBy: string[];
  sortDesc: boolean[];
  tableData: T[];
  items: T[];
}

type AuthSessionResponse = {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresInSeconds: number;
  user: any;
};

const applySession = (session: AuthSessionResponse) => {
  setAuthTokens(session.accessToken, session.refreshToken);
  return normalizeUser(session.user);
};

export const authApi = {
  async login(payload: { email: string; password: string }) {
    const session = await apiRequest<AuthSessionResponse>("/auth/login", {
      method: "POST",
      body: payload,
    });
    return applySession(session);
  },

  async signup(payload: {
    name: string;
    email: string;
    countryCode: string;
    phone: string;
    password: string;
  }) {
    const session = await apiRequest<AuthSessionResponse>("/auth/signup", {
      method: "POST",
      body: payload,
    });
    return applySession(session);
  },

  async onboarding(payload: {
    platformType: string;
    businessName: string;
    ownerName: string;
    phone: string;
    city?: string;
    address?: string;
    upiId?: string;
    displayName?: string;
  }) {
    const session = await apiRequest<AuthSessionResponse>("/auth/onboarding", {
      method: "POST",
      body: payload,
      auth: true,
    });
    return applySession(session);
  },

  async me() {
    const user = await apiRequest<any>("/auth/me", { auth: true });
    return normalizeUser(user);
  },

  async forgotPassword(payload: { email: string }) {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: payload,
    });
  },

  async verifyCode(payload: { email: string; code: string; newPassword: string }) {
    return apiRequest("/auth/verify-code", {
      method: "POST",
      body: payload,
    });
  },

  async resetPassword(payload: { oldPassword: string; newPassword: string }) {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: payload,
      auth: true,
    });
  },
};

export const constantsApi = {
  getAll: () => apiRequest<any>("/constants"),
};

export const adminApi = {
  listGyms: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/gyms/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  createGym: (payload: any) =>
    apiRequest("/admin/gyms", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  getGymById: (id: string) => apiRequest<any>(`/admin/gyms/${id}`, { auth: true }),
  freezeGym: (id: string) =>
    apiRequest(`/admin/gyms/${id}/freeze`, { method: "POST", auth: true }),
  unfreezeGym: (id: string) =>
    apiRequest(`/admin/gyms/${id}/unfreeze`, { method: "POST", auth: true }),
  resetGymWa: (id: string) =>
    apiRequest(`/admin/gyms/${id}/reset-wa`, { method: "POST", auth: true }),

  listPlans: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/plans/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  createPlan: (payload: any) =>
    apiRequest("/admin/plans", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  updatePlan: (id: string, payload: any) =>
    apiRequest(`/admin/plans/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  listSubscriptions: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/subscriptions/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  listSubscriptionPayments: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/subscription-payments/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  revenueStats: () => apiRequest<any>("/admin/revenue-stats", { auth: true }),
  listWhatsAppPhones: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/whatsapp-phones/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  createWhatsAppPhone: (payload: {
    phone: string;
    phoneNumberId: string;
    wabaId: string;
    tokenEncrypted: string;
  }) =>
    apiRequest("/admin/whatsapp-phones", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  getWhatsAppPhoneById: (id: string) =>
    apiRequest<any>(`/admin/whatsapp-phones/${id}`, {
      auth: true,
    }),
  updateWhatsAppPhone: (id: string, payload: Record<string, unknown>) =>
    apiRequest(`/admin/whatsapp-phones/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  listActivityLogs: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/activity-logs/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  listAnnouncements: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/announcements/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  createAnnouncement: (payload: { message: string; targetGymIds: string[] | "all" }) =>
    apiRequest("/admin/announcements", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  listEnquiries: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/enquiries/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  updateEnquiry: (id: string, payload: { status?: string; assignedTo?: string }) =>
    apiRequest(`/admin/enquiries/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  listOwnerSupport: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/admin/owner-support/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  updateOwnerSupport: (id: string, payload: { status?: string; replyMessage?: string }) =>
    apiRequest(`/admin/owner-support/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
};

export const gymApi = {
  dashboardStats: () => apiRequest<any>("/gym/dashboard/stats", { auth: true }),
  dashboardGrowth: (months = 6) =>
    apiRequest<any>(`/gym/dashboard/growth?months=${months}`, { auth: true }),

  listMembers: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/gym/members/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  createMember: (payload: any) =>
    apiRequest("/gym/members", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  getMemberById: (id: string) => apiRequest<any>(`/gym/members/${id}`, { auth: true }),
  createPayment: (payload: any) =>
    apiRequest("/gym/payments", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  listPayments: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/gym/payments/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  listPendingPayments: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/gym/payments/pending/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  billingSummary: () => apiRequest<any>("/gym/billing", { auth: true }),
  updateSettings: (payload: {
    name?: string;
    ownerName?: string;
    phone?: string;
    upiId?: string;
    gymDisplayName?: string;
    autoRenewal?: boolean;
  }) =>
    apiRequest("/gym/billing", {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  listSupportTickets: (payload: TableQueryPayload) =>
    apiRequest<TableResult<any>>("/gym/support/getAll", {
      method: "POST",
      body: payload,
      auth: true,
    }),
  updateMember: (id: string, payload: any) =>
    apiRequest(`/gym/members/${id}`, {
      method: "PATCH",
      body: payload,
      auth: true,
    }),
  deleteMember: (id: string) =>
    apiRequest(`/gym/members/${id}`, {
      method: "DELETE",
      auth: true,
    }),
  createSupportTicket: (payload: { subject: string; message: string; priority?: string }) =>
    apiRequest("/gym/support", {
      method: "POST",
      body: payload,
      auth: true,
    }),
};
