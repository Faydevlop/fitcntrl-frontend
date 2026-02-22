export type UserRole = 'admin' | 'gym_owner';

export type AccountStatus = 'active' | 'grace_period' | 'frozen' | 'suspended';
export type MemberStatus = 'active' | 'paused' | 'expired' | 'blacklisted';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'online';
export type WhatsAppMode = 'shared' | 'dedicated';
export type SubscriptionStatus = 'active' | 'past_due' | 'cancelled' | 'trialing';

export interface Plan {
  id: string;
  name: string;
  price: number;
  billing: 'monthly' | 'yearly';
  maxMembers: number;
  whatsappLimit: number;
  features: string[];
  active: boolean;
  razorpayPlanId?: string;
  trialDays?: number;
  gracePeriodDays?: number;
}

export interface WhatsAppDailyData {
  date: string;
  messagesSent: number;
  conversations: number;
}

export interface WhatsAppUsageData {
  messagesUsed: number;
  planLimit: number;
  messagesFailed?: number;
  deliveryRate?: number;
  conversationsThisMonth?: number;
  dailySafeLimit?: number;
  phoneNumber?: string;
  wabaId?: string;
  phoneNumberId?: string;
  dailyData?: WhatsAppDailyData[];
  whatsappPaused?: boolean;
}

export interface Gym {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  planId: string;
  status: AccountStatus;
  membersCount: number;
  startDate: string;
  expiryDate: string;
  gracePeriodDays?: number;
  wa_mode: WhatsAppMode;
  whatsappUsage: WhatsAppUsageData;
  upiId?: string;
  gymDisplayName?: string;
}

export interface Subscription {
  id: string;
  gymId: string;
  gymName: string;
  planName: string;
  startDate: string;
  expiryDate: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
  amountPaid: number;
  subscriptionStatus: SubscriptionStatus;
  nextBillingDate: string;
  lastPaymentDate: string;
  autoRenewal: boolean;
  razorpaySubscriptionId?: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  date: string;
  amount: number;
  status: 'success' | 'failed' | 'pending';
  razorpayPaymentId?: string;
}

export interface GymUsage {
  id: string;
  gymId: string;
  gymName: string;
  membersCount: number;
  whatsappUsed: number;
  planLimit: number;
  status: 'within_limit' | 'near_limit' | 'exceeded';
  wa_mode: WhatsAppMode;
  planName: string;
}

export interface Member {
  id: string;
  name: string;
  phone: string;
  plan: 'monthly' | 'quarterly' | 'yearly';
  fee: number;
  joinDate: string;
  nextDueDate: string;
  status: MemberStatus;
  paymentStatus: 'paid' | 'pending';
  notes: string;
  lastPaymentDate?: string;
  lastPaymentMethod?: PaymentMethod;
}

export interface Payment {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paidDate: string;
  month: string;
  method: PaymentMethod;
  isPartial?: boolean;
  notes?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  gym: string;
  timestamp: string;
}

export interface Announcement {
  id: string;
  message: string;
  targetGyms: string[] | 'all';
  sentAt: string;
  sentBy: string;
}

export const ALL_FEATURES = [
  'Member Management',
  'Dashboard Analytics',
  'WhatsApp Reminders',
  'WhatsApp Owner Reports',
  'CSV Import',
  'Payment History',
  'Multi Staff Access',
];

export const plans: Plan[] = [
  {
    id: '1',
    name: 'Basic',
    price: 999,
    billing: 'monthly',
    maxMembers: 100,
    whatsappLimit: 1000,
    features: ['Member Management', 'Dashboard Analytics', 'Payment History'],
    active: true,
    razorpayPlanId: 'plan_basic_monthly_001',
    trialDays: 14,
    gracePeriodDays: 7,
  },
  {
    id: '2',
    name: 'Pro',
    price: 2499,
    billing: 'monthly',
    maxMembers: 500,
    whatsappLimit: 5000,
    features: ALL_FEATURES.filter(f => f !== 'Multi Staff Access'),
    active: true,
    razorpayPlanId: 'plan_pro_monthly_002',
    trialDays: 14,
    gracePeriodDays: 14,
  },
];

