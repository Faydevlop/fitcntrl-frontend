import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { supportTickets, type SupportTicket, type SupportTicketStatus } from '@/data/supportData';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import SupportTicketModal from '@/components/SupportTicketModal';

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

const GymSupport = () => {
  // Filter tickets for current gym (gym id 1 - FitZone Gym)
  const ownerTickets = supportTickets.filter(t => t.gymId === '1');
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [helpModalOpen, setHelpModalOpen] = useState(false);

  const table = useTableControls({
    data: ownerTickets,
    searchFields: ['id', 'message'],
    pageSize: 10,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground">Your support tickets and help requests.</p>
        </div>
        <Button onClick={() => setHelpModalOpen(true)}>
          <HelpCircle className="mr-2 h-4 w-4" /> Send Help Request
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search tickets..." />
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Ticket ID" sortKey="id" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead><SortableHeader label="Created" sortKey="createdDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><SortableHeader label="Last Updated" sortKey="lastUpdated" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.paginatedData.map(t => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(t)}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{t.message}</TableCell>
                    <TableCell>{t.createdDate}</TableCell>
                    <TableCell><Badge className={statusColors[t.status]}>{statusLabels[t.status]}</Badge></TableCell>
                    <TableCell>{t.lastUpdated}</TableCell>
                  </TableRow>
                ))}
                {table.paginatedData.length === 0 && (
                  <TableRow><TableCell colSpan={5} className="py-8 text-center text-muted-foreground">No support tickets found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
        </CardContent>
      </Card>

      <SupportTicketModal
        ticket={selected}
        open={!!selected}
        onOpenChange={open => { if (!open) setSelected(null); }}
        role="owner"
      />

      {/* WhatsApp Help Instruction Modal */}
      <Dialog open={helpModalOpen} onOpenChange={setHelpModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-success" /> Send Help Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg bg-success/5 border border-success/20 p-4 space-y-2">
              <p className="text-sm font-medium text-foreground">How to get help via WhatsApp:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Open your WhatsApp chat with GymFlow assistant</li>
                <li>Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-foreground">HELP</span> followed by your issue</li>
                <li>Our team will review and respond to your request</li>
              </ol>
            </div>
            <p className="text-xs text-muted-foreground">
              Example: <span className="font-mono text-foreground">HELP I am unable to send reminders to my members</span>
            </p>
            <Button variant="outline" className="w-full" onClick={() => setHelpModalOpen(false)}>
              Got it
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GymSupport;
