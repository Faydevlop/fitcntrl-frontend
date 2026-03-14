import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { CreditCard, MessageSquare, XCircle } from 'lucide-react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gymApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { toast } from '@/components/ui/sonner';

const paymentStatusStyles: Record<string, string> = {
  success: 'bg-success/10 text-success hover:bg-success/20',
  failed: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  pending: 'bg-warning/10 text-warning hover:bg-warning/20',
};

const subscriptionStatusStyles: Record<string, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  trialing: 'bg-primary/10 text-primary hover:bg-primary/20',
  past_due: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  cancelled: 'bg-muted text-muted-foreground',
};

const toDate = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().split('T')[0];
};

const resolvePlan = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== 'object') return null;
  const plan = value as Record<string, unknown>;
  if (!plan.name) return null;
  return plan;
};

const GymBilling = () => {
  const queryClient = useQueryClient();
  const [autoRenewal, setAutoRenewal] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['gym-billing-summary'],
    queryFn: () => gymApi.billingSummary(),
  });

  const gym = data?.gym || {};
  const subscription = data?.subscription || {};
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const plan = useMemo(
    () => resolvePlan(subscription?.planId) || resolvePlan(gym?.planId),
    [subscription?.planId, gym?.planId],
  );

  useEffect(() => {
    setAutoRenewal(Boolean(gym?.subscription?.autoRenewal));
  }, [gym?.subscription?.autoRenewal]);

  const updateAutoRenewalMutation = useMutation({
    mutationFn: (nextValue: boolean) => gymApi.updateSettings({ autoRenewal: nextValue }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-billing-summary'] });
      toast.success('Auto renewal updated');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update auto renewal';
      toast.error(message);
    },
  });

  const handleAutoRenewalChange = (nextValue: boolean) => {
    setAutoRenewal(nextValue);
    updateAutoRenewalMutation.mutate(nextValue, {
      onError: () => setAutoRenewal(Boolean(gym?.subscription?.autoRenewal)),
    });
  };

  const gymStatus = String(gym?.status || 'active');
  const isExpired = gymStatus === 'suspended' || gymStatus === 'frozen';
  const isGracePeriod = gymStatus === 'grace_period';
  const graceDaysLeft = Number(gym?.subscription?.gracePeriodDays || 0);
  const planPrice = Number(plan?.price || 0);
  const planBilling = String(plan?.billing || 'monthly');
  const subscriptionStatus = String(subscription?.status || '-');
  const paymentStatus = String(subscription?.paymentStatus || '-');

  if (isLoading && !data) {
    return <TablePageSkeleton columns={4} rows={6} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payments</p>
      </div>

      {isExpired && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your subscription has expired</p>
            <p className="text-xs text-muted-foreground">Please contact support to renew your plan.</p>
          </div>
        </div>
      )}
      {isGracePeriod && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your subscription will expire in {graceDaysLeft} days</p>
            <p className="text-xs text-muted-foreground">Please renew before the grace period ends.</p>
          </div>
        </div>
      )}

      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <CreditCard className="h-5 w-5 text-primary" /> Current Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">Plan Name</p>
              <p className="text-xl font-bold text-foreground">{String(plan?.name || '-')}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-xl font-bold text-foreground">Rs. {planPrice.toLocaleString()}/{planBilling === 'monthly' ? 'mo' : 'yr'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={subscriptionStatusStyles[subscriptionStatus] || 'bg-muted text-muted-foreground'}>
                {subscriptionStatus.replace('_', ' ')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Billing Date</p>
              <p className="text-sm font-medium text-foreground">{toDate(subscription?.nextBillingDate)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Billing Cycle</p>
              <p className="text-sm font-medium capitalize text-foreground">{planBilling}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Payment Status</p>
              <p className="text-sm font-medium capitalize text-foreground">{paymentStatus}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label>Auto Renewal</Label>
              <p className="text-xs text-muted-foreground">Automatically renew your subscription at end of period</p>
            </div>
            <Switch
              checked={autoRenewal}
              onCheckedChange={handleAutoRenewalChange}
              disabled={updateAutoRenewalMutation.isPending}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { window.location.href = '/gym/support'; }}>
              <MessageSquare className="mr-2 h-4 w-4" /> Contact Support for Plan Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="text-lg">Payment History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invoice ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No payment records</TableCell>
                  </TableRow>
                ) : (
                  payments.map((payment: any) => (
                    <TableRow key={String(payment?._id || payment?.providerPaymentId || `${payment?.paidAt}-${payment?.amount}`)}>
                      <TableCell className="text-muted-foreground">{toDate(payment?.paidAt)}</TableCell>
                      <TableCell>Rs. {Number(payment?.amount || 0).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge className={paymentStatusStyles[String(payment?.status || 'pending')] || 'bg-muted text-muted-foreground'}>
                          {String(payment?.status || '-')}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">{String(payment?.providerPaymentId || '-')}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GymBilling;
