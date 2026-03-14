import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

const actionColors: Record<string, string> = {
  'Created Member': 'bg-success/10 text-success hover:bg-success/20',
  'Mark Paid': 'bg-primary/10 text-primary hover:bg-primary/20',
  'Deleted Member': 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  'Updated Plan': 'bg-warning/10 text-warning hover:bg-warning/20',
  'Frozen Account': 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  'Sent Announcement': 'bg-primary/10 text-primary hover:bg-primary/20',
  'Manual Payment Override': 'bg-warning/10 text-warning hover:bg-warning/20',
};

const mapLog = (row: any) => ({
  id: String(row?._id || row?.id || ''),
  action: String(row?.action || '-'),
  performedBy: String(row?.actorRole || row?.actorUserId || '-'),
  gym: String(row?.gymId || '-'),
  timestamp: row?.createdAt ? new Date(row.createdAt).toISOString().replace('T', ' ').slice(0, 16) : '-',
});

const AdminActivityLogs = () => {
  const table = useServerTableControls({
    searchFields: ['action', 'performedBy', 'gym'],
    pageSize: 10,
    sortKeyMap: {
      performedBy: 'actorRole',
      gym: 'gymId',
      timestamp: 'createdAt',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-activity-logs', table.search, table.sort, table.page],
    queryFn: () => adminApi.listActivityLogs(table.toPayload()),
  });

  const logs = useMemo(() => (data?.tableData || []).map(mapLog), [data]);
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  if (isLoading && !data) {
    return <TablePageSkeleton columns={4} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity Logs</h1>
        <p className="text-sm text-muted-foreground">Audit trail of all platform actions</p>
      </div>

      <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search logs..." />

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Action" sortKey="action" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Performed By" sortKey="performedBy" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Gym" sortKey="gym" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Timestamp" sortKey="timestamp" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Loading logs...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && logs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge className={actionColors[log.action] || 'bg-secondary text-secondary-foreground'}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{log.performedBy}</TableCell>
                    <TableCell className="text-muted-foreground">{log.gym}</TableCell>
                    <TableCell className="text-muted-foreground">{log.timestamp}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={totalPages} totalItems={totalCount} onPageChange={table.setPage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminActivityLogs;
