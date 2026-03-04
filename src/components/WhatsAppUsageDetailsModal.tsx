import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface WhatsAppUsageData {
  messagesUsed: number;
  planLimit: number;
  messagesFailed?: number;
  deliveryRate?: number;
  conversationsThisMonth?: number;
  dailySafeLimit?: number;
  dailyData?: Array<{
    date: string;
    messagesSent: number;
    conversations: number;
  }>;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  usage: WhatsAppUsageData;
}

const WhatsAppUsageDetailsModal = ({ open, onOpenChange, usage }: Props) => {
  const successRate = usage.messagesUsed > 0
    ? (((usage.messagesUsed - (usage.messagesFailed || 0)) / usage.messagesUsed) * 100).toFixed(1)
    : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>WhatsApp Usage Details</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Messages Sent</p>
                <p className="text-lg font-bold text-foreground">{usage.messagesUsed.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Messages Delivered</p>
                <p className="text-lg font-bold text-foreground">{(usage.messagesUsed - (usage.messagesFailed || 0)).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Failed</p>
                <p className="text-lg font-bold text-destructive">{(usage.messagesFailed || 0).toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Success Rate</p>
                <p className="text-lg font-bold text-success">{successRate}%</p>
              </div>
            </div>
          </div>

          {/* Daily Activity Table */}
          {usage.dailyData && usage.dailyData.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3">Daily Activity</h3>
              <div className="overflow-x-auto max-h-60 overflow-y-auto rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Messages Sent</TableHead>
                      <TableHead>Conversations</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usage.dailyData.slice().reverse().slice(0, 14).map((d) => (
                      <TableRow key={d.date}>
                        <TableCell className="text-muted-foreground">{d.date}</TableCell>
                        <TableCell>{d.messagesSent}</TableCell>
                        <TableCell>{d.conversations}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Plan Limits */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Plan Limits</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">Monthly Limit</p>
                <p className="text-lg font-bold text-foreground">{usage.planLimit.toLocaleString()}</p>
              </div>
              {usage.dailySafeLimit && (
                <div className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">Daily Safe Limit</p>
                  <p className="text-lg font-bold text-foreground">{usage.dailySafeLimit}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsAppUsageDetailsModal;
