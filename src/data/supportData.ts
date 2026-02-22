export type SupportTicketStatus = 'open' | 'in_progress' | 'resolved';

export interface SupportReply {
  id: string;
  sender: 'owner' | 'admin';
  senderName: string;
  message: string;
  timestamp: string;
}

export interface SupportTicket {
  id: string;
  gymId: string;
  gymName: string;
  ownerName: string;
  ownerPhone: string;
  message: string;
  createdDate: string;
  lastUpdated: string;
  status: SupportTicketStatus;
  replies: SupportReply[];
}

export const supportTickets: SupportTicket[] = [
  {
    id: 'TKT-001',
    gymId: '1',
    gymName: 'FitZone Gym',
    ownerName: 'Rahul Sharma',
    ownerPhone: '+91 98765 43210',
    message: 'WhatsApp reminders are not being delivered to some members. I checked the numbers and they seem correct. Please help.',
    createdDate: '2025-02-20',
    lastUpdated: '2025-02-21',
    status: 'in_progress',
    replies: [
      { id: 'r1', sender: 'admin', senderName: 'Admin', message: 'Hi Rahul, we are checking the delivery logs for your account. Will update you shortly.', timestamp: '2025-02-20 03:30 PM' },
      { id: 'r2', sender: 'owner', senderName: 'Rahul Sharma', message: 'Thanks, please let me know once you find the issue.', timestamp: '2025-02-20 04:15 PM' },
    ],
  },
  {
    id: 'TKT-002',
    gymId: '1',
    gymName: 'FitZone Gym',
    ownerName: 'Rahul Sharma',
    ownerPhone: '+91 98765 43210',
    message: 'How do I change my UPI ID for payment collection? I updated it in settings but old one still shows on QR.',
    createdDate: '2025-02-18',
    lastUpdated: '2025-02-19',
    status: 'resolved',
    replies: [
      { id: 'r3', sender: 'admin', senderName: 'Admin', message: 'Hi Rahul, please clear your browser cache and reload the page. The QR code is cached locally.', timestamp: '2025-02-18 11:00 AM' },
      { id: 'r4', sender: 'owner', senderName: 'Rahul Sharma', message: 'That worked! Thank you so much.', timestamp: '2025-02-18 11:30 AM' },
    ],
  },
  {
    id: 'TKT-003',
    gymId: '2',
    gymName: 'Iron Paradise',
    ownerName: 'Priya Patel',
    ownerPhone: '+91 87654 32109',
    message: 'I want to upgrade my plan from Basic to Pro. Can you guide me through the process?',
    createdDate: '2025-02-21',
    lastUpdated: '2025-02-21',
    status: 'open',
    replies: [],
  },
  {
    id: 'TKT-004',
    gymId: '4',
    gymName: 'Muscle Factory',
    ownerName: 'Deepak Rao',
    ownerPhone: '+91 65432 10987',
    message: 'My account shows frozen but I have made the payment. Please check and activate my account.',
    createdDate: '2025-02-22',
    lastUpdated: '2025-02-22',
    status: 'open',
    replies: [],
  },
  {
    id: 'TKT-005',
    gymId: '5',
    gymName: 'FlexFit Studio',
    ownerName: 'Ananya Joshi',
    ownerPhone: '+91 54321 09876',
    message: 'Can I get a report of all WhatsApp messages sent this month? I need it for my records.',
    createdDate: '2025-02-19',
    lastUpdated: '2025-02-20',
    status: 'in_progress',
    replies: [
      { id: 'r5', sender: 'admin', senderName: 'Admin', message: 'Hi Ananya, we are generating the report for you. It will be ready by tomorrow.', timestamp: '2025-02-19 02:00 PM' },
    ],
  },
  {
    id: 'TKT-006',
    gymId: '6',
    gymName: 'Peak Performance',
    ownerName: 'Sanjay Verma',
    ownerPhone: '+91 43210 98765',
    message: 'I am unable to add new members. The form throws an error when I try to save.',
    createdDate: '2025-02-22',
    lastUpdated: '2025-02-22',
    status: 'open',
    replies: [],
  },
  {
    id: 'TKT-007',
    gymId: '2',
    gymName: 'Iron Paradise',
    ownerName: 'Priya Patel',
    ownerPhone: '+91 87654 32109',
    message: 'Payment reminder was sent to a member who already paid. Please fix the logic.',
    createdDate: '2025-02-15',
    lastUpdated: '2025-02-17',
    status: 'resolved',
    replies: [
      { id: 'r6', sender: 'admin', senderName: 'Admin', message: 'Sorry about that. We found a sync issue. It has been fixed now.', timestamp: '2025-02-16 10:00 AM' },
      { id: 'r7', sender: 'owner', senderName: 'Priya Patel', message: 'Great, thanks for the quick fix!', timestamp: '2025-02-17 09:00 AM' },
    ],
  },
  {
    id: 'TKT-008',
    gymId: '1',
    gymName: 'FitZone Gym',
    ownerName: 'Rahul Sharma',
    ownerPhone: '+91 98765 43210',
    message: 'Can we customize the WhatsApp reminder template? I want to add my gym logo.',
    createdDate: '2025-02-10',
    lastUpdated: '2025-02-12',
    status: 'resolved',
    replies: [
      { id: 'r8', sender: 'admin', senderName: 'Admin', message: 'Currently template customization is not supported, but it is on our roadmap. We will notify you when it is available.', timestamp: '2025-02-11 04:00 PM' },
    ],
  },
];
