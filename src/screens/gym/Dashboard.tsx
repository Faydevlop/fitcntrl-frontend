import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, TrendingUp, MessageSquare, Eye, AlertTriangle, CalendarClock, IndianRupee, Phone, ArrowUpRight, CreditCard, XCircle, Wallet, LifeBuoy } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessLabel } from '@/data/businessTypes';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import WhatsAppUsageBar from '@/components/WhatsAppUsageBar';
import WhatsAppUsageDetailsModal from '@/components/WhatsAppUsageDetailsModal';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { gymApi } from '@/services/api';

type DashboardUsage = {
  messagesUsed: number;
  planLimit: number;
  messagesFailed?: number;
  deliveryRate?: number;
  conversationsThisMonth?: number;
  dailySafeLimit?: number;
  whatsappPaused?: boolean;
  dailyData?: Array<{
    date: string;
    messagesSent: number;
    conversations: number;
  }>;
};

type PendingMember = {
  id: string;
  name: string;
  fee: number;
  nextDueDate: string;
  overdueDays: number;
};

const toDateOnly = (value: unknown): string => {
  if (!value) return '-';
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return '-';
  return date.toISOString().split('T')[0];
};

const monthLabelFromKey = (monthKey: string): string => {
  const [yearPart, monthPart] = String(monthKey || '').split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!year || !month || month < 1 || month > 12) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'short' });
};

const getLastMonthKeys = (months: number): string[] => {
  const keys: string[] = [];
  const now = new Date();
  for (let index = months - 1; index >= 0; index -= 1) {
    const monthDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - index, 1));
    const key = `${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`;
    keys.push(key);
  }
  return keys;
};

