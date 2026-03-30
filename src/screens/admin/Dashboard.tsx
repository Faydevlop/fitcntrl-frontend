import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { Building2, DollarSign, AlertTriangle, PieChart, Inbox, HeadsetIcon } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { adminApi } from '@/services/api';

type RecentGym = {
  id: string;
  name: string;
  ownerName: string;
  planName: string;
  membersCount: number;
  status: string;
};

const statusColor: Record<string, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  grace_period: 'bg-warning/10 text-warning hover:bg-warning/20',
  frozen: 'bg-primary/10 text-primary hover:bg-primary/20',
  suspended: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const formatCurrency = (value: number) => `Rs. ${Number(value || 0).toLocaleString()}`;

const monthLabelFromKey = (monthKey: string): string => {
  const [yearPart, monthPart] = String(monthKey || '').split('-');
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!year || !month || month < 1 || month > 12) return monthKey;
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', { month: 'short' });
};

const AdminDashboard = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-live'],
    queryFn: async () => {
      const [
        revenueStats,
        plansResponse,
        activeGymsResponse,
        recentGymsResponse,
        subscriptionsResponse,
        newEnquiriesResponse,
        openSupportResponse,
        inProgressSupportResponse,
      ] = await Promise.all([
        adminApi.revenueStats(),
        adminApi.listPlans({
          options: { page: 1, itemsPerPage: 500, sortBy: ['createdAt'], sortDesc: [true] },
        }),
        adminApi.listGyms({
          filters: { status: 'active' },
          options: { page: 1, itemsPerPage: 1 },
        }),
        adminApi.listGyms({
          options: { page: 1, itemsPerPage: 5, sortBy: ['createdAt'], sortDesc: [true] },
        }),
        adminApi.listSubscriptions({
          options: { page: 1, itemsPerPage: 5000, sortBy: ['createdAt'], sortDesc: [true] },
        }),
        adminApi.listEnquiries({
          filters: { status: 'new' },
          options: { page: 1, itemsPerPage: 1 },
        }),
        adminApi.listOwnerSupport({
          filters: { status: 'open' },
          options: { page: 1, itemsPerPage: 1 },
        }),
        adminApi.listOwnerSupport({
          filters: { status: 'in_progress' },
          options: { page: 1, itemsPerPage: 1 },
        }),
      ]);

      const planPriceById = new Map<string, number>();
      const planPriceByName = new Map<string, number>();
      const planNameById = new Map<string, string>();

      (plansResponse?.tableData || []).forEach((plan: any) => {
        const id = String(plan?._id || '');
        const name = String(plan?.name || '-');
        const price = Number(plan?.price || 0);
        if (id) {
          planPriceById.set(id, price);
          planNameById.set(id, name);
        }
        if (name) {
          planPriceByName.set(name, price);
        }
      });

      const subscriptions = subscriptionsResponse?.tableData || [];
      const recurringStatuses = new Set(['active', 'trialing']);
      const mrr = subscriptions.reduce((sum: number, subscription: any) => {
        const status = String(subscription?.status || '');
        if (!recurringStatuses.has(status)) return sum;

        const planId = String(subscription?.planId || '');
        const planName = String(subscription?.planName || '');
        const price =
          planPriceById.get(planId) ??
          planPriceByName.get(planName) ??
          0;
        return sum + price;
      }, 0);

      const failedPaymentsCount = subscriptions.filter((subscription: any) => {
        const status = String(subscription?.status || '');
        const paymentStatus = String(subscription?.paymentStatus || '');
        return status === 'past_due' || paymentStatus === 'overdue';
      }).length;

      const recentGyms: RecentGym[] = (recentGymsResponse?.tableData || []).map((gym: any) => {
        const planId = String(gym?.planId || '');
        return {
          id: String(gym?._id || ''),
          name: String(gym?.name || '-'),
          ownerName: String(gym?.ownerName || '-'),
          planName: planNameById.get(planId) || '-',
          membersCount: Number(gym?.memberCounts?.total || 0),
          status: String(gym?.status || 'active'),
        };
      });

      return {
        mrr,
        activeGyms: Number(activeGymsResponse?.totalCount || 0),
        failedPaymentsCount,
        newEnquiriesCount: Number(newEnquiriesResponse?.totalCount || 0),
        openSupportTickets: Number(openSupportResponse?.totalCount || 0),
        inProgressSupportTickets: Number(inProgressSupportResponse?.totalCount || 0),
        monthlyRevenue: (revenueStats?.monthlyRevenue || []).map((row: any) => ({
          month: monthLabelFromKey(String(row?.month || '')),
          revenue: Number(row?.revenue || 0),
        })),
        revenueByPlan: (revenueStats?.revenueByPlan || []).map((row: any) => ({
          plan: String(row?.plan || '-'),
          revenue: Number(row?.revenue || 0),
          count: Number(row?.count || 0),
        })),
        recentGyms,
      };
    },
  });

  const dashboard = useMemo(
    () =>
      data || {
        mrr: 0,
        activeGyms: 0,
        failedPaymentsCount: 0,
        newEnquiriesCount: 0,
        openSupportTickets: 0,
        inProgressSupportTickets: 0,
        monthlyRevenue: [] as Array<{ month: string; revenue: number }>,
        revenueByPlan: [] as Array<{ plan: string; revenue: number; count: number }>,
        recentGyms: [] as RecentGym[],
      },
    [data],
  );

  if (isLoading && !data) {
    return <TablePageSkeleton columns={5} rows={6} />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Monthly Recurring Revenue" value={formatCurrency(dashboard.mrr)} icon={DollarSign} variant="success" />
        <StatsCard title="Total Active Gyms" value={dashboard.activeGyms} icon={Building2} variant="primary" />
        <StatsCard title="Failed Payments" value={dashboard.failedPaymentsCount} icon={AlertTriangle} variant="warning" />
        <StatsCard title="New Enquiries" value={dashboard.newEnquiriesCount} icon={Inbox} variant="primary" />
        <StatsCard
          title="Open Support Tickets"
          value={`${dashboard.openSupportTickets} open - ${dashboard.inProgressSupportTickets} in progress`}
          icon={HeadsetIcon}
          variant="warning"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Platform Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={dashboard.monthlyRevenue}>
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
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChart className="h-5 w-5 text-primary" /> Revenue by Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard.revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="plan" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {dashboard.revenueByPlan.map(row => (
                <div key={row.plan} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{row.plan} ({row.count} payments)</p>
                  <p className="text-lg font-bold text-foreground">{formatCurrency(row.revenue)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="text-lg">Recent Gym Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gym Name</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Members</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboard.recentGyms.map(gym => (
                  <TableRow key={gym.id}>
                    <TableCell className="font-medium">{gym.name}</TableCell>
                    <TableCell>{gym.ownerName}</TableCell>
                    <TableCell>{gym.planName}</TableCell>
                    <TableCell>{gym.membersCount}</TableCell>
                    <TableCell>
                      <Badge className={statusColor[gym.status] || statusColor.active}>
                        {gym.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
