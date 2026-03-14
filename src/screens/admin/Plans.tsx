import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { adminApi } from '@/services/api';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

type Plan = {
  id: string;
  name: string;
  price: number;
  isBasic: boolean;
  billing: 'monthly' | 'yearly';
  maxMembers: number;
  whatsappLimit: number;
  features: string[];
  active: boolean;
  razorpayPlanId?: string;
  trialDays?: number;
  gracePeriodDays?: number;
};

const ALL_FEATURES = [
  'Member Management',
  'Dashboard Analytics',
  'WhatsApp Reminders',
  'WhatsApp Owner Reports',
  'CSV Import',
  'Payment History',
  'Multi Staff Access',
];

type PlanForm = {
  name: string;
  price: string;
  isBasic: boolean;
  billing: 'monthly' | 'yearly';
  maxMembers: string;
  whatsappLimit: string;
  providerPlanId: string;
  trialDays: string;
  gracePeriodDays: string;
  active: boolean;
};

const emptyForm = (): PlanForm => ({
  name: '',
  price: '',
  isBasic: false,
  billing: 'monthly',
  maxMembers: '',
  whatsappLimit: '',
  providerPlanId: '',
  trialDays: '',
  gracePeriodDays: '',
  active: true,
});

const mapPlan = (plan: any): Plan => ({
  id: String(plan?._id || plan?.id || ''),
  name: String(plan?.name || ''),
  price: Number(plan?.price || 0),
  isBasic: Boolean(plan?.isBasic),
  billing: plan?.billing === 'yearly' ? 'yearly' : 'monthly',
  maxMembers: Number(plan?.maxMembers || 0),
  whatsappLimit: Number(plan?.whatsappLimit || 0),
  features: Array.isArray(plan?.features) ? plan.features.map((f: unknown) => String(f)) : [],
  active: Boolean(plan?.active),
  razorpayPlanId: plan?.providerPlanId ? String(plan.providerPlanId) : undefined,
  trialDays: typeof plan?.trialDays === 'number' ? plan.trialDays : undefined,
  gracePeriodDays: typeof plan?.gracePeriodDays === 'number' ? plan.gracePeriodDays : undefined,
});

