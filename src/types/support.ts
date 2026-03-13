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