const generateDailyData = (days: number, avgMessages: number): WhatsAppDailyData[] => {
  const data: WhatsAppDailyData[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const variation = 0.5 + Math.random();
    const msgs = Math.round(avgMessages * variation);
    data.push({
      date: date.toISOString().split('T')[0],
      messagesSent: msgs,
      conversations: Math.round(msgs * 0.6),
    });
  }
  return data;
};

export const gyms: Gym[] = [
  {
    id: '1', name: 'FitZone Gym', ownerName: 'Rahul Sharma', phone: '+91 98765 43210',
    planId: '2', status: 'active', membersCount: 145, startDate: '2024-01-15', expiryDate: '2025-01-15',
    wa_mode: 'dedicated',
    whatsappUsage: {
      messagesUsed: 3200, planLimit: 5000, messagesFailed: 45, deliveryRate: 98.6,
      conversationsThisMonth: 1920, dailySafeLimit: 200, phoneNumber: '+91 99999 00001',
      wabaId: 'WABA-FZ-001', phoneNumberId: 'PN-FZ-001',
      dailyData: generateDailyData(30, 110),
    },
    upiId: 'fitzone@upi', gymDisplayName: 'FitZone Gym',
  },
  {
    id: '2', name: 'Iron Paradise', ownerName: 'Priya Patel', phone: '+91 87654 32109',
    planId: '1', status: 'active', membersCount: 78, startDate: '2024-03-01', expiryDate: '2025-03-01',
    wa_mode: 'shared',
    whatsappUsage: { messagesUsed: 420, planLimit: 1000 },
  },
  {
    id: '3', name: 'PowerHouse Fitness', ownerName: 'Vikram Singh', phone: '+91 76543 21098',
    planId: '2', status: 'suspended', membersCount: 0, startDate: '2024-06-10', expiryDate: '2024-12-10',
    wa_mode: 'dedicated',
    whatsappUsage: {
      messagesUsed: 0, planLimit: 5000, messagesFailed: 0, deliveryRate: 0,
      conversationsThisMonth: 0, dailySafeLimit: 200, phoneNumber: '+91 99999 00003',
      wabaId: 'WABA-PH-003', phoneNumberId: 'PN-PH-003',
      dailyData: [],
    },
  },
  {
    id: '4', name: 'Muscle Factory', ownerName: 'Deepak Rao', phone: '+91 65432 10987',
    planId: '1', status: 'frozen', membersCount: 52, startDate: '2024-04-01', expiryDate: '2025-02-01', gracePeriodDays: 0,
    wa_mode: 'shared',
    whatsappUsage: { messagesUsed: 490, planLimit: 1000 },
  },
  {
    id: '5', name: 'FlexFit Studio', ownerName: 'Ananya Joshi', phone: '+91 54321 09876',
    planId: '2', status: 'frozen', membersCount: 91, startDate: '2024-05-15', expiryDate: '2025-01-15', gracePeriodDays: 0,
    wa_mode: 'dedicated',
    whatsappUsage: {
      messagesUsed: 5400, planLimit: 5000, messagesFailed: 120, deliveryRate: 97.8,
      conversationsThisMonth: 3240, dailySafeLimit: 200, phoneNumber: '+91 99999 00005',
      wabaId: 'WABA-FF-005', phoneNumberId: 'PN-FF-005',
      dailyData: generateDailyData(30, 180),
    },
  },
  {
    id: '6', name: 'Peak Performance', ownerName: 'Sanjay Verma', phone: '+91 43210 98765',
    planId: '1', status: 'grace_period', membersCount: 34, startDate: '2024-07-01', expiryDate: '2025-02-20', gracePeriodDays: 7,
    wa_mode: 'shared',
    whatsappUsage: { messagesUsed: 1050, planLimit: 1000 },
  },
];

