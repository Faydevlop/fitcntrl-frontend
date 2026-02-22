import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import EmptyState from '@/components/EmptyState';
import { Wallet } from 'lucide-react';
import { payments } from '@/data/mockData';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';

const GymPayments = () => {
  const table = useTableControls({
    data: payments,
    searchFields: ['memberName', 'month', 'method'],
    pageSize: 10,
  });

  if (payments.length === 0) {
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
        <p className="text-sm text-muted-foreground">{payments.length} payments recorded</p>
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
                {table.paginatedData.map(p => (
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
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
        </CardContent>
      </Card>
    </div>
  );
};

export default GymPayments;
