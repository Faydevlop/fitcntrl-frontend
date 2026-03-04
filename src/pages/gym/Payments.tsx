import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/EmptyState';
import { Wallet } from 'lucide-react';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useQuery } from '@tanstack/react-query';
import { gymApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

type Payment = {
  id: string;
  memberId: string;
  memberName: string;
  amount: number;
  paidDate: string;
  month: string;
  method: 'cash' | 'upi' | 'card' | 'online';
  isPartial?: boolean;
  notes?: string;
};

const mapPayment = (row: any, memberNameById: Record<string, string>): Payment => ({
  id: String(row?._id || row?.id || ''),
  memberId: String(row?.memberId || ''),
  memberName: memberNameById[String(row?.memberId || '')] || 'Member',
  amount: Number(row?.amount || 0),
  paidDate: row?.paidDate ? new Date(row.paidDate).toISOString().split('T')[0] : '-',
  month: String(row?.monthLabel || '-'),
  method: row?.method === 'upi' ? 'upi' : row?.method === 'card' ? 'card' : row?.method === 'online' ? 'online' : 'cash',
  isPartial: Boolean(row?.isPartial),
  notes: row?.notes ? String(row.notes) : '',
});

const GymPayments = () => {
  const table = useServerTableControls({
    searchFields: ['memberName', 'monthLabel', 'method'],
    pageSize: 10,
    sortKeyMap: {
      memberName: 'memberId',
      month: 'monthLabel',
    },
  });

  const { data: membersResponse } = useQuery({
    queryKey: ['gym-members-map'],
    queryFn: () =>
      gymApi.listMembers({
        options: { page: 1, itemsPerPage: 500, sortBy: ['createdAt'], sortDesc: [true] },
      }),
  });

  const memberNameById = useMemo(() => {
    return (membersResponse?.tableData || []).reduce((acc: Record<string, string>, row: any) => {
      acc[String(row?._id || '')] = String(row?.name || 'Member');
      return acc;
    }, {});
  }, [membersResponse]);

  const { data, isLoading } = useQuery({
    queryKey: ['gym-payments', table.search, table.sort, table.page],
    queryFn: () => gymApi.listPayments(table.toPayload()),
  });

  const payments = useMemo(
    () => (data?.tableData || []).map((row: any) => mapPayment(row, memberNameById)),
    [data, memberNameById],
  );
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  if (isLoading && !data) {
    return <TablePageSkeleton columns={6} />;
  }

  if (!isLoading && payments.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-sm text-muted-foreground">Payment history</p>
        </div>
        <EmptyState icon={Wallet} title="No payments yet" description="Payments will appear here once members start paying." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Payments</h1>
        <p className="text-sm text-muted-foreground">{totalCount} payments recorded</p>
      </div>

      <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search payments..." />

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Member" sortKey="memberName" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Amount" sortKey="amount" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Paid Date" sortKey="paidDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Month" sortKey="month" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Loading payments...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && payments.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.memberName}</TableCell>
                    <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                    <TableCell className="text-muted-foreground">{p.paidDate}</TableCell>
                    <TableCell className="text-muted-foreground">{p.month}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="uppercase text-xs">{p.method}</Badge>
                      {p.isPartial && <Badge className="ml-1 bg-warning/10 text-warning text-[10px]">Partial</Badge>}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.notes || '—'}</TableCell>
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

export default GymPayments;
