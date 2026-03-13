import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, User, ShieldCheck } from 'lucide-react';
import type { SupportTicket, SupportTicketStatus } from '@/types/support';

const statusColors: Record<SupportTicketStatus, string> = {
  open: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  in_progress: 'bg-warning/10 text-warning hover:bg-warning/20',
  resolved: 'bg-success/10 text-success hover:bg-success/20',
};

const statusLabels: Record<SupportTicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
};

interface SupportTicketModalProps {
  ticket: SupportTicket | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (ticketId: string, status: SupportTicketStatus) => void;
  onReply?: (ticketId: string, message: string) => void;
  role: 'admin' | 'owner';
}

const SupportTicketModal = ({ ticket, open, onOpenChange, onStatusChange, onReply, role }: SupportTicketModalProps) => {
  const [replyText, setReplyText] = useState('');

  if (!ticket) return null;

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    onReply?.(ticket.id, replyText.trim());
    setReplyText('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Ticket {ticket.id}
            <Badge className={statusColors[ticket.status]}>{statusLabels[ticket.status]}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Owner Details */}
          <div className="rounded-lg border border-border p-4 space-y-2">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Owner Details</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-muted-foreground">Gym Name</span>
                <p className="font-medium text-foreground">{ticket.gymName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Owner Name</span>
                <p className="font-medium text-foreground">{ticket.ownerName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Phone</span>
                <p className="font-medium text-foreground">{ticket.ownerPhone}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Created</span>
                <p className="font-medium text-foreground">{ticket.createdDate}</p>
              </div>
            </div>
          </div>

          {/* Message Thread */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wide">Message Thread</p>

            {/* Original message */}
            <div className="flex gap-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
              <div className="flex-1 rounded-lg bg-muted p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{ticket.ownerName}</p>
                  <p className="text-[11px] text-muted-foreground">{ticket.createdDate}</p>
                </div>
                <p className="mt-1 text-sm text-foreground">{ticket.message}</p>
              </div>
            </div>

            {/* Replies */}
            {ticket.replies.map(reply => (
              <div key={reply.id} className={`flex gap-3 ${reply.sender === 'admin' ? 'flex-row-reverse' : ''}`}>
                <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${reply.sender === 'admin' ? 'bg-success/10 text-success' : 'bg-primary/10 text-primary'}`}>
                  {reply.sender === 'admin' ? <ShieldCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`flex-1 rounded-lg p-3 ${reply.sender === 'admin' ? 'bg-success/5' : 'bg-muted'}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-foreground">{reply.senderName}</p>
                    <p className="text-[11px] text-muted-foreground">{reply.timestamp}</p>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{reply.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Status not resolved message for owner */}
          {role === 'owner' && ticket.status !== 'resolved' && (
            <p className="text-sm text-muted-foreground italic">Our team will contact you soon.</p>
          )}

          {/* Admin Actions */}
          {role === 'admin' && ticket.status !== 'resolved' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" onClick={handleSendReply} disabled={!replyText.trim()}>
                  <Send className="mr-1 h-3 w-3" /> Send Reply
                </Button>
                {ticket.status === 'open' && (
                  <Button size="sm" variant="outline" onClick={() => onStatusChange?.(ticket.id, 'in_progress')}>
                    Mark as In Progress
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => onStatusChange?.(ticket.id, 'resolved')} className="text-success border-success/30 hover:bg-success/10">
                  Mark as Resolved
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SupportTicketModal;
