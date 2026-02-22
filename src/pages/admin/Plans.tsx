import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { plans as initialPlans, ALL_FEATURES, type Plan } from '@/data/mockData';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';

const AdminPlans = () => {
  const [planList] = useState<Plan[]>(initialPlans);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const table = useTableControls({
    data: planList,
    searchFields: ['name'],
    pageSize: 10,
  });

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans & Pricing</h1>
          <p className="text-sm text-muted-foreground">Manage your SaaS subscription plans</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (o) setSelectedFeatures([]); }}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>Add New Plan</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2"><Label>Plan Name</Label><Input placeholder="e.g. Pro Plus" /></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label>Price (₹)</Label><Input type="number" placeholder="999" /></div>
                <div className="grid gap-2"><Label>Billing Cycle</Label><Select><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2"><Label>Max Members</Label><Input type="number" placeholder="100" /></div>
                <div className="grid gap-2"><Label>WhatsApp Limit/mo</Label><Input type="number" placeholder="500" /></div>
              </div>
              <div className="grid gap-2">
                <Label>Features</Label>
                <div className="grid gap-2 rounded-lg border border-border p-3">
                  {ALL_FEATURES.map(f => (
                    <label key={f} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={selectedFeatures.includes(f)} onCheckedChange={() => toggleFeature(f)} />
                      {f}
                      {f === 'Multi Staff Access' && (<Badge variant="secondary" className="text-[10px] ml-1">Future</Badge>)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Billing Configuration</p>
                <div className="grid gap-4">
                  <div className="grid gap-2"><Label>Razorpay Plan ID</Label><Input placeholder="plan_XXXXXXXXXXXXX" /></div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2"><Label>Trial Days</Label><Input type="number" placeholder="14" min={0} /></div>
                    <div className="grid gap-2"><Label>Grace Period Days</Label><Input type="number" placeholder="7" min={0} /></div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2"><Switch defaultChecked /><Label>Active</Label></div>
              <Button className="mt-2" onClick={() => setDialogOpen(false)}>Save Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <TableSearchBar value={table.search} onChange={table.setSearch} placeholder="Search plans..." />

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Plan Name" sortKey="name" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Price" sortKey="price" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="Member Limit" sortKey="maxMembers" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead><SortableHeader label="WhatsApp Limit" sortKey="whatsappLimit" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                  <TableHead>Trial</TableHead>
                  <TableHead>Grace</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {table.paginatedData.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>₹{plan.price}/{plan.billing === 'monthly' ? 'mo' : 'yr'}</TableCell>
                    <TableCell>{plan.maxMembers}</TableCell>
                    <TableCell>{plan.whatsappLimit}</TableCell>
                    <TableCell>{plan.trialDays ?? 0}d</TableCell>
                    <TableCell>{plan.gracePeriodDays ?? 0}d</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 2).map(f => (<Badge key={f} variant="secondary" className="text-xs">{f}</Badge>))}
                        {plan.features.length > 2 && (<Badge variant="secondary" className="text-xs">+{plan.features.length - 2}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell><Badge className={plan.active ? 'bg-success/10 text-success hover:bg-success/20' : ''}>{plan.active ? 'Active' : 'Inactive'}</Badge></TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={table.totalPages} totalItems={table.totalFiltered} onPageChange={table.setPage} />
        </CardContent>
      </Card>

      <Card className="card-shadow border-0">
        <CardHeader><CardTitle className="text-lg">Billing Configuration</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan</TableHead>
                  <TableHead>Razorpay Plan ID</TableHead>
                  <TableHead>Trial Days</TableHead>
                  <TableHead>Grace Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planList.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{plan.razorpayPlanId || '—'}</TableCell>
                    <TableCell>{plan.trialDays ?? 0} days</TableCell>
                    <TableCell>{plan.gracePeriodDays ?? 0} days</TableCell>
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

export default AdminPlans;
