import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { gymUsage } from '@/data/mockData';
import WhatsAppUsageBar from '@/components/WhatsAppUsageBar';

const usageStatusStyles: Record<string, string> = {
  within_limit: 'bg-success/10 text-success hover:bg-success/20',
  near_limit: 'bg-warning/10 text-warning hover:bg-warning/20',
  exceeded: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const usageStatusLabels: Record<string, string> = {
  within_limit: 'Normal',
  near_limit: 'Near Limit',
  exceeded: 'Exceeded',
};

const AdminUsage = () => {
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = gymUsage.filter(u => {
    if (planFilter !== 'all' && u.planName !== planFilter) return false;
    if (statusFilter !== 'all' && u.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usage</h1>
        <p className="text-sm text-muted-foreground">Monitor per-gym WhatsApp resource usage</p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Plan Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Plans</SelectItem>
            <SelectItem value="Basic">Basic</SelectItem>
            <SelectItem value="Pro">Pro</SelectItem>
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
                  <TableHead>%</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(u => {
                  const pct = u.planLimit > 0 ? Math.round((u.whatsappUsed / u.planLimit) * 100) : 0;
                  return (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">{u.gymName}</TableCell>
                      <TableCell>{u.planName}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {u.wa_mode === 'shared' ? 'Shared' : 'Dedicated'}
                        </Badge>
                      </TableCell>
                      <TableCell>{u.whatsappUsed.toLocaleString()}</TableCell>
                      <TableCell>{u.planLimit.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <WhatsAppUsageBar used={u.whatsappUsed} limit={u.planLimit} className="w-20" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={usageStatusStyles[u.status]}>
                          {usageStatusLabels[u.status]}
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

export default AdminUsage;
