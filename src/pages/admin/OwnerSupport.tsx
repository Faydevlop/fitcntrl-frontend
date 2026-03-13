import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Play, CheckCircle2, MessageSquare } from 'lucide-react';
import { type SupportTicket, type SupportTicketStatus } from '@/types/support';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import SupportTicketModal from '@/components/SupportTicketModal';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

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

const mapTicket = (row: any): SupportTicket => ({
  id: String(row?._id || row?.id || ''),
  gymId: String(row?.gymId || ''),
  gymName: String(row?.gymName || row?.gymId || '-'),
  ownerName: String(row?.ownerName || row?.ownerUserId || '-'),
  ownerPhone: String(row?.ownerPhone || '-'),
  message: String(row?.message || row?.subject || ''),
  createdDate: row?.createdAt ? new Date(row.createdAt).toISOString().split('T')[0] : '-',
  lastUpdated: row?.lastUpdatedAt ? new Date(row.lastUpdatedAt).toISOString().split('T')[0] : '-',
  status: row?.status === 'in_progress' ? 'in_progress' : row?.status === 'resolved' ? 'resolved' : 'open',
  replies: Array.isArray(row?.replies)
    ? row.replies.map((reply: any, index: number) => ({
      id: String(reply?.id || `${row?._id || 'r'}-${index}`),
      sender: reply?.sender === 'admin' ? 'admin' : 'owner',
      senderName: String(reply?.senderName || (reply?.sender === 'admin' ? 'Admin' : 'Owner')),
      message: String(reply?.message || ''),
      timestamp: reply?.timestamp
        ? new Date(reply.timestamp).toLocaleString('en-IN')
        : '-',
    }))
    : [],
});

const AdminOwnerSupport = () => {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gymFilter, setGymFilter] = useState<string>('all');
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const table = useServerTableControls({
    searchFields: ['id', 'gymName', 'ownerName', 'ownerPhone', 'message'],
    pageSize: 10,
    sortKeyMap: {
      id: '_id',
      gymName: 'gymId',
      createdDate: 'createdAt',
      lastUpdated: 'lastUpdatedAt',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-owner-support', table.search, table.sort, table.page, statusFilter, gymFilter],
    queryFn: () =>
      adminApi.listOwnerSupport(
        table.toPayload({
          ...(statusFilter === 'all' ? {} : { status: statusFilter }),
          ...(gymFilter === 'all' ? {} : { gymId: gymFilter }),
        }),
      ),
  });

  const rows = useMemo(() => (data?.tableData || []).map(mapTicket), [data]);

  const uniqueGyms = [...new Map(rows.map(t => [t.gymId, { id: t.gymId, name: t.gymName }])).values()];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  const updateSupportMutation = useMutation({
    mutationFn: (payload: { id: string; status?: SupportTicketStatus; replyMessage?: string }) =>
      adminApi.updateOwnerSupport(payload.id, {
        status: payload.status,
        replyMessage: payload.replyMessage,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-owner-support'] });
    },
  });

  const handleStatusChange = (ticketId: string, status: SupportTicketStatus) => {
    if (selected?.id === ticketId) {
      setSelected(prev => (prev ? { ...prev, status } : prev));
    }
    updateSupportMutation.mutate({ id: ticketId, status });
  };

  const handleReply = (ticketId: string, message: string) => {
    const newReply = {
      id: `r-${Date.now()}`,
      sender: 'admin' as const,
      senderName: 'Admin',
      message,
      timestamp: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    if (selected?.id === ticketId) {
      setSelected(prev => (prev ? { ...prev, replies: [...prev.replies, newReply] } : prev));
    }
    updateSupportMutation.mutate({ id: ticketId, replyMessage: message });
  };

  if (isLoading && !data) {
    return <TablePageSkeleton columns={8} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Owner Support</h1>
        <p className="text-sm text-muted-foreground">Manage support tickets from gym owners.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search tickets..." />
        <Select value={statusFilter} onValueChange={value => { setStatusFilter(value); table.setPage(1); }}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={gymFilter} onValueChange={value => { setGymFilter(value); table.setPage(1); }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Gym" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Gyms</SelectItem>
            {uniqueGyms.map(g => (
              <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
            ))}
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
                  <TableHead><SortableHeader label="Gym Name" sortKey="gymName" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Owner Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead><SortableHeader label="Created" sortKey="createdDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">Loading support tickets...</TableCell></TableRow>
                )}
                {!isLoading && rows.map(t => (
                  <TableRow key={t.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelected(t)}>
                    <TableCell className="font-medium">{t.id}</TableCell>
                    <TableCell>{t.gymName}</TableCell>
                    <TableCell>{t.ownerName}</TableCell>
                    <TableCell>{t.ownerPhone}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{t.message}</TableCell>
                    <TableCell>{t.createdDate}</TableCell>
                    <TableCell><Badge className={statusColors[t.status]}>{statusLabels[t.status]}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" onClick={() => setSelected(t)} title="View"><Eye className="h-4 w-4" /></Button>
                        {t.status === 'open' && (
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(t.id, 'in_progress')} title="In Progress"><Play className="h-4 w-4 text-warning" /></Button>
                        )}
                        {t.status !== 'resolved' && (
                          <Button variant="ghost" size="icon" onClick={() => handleStatusChange(t.id, 'resolved')} title="Resolve"><CheckCircle2 className="h-4 w-4 text-success" /></Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && rows.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No support tickets found.</TableCell></TableRow>
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
        onStatusChange={handleStatusChange}
        onReply={handleReply}
        role="admin"
      />
    </div>
  );
};

export default AdminOwnerSupport;
