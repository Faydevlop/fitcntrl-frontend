import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, MessageSquare } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type SupportTicket, type SupportTicketStatus } from '@/types/support';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import SupportTicketModal from '@/components/SupportTicketModal';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gymApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

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

type OwnerSupportTicket = SupportTicket & {
  subject: string;
  priority: string;
};

const toDate = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().split('T')[0];
};

const toDateTime = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN');
};

const GymSupport = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [statusFilter, setStatusFilter] = useState<'all' | SupportTicketStatus>('all');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');

  const table = useServerTableControls({
    searchFields: ['subject', 'message', 'status', 'priority'],
    pageSize: 10,
    sortKeyMap: {
      id: '_id',
      createdDate: 'createdAt',
      lastUpdated: 'lastUpdatedAt',
    },
  });

  const { data: billingData } = useQuery({
    queryKey: ['gym-billing-lite-support'],
    queryFn: () => gymApi.billingSummary(),
  });
  const gymName = String(billingData?.gym?.name || 'Your Gym');

  const { data, isLoading } = useQuery({
    queryKey: ['gym-support', table.search, table.sort, table.page, statusFilter],
    queryFn: () =>
      gymApi.listSupportTickets(
        table.toPayload(
          statusFilter === 'all'
            ? {}
            : { status: statusFilter },
        ),
      ),
  });

  const tickets = useMemo(
    () =>
      (data?.tableData || []).map((row: any) => ({
        id: String(row?._id || ''),
        gymId: String(row?.gymId || ''),
        gymName,
        ownerName: user?.name || 'Owner',
        ownerPhone: user?.phone || '-',
        subject: String(row?.subject || '-'),
        priority: String(row?.priority || 'medium'),
        message: String(row?.message || ''),
        createdDate: toDate(row?.createdAt),
        lastUpdated: toDate(row?.lastUpdatedAt || row?.updatedAt),
        status:
          row?.status === 'in_progress'
            ? 'in_progress'
            : row?.status === 'resolved'
              ? 'resolved'
              : 'open',
        replies: Array.isArray(row?.replies)
          ? row.replies.map((reply: any, index: number) => ({
            id: `${row?._id || 'r'}-${index}`,
            sender: reply?.sender === 'admin' ? 'admin' : 'owner',
            senderName: String(reply?.senderName || (reply?.sender === 'admin' ? 'Admin' : 'Owner')),
            message: String(reply?.message || ''),
            timestamp: toDateTime(reply?.timestamp),
          }))
          : [],
      })) as OwnerSupportTicket[],
    [data, gymName, user?.name, user?.phone],
  );

  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  const createTicketMutation = useMutation({
    mutationFn: () =>
      gymApi.createSupportTicket({
        subject: subject.trim() || 'General Support',
        message: message.trim(),
        priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-support'] });
      setCreateOpen(false);
      setSubject('');
      setMessage('');
      setPriority('medium');
      setFieldErrors({});
      setSubmitError('');
      toast.success('Support request created');
    },
    onError: (error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unable to create support request';
      setSubmitError(errorMessage);
    },
  });

  const handleCreateTicket = () => {
    const errors: Record<string, string> = {};
    if (!message.trim()) errors.message = 'Message is required';
    if (message.trim().length > 2000) errors.message = 'Message must be 2000 characters or less';
    if (subject.trim().length > 120) errors.subject = 'Subject must be 120 characters or less';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setSubmitError('');
    createTicketMutation.mutate();
  };

  if (isLoading && !data) {
    return <TablePageSkeleton columns={5} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Support</h1>
          <p className="text-sm text-muted-foreground">Your support tickets and help requests.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <HelpCircle className="mr-2 h-4 w-4" /> Send Help Request
        </Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search tickets..." />
        <Select
          value={statusFilter}
          onValueChange={value => {
            setStatusFilter(value as 'all' | SupportTicketStatus);
            table.setPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Ticket ID" sortKey="id" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead><SortableHeader label="Created" sortKey="createdDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><SortableHeader label="Last Updated" sortKey="lastUpdated" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">Loading support tickets...</TableCell></TableRow>
                )}
                {!isLoading && tickets.map(t => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(t)}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell className="max-w-[220px] truncate">{t.subject}</TableCell>
                    <TableCell className="max-w-[300px] truncate">{t.message}</TableCell>
                    <TableCell>{t.createdDate}</TableCell>
                    <TableCell><Badge className={statusColors[t.status]}>{statusLabels[t.status]}</Badge></TableCell>
                    <TableCell>{t.lastUpdated}</TableCell>
                  </TableRow>
                ))}
                {!isLoading && tickets.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="py-8 text-center text-muted-foreground">No support tickets found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={totalPages} totalItems={totalCount} onPageChange={table.setPage} />
        </CardContent>
      </Card>

      <SupportTicketModal
        ticket={selected}
        open={!!selected}
        onOpenChange={open => { if (!open) setSelected(null); }}
        role="owner"
      />

      <Dialog
        open={createOpen}
        onOpenChange={open => {
          setCreateOpen(open);
          if (!open) {
            setFieldErrors({});
            setSubmitError('');
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-success" /> Send Help Request
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="ticket-subject">Subject (optional)</Label>
              <Input
                id="ticket-subject"
                value={subject}
                onChange={event => setSubject(event.target.value)}
                placeholder="e.g. Unable to send reminders"
              />
              {fieldErrors.subject && <p className="text-xs text-destructive">{fieldErrors.subject}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket-priority">Priority</Label>
              <Select value={priority} onValueChange={value => setPriority(value as 'low' | 'medium' | 'high')}>
                <SelectTrigger id="ticket-priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ticket-message">Message</Label>
              <Textarea
                id="ticket-message"
                rows={5}
                value={message}
                onChange={event => setMessage(event.target.value)}
                placeholder="Describe your issue clearly..."
              />
              {fieldErrors.message && <p className="text-xs text-destructive">{fieldErrors.message}</p>}
            </div>
            {submitError && <p className="text-xs text-destructive">{submitError}</p>}
            <Button className="w-full" onClick={handleCreateTicket} disabled={createTicketMutation.isPending}>
              {createTicketMutation.isPending ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GymSupport;
