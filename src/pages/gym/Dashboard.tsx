import { useState } from 'react';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, Clock, TrendingUp, MessageSquare, Send, Eye, HelpCircle, AlertTriangle, CalendarClock, IndianRupee, Phone, ArrowUpRight, CreditCard, XCircle, Wallet, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { members, revenueData, membersJoinedData, payments, gyms, subscriptions } from '@/data/mockData';
import { supportTickets } from '@/data/supportData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WhatsAppUsageBar from '@/components/WhatsAppUsageBar';
import WhatsAppUsageDetailsModal from '@/components/WhatsAppUsageDetailsModal';

const GymDashboard = () => {
  const [usageModalOpen, setUsageModalOpen] = useState(false);

  // Current gym (gym owner logged in = gym id 1)
  const currentGym = gyms.find(g => g.id === '1')!;
  const currentSub = subscriptions.find(s => s.gymId === currentGym.id);
  const waUsage = currentGym.whatsappUsage;
  const isBasic = currentGym.wa_mode === 'shared';
  const isPro = currentGym.wa_mode === 'dedicated';
  const usagePct = waUsage.planLimit > 0 ? Math.round((waUsage.messagesUsed / waUsage.planLimit) * 100) : 0;
  const remaining = Math.max(0, waUsage.planLimit - waUsage.messagesUsed);
  const exceeded = usagePct > 100;
  const nearLimit = usagePct > 80 && !exceeded;

  const totalMembers = members.filter(m => m.status === 'active' || m.status === 'paused').length;
  const paidCount = members.filter(m => m.paymentStatus === 'paid').length;
  const pendingCount = members.filter(m => m.paymentStatus === 'pending').length;
  const pendingMembers = members.filter(m => m.paymentStatus === 'pending').slice(0, 5);
  const revenue = members.filter(m => m.paymentStatus === 'paid').reduce((sum, m) => sum + m.fee, 0);
  const pendingAmount = members.filter(m => m.paymentStatus === 'pending').reduce((sum, m) => sum + m.fee, 0);

  const today = new Date();
  const defaulters = members
    .filter(m => {
      if (m.paymentStatus !== 'pending') return false;
      const due = new Date(m.nextDueDate);
      return (today.getTime() - due.getTime()) / (1000 * 60 * 60 * 24) > 7;
    })
    .slice(0, 5);

  const threeDaysLater = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const expiringSoon = members.filter(m => {
    const due = new Date(m.nextDueDate);
    return due >= today && due <= threeDaysLater && m.status === 'active';
  });

  const todayStr = today.toISOString().split('T')[0];
  const todayPayments = payments.filter(p => p.paidDate === todayStr);
  const todayTotal = todayPayments.reduce((sum, p) => sum + p.amount, 0);

  // Subscription warning states
  const isExpired = currentGym.status === 'suspended' || currentGym.status === 'frozen';
  const isGracePeriod = currentGym.status === 'grace_period';
  const graceDaysLeft = currentGym.gracePeriodDays ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gym Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, Rahul!</p>
      </div>

      {/* Subscription Warning Banners */}
      {isExpired && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <XCircle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your subscription has expired. Please renew to continue services.</p>
          </div>
        </div>
      )}
      {isGracePeriod && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <CreditCard className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your subscription will expire in {graceDaysLeft} days.</p>
          </div>
        </div>
      )}

      {/* WhatsApp Warning Banners */}
      {exceeded && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">WhatsApp sending is temporarily paused</p>
            <p className="text-xs text-muted-foreground">Your usage has exceeded the monthly limit. Upgrade your plan or wait for the next billing cycle reset.</p>
          </div>
        </div>
      )}
      {nearLimit && !exceeded && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Your WhatsApp usage is nearing the monthly limit</p>
            <p className="text-xs text-muted-foreground">{remaining.toLocaleString()} messages remaining this month.</p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Members" value={totalMembers} icon={Users} variant="primary" />
        <StatsCard title="This Month Collection" value={`₹${revenue.toLocaleString()}`} icon={DollarSign} variant="success" />
        <StatsCard title="Pending Amount" value={`₹${pendingAmount.toLocaleString()}`} icon={Wallet} variant="warning" />
        <StatsCard title="Expected Next Month" value={`₹${(revenue + pendingAmount).toLocaleString()}`} icon={TrendingUp} variant="primary" />
      </div>

      {/* WhatsApp Usage Card */}
      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Phone className="h-5 w-5 text-success" /> WhatsApp Assistant Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isBasic ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Messages Used</p>
                  <p className="text-xl font-bold text-foreground">{waUsage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan Limit</p>
                  <p className="text-xl font-bold text-foreground">{waUsage.planLimit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold text-foreground">{remaining.toLocaleString()}</p>
                </div>
              </div>
              <WhatsAppUsageBar used={waUsage.messagesUsed} limit={waUsage.planLimit} />
              {exceeded && (
                <Button className="w-full sm:w-auto">
                  <ArrowUpRight className="mr-1 h-4 w-4" /> Upgrade to Pro for dedicated WhatsApp number and higher limits
                </Button>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Messages Sent</p>
                  <p className="text-xl font-bold text-foreground">{waUsage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversations Started</p>
                  <p className="text-xl font-bold text-foreground">{(waUsage.conversationsThisMonth || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Success</p>
                  <p className="text-xl font-bold text-success">{waUsage.deliveryRate || 0}%</p>
                </div>
              </div>
              <WhatsAppUsageBar used={waUsage.messagesUsed} limit={waUsage.planLimit} />
              <Button variant="outline" size="sm" onClick={() => setUsageModalOpen(true)}>
                <Eye className="mr-1 h-3 w-3" /> View Usage Details
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Today's Collection + Expiry Alerts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <IndianRupee className="h-5 w-5 text-success" /> Today's Collection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-foreground">₹{todayTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{todayPayments.length} payment(s) today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CalendarClock className="h-5 w-5 text-warning" /> Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expiringSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members expiring in the next 3 days.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{expiringSoon.length} member(s) expiring in 3 days</p>
                {expiringSoon.slice(0, 3).map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-warning/5 p-2">
                    <span className="text-sm font-medium text-foreground">{m.name}</span>
                    <span className="text-xs text-muted-foreground">{m.nextDueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="hsl(230 80% 56%)" strokeWidth={2} dot={{ fill: 'hsl(230 80% 56%)' }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Members Joined Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={membersJoinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Bar dataKey="joined" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-destructive" /> High Priority Defaulters
            </CardTitle>
          </CardHeader>
          <CardContent>
            {defaulters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high priority defaulters. Great!</p>
            ) : (
              <div className="space-y-3">
                {defaulters.map(m => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.name}</p>
                      <p className="text-xs text-muted-foreground">Due: {m.nextDueDate}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">₹{m.fee}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Top Pending Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingMembers.map(m => (
                <div key={m.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{m.name}</p>
                    <p className="text-xs text-muted-foreground">Due: {m.nextDueDate}</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning hover:bg-warning/20">₹{m.fee}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Support Requests Card */}
      {(() => {
        const ownerTickets = supportTickets.filter(t => t.gymId === '1');
        const openCount = ownerTickets.filter(t => t.status === 'open').length;
        const resolvedCount = ownerTickets.filter(t => t.status === 'resolved').length;
        return (
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <LifeBuoy className="h-5 w-5 text-primary" /> Support Requests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total</p>
                  <p className="text-xl font-bold text-foreground">{ownerTickets.length}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Open</p>
                  <p className="text-xl font-bold text-destructive">{openCount}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                  <p className="text-xl font-bold text-success">{resolvedCount}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/gym/support'}>
                View All
              </Button>
            </CardContent>
          </Card>
        );
      })()}

      {/* WhatsApp Assistant */}
      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-success" /> WhatsApp Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className="bg-success/10 text-success hover:bg-success/20">Connected</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last message sent</span>
            <span className="text-sm text-foreground">Feb 20, 2025</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm"><Send className="mr-1 h-3 w-3" /> Send Test Reminder</Button>
            <Button variant="outline" size="sm"><Eye className="mr-1 h-3 w-3" /> View Templates</Button>
            <Button variant="outline" size="sm"><HelpCircle className="mr-1 h-3 w-3" /> Open Help</Button>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/gym/support'}><LifeBuoy className="mr-1 h-3 w-3" /> Send Help Request</Button>
          </div>
        </CardContent>
      </Card>

      {/* Future Placeholders */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="card-shadow border-0 opacity-60">
          <CardContent className="flex items-center justify-between p-6">
            <span className="text-sm font-medium text-foreground">Attendance Tracking</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
        <Card className="card-shadow border-0 opacity-60">
          <CardContent className="flex items-center justify-between p-6">
            <span className="text-sm font-medium text-foreground">UPI Payment Link</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
        <Card className="card-shadow border-0 opacity-60">
          <CardContent className="flex items-center justify-between p-6">
            <span className="text-sm font-medium text-foreground">Multi Staff Accounts</span>
            <Badge variant="secondary">Coming Soon</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Usage Details Modal (Pro only) */}
      {isPro && (
        <WhatsAppUsageDetailsModal
          open={usageModalOpen}
          onOpenChange={setUsageModalOpen}
          usage={waUsage}
        />
      )}
    </div>
  );
};

export default GymDashboard;
