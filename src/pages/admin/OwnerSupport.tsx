import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Play, CheckCircle2, MessageSquare } from 'lucide-react';
import { supportTickets, type SupportTicket, type SupportTicketStatus } from '@/data/supportData';
import { gyms } from '@/data/mockData';
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

const AdminOwnerSupport = () => {
  const [data, setData] = useState<SupportTicket[]>([...supportTickets]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gymFilter, setGymFilter] = useState<string>('all');
  const [selected, setSelected] = useState<SupportTicket | null>(null);

  const filtered = data
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => gymFilter === 'all' || t.gymId === gymFilter);

  const table = useTableControls({
    data: filtered,
    searchFields: ['id', 'gymName', 'ownerName', 'ownerPhone', 'message'],
    pageSize: 10,
  });

  const uniqueGyms = [...new Map(data.map(t => [t.gymId, { id: t.gymId, name: t.gymName }])).values()];

  const handleStatusChange = (ticketId: string, status: SupportTicketStatus) => {
    const now = new Date().toISOString().split('T')[0];
    setData(prev => prev.map(t => t.id === ticketId ? { ...t, status, lastUpdated: now } : t));
    if (selected?.id === ticketId) setSelected(s => s ? { ...s, status, lastUpdated: now } : null);
  };

  const handleReply = (ticketId: string, message: string) => {
    const now = new Date().toISOString().split('T')[0];
    const newReply = {
      id: `r-${Date.now()}`,
      sender: 'admin' as const,
      senderName: 'Admin',
      message,
      timestamp: new Date().toLocaleString('en-IN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }),
    };
    setData(prev => prev.map(t => t.id === ticketId ? { ...t, replies: [...t.replies, newReply], lastUpdated: now } : t));
    if (selected?.id === ticketId) setSelected(s => s ? { ...s, replies: [...s.replies, newReply], lastUpdated: now } : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Owner Support</h1>
        <p className="text-sm text-muted-foreground">Manage support tickets from gym owners.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search tickets..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        <Select value={gymFilter} onValueChange={setGymFilter}>
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
                {table.paginatedData.map(t => (
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
                {table.paginatedData.length === 0 && (
                  <TableRow><TableCell colSpan={8} className="py-8 text-center text-muted-foreground">No support tickets found.</TableCell></TableRow>
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
        onStatusChange={handleStatusChange}
        onReply={handleReply}
        role="admin"
      />
    </div>
  );
};

export default AdminOwnerSupport;
