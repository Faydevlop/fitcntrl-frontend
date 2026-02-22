import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Phone } from 'lucide-react';
import { whatsappPhones as initialPhones, gyms, type WhatsAppPhone } from '@/data/mockData';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';

const AdminWhatsAppPhones = () => {
  const [phones, setPhones] = useState<WhatsAppPhone[]>(initialPhones);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState({ phone: '', phoneNumberId: '', wabaId: '', token: '' });

  const table = useTableControls({
    data: phones,
    searchFields: ['phone', 'phoneNumberId', 'wabaId'],
    pageSize: 10,
  });

  const handleAdd = () => {
    if (!newPhone.phone || !newPhone.phoneNumberId || !newPhone.wabaId || !newPhone.token) return;
    const phone: WhatsAppPhone = {
      id: `wp-${Date.now()}`,
      phone: newPhone.phone,
      phoneNumberId: newPhone.phoneNumberId,
      wabaId: newPhone.wabaId,
      token: newPhone.token,
      assignedGymId: null,
    };
    setPhones(prev => [...prev, phone]);
    setNewPhone({ phone: '', phoneNumberId: '', wabaId: '', token: '' });
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setPhones(prev => prev.filter(p => p.id !== id));
  };

  const getAssignedGymName = (gymId: string | null) => {
    if (!gymId) return null;
    return gyms.find(g => g.id === gymId)?.name || gymId;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WhatsApp Phone Numbers</h1>
          <p className="text-sm text-muted-foreground">Manage dedicated WhatsApp lines for Pro gyms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Phone Number</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Add WhatsApp Phone Number</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Phone Number</Label><Input placeholder="+91 XXXXX XXXXX" value={newPhone.phone} onChange={e => setNewPhone(p => ({ ...p, phone: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>Phone Number ID</Label><Input placeholder="e.g. PN-XXX-001" value={newPhone.phoneNumberId} onChange={e => setNewPhone(p => ({ ...p, phoneNumberId: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>WABA ID</Label><Input placeholder="e.g. WABA-XXX-001" value={newPhone.wabaId} onChange={e => setNewPhone(p => ({ ...p, wabaId: e.target.value }))} /></div>
              <div className="grid gap-2"><Label>WhatsApp Token</Label><Input type="password" placeholder="Enter token" value={newPhone.token} onChange={e => setNewPhone(p => ({ ...p, token: e.target.value }))} /></div>
              <Button className="mt-2" onClick={handleAdd}>Save Phone Number</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search phone numbers..." />

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Phone Number" sortKey="phone" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Phone Number ID</TableHead>
                  <TableHead>WABA ID</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.paginatedData.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-success" />
                        {p.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.phoneNumberId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.wabaId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">••••••••</TableCell>
                    <TableCell>
                      {p.assignedGymId ? (
                        <Badge className="bg-primary/10 text-primary text-xs">Assigned: {getAssignedGymName(p.assignedGymId)}</Badge>
                      ) : (
                        <Badge className="bg-success/10 text-success text-xs">Available</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(p.id)} disabled={!!p.assignedGymId}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {table.paginatedData.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No phone numbers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWhatsAppPhones;