const AdminPlans = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [form, setForm] = useState<PlanForm>(emptyForm());
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');

  const table = useServerTableControls({
    searchFields: ['name'],
    pageSize: 10,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-plans', table.search, table.sort, table.page],
    queryFn: () => adminApi.listPlans(table.toPayload()),
  });

  const planList = useMemo(() => (data?.tableData || []).map(mapPlan), [data]);
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  const createMutation = useMutation({
    mutationFn: (payload: any) => adminApi.createPlan(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans-lite'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-live'] });
      setDialogOpen(false);
      setEditingPlanId(null);
      setForm(emptyForm());
      setSelectedFeatures([]);
      setFieldErrors({});
      setFormError('');
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : 'Unable to create plan');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => adminApi.updatePlan(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans-lite'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-live'] });
      setDialogOpen(false);
      setEditingPlanId(null);
      setForm(emptyForm());
      setSelectedFeatures([]);
      setFieldErrors({});
      setFormError('');
    },
    onError: (error: unknown) => {
      setFormError(error instanceof Error ? error.message : 'Unable to update plan');
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => adminApi.updatePlan(id, { active: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-plans'] });
      queryClient.invalidateQueries({ queryKey: ['admin-plans-lite'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-live'] });
    },
  });

  if (isLoading && !data) {
    return <TablePageSkeleton columns={9} />;
  }

  const toggleFeature = (feature: string) => {
    setSelectedFeatures(prev =>
      prev.includes(feature) ? prev.filter(f => f !== feature) : [...prev, feature],
    );
  };

  const resetDialog = () => {
    setEditingPlanId(null);
    setForm(emptyForm());
    setSelectedFeatures([]);
    setFieldErrors({});
    setFormError('');
  };

  const openCreateDialog = () => {
    resetDialog();
    setDialogOpen(true);
  };

  const openEditDialog = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setSelectedFeatures(plan.features);
    setFieldErrors({});
    setForm({
      name: plan.name,
      price: String(plan.price),
      isBasic: Boolean(plan.isBasic),
      billing: plan.billing,
      maxMembers: String(plan.maxMembers),
      whatsappLimit: String(plan.whatsappLimit),
      providerPlanId: plan.razorpayPlanId || '',
      trialDays: String(plan.trialDays ?? 0),
      gracePeriodDays: String(plan.gracePeriodDays ?? 0),
      active: plan.active,
    });
    setDialogOpen(true);
  };

  const validate = () => {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Plan name is required';
    if (!form.price.trim()) errors.price = 'Price is required';
    if (Number(form.price) < 0) errors.price = 'Price must be zero or more';
    if (form.isBasic && Number(form.price || 0) > 0) {
      errors.price = 'Basic plan price must be 0';
    }
    if (form.maxMembers.trim() && Number(form.maxMembers) < 0) {
      errors.maxMembers = 'Member limit must be zero or more';
    }
    if (form.whatsappLimit.trim() && Number(form.whatsappLimit) < 0) {
      errors.whatsappLimit = 'WhatsApp limit must be zero or more';
    }
    if (form.trialDays.trim() && Number(form.trialDays) < 0) {
      errors.trialDays = 'Trial days must be zero or more';
    }
    if (form.gracePeriodDays.trim() && Number(form.gracePeriodDays) < 0) {
      errors.gracePeriodDays = 'Grace days must be zero or more';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    setFormError('');

    const payload = {
      name: form.name.trim(),
      billing: form.billing,
      price: Number(form.price || 0),
      isBasic: form.isBasic,
      maxMembers: Number(form.maxMembers || 0),
      whatsappLimit: Number(form.whatsappLimit || 0),
      features: selectedFeatures,
      active: form.active,
      providerPlanId: form.providerPlanId.trim() || undefined,
      trialDays: Number(form.trialDays || 0),
      gracePeriodDays: Number(form.gracePeriodDays || 0),
    };

    if (editingPlanId) {
      updateMutation.mutate({ id: editingPlanId, payload });
      return;
    }
    createMutation.mutate(payload);
  };

  const handleDeactivate = (plan: Plan) => {
    if (!plan.active) return;
    const confirmed = window.confirm(`Deactivate plan "${plan.name}"?`);
    if (!confirmed) return;
    deactivateMutation.mutate(plan.id);
  };

  const saving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Plans & Pricing</h1>
          <p className="text-sm text-muted-foreground">Manage your SaaS subscription plans</p>
        </div>
        <Dialog
          open={dialogOpen}
          onOpenChange={open => {
            setDialogOpen(open);
            if (!open) resetDialog();
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}><Plus className="mr-2 h-4 w-4" /> Add Plan</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingPlanId ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Plan Name</Label>
                <Input
                  placeholder="e.g. Pro Plus"
                  value={form.name}
                  onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
                />
                {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Price (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="999"
                    value={form.price}
                    disabled={form.isBasic}
                    onChange={event => setForm(prev => ({ ...prev, price: event.target.value }))}
                  />
                  {fieldErrors.price && <p className="text-xs text-destructive">{fieldErrors.price}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Billing Cycle</Label>
                  <Select
                    value={form.billing}
                    onValueChange={value => setForm(prev => ({ ...prev, billing: value as 'monthly' | 'yearly' }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Max Members</Label>
                  <Input
                    type="number"
                    placeholder="100"
                    value={form.maxMembers}
                    onChange={event => setForm(prev => ({ ...prev, maxMembers: event.target.value }))}
                  />
                  {fieldErrors.maxMembers && <p className="text-xs text-destructive">{fieldErrors.maxMembers}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>WhatsApp Limit/mo</Label>
                  <Input
                    type="number"
                    placeholder="500"
                    value={form.whatsappLimit}
                    onChange={event => setForm(prev => ({ ...prev, whatsappLimit: event.target.value }))}
                  />
                  {fieldErrors.whatsappLimit && <p className="text-xs text-destructive">{fieldErrors.whatsappLimit}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Features</Label>
                <div className="grid gap-2 rounded-lg border border-border p-3">
                  {ALL_FEATURES.map(feature => (
                    <label key={feature} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={selectedFeatures.includes(feature)} onCheckedChange={() => toggleFeature(feature)} />
                      {feature}
                      {feature === 'Multi Staff Access' && (<Badge variant="secondary" className="text-[10px] ml-1">Future</Badge>)}
                    </label>
                  ))}
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm font-semibold text-foreground mb-3">Billing Configuration</p>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label>Razorpay Plan ID</Label>
                    <Input
                      placeholder="plan_XXXXXXXXXXXXX"
                      value={form.providerPlanId}
                      onChange={event => setForm(prev => ({ ...prev, providerPlanId: event.target.value }))}
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Trial Days</Label>
                      <Input
                        type="number"
                        placeholder="14"
                        min={0}
                        value={form.trialDays}
                        onChange={event => setForm(prev => ({ ...prev, trialDays: event.target.value }))}
                      />
                      {fieldErrors.trialDays && <p className="text-xs text-destructive">{fieldErrors.trialDays}</p>}
                    </div>
                    <div className="grid gap-2">
                      <Label>Grace Period Days</Label>
                      <Input
                        type="number"
                        placeholder="7"
                        min={0}
                        value={form.gracePeriodDays}
                        onChange={event => setForm(prev => ({ ...prev, gracePeriodDays: event.target.value }))}
                      />
                      {fieldErrors.gracePeriodDays && <p className="text-xs text-destructive">{fieldErrors.gracePeriodDays}</p>}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.active} onCheckedChange={checked => setForm(prev => ({ ...prev, active: Boolean(checked) }))} />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isBasic}
                  onCheckedChange={checked =>
                    setForm(prev => ({
                      ...prev,
                      isBasic: Boolean(checked),
                      price: checked ? '0' : prev.price,
                    }))
                  }
                />
                <Label>Set as Basic Plan</Label>
              </div>
              {formError && <p className="text-xs text-destructive">{formError}</p>}
              <Button className="mt-2" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editingPlanId ? 'Update Plan' : 'Save Plan'}
              </Button>
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
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                      Loading plans...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && planList.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>Rs. {plan.price}/{plan.billing === 'monthly' ? 'mo' : 'yr'}</TableCell>
                    <TableCell>{plan.maxMembers}</TableCell>
                    <TableCell>{plan.whatsappLimit}</TableCell>
                    <TableCell>{plan.trialDays ?? 0}d</TableCell>
                    <TableCell>{plan.gracePeriodDays ?? 0}d</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {plan.features.slice(0, 2).map(feature => (<Badge key={feature} variant="secondary" className="text-xs">{feature}</Badge>))}
                        {plan.features.length > 2 && (<Badge variant="secondary" className="text-xs">+{plan.features.length - 2}</Badge>)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge className={plan.active ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-muted text-muted-foreground'}>
                          {plan.active ? 'Active' : 'Inactive'}
                        </Badge>
                        {plan.isBasic && (
                          <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                            Basic
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditDialog(plan)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeactivate(plan)}
                          disabled={!plan.active || plan.isBasic || deactivateMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={table.page} totalPages={totalPages} totalItems={totalCount} onPageChange={table.setPage} />
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
                  <TableHead>Basic</TableHead>
                  <TableHead>Razorpay Plan ID</TableHead>
                  <TableHead>Trial Days</TableHead>
                  <TableHead>Grace Period</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {planList.map(plan => (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">{plan.name}</TableCell>
                    <TableCell>{plan.isBasic ? 'Yes' : 'No'}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{plan.razorpayPlanId || '-'}</TableCell>
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