const GymDashboard = () => {
  const [usageModalOpen, setUsageModalOpen] = useState(false);
  const { user } = useAuth();
  const labels = getBusinessLabel(user?.platformType || user?.businessType || 'gym');

  const { data, isLoading } = useQuery({
    queryKey: ['gym-dashboard-live'],
    queryFn: async () => {
      const [
        dashboardStats,
        growthResponse,
        pendingPaymentsResponse,
        paymentsResponse,
        activeMembersResponse,
        billingSummary,
        supportTotalResponse,
        supportOpenResponse,
        supportResolvedResponse,
      ] = await Promise.all([
        gymApi.dashboardStats(),
        gymApi.dashboardGrowth(6),
        gymApi.listPendingPayments({
          options: { page: 1, itemsPerPage: 5000, sortBy: ['nextDueDate'], sortDesc: [false] },
        }),
        gymApi.listPayments({
          options: { page: 1, itemsPerPage: 5000, sortBy: ['paidDate'], sortDesc: [true] },
        }),
        gymApi.listMembers({
          filters: { status: 'active' },
          options: { page: 1, itemsPerPage: 5000, sortBy: ['nextDueDate'], sortDesc: [false] },
        }),
        gymApi.billingSummary(),
        gymApi.listSupportTickets({
          options: { page: 1, itemsPerPage: 1 },
        }),
        gymApi.listSupportTickets({
          filters: { status: 'open' },
          options: { page: 1, itemsPerPage: 1 },
        }),
        gymApi.listSupportTickets({
          filters: { status: 'resolved' },
          options: { page: 1, itemsPerPage: 1 },
        }),
      ]);

      const usageSource = dashboardStats?.whatsappUsage || billingSummary?.whatsappUsage || {};
      const usageDailyRaw = Array.isArray(usageSource?.daily)
        ? usageSource.daily
        : Array.isArray(usageSource?.dailyData)
          ? usageSource.dailyData
          : [];

      const usage: DashboardUsage = {
        messagesUsed: Number(usageSource?.messagesUsed || 0),
        planLimit: Number(usageSource?.planLimit || 0),
        messagesFailed: Number(usageSource?.messagesFailed || 0),
        deliveryRate: Number(usageSource?.deliveryRate || 0),
        conversationsThisMonth: Number(usageSource?.conversationsCount || usageSource?.conversationsThisMonth || 0),
        dailySafeLimit: Number(usageSource?.dailySafeLimit || 0),
        whatsappPaused: Boolean(usageSource?.whatsappPaused),
        dailyData: usageDailyRaw.map((entry: any) => ({
          date: toDateOnly(entry?.date),
          messagesSent: Number(entry?.sent || entry?.messagesSent || 0),
          conversations: Number(entry?.conversations || 0),
        })),
      };

      const pendingRows: PendingMember[] = (pendingPaymentsResponse?.tableData || []).map((member: any) => ({
        id: String(member?._id || ''),
        name: String(member?.name || 'Member'),
        fee: Number(member?.fee || 0),
        nextDueDate: toDateOnly(member?.nextDueDate),
        overdueDays: Number(member?.overdueDays || 0),
      }));

      const defaulters = pendingRows.filter(member => member.overdueDays > 7).slice(0, 5);
      const pendingMembers = pendingRows.slice(0, 5);

      const todayKey = toDateOnly(new Date());
      const thisMonthKey = todayKey.slice(0, 7);

      const payments = (paymentsResponse?.tableData || []).map((payment: any) => ({
        amount: Number(payment?.amount || 0),
        paidDate: toDateOnly(payment?.paidDate),
      }));

      const todayPayments = payments.filter(payment => payment.paidDate === todayKey);
      const todayTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

      const thisMonthCollection = payments
        .filter(payment => payment.paidDate.startsWith(thisMonthKey))
        .reduce((sum, payment) => sum + payment.amount, 0);

      const monthRevenueMap = payments.reduce((acc, payment) => {
        const monthKey = payment.paidDate.slice(0, 7);
        if (!monthKey || monthKey.length < 7) return acc;
        const prev = acc.get(monthKey) || 0;
        acc.set(monthKey, prev + payment.amount);
        return acc;
      }, new Map<string, number>());

      const growthMap = (growthResponse?.items || []).reduce((acc: Map<string, number>, row: any) => {
        const key = String(row?.month || '');
        if (!key) return acc;
        acc.set(key, Number(row?.joined || 0));
        return acc;
      }, new Map<string, number>());

      const lastSixMonthKeys = getLastMonthKeys(6);
      const revenueSeries = lastSixMonthKeys.map(monthKey => ({
        month: monthLabelFromKey(monthKey),
        revenue: Number(monthRevenueMap.get(monthKey) || 0),
      }));
      const joinedSeries = lastSixMonthKeys.map(monthKey => ({
        month: monthLabelFromKey(monthKey),
        joined: Number(growthMap.get(monthKey) || 0),
      }));

      const now = new Date();
      const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
      const threeDaysLater = new Date(todayStart);
      threeDaysLater.setUTCDate(threeDaysLater.getUTCDate() + 3);

      const expiringSoon = (activeMembersResponse?.tableData || [])
        .map((member: any) => ({
          id: String(member?._id || ''),
          name: String(member?.name || 'Member'),
          nextDueDate: toDateOnly(member?.nextDueDate),
        }))
        .filter(member => {
          const dueDate = new Date(member.nextDueDate);
          return !Number.isNaN(dueDate.getTime()) && dueDate >= todayStart && dueDate <= threeDaysLater;
        });

      let lastMessageDate = '-';
      (usage.dailyData || []).forEach(item => {
        if (item.messagesSent <= 0 || !item.date || item.date === '-') return;
        if (lastMessageDate === '-' || item.date > lastMessageDate) {
          lastMessageDate = item.date;
        }
      });

      const gym = billingSummary?.gym || {};
      const gymStatus = String(gym?.status || dashboardStats?.gymStatus || 'active');
      const waMode = gym?.waMode === 'dedicated' ? 'dedicated' : 'shared';

      return {
        usage,
        waMode,
        gymStatus,
        graceDaysLeft: Number(gym?.subscription?.gracePeriodDays || 0),
        totalMembers: Number(dashboardStats?.totalMembers || 0),
        pendingAmount: Number(dashboardStats?.pendingAmount || 0),
        thisMonthCollection,
        expectedNextMonth: thisMonthCollection + Number(dashboardStats?.pendingAmount || 0),
        pendingMembers,
        defaulters,
        expiringSoon,
        todayTotal,
        todayPaymentsCount: todayPayments.length,
        revenueSeries,
        joinedSeries,
        supportTotal: Number(supportTotalResponse?.totalCount || 0),
        supportOpen: Number(supportOpenResponse?.totalCount || 0),
        supportResolved: Number(supportResolvedResponse?.totalCount || 0),
        lastMessageDate,
      };
    },
  });

  const dashboard = useMemo(
    () =>
      data || {
        usage: {
          messagesUsed: 0,
          planLimit: 0,
          messagesFailed: 0,
          deliveryRate: 0,
          conversationsThisMonth: 0,
          dailySafeLimit: 0,
          whatsappPaused: false,
          dailyData: [],
        } as DashboardUsage,
        waMode: 'shared',
        gymStatus: 'active',
        graceDaysLeft: 0,
        totalMembers: 0,
        pendingAmount: 0,
        thisMonthCollection: 0,
        expectedNextMonth: 0,
        pendingMembers: [] as PendingMember[],
        defaulters: [] as PendingMember[],
        expiringSoon: [] as Array<{ id: string; name: string; nextDueDate: string }>,
        todayTotal: 0,
        todayPaymentsCount: 0,
        revenueSeries: [] as Array<{ month: string; revenue: number }>,
        joinedSeries: [] as Array<{ month: string; joined: number }>,
        supportTotal: 0,
        supportOpen: 0,
        supportResolved: 0,
        lastMessageDate: '-',
      },
    [data],
  );

  if (isLoading && !data) {
    return <TablePageSkeleton columns={4} rows={6} />;
  }

  const usagePct = dashboard.usage.planLimit > 0
    ? Math.round((dashboard.usage.messagesUsed / dashboard.usage.planLimit) * 100)
    : 0;
  const remaining = Math.max(0, dashboard.usage.planLimit - dashboard.usage.messagesUsed);
  const exceeded = usagePct > 100;
  const nearLimit = usagePct > 80 && !exceeded;
  const isBasic = dashboard.waMode === 'shared';
  const isPro = dashboard.waMode === 'dedicated';

  const isExpired = new Set(['suspended', 'frozen']).has(dashboard.gymStatus);
  const isGracePeriod = dashboard.gymStatus === 'grace_period';
  const assistantPaused = exceeded || Boolean(dashboard.usage.whatsappPaused);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Gym Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back, {user?.name || 'Owner'}!</p>
      </div>

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
            <p className="text-sm font-medium text-foreground">Your subscription will expire in {dashboard.graceDaysLeft} days.</p>
          </div>
        </div>
      )}

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
        <StatsCard title={`Total ${labels.entityLabelPlural}`} value={dashboard.totalMembers} icon={Users} variant="primary" />
        <StatsCard title="This Month Collection" value={`Rs. ${dashboard.thisMonthCollection.toLocaleString()}`} icon={DollarSign} variant="success" />
        <StatsCard title="Pending Amount" value={`Rs. ${dashboard.pendingAmount.toLocaleString()}`} icon={Wallet} variant="warning" />
        <StatsCard title="Expected Next Month" value={`Rs. ${dashboard.expectedNextMonth.toLocaleString()}`} icon={TrendingUp} variant="primary" />
      </div>

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
                  <p className="text-xl font-bold text-foreground">{dashboard.usage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan Limit</p>
                  <p className="text-xl font-bold text-foreground">{dashboard.usage.planLimit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold text-foreground">{remaining.toLocaleString()}</p>
                </div>
              </div>
              <WhatsAppUsageBar used={dashboard.usage.messagesUsed} limit={dashboard.usage.planLimit} />
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
                  <p className="text-xl font-bold text-foreground">{dashboard.usage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Conversations Started</p>
                  <p className="text-xl font-bold text-foreground">{(dashboard.usage.conversationsThisMonth || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Success</p>
                  <p className="text-xl font-bold text-success">{dashboard.usage.deliveryRate || 0}%</p>
                </div>
              </div>
              <WhatsAppUsageBar used={dashboard.usage.messagesUsed} limit={dashboard.usage.planLimit} />
              <Button variant="outline" size="sm" onClick={() => setUsageModalOpen(true)}>
                <Eye className="mr-1 h-3 w-3" /> View Usage Details
              </Button>
            </>
          )}
        </CardContent>
      </Card>

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
                <p className="text-2xl font-bold text-foreground">Rs. {dashboard.todayTotal.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">{dashboard.todayPaymentsCount} payment(s) today</p>
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
            {dashboard.expiringSoon.length === 0 ? (
              <p className="text-sm text-muted-foreground">No members expiring in the next 3 days.</p>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{dashboard.expiringSoon.length} member(s) expiring in 3 days</p>
                {dashboard.expiringSoon.slice(0, 3).map(member => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg bg-warning/5 p-2">
                    <span className="text-sm font-medium text-foreground">{member.name}</span>
                    <span className="text-xs text-muted-foreground">{member.nextDueDate}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboard.revenueSeries}>
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
            <CardTitle className="text-lg">{labels.entityLabelPlural} Joined Per Month</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.joinedSeries}>
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
            {dashboard.defaulters.length === 0 ? (
              <p className="text-sm text-muted-foreground">No high priority defaulters. Great!</p>
            ) : (
              <div className="space-y-3">
                {dashboard.defaulters.map(member => (
                  <div key={member.id} className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{member.name}</p>
                      <p className="text-xs text-muted-foreground">Due: {member.nextDueDate}</p>
                    </div>
                    <Badge className="bg-destructive/10 text-destructive hover:bg-destructive/20">Rs. {member.fee.toLocaleString()}</Badge>
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
              {dashboard.pendingMembers.map(member => (
                <div key={member.id} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{member.name}</p>
                    <p className="text-xs text-muted-foreground">Due: {member.nextDueDate}</p>
                  </div>
                  <Badge className="bg-warning/10 text-warning hover:bg-warning/20">Rs. {member.fee.toLocaleString()}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
              <p className="text-xl font-bold text-foreground">{dashboard.supportTotal}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Open</p>
              <p className="text-xl font-bold text-destructive">{dashboard.supportOpen}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Resolved</p>
              <p className="text-xl font-bold text-success">{dashboard.supportResolved}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => { window.location.href = '/gym/support'; }}>
            View All
          </Button>
        </CardContent>
      </Card>

      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquare className="h-5 w-5 text-success" /> WhatsApp Assistant
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={assistantPaused ? 'bg-warning/10 text-warning hover:bg-warning/20' : 'bg-success/10 text-success hover:bg-success/20'}>
              {assistantPaused ? 'Paused' : 'Connected'}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Last message sent</span>
            <span className="text-sm text-foreground">{dashboard.lastMessageDate}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => { window.location.href = '/gym/support'; }}><LifeBuoy className="mr-1 h-3 w-3" /> Send Help Request</Button>
          </div>
        </CardContent>
      </Card>

      {isPro && (
        <WhatsAppUsageDetailsModal
          open={usageModalOpen}
          onOpenChange={setUsageModalOpen}
          usage={dashboard.usage}
        />
      )}
    </div>
  );
};

export default GymDashboard;
