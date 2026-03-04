import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import WhatsAppUsageBar from '@/components/WhatsAppUsageBar';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { adminApi } from '@/services/api';

type UsageRow = {
  id: string;
  gymName: string;
  planName: string;
  waMode: 'shared' | 'dedicated';
  whatsappUsed: number;
  planLimit: number;
  qualityRating: string;
  messagingLimitTier: string;
  status: 'within_limit' | 'near_limit' | 'exceeded';
};

const usageStatusStyles: Record<UsageRow['status'], string> = {
  within_limit: 'bg-success/10 text-success hover:bg-success/20',
  near_limit: 'bg-warning/10 text-warning hover:bg-warning/20',
  exceeded: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const usageStatusLabels: Record<UsageRow['status'], string> = {
  within_limit: 'Normal',
  near_limit: 'Near Limit',
  exceeded: 'Exceeded',
};

const normalizeStatus = (used: number, limit: number): UsageRow['status'] => {
  if (limit <= 0) return used > 0 ? 'exceeded' : 'within_limit';
  const pct = (used / limit) * 100;
  if (pct >= 100) return 'exceeded';
  if (pct >= 80) return 'near_limit';
  return 'within_limit';
};

const AdminUsage = () => {
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-usage-live'],
    queryFn: async () => {
      const [gymsResponse, plansResponse] = await Promise.all([
        adminApi.listGyms({
          filters: { includeLiveWhatsAppInsights: 'true' },
          options: { page: 1, itemsPerPage: 500, sortBy: ['name'], sortDesc: [false] },
        }),
        adminApi.listPlans({
          options: { page: 1, itemsPerPage: 500, sortBy: ['name'], sortDesc: [false] },
        }),
      ]);

      const planNameById = new Map<string, string>();
      (plansResponse?.tableData || []).forEach((plan: any) => {
        planNameById.set(String(plan?._id || ''), String(plan?.name || '-'));
      });

      const rows: UsageRow[] = (gymsResponse?.tableData || []).map((gym: any) => {
        const used = Number(gym?.whatsappUsage?.messagesUsed || 0);
        const limit = Number(gym?.whatsappUsage?.planLimit || 0);
        return {
          id: String(gym?._id || ''),
          gymName: String(gym?.name || '-'),
          planName: planNameById.get(String(gym?.planId || '')) || '-',
          waMode: gym?.waMode === 'dedicated' ? 'dedicated' : 'shared',
          whatsappUsed: used,
          planLimit: limit,
          qualityRating: String(gym?.whatsappUsage?.qualityRating || '-'),
          messagingLimitTier: String(gym?.whatsappUsage?.messagingLimitTier || '-'),
          status: normalizeStatus(used, limit),
        };
      });

      return {
        rows,
        planNames: Array.from(new Set(rows.map(row => row.planName).filter(Boolean))).sort(),
      };
    },
  });

  const filtered = useMemo(() => {
    const rows = data?.rows || [];
    return rows.filter(row => {
      if (planFilter !== 'all' && row.planName !== planFilter) return false;
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      return true;
    });
  }, [data, planFilter, statusFilter]);

  if (isLoading && !data) {
    return <TablePageSkeleton columns={9} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usage</h1>
        <p className="text-sm text-muted-foreground">Monitor per-gym WhatsApp usage with live quality and messaging limits</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Plan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            {(data?.planNames || []).map(name => (
              <SelectItem key={name} value={name}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Usage Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="within_limit">Normal</SelectItem>
            <SelectItem value="near_limit">Near Limit</SelectItem>
            <SelectItem value="exceeded">Exceeded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gym</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>WA Mode</TableHead>
                  <TableHead>Used</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead>Limit Tier</TableHead>
                  <TableHead>Quality</TableHead>
                  <TableHead>%</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(row => (
                  <TableRow key={row.id}>
                    <TableCell className="font-medium">{row.gymName}</TableCell>
                    <TableCell>{row.planName}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {row.waMode === 'shared' ? 'Shared' : 'Dedicated'}
                      </Badge>
                    </TableCell>
                    <TableCell>{row.whatsappUsed.toLocaleString()}</TableCell>
                    <TableCell>{row.planLimit.toLocaleString()}</TableCell>
                    <TableCell>{row.messagingLimitTier}</TableCell>
                    <TableCell>{row.qualityRating}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <WhatsAppUsageBar used={row.whatsappUsed} limit={row.planLimit} className="w-20" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={usageStatusStyles[row.status]}>
                        {usageStatusLabels[row.status]}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      No usage rows found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminUsage;
