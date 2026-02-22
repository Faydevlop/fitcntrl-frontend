import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, CheckCircle, Search, Filter, Upload, Download, Send, UserCircle, Copy, MessageSquare } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { members as initialMembers, payments, gyms, type Member, type MemberStatus } from '@/data/mockData';
import { Users } from 'lucide-react';
import { useTableControls } from '@/hooks/useTableControls';
import { SortableHeader, TablePagination } from '@/components/TableControls';

const statusStyles: Record<MemberStatus, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  paused: 'bg-warning/10 text-warning hover:bg-warning/20',
  expired: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  blacklisted: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const GymMembers = () => {
  const [memberList, setMemberList] = useState<Member[]>(initialMembers);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [profileMember, setProfileMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const currentGym = gyms.find(g => g.id === '1')!;

  const preFiltered = memberList.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchesFilter = filterStatus === 'all' || m.paymentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const table = useTableControls({
    data: preFiltered,
    searchFields: [],
    pageSize: 10,
  });

  const handleMarkPaid = (member: Member) => {
    setSelectedMember(member);
    setPayOpen(true);
  };

  const confirmPayment = () => {
    if (!selectedMember) return;
    setMemberList(prev => prev.map(m => m.id === selectedMember.id ? { ...m, paymentStatus: 'paid' as const, lastPaymentDate: new Date().toISOString().split('T')[0], lastPaymentMethod: 'cash' as const } : m));
    setPayOpen(false);
    setSelectedMember(null);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === preFiltered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(preFiltered.map(m => m.id));
    }
  };

  const memberPayments = profileMember ? payments.filter(p => p.memberId === profileMember.id) : [];
  const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

  // UPI link generation
  const generateUpiLink = (member: Member) => {
    const upiId = currentGym.upiId || '';
    if (!upiId) return '';
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(currentGym.gymDisplayName || currentGym.name)}&am=${member.fee}&tn=Gym Fee ${month}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-sm text-muted-foreground">{memberList.length} total members</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dialog open={importOpen} onOpenChange={setImportOpen}>
            <DialogTrigger asChild>
              <Button variant="outline"><Upload className="mr-2 h-4 w-4" /> Import CSV</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Import Members from CSV</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Upload CSV File</Label>
                  <Input type="file" accept=".csv" />
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="text-sm font-medium text-foreground mb-2">Preview</p>
                  <p className="text-xs text-muted-foreground">Upload a CSV file to see a preview of the data before importing.</p>
                </div>
                <Button onClick={() => setImportOpen(false)}>
                  <Upload className="mr-2 h-4 w-4" /> Confirm Import
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input placeholder="Member name" />
                </div>
                <div className="grid gap-2">
                  <Label>Phone</Label>
                  <Input placeholder="+91 XXXXX XXXXX" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Plan</Label>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Fee Amount (₹)</Label>
                    <Input type="number" placeholder="1500" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Join Date</Label>
                    <Input type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Next Due Date</Label>
                    <Input type="date" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea placeholder="Optional notes..." />
                </div>
                <Button className="mt-2" onClick={() => setAddOpen(false)}>Save Member</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: 'all' | 'paid' | 'pending') => setFilterStatus(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <span className="text-sm text-muted-foreground">{selectedIds.length} selected</span>
          <Button variant="outline" size="sm"><Send className="mr-1 h-3 w-3" /> Send Reminder</Button>
          <Button variant="outline" size="sm"><CheckCircle className="mr-1 h-3 w-3" /> Mark as Paid</Button>
          <Button variant="outline" size="sm"><Download className="mr-1 h-3 w-3" /> Export Selected</Button>
        </div>
      )}

      {preFiltered.length === 0 ? (
        <EmptyState icon={Users} title="No members found" description="No members match your search or filter criteria." />
      ) : (
        <Card className="card-shadow border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.length === preFiltered.length && preFiltered.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead><SortableHeader label="Name" sortKey="name" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead><SortableHeader label="Plan" sortKey="plan" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead><SortableHeader label="Fee" sortKey="fee" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead><SortableHeader label="Next Due" sortKey="nextDueDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead><SortableHeader label="Status" sortKey="status" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {table.paginatedData.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
                      </TableCell>
                      <TableCell>
                        <button className="font-medium text-primary hover:underline" onClick={() => setProfileMember(m)}>
                          {m.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{m.phone}</TableCell>
                      <TableCell className="capitalize">{m.plan}</TableCell>
                      <TableCell>₹{m.fee.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{m.nextDueDate}</TableCell>
                      <TableCell className="text-muted-foreground">{m.lastPaymentDate || '—'}</TableCell>
                      <TableCell>
                        {m.lastPaymentMethod ? (
                          <Badge variant="secondary" className="text-xs uppercase">{m.lastPaymentMethod}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[m.status]}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={m.paymentStatus === 'paid' ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}>
                          {m.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {m.paymentStatus === 'pending' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleMarkPaid(m)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProfileMember(m)}>
                            <UserCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
          </CardContent>
        </Card>
      )}

      {/* Mark Payment Dialog - Enhanced */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Payment</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Recording payment for <strong>{selectedMember.name}</strong></p>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input type="number" defaultValue={selectedMember.fee} />
              </div>
              <div className="grid gap-2">
                <Label>Paid Date</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select defaultValue="cash">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch id="partial" />
                <Label htmlFor="partial">Partial Payment</Label>
              </div>
              <div className="grid gap-2">
                <Label>Transaction Note (optional)</Label>
                <Textarea placeholder="Payment notes..." />
              </div>
              <Button variant="success" onClick={confirmPayment}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Profile Sheet - Enhanced with tabs */}
      <Sheet open={!!profileMember} onOpenChange={(open) => { if (!open) setProfileMember(null); }}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Member Profile</SheetTitle>
          </SheetHeader>
          {profileMember && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {profileMember.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{profileMember.name}</p>
                  <p className="text-sm text-muted-foreground">{profileMember.phone}</p>
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1">Payment History</TabsTrigger>
                  <TabsTrigger value="upi" className="flex-1">Payment Link</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium capitalize text-foreground">{profileMember.plan}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm font-medium text-foreground">₹{profileMember.fee.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={statusStyles[profileMember.status]}>{profileMember.status}</Badge>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <Badge className={profileMember.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{profileMember.paymentStatus}</Badge>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Join Date</p>
                      <p className="text-sm font-medium text-foreground">{profileMember.joinDate}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-sm font-medium text-foreground">{profileMember.nextDueDate}</p>
                    </div>
                  </div>
                  {profileMember.notes && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground">{profileMember.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="text-lg font-bold text-foreground">₹{totalPaid.toLocaleString()}</span>
                  </div>
                  {memberPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payment records found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberPayments.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-muted-foreground">{p.paidDate}</TableCell>
                            <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs uppercase">{p.method}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{p.notes || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="upi" className="space-y-4 mt-4">
                  {currentGym.upiId ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Payment Link Preview</p>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-mono text-muted-foreground break-all">{generateUpiLink(profileMember)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateUpiLink(profileMember))}>
                          <Copy className="mr-1 h-3 w-3" /> Copy Link
                        </Button>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="mr-1 h-3 w-3" /> Send via WhatsApp
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Set up UPI ID in Settings to generate payment links.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GymMembers;
