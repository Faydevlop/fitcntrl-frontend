import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RefreshCw, CheckCircle, Eye, XCircle, CalendarPlus, Snowflake, ArrowLeft } from 'lucide-react';
import { type Subscription, type SubscriptionStatus } from '@/data/mockData';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

const statusStyles: Record<string, string> = {
  paid: 'bg-success/10 text-success hover:bg-success/20',
  pending: 'bg-warning/10 text-warning hover:bg-warning/20',
  overdue: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const subStatusStyles: Record<SubscriptionStatus, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  past_due: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  cancelled: 'bg-muted text-muted-foreground',
  trialing: 'bg-primary/10 text-primary hover:bg-primary/20',
};

const paymentStatusStyles: Record<string, string> = {
  success: 'bg-success/10 text-success hover:bg-success/20',
  failed: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  pending: 'bg-warning/10 text-warning hover:bg-warning/20',
};

const formatDate = (value: unknown) => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toISOString().split('T')[0];
};

const mapSubscription = (row: any): Subscription => ({
  id: String(row?._id || row?.id || ''),
  gymId: row?.gymId ? String(row.gymId) : '',
  gymName: String(row?.gymName || '-'),
  planName: String(row?.planName || '-'),
  startDate: formatDate(row?.startDate),
  expiryDate: formatDate(row?.expiryDate),
  paymentStatus: row?.paymentStatus === 'paid' ? 'paid' : row?.paymentStatus === 'overdue' ? 'overdue' : 'pending',
  amountPaid: Number(row?.amountPaid || 0),
  subscriptionStatus:
    row?.status === 'past_due'
      ? 'past_due'
      : row?.status === 'cancelled'
        ? 'cancelled'
        : row?.status === 'trialing'
          ? 'trialing'
          : 'active',
  nextBillingDate: formatDate(row?.nextBillingDate),
  lastPaymentDate: formatDate(row?.lastPaymentDate),
  autoRenewal: row?.autoRenewal !== false,
  razorpaySubscriptionId: row?.providerSubscriptionId ? String(row.providerSubscriptionId) : undefined,
});

