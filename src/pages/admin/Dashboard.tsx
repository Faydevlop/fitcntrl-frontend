import StatsCard from '@/components/StatsCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Building2, DollarSign, TrendingDown, CalendarClock, AlertTriangle, PieChart, Inbox, HeadsetIcon } from 'lucide-react';
import { gyms, plans, subscriptions, adminRevenueData, revenueByPlan } from '@/data/mockData';
import { enquiries } from '@/data/enquiryData';
import { supportTickets } from '@/data/supportData';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
  const activeGyms = gyms.filter(g => g.status === 'active').length;
  const recentGyms = gyms.slice(0, 5);
  const mrr = plans.reduce((sum, p) => {
    const count = gyms.filter(g => g.planId === p.id && g.status === 'active').length;
    return sum + (p.price * count);
  }, 0);
  const expiringThisMonth = subscriptions.filter(s => {
    const exp = new Date(s.expiryDate);
    const now = new Date();
    return exp.getMonth() === now.getMonth() && exp.getFullYear() === now.getFullYear();
  }).length;
  const failedRenewals = subscriptions.filter(s => s.paymentStatus === 'overdue').length;
  const failedPaymentsCount = subscriptions.filter(s => s.subscriptionStatus === 'past_due').length;
  const newEnquiriesCount = enquiries.filter(e => e.status === 'new').length;
  const openSupportTickets = supportTickets.filter(t => t.status === 'open').length;
  const inProgressSupportTickets = supportTickets.filter(t => t.status === 'in_progress').length;

  const now = new Date();
  const weekLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const renewalsDueThisWeek = subscriptions.filter(s => {
    if (s.nextBillingDate === '-') return false;
    const d = new Date(s.nextBillingDate);
    return d >= now && d <= weekLater;
  }).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground">Overview of your platform</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatsCard title="Monthly Recurring Revenue" value={`₹${mrr.toLocaleString()}`} icon={DollarSign} variant="success" />
        <StatsCard title="Total Active Gyms" value={activeGyms} icon={Building2} variant="primary" />
        <StatsCard title="Failed Payments" value={failedPaymentsCount} icon={AlertTriangle} variant="warning" />
        <StatsCard title="New Enquiries" value={newEnquiriesCount} icon={Inbox} variant="primary" />
        <StatsCard title="Open Support Tickets" value={`${openSupportTickets} open · ${inProgressSupportTickets} in progress`} icon={HeadsetIcon} variant="warning" />
      </div>

      {/* Revenue by Plan */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Platform Revenue (Last 6 Months)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={adminRevenueData}>
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
              <BarChart data={revenueByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                <XAxis dataKey="plan" tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220 10% 46%)" />
                <Tooltip />
                <Bar dataKey="revenue" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {revenueByPlan.map(r => (
                <div key={r.plan} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">{r.plan} ({r.count} gyms)</p>
                  <p className="text-lg font-bold text-foreground">₹{r.revenue.toLocaleString()}</p>
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
                {recentGyms.map(gym => {
                  const statusColor: Record<string, string> = {
                    active: 'bg-success/10 text-success hover:bg-success/20',
                    grace_period: 'bg-warning/10 text-warning hover:bg-warning/20',
                    frozen: 'bg-primary/10 text-primary hover:bg-primary/20',
                    suspended: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
                  };
                  return (
                    <TableRow key={gym.id}>
                      <TableCell className="font-medium">{gym.name}</TableCell>
                      <TableCell>{gym.ownerName}</TableCell>
                      <TableCell>{plans.find(p => p.id === gym.planId)?.name}</TableCell>
                      <TableCell>{gym.membersCount}</TableCell>
                      <TableCell>
                        <Badge className={statusColor[gym.status] || ''}>
                          {gym.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
