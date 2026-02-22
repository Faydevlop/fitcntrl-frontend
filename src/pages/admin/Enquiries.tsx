import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Phone, Eye, CheckCircle2, XCircle } from 'lucide-react';
import { enquiries, type Enquiry, type EnquiryStatus } from '@/data/enquiryData';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';

const statusColors: Record<EnquiryStatus, string> = {
  new: 'bg-primary/10 text-primary hover:bg-primary/20',
  contacted: 'bg-warning/10 text-warning hover:bg-warning/20',
  closed: 'bg-success/10 text-success hover:bg-success/20',
};

const Enquiries = () => {
  const [data, setData] = useState<Enquiry[]>([...enquiries]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selected, setSelected] = useState<Enquiry | null>(null);

  const filteredByStatus = statusFilter === 'all' ? data : data.filter(e => e.status === statusFilter);

  const table = useTableControls({
    data: filteredByStatus,
    searchFields: ['name', 'phone', 'email', 'gymName', 'city'],
    pageSize: 10,
  });

  const updateStatus = (id: string, status: EnquiryStatus) => {
    setData(prev => prev.map(e => e.id === id ? { ...e, status } : e));
    const idx = enquiries.findIndex(e => e.id === id);
    if (idx >= 0) enquiries[idx].status = status;
    if (selected?.id === id) setSelected(s => s ? { ...s, status } : null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Enquiries</h1>
        <p className="text-sm text-muted-foreground">Manage leads and enquiries from the website.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search enquiries..." />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="contacted">Contacted</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Name" sortKey="name" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead><SortableHeader label="Email" sortKey="email" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Gym Name" sortKey="gymName" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="City" sortKey="city" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead><SortableHeader label="Date" sortKey="date" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.paginatedData.map(e => (
                  <TableRow key={e.id}>
                    <TableCell className="font-medium">{e.name}</TableCell>
                    <TableCell>{e.phone}</TableCell>
                    <TableCell>{e.email}</TableCell>
                    <TableCell>{e.gymName}</TableCell>
                    <TableCell>{e.city}</TableCell>
                    <TableCell>{e.membersCount}</TableCell>
                    <TableCell>{e.date}</TableCell>
                    <TableCell><Badge className={statusColors[e.status]}>{e.status}</Badge></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => setSelected(e)} title="View"><Eye className="h-4 w-4" /></Button>
                        {e.status === 'new' && (<Button variant="ghost" size="icon" onClick={() => updateStatus(e.id, 'contacted')} title="Mark Contacted"><CheckCircle2 className="h-4 w-4 text-warning" /></Button>)}
                        {e.status !== 'closed' && (<Button variant="ghost" size="icon" onClick={() => updateStatus(e.id, 'closed')} title="Mark Closed"><XCircle className="h-4 w-4 text-success" /></Button>)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {table.paginatedData.length === 0 && (
                  <TableRow><TableCell colSpan={9} className="py-8 text-center text-muted-foreground">No enquiries found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-lg">
          {selected && (
            <>
              <DialogHeader><DialogTitle>Enquiry Details</DialogTitle></DialogHeader>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-muted-foreground">Name:</span> <p className="font-medium text-foreground">{selected.name}</p></div>
                  <div><span className="text-muted-foreground">Phone:</span> <p className="font-medium text-foreground">{selected.phone}</p></div>
                  <div><span className="text-muted-foreground">Email:</span> <p className="font-medium text-foreground">{selected.email}</p></div>
                  <div><span className="text-muted-foreground">City:</span> <p className="font-medium text-foreground">{selected.city}</p></div>
                  <div><span className="text-muted-foreground">Gym Name:</span> <p className="font-medium text-foreground">{selected.gymName}</p></div>
                  <div><span className="text-muted-foreground">Members:</span> <p className="font-medium text-foreground">{selected.membersCount}</p></div>
                  <div><span className="text-muted-foreground">Date:</span> <p className="font-medium text-foreground">{selected.date}</p></div>
                  <div><span className="text-muted-foreground">Status:</span> <Badge className={statusColors[selected.status]}>{selected.status}</Badge></div>
                </div>
                <div>
                  <span className="text-muted-foreground">Message:</span>
                  <p className="mt-1 rounded-lg bg-muted p-3 text-foreground">{selected.message || '—'}</p>
                </div>
              </div>
              <DialogFooter className="flex-row gap-2">
                <Button variant="outline" size="sm"><Phone className="mr-1 h-4 w-4" /> Call</Button>
                {selected.status === 'new' && (<Button variant="secondary" size="sm" onClick={() => updateStatus(selected.id, 'contacted')}>Mark Contacted</Button>)}
                {selected.status !== 'closed' && (<Button variant="default" size="sm" onClick={() => updateStatus(selected.id, 'closed')}>Mark Closed</Button>)}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Enquiries;
