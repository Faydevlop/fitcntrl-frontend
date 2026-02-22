import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CreditCard, ArrowUpRight, ArrowDownRight, XCircle, CheckCircle } from 'lucide-react';
import { subscriptions, subscriptionPayments, plans, gyms } from '@/data/mockData';

const paymentStatusStyles: Record<string, string> = {
  success: 'bg-success/10 text-success hover:bg-success/20',
  failed: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  pending: 'bg-warning/10 text-warning hover:bg-warning/20',
};

const GymBilling = () => {
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  // Current gym = gym id 1
  const currentGym = gyms.find(g => g.id === '1')!;
  const currentSub = subscriptions.find(s => s.gymId === currentGym.id);
  const currentPlan = plans.find(p => p.id === currentGym.planId);
  const subPayments = currentSub ? subscriptionPayments.filter(p => p.subscriptionId === currentSub.id) : [];

  const isExpired = currentGym.status === 'suspended' || currentGym.status === 'frozen';
  const isGracePeriod = currentGym.status === 'grace_period';
  const graceDaysLeft = currentGym.gracePeriodDays ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your subscription and payments</p>
      </div>

      {/* Warning Banners */}
      {isExpired && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your subscription has expired</p>
            <p className="text-xs text-muted-foreground">Please renew to continue services.</p>
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

      {/* Current Plan Card */}
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
              <p className="text-xl font-bold text-foreground">{currentPlan?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Price</p>
              <p className="text-xl font-bold text-foreground">₹{currentPlan?.price.toLocaleString()}/{currentPlan?.billing === 'monthly' ? 'mo' : 'yr'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className={
                currentSub?.subscriptionStatus === 'active' ? 'bg-success/10 text-success hover:bg-success/20' :
                currentSub?.subscriptionStatus === 'past_due' ? 'bg-destructive/10 text-destructive hover:bg-destructive/20' :
                'bg-muted text-muted-foreground'
              }>
                {currentSub?.subscriptionStatus?.replace('_', ' ') || '—'}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next Billing Date</p>
              <p className="text-sm font-medium text-foreground">{currentSub?.nextBillingDate || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Billing Cycle</p>
              <p className="text-sm font-medium capitalize text-foreground">{currentPlan?.billing || '—'}</p>
            </div>
          </div>

          {/* Auto Renewal Toggle */}
          <div className="mt-6 flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label>Auto Renewal</Label>
              <p className="text-xs text-muted-foreground">Automatically renew your subscription at end of period</p>
            </div>
            <Switch defaultChecked={currentSub?.autoRenewal} />
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => setUpgradeOpen(true)}>
              <ArrowUpRight className="mr-2 h-4 w-4" /> Upgrade Plan
            </Button>
            <Button variant="outline">
              <ArrowDownRight className="mr-2 h-4 w-4" /> Downgrade Plan
            </Button>
            <Button variant="outline" className="text-destructive">
              <XCircle className="mr-2 h-4 w-4" /> Cancel Subscription
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Payment History */}
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
                {subPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">No payment records</TableCell>
                  </TableRow>
                ) : (
                  subPayments.map(p => (
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

      {/* Plan Upgrade Modal */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4 sm:grid-cols-2">
            {plans.filter(p => p.active).map(plan => {
              const isCurrent = plan.id === currentGym.planId;
              return (
                <Card key={plan.id} className={`border ${isCurrent ? 'border-primary' : 'border-border'}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      {isCurrent && <Badge className="bg-primary/10 text-primary">Current</Badge>}
                    </div>
                    <p className="text-2xl font-bold text-foreground">₹{plan.price}<span className="text-sm font-normal text-muted-foreground">/{plan.billing === 'monthly' ? 'mo' : 'yr'}</span></p>
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground">Up to {plan.maxMembers} members</p>
                      <p className="text-xs text-muted-foreground">{plan.whatsappLimit.toLocaleString()} WhatsApp messages/mo</p>
                    </div>
                    <div className="space-y-1">
                      {plan.features.map(f => (
                        <div key={f} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle className="h-3.5 w-3.5 text-success" />
                          {f}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" variant={isCurrent ? 'outline' : 'default'} disabled={isCurrent}>
                      {isCurrent ? 'Current Plan' : 'Choose Plan'}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GymBilling;