const AdminSubscriptions = () => {
  const [payOpen, setPayOpen] = useState(false);
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  const [detailSub, setDetailSub] = useState<Subscription | null>(null);

  const table = useServerTableControls({
    searchFields: ['gymName', 'planName'],
    pageSize: 10,
    sortKeyMap: {
      subscriptionStatus: 'status',
      amountPaid: 'createdAt',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-subscriptions', table.search, table.sort, table.page],
    queryFn: () => adminApi.listSubscriptions(table.toPayload()),
  });

  const subList = useMemo(() => (data?.tableData || []).map(mapSubscription), [data]);
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  const handleMarkPaid = (sub: Subscription) => {
    setSelectedSub(sub);
    setPayOpen(true);
  };

  const confirmPayment = () => {
    setPayOpen(false);
    setSelectedSub(null);
  };

  const { data: detailPaymentsResponse, isLoading: detailPaymentsLoading } = useQuery({
    queryKey: ['admin-subscription-payments', detailSub?.id],
    enabled: Boolean(detailSub?.id),
    queryFn: () =>
      adminApi.listSubscriptionPayments({
        filters: { subscriptionId: detailSub!.id },
        options: { page: 1, itemsPerPage: 100, sortBy: ['paidAt'], sortDesc: [true] },
      }),
  });

  const detailPayments = useMemo(
    () =>
      (detailPaymentsResponse?.tableData || []).map((row: any) => ({
        id: String(row?._id || ''),
        date: formatDate(row?.paidAt || row?.createdAt),
        amount: Number(row?.amount || 0),
        status:
          row?.status === 'failed'
            ? 'failed'
            : row?.status === 'pending'
              ? 'pending'
              : 'success',
        razorpayPaymentId: row?.providerPaymentId ? String(row.providerPaymentId) : '',
      })),
    [detailPaymentsResponse],
  );

  if (isLoading && !data) {
    return <TablePageSkeleton columns={8} />;
  }

  if (detailSub) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setDetailSub(null)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Subscription Details</h1>
            <p className="text-sm text-muted-foreground">{detailSub.gymName}</p>
          </div>
        </div>

        <Card className="card-shadow border-0">
          <CardHeader><CardTitle className="text-lg">Subscription Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Plan</p><p className="text-sm font-medium text-foreground">{detailSub.planName}</p></div>
              <div><p className="text-xs text-muted-foreground">Price</p><p className="text-sm font-medium text-foreground">₹{detailSub.amountPaid > 0 ? detailSub.amountPaid.toLocaleString() : '—'}</p></div>
              <div><p className="text-xs text-muted-foreground">Status</p><Badge className={subStatusStyles[detailSub.subscriptionStatus]}>{detailSub.subscriptionStatus.replace('_', ' ')}</Badge></div>
              <div><p className="text-xs text-muted-foreground">Next Charge</p><p className="text-sm font-medium text-foreground">{detailSub.nextBillingDate}</p></div>
              <div><p className="text-xs text-muted-foreground">Start Date</p><p className="text-sm font-medium text-foreground">{detailSub.startDate}</p></div>
              <div><p className="text-xs text-muted-foreground">Expiry Date</p><p className="text-sm font-medium text-foreground">{detailSub.expiryDate}</p></div>
              <div><p className="text-xs text-muted-foreground">Auto Renewal</p><Badge className={detailSub.autoRenewal ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>{detailSub.autoRenewal ? 'On' : 'Off'}</Badge></div>
              {detailSub.razorpaySubscriptionId && (<div><p className="text-xs text-muted-foreground">Razorpay Sub ID</p><p className="text-xs font-mono text-muted-foreground">{detailSub.razorpaySubscriptionId}</p></div>)}
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader><CardTitle className="text-lg">Payment History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Razorpay Payment ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detailPaymentsLoading ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">Loading payment records...</TableCell></TableRow>
                  ) : detailPayments.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground">No payment records</TableCell></TableRow>
                  ) : (
                    detailPayments.map(p => (
                      <TableRow key={p.id}>
                        <TableCell className="text-muted-foreground">{p.date}</TableCell>
                        <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                        <TableCell><Badge className={paymentStatusStyles[p.status]}>{p.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">{p.razorpayPaymentId || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader><CardTitle className="text-lg">Admin Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" onClick={() => handleMarkPaid(detailSub)}><CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid</Button>
              <Button variant="outline"><CalendarPlus className="mr-2 h-4 w-4" /> Extend Expiry</Button>
              <Button variant="outline" className="text-destructive"><XCircle className="mr-2 h-4 w-4" /> Cancel Subscription</Button>
              <Button variant="outline"><Snowflake className="mr-2 h-4 w-4" /> Freeze Account</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Subscriptions</h1>
        <p className="text-sm text-muted-foreground">Manage gym subscriptions and payments</p>
      </div>

      <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search by gym or plan..." />

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Gym" sortKey="gymName" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Plan" sortKey="planName" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Subscription Status" sortKey="subscriptionStatus" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Next Billing" sortKey="nextBillingDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Last Payment</TableHead>
                  <TableHead><SortableHeader label="Amount" sortKey="amountPaid" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Auto Renewal</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                      Loading subscriptions...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && subList.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">{sub.gymName}</TableCell>
                    <TableCell>{sub.planName}</TableCell>
                    <TableCell><Badge className={subStatusStyles[sub.subscriptionStatus]}>{sub.subscriptionStatus.replace('_', ' ')}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{sub.nextBillingDate}</TableCell>
                    <TableCell className="text-muted-foreground">{sub.lastPaymentDate}</TableCell>
                    <TableCell>₹{sub.amountPaid > 0 ? sub.amountPaid.toLocaleString() : '—'}</TableCell>
                    <TableCell><Badge className={sub.autoRenewal ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}>{sub.autoRenewal ? 'On' : 'Off'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailSub(sub)}><Eye className="h-4 w-4" /></Button>
                        {sub.paymentStatus !== 'paid' && (<Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleMarkPaid(sub)}><CheckCircle className="h-4 w-4" /></Button>)}
                        {sub.subscriptionStatus !== 'cancelled' && (<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><XCircle className="h-4 w-4" /></Button>)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={totalPages} totalItems={totalCount} onPageChange={table.setPage} />
        </CardContent>
      </Card>

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Manual Payment Override</DialogTitle></DialogHeader>
          {selectedSub && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Mark payment for <strong>{selectedSub.gymName}</strong></p>
              <div className="grid gap-2"><Label>Amount (₹)</Label><Input type="number" placeholder="Enter amount" /></div>
              <div className="grid gap-2"><Label>Payment Date</Label><Input type="date" defaultValue={new Date().toISOString().split('T')[0]} /></div>
              <div className="grid gap-2"><Label>Extend Expiry Date</Label><Input type="date" /></div>
              <Button variant="success" onClick={confirmPayment}><CheckCircle className="mr-2 h-4 w-4" /> Confirm Payment</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminSubscriptions;
