import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2, Phone, Loader2, Star, Pencil } from 'lucide-react';
import { type WhatsAppPhone } from '@/data/mockData';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

const mapPhone = (row: any): WhatsAppPhone => ({
  id: String(row?._id || row?.id || ''),
  phone: String(row?.phone || ''),
  phoneNumberId: String(row?.phoneNumberId || ''),
  wabaId: String(row?.wabaId || ''),
  token: String(row?.tokenEncrypted || row?.token || ''),
  assignedGymId: row?.assignedGymId ? String(row.assignedGymId) : null,
  setForBasic: Boolean(row?.setForBasic),
  isActive: row?.isActive !== undefined ? Boolean(row.isActive) : true,
});

const AdminWhatsAppPhones = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [newPhone, setNewPhone] = useState({ phone: '', phoneNumberId: '', wabaId: '', token: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [editPhone, setEditPhone] = useState({ id: '', phone: '', phoneNumberId: '', wabaId: '', token: '' });
  const [editFieldErrors, setEditFieldErrors] = useState<Record<string, string>>({});
  const [basicUpdatingId, setBasicUpdatingId] = useState<string | null>(null);
  const [editLoadingId, setEditLoadingId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const table = useServerTableControls({
    searchFields: ['phone'],
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-whatsapp-phones', table.search, table.sort, table.page],
    queryFn: () => adminApi.listWhatsAppPhones(table.toPayload()),
  });

  const { data: gymsData } = useQuery({
    queryKey: ['admin-gyms-phone-map'],
    queryFn: () =>
      adminApi.listGyms({
        options: { page: 1, itemsPerPage: 500, sortBy: ['name'], sortDesc: [false] },
      }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      adminApi.createWhatsAppPhone({
        phone: newPhone.phone,
        phoneNumberId: newPhone.phoneNumberId,
        wabaId: newPhone.wabaId,
        tokenEncrypted: newPhone.token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-phones'] });
      setNewPhone({ phone: '', phoneNumberId: '', wabaId: '', token: '' });
      setDialogOpen(false);
    },
  });

  const setBasicMutation = useMutation({
    mutationFn: (id: string) => adminApi.updateWhatsAppPhone(id, { setForBasic: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-phones'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: () =>
      adminApi.updateWhatsAppPhone(editPhone.id, {
        phone: editPhone.phone,
        phoneNumberId: editPhone.phoneNumberId,
        wabaId: editPhone.wabaId,
        tokenEncrypted: editPhone.token,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-whatsapp-phones'] });
      setEditDialogOpen(false);
      setEditFieldErrors({});
    },
  });

  const phones = useMemo(() => (data?.tableData || []).map(mapPhone), [data]);
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  if (isLoading && !data) {
    return <TablePageSkeleton columns={6} />;
  }

  const handleAdd = () => {
    const errors: Record<string, string> = {};
    if (!newPhone.phone.trim()) errors.phone = 'Phone number is required';
    if (!newPhone.phoneNumberId.trim()) errors.phoneNumberId = 'Phone number ID is required';
    if (!newPhone.wabaId.trim()) errors.wabaId = 'WABA ID is required';
    if (!newPhone.token.trim()) errors.token = 'Token is required';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    createMutation.mutate();
  };

  const getAssignedGymName = (gymId: string | null) => {
    if (!gymId) return null;
    const gym = (gymsData?.tableData || []).find((row: any) => String(row?._id || '') === gymId);
    return gym?.name ? String(gym.name) : gymId;
  };

  const handleSetForBasic = async (id: string) => {
    setBasicUpdatingId(id);
    try {
      await setBasicMutation.mutateAsync(id);
    } finally {
      setBasicUpdatingId(null);
    }
  };

  const handleEditOpen = async (id: string) => {
    setEditLoadingId(id);
    try {
      const row = await adminApi.getWhatsAppPhoneById(id);
      setEditPhone({
        id: String(row?._id || row?.id || id),
        phone: String(row?.phone || ''),
        phoneNumberId: String(row?.phoneNumberId || ''),
        wabaId: String(row?.wabaId || ''),
        token: String(row?.tokenEncrypted || row?.token || ''),
      });
      setEditFieldErrors({});
      setEditDialogOpen(true);
    } finally {
      setEditLoadingId(null);
    }
  };

  const handleEditSave = () => {
    const errors: Record<string, string> = {};
    if (!editPhone.phone.trim()) errors.phone = 'Phone number is required';
    if (!editPhone.phoneNumberId.trim()) errors.phoneNumberId = 'Phone number ID is required';
    if (!editPhone.wabaId.trim()) errors.wabaId = 'WABA ID is required';
    if (!editPhone.token.trim()) errors.token = 'Token is required';
    if (Object.keys(errors).length > 0) {
      setEditFieldErrors(errors);
      return;
    }
    setEditFieldErrors({});
    updateMutation.mutate();
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
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input placeholder="+91 XXXXX XXXXX" value={newPhone.phone} onChange={e => setNewPhone(p => ({ ...p, phone: e.target.value }))} />
                {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Phone Number ID</Label>
                <Input placeholder="e.g. PN-XXX-001" value={newPhone.phoneNumberId} onChange={e => setNewPhone(p => ({ ...p, phoneNumberId: e.target.value }))} />
                {fieldErrors.phoneNumberId && <p className="text-xs text-destructive">{fieldErrors.phoneNumberId}</p>}
              </div>
              <div className="grid gap-2">
                <Label>WABA ID</Label>
                <Input placeholder="e.g. WABA-XXX-001" value={newPhone.wabaId} onChange={e => setNewPhone(p => ({ ...p, wabaId: e.target.value }))} />
                {fieldErrors.wabaId && <p className="text-xs text-destructive">{fieldErrors.wabaId}</p>}
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp Token</Label>
                <Input type="password" placeholder="Enter token" value={newPhone.token} onChange={e => setNewPhone(p => ({ ...p, token: e.target.value }))} />
                {fieldErrors.token && <p className="text-xs text-destructive">{fieldErrors.token}</p>}
              </div>
              <Button className="mt-2" onClick={handleAdd} disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Saving...' : 'Save Phone Number'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Edit WhatsApp Phone Number</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Phone Number</Label>
                <Input
                  placeholder="+91 XXXXX XXXXX"
                  value={editPhone.phone}
                  onChange={e => setEditPhone(p => ({ ...p, phone: e.target.value }))}
                />
                {editFieldErrors.phone && <p className="text-xs text-destructive">{editFieldErrors.phone}</p>}
              </div>
              <div className="grid gap-2">
                <Label>Phone Number ID</Label>
                <Input
                  placeholder="e.g. PN-XXX-001"
                  value={editPhone.phoneNumberId}
                  onChange={e => setEditPhone(p => ({ ...p, phoneNumberId: e.target.value }))}
                />
                {editFieldErrors.phoneNumberId && <p className="text-xs text-destructive">{editFieldErrors.phoneNumberId}</p>}
              </div>
              <div className="grid gap-2">
                <Label>WABA ID</Label>
                <Input
                  placeholder="e.g. WABA-XXX-001"
                  value={editPhone.wabaId}
                  onChange={e => setEditPhone(p => ({ ...p, wabaId: e.target.value }))}
                />
                {editFieldErrors.wabaId && <p className="text-xs text-destructive">{editFieldErrors.wabaId}</p>}
              </div>
              <div className="grid gap-2">
                <Label>WhatsApp Token</Label>
                <Input
                  type="password"
                  placeholder="Enter token"
                  value={editPhone.token}
                  onChange={e => setEditPhone(p => ({ ...p, token: e.target.value }))}
                />
                {editFieldErrors.token && <p className="text-xs text-destructive">{editFieldErrors.token}</p>}
              </div>
              <Button className="mt-2" onClick={handleEditSave} disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : 'Update Phone Number'}
              </Button>
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
                {isLoading && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Loading phone numbers...</TableCell></TableRow>
                )}
                {!isLoading && phones.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-success" />
                        {p.phone}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.phoneNumberId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">{p.wabaId}</TableCell>
                    <TableCell className="text-muted-foreground text-xs">******</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-2">
                        {p.assignedGymId ? (
                          <Badge className="bg-primary/10 text-primary text-xs">Assigned: {getAssignedGymName(p.assignedGymId)}</Badge>
                        ) : (
                          <Badge className="bg-success/10 text-success text-xs">Available</Badge>
                        )}
                        {p.setForBasic && (
                          <Badge className="bg-amber-100 text-amber-700 text-xs border border-amber-300">
                            <Star className="mr-1 h-3 w-3" /> Basic Default
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditOpen(p.id)}
                          disabled={editLoadingId === p.id}
                        >
                          {editLoadingId === p.id ? (
                            <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Loading...</>
                          ) : (
                            <><Pencil className="mr-1 h-3 w-3" /> Edit</>
                          )}
                        </Button>
                        <Button
                          variant={p.setForBasic ? 'secondary' : 'outline'}
                          size="sm"
                          onClick={() => handleSetForBasic(p.id)}
                          disabled={p.setForBasic || basicUpdatingId === p.id}
                        >
                          {basicUpdatingId === p.id ? (
                            <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Setting...</>
                          ) : p.setForBasic ? (
                            'Default for Basic'
                          ) : (
                            'Set for Basic'
                          )}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" disabled>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {!isLoading && phones.length === 0 && (
                  <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No phone numbers found</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={totalPages} totalItems={totalCount} onPageChange={table.setPage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminWhatsAppPhones;