export const subscriptions: Subscription[] = [
  { id: '1', gymId: '1', gymName: 'FitZone Gym', planName: 'Pro', startDate: '2024-01-15', expiryDate: '2025-01-15', paymentStatus: 'paid', amountPaid: 2499, subscriptionStatus: 'active', nextBillingDate: '2025-03-04', lastPaymentDate: '2025-02-04', autoRenewal: true, razorpaySubscriptionId: 'sub_rzp_001' },
  { id: '2', gymId: '2', gymName: 'Iron Paradise', planName: 'Basic', startDate: '2024-03-01', expiryDate: '2025-03-01', paymentStatus: 'paid', amountPaid: 999, subscriptionStatus: 'active', nextBillingDate: '2025-03-12', lastPaymentDate: '2025-02-12', autoRenewal: true, razorpaySubscriptionId: 'sub_rzp_002' },
  { id: '3', gymId: '3', gymName: 'PowerHouse Fitness', planName: 'Pro', startDate: '2024-06-10', expiryDate: '2024-12-10', paymentStatus: 'overdue', amountPaid: 0, subscriptionStatus: 'past_due', nextBillingDate: '2025-01-10', lastPaymentDate: '2024-12-10', autoRenewal: false },
  { id: '4', gymId: '4', gymName: 'Muscle Factory', planName: 'Basic', startDate: '2024-04-01', expiryDate: '2025-02-01', paymentStatus: 'overdue', amountPaid: 0, subscriptionStatus: 'past_due', nextBillingDate: '2025-02-01', lastPaymentDate: '2024-12-01', autoRenewal: true },
  { id: '5', gymId: '5', gymName: 'FlexFit Studio', planName: 'Pro', startDate: '2024-05-15', expiryDate: '2025-01-15', paymentStatus: 'overdue', amountPaid: 0, subscriptionStatus: 'cancelled', nextBillingDate: '-', lastPaymentDate: '2024-11-15', autoRenewal: false },
  { id: '6', gymId: '6', gymName: 'Peak Performance', planName: 'Basic', startDate: '2024-07-01', expiryDate: '2025-02-20', paymentStatus: 'pending', amountPaid: 0, subscriptionStatus: 'active', nextBillingDate: '2025-03-01', lastPaymentDate: '2025-02-01', autoRenewal: true },
];

export const subscriptionPayments: SubscriptionPayment[] = [
  { id: 'sp-1', subscriptionId: '1', date: '2025-02-04', amount: 2499, status: 'success', razorpayPaymentId: 'pay_rzp_feb_001' },
  { id: 'sp-2', subscriptionId: '1', date: '2025-01-04', amount: 2499, status: 'success', razorpayPaymentId: 'pay_rzp_jan_001' },
  { id: 'sp-3', subscriptionId: '1', date: '2024-12-04', amount: 2499, status: 'success', razorpayPaymentId: 'pay_rzp_dec_001' },
  { id: 'sp-4', subscriptionId: '2', date: '2025-02-12', amount: 999, status: 'success', razorpayPaymentId: 'pay_rzp_feb_002' },
  { id: 'sp-5', subscriptionId: '2', date: '2025-01-12', amount: 999, status: 'success', razorpayPaymentId: 'pay_rzp_jan_002' },
  { id: 'sp-6', subscriptionId: '3', date: '2024-12-10', amount: 2499, status: 'failed' },
  { id: 'sp-7', subscriptionId: '4', date: '2025-01-01', amount: 999, status: 'failed' },
  { id: 'sp-8', subscriptionId: '6', date: '2025-02-01', amount: 999, status: 'success', razorpayPaymentId: 'pay_rzp_feb_006' },
];

export const gymUsage: GymUsage[] = [
  { id: '1', gymId: '1', gymName: 'FitZone Gym', membersCount: 145, whatsappUsed: 3200, planLimit: 5000, status: 'within_limit', wa_mode: 'dedicated', planName: 'Pro' },
  { id: '2', gymId: '2', gymName: 'Iron Paradise', membersCount: 78, whatsappUsed: 420, planLimit: 1000, status: 'within_limit', wa_mode: 'shared', planName: 'Basic' },
  { id: '3', gymId: '3', gymName: 'PowerHouse Fitness', membersCount: 0, whatsappUsed: 0, planLimit: 5000, status: 'within_limit', wa_mode: 'dedicated', planName: 'Pro' },
  { id: '4', gymId: '4', gymName: 'Muscle Factory', membersCount: 52, whatsappUsed: 490, planLimit: 1000, status: 'near_limit', wa_mode: 'shared', planName: 'Basic' },
  { id: '5', gymId: '5', gymName: 'FlexFit Studio', membersCount: 91, whatsappUsed: 5400, planLimit: 5000, status: 'exceeded', wa_mode: 'dedicated', planName: 'Pro' },
  { id: '6', gymId: '6', gymName: 'Peak Performance', membersCount: 34, whatsappUsed: 1050, planLimit: 1000, status: 'exceeded', wa_mode: 'shared', planName: 'Basic' },
];

export const members: Member[] = [
  { id: '1', name: 'Amit Kumar', phone: '+91 99887 76655', plan: 'monthly', fee: 1500, joinDate: '2024-01-10', nextDueDate: '2025-02-10', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2025-02-10', lastPaymentMethod: 'upi' },
  { id: '2', name: 'Sneha Reddy', phone: '+91 88776 65544', plan: 'quarterly', fee: 4000, joinDate: '2024-02-15', nextDueDate: '2025-05-15', status: 'active', paymentStatus: 'paid', notes: 'Morning batch', lastPaymentDate: '2025-01-15', lastPaymentMethod: 'upi' },
  { id: '3', name: 'Raj Malhotra', phone: '+91 77665 54433', plan: 'monthly', fee: 1500, joinDate: '2024-03-01', nextDueDate: '2025-02-01', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '4', name: 'Anita Desai', phone: '+91 66554 43322', plan: 'yearly', fee: 12000, joinDate: '2024-01-20', nextDueDate: '2025-01-20', status: 'expired', paymentStatus: 'pending', notes: 'Personal training' },
  { id: '5', name: 'Karan Johar', phone: '+91 55443 32211', plan: 'monthly', fee: 1500, joinDate: '2024-04-05', nextDueDate: '2025-02-05', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '6', name: 'Meera Nair', phone: '+91 44332 21100', plan: 'monthly', fee: 1500, joinDate: '2024-05-12', nextDueDate: '2025-02-12', status: 'active', paymentStatus: 'paid', notes: 'Evening batch', lastPaymentDate: '2025-02-12', lastPaymentMethod: 'card' },
  { id: '7', name: 'Suresh Gupta', phone: '+91 33221 10099', plan: 'quarterly', fee: 4000, joinDate: '2024-06-01', nextDueDate: '2025-03-01', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2024-12-01', lastPaymentMethod: 'upi' },
  { id: '8', name: 'Divya Sharma', phone: '+91 22110 09988', plan: 'monthly', fee: 1500, joinDate: '2024-07-10', nextDueDate: '2025-02-10', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '9', name: 'Arjun Kapoor', phone: '+91 11009 98877', plan: 'monthly', fee: 1800, joinDate: '2024-08-15', nextDueDate: '2025-02-15', status: 'active', paymentStatus: 'paid', notes: 'With locker', lastPaymentDate: '2025-02-15', lastPaymentMethod: 'cash' },
  { id: '10', name: 'Pooja Hegde', phone: '+91 99001 12233', plan: 'yearly', fee: 14000, joinDate: '2024-09-01', nextDueDate: '2025-09-01', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2024-09-01', lastPaymentMethod: 'online' },
  { id: '11', name: 'Rohit Shetty', phone: '+91 88112 23344', plan: 'monthly', fee: 1500, joinDate: '2024-10-05', nextDueDate: '2025-02-05', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '12', name: 'Neha Kakkar', phone: '+91 77223 34455', plan: 'monthly', fee: 1500, joinDate: '2024-10-20', nextDueDate: '2025-02-20', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2025-02-20', lastPaymentMethod: 'upi' },
  { id: '13', name: 'Vivek Oberoi', phone: '+91 66334 45566', plan: 'quarterly', fee: 4000, joinDate: '2024-11-01', nextDueDate: '2025-02-01', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '14', name: 'Isha Talwar', phone: '+91 55445 56677', plan: 'monthly', fee: 1500, joinDate: '2024-11-15', nextDueDate: '2025-02-15', status: 'active', paymentStatus: 'paid', notes: 'Yoga + Gym', lastPaymentDate: '2025-02-15', lastPaymentMethod: 'cash' },
  { id: '15', name: 'Manish Paul', phone: '+91 44556 67788', plan: 'monthly', fee: 1500, joinDate: '2024-12-01', nextDueDate: '2025-02-01', status: 'active', paymentStatus: 'pending', notes: '' },
  { id: '16', name: 'Shraddha Das', phone: '+91 33667 78899', plan: 'monthly', fee: 1500, joinDate: '2024-12-10', nextDueDate: '2025-02-10', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2025-02-10', lastPaymentMethod: 'upi' },
  { id: '17', name: 'Aakash Chopra', phone: '+91 22778 89900', plan: 'yearly', fee: 14000, joinDate: '2025-01-01', nextDueDate: '2026-01-01', status: 'active', paymentStatus: 'paid', notes: 'Cricket player', lastPaymentDate: '2025-01-01', lastPaymentMethod: 'online' },
  { id: '18', name: 'Tanya Mehta', phone: '+91 11889 90011', plan: 'monthly', fee: 1500, joinDate: '2025-01-10', nextDueDate: '2025-02-10', status: 'paused', paymentStatus: 'pending', notes: 'On vacation' },
  { id: '19', name: 'Farhan Akhtar', phone: '+91 99990 01122', plan: 'monthly', fee: 1800, joinDate: '2025-01-15', nextDueDate: '2025-02-15', status: 'active', paymentStatus: 'paid', notes: 'With trainer', lastPaymentDate: '2025-02-15', lastPaymentMethod: 'card' },
  { id: '20', name: 'Jhanvi Kapoor', phone: '+91 88001 12233', plan: 'quarterly', fee: 4500, joinDate: '2025-02-01', nextDueDate: '2025-05-01', status: 'active', paymentStatus: 'paid', notes: '', lastPaymentDate: '2025-02-01', lastPaymentMethod: 'upi' },
  { id: '21', name: 'Ravi Teja', phone: '+91 77112 23344', plan: 'monthly', fee: 1500, joinDate: '2024-08-01', nextDueDate: '2025-01-01', status: 'blacklisted', paymentStatus: 'pending', notes: 'Multiple defaults' },
];

export const payments: Payment[] = [
  { id: '1', memberId: '1', memberName: 'Amit Kumar', amount: 1500, paidDate: '2025-02-22', month: 'February 2025', method: 'upi' },
  { id: '2', memberId: '2', memberName: 'Sneha Reddy', amount: 4000, paidDate: '2025-01-15', month: 'Q1 2025', method: 'upi' },
  { id: '3', memberId: '4', memberName: 'Anita Desai', amount: 12000, paidDate: '2025-01-20', month: '2025', method: 'cash' },
  { id: '4', memberId: '6', memberName: 'Meera Nair', amount: 1500, paidDate: '2025-02-22', month: 'February 2025', method: 'card' },
  { id: '5', memberId: '9', memberName: 'Arjun Kapoor', amount: 1800, paidDate: '2025-02-15', month: 'February 2025', method: 'cash' },
  { id: '6', memberId: '10', memberName: 'Pooja Hegde', amount: 14000, paidDate: '2024-09-01', month: '2024-2025', method: 'online' },
  { id: '7', memberId: '12', memberName: 'Neha Kakkar', amount: 1500, paidDate: '2025-02-20', month: 'February 2025', method: 'upi' },
  { id: '8', memberId: '14', memberName: 'Isha Talwar', amount: 1500, paidDate: '2025-02-15', month: 'February 2025', method: 'cash' },
  { id: '9', memberId: '16', memberName: 'Shraddha Das', amount: 1500, paidDate: '2025-02-10', month: 'February 2025', method: 'upi' },
  { id: '10', memberId: '17', memberName: 'Aakash Chopra', amount: 14000, paidDate: '2025-01-01', month: '2025', method: 'online' },
  { id: '11', memberId: '19', memberName: 'Farhan Akhtar', amount: 1800, paidDate: '2025-02-15', month: 'February 2025', method: 'card' },
  { id: '12', memberId: '20', memberName: 'Jhanvi Kapoor', amount: 4500, paidDate: '2025-02-01', month: 'Q1 2025', method: 'upi' },
  { id: '13', memberId: '5', memberName: 'Karan Johar', amount: 750, paidDate: '2025-02-18', month: 'February 2025', method: 'cash', isPartial: true, notes: 'Partial payment - balance pending' },
];

export const auditLogs: AuditLog[] = [
  { id: '1', action: 'Created Member', performedBy: 'Rahul Sharma', gym: 'FitZone Gym', timestamp: '2025-02-22 10:30 AM' },
  { id: '2', action: 'Mark Paid', performedBy: 'Rahul Sharma', gym: 'FitZone Gym', timestamp: '2025-02-22 09:15 AM' },
  { id: '3', action: 'Deleted Member', performedBy: 'Priya Patel', gym: 'Iron Paradise', timestamp: '2025-02-21 04:45 PM' },
  { id: '4', action: 'Updated Plan', performedBy: 'Admin', gym: 'Platform', timestamp: '2025-02-21 02:00 PM' },
  { id: '5', action: 'Frozen Account', performedBy: 'Admin', gym: 'Muscle Factory', timestamp: '2025-02-20 11:30 AM' },
  { id: '6', action: 'Created Member', performedBy: 'Priya Patel', gym: 'Iron Paradise', timestamp: '2025-02-20 10:00 AM' },
  { id: '7', action: 'Mark Paid', performedBy: 'Rahul Sharma', gym: 'FitZone Gym', timestamp: '2025-02-19 03:30 PM' },
  { id: '8', action: 'Sent Announcement', performedBy: 'Admin', gym: 'All Gyms', timestamp: '2025-02-19 01:00 PM' },
  { id: '9', action: 'Frozen Account', performedBy: 'Admin', gym: 'FlexFit Studio', timestamp: '2025-02-18 09:00 AM' },
  { id: '10', action: 'Manual Payment Override', performedBy: 'Admin', gym: 'Peak Performance', timestamp: '2025-02-17 04:00 PM' },
];

export const announcements: Announcement[] = [
  { id: '1', message: 'Platform maintenance scheduled for March 1st, 2025. Expect 2 hours downtime.', targetGyms: 'all', sentAt: '2025-02-19 01:00 PM', sentBy: 'Admin' },
  { id: '2', message: 'New WhatsApp template approved. You can now send payment reminders automatically.', targetGyms: ['1', '2'], sentAt: '2025-02-15 10:00 AM', sentBy: 'Admin' },
];

export interface WhatsAppPhone {
  id: string;
  phone: string;
  phoneNumberId: string;
  wabaId: string;
  token: string;
  assignedGymId: string | null;
}

export const whatsappPhones: WhatsAppPhone[] = [
  { id: 'wp-1', phone: '+91 99999 00001', phoneNumberId: 'PN-FZ-001', wabaId: 'WABA-FZ-001', token: 'tok_fitzone_001', assignedGymId: '1' },
  { id: 'wp-2', phone: '+91 99999 00003', phoneNumberId: 'PN-PH-003', wabaId: 'WABA-PH-003', token: 'tok_powerhouse_003', assignedGymId: '3' },
  { id: 'wp-3', phone: '+91 99999 00005', phoneNumberId: 'PN-FF-005', wabaId: 'WABA-FF-005', token: 'tok_flexfit_005', assignedGymId: '5' },
  { id: 'wp-4', phone: '+91 99999 00010', phoneNumberId: 'PN-AVAIL-010', wabaId: 'WABA-AVAIL-010', token: 'tok_available_010', assignedGymId: null },
  { id: 'wp-5', phone: '+91 99999 00011', phoneNumberId: 'PN-AVAIL-011', wabaId: 'WABA-AVAIL-011', token: 'tok_available_011', assignedGymId: null },
];

export const adminRevenueData = [
  { month: 'Sep', revenue: 8500 },
  { month: 'Oct', revenue: 12000 },
  { month: 'Nov', revenue: 11500 },
  { month: 'Dec', revenue: 15000 },
  { month: 'Jan', revenue: 18500 },
  { month: 'Feb', revenue: 14000 },
];

export const revenueByPlan = [
  { plan: 'Basic', revenue: 3996, count: 4 },
  { plan: 'Pro', revenue: 4998, count: 2 },
];

export const revenueData = [
  { month: 'Sep', revenue: 18500 },
  { month: 'Oct', revenue: 22000 },
  { month: 'Nov', revenue: 19500 },
  { month: 'Dec', revenue: 25000 },
  { month: 'Jan', revenue: 28500 },
  { month: 'Feb', revenue: 24000 },
];

export const membersJoinedData = [
  { month: 'Sep', joined: 3 },
  { month: 'Oct', joined: 5 },
  { month: 'Nov', joined: 4 },
  { month: 'Dec', joined: 6 },
  { month: 'Jan', joined: 8 },
  { month: 'Feb', joined: 2 },
];
