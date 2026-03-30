import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Pencil, Trash2, CheckCircle, Search, Filter, UserCircle, Copy, SendHorizontal } from 'lucide-react';
import EmptyState from '@/components/EmptyState';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessLabel } from '@/data/businessTypes';
import { Users } from 'lucide-react';
import { SortableHeader, TablePagination } from '@/components/TableControls';
import { useServerTableControls } from '@/hooks/useServerTableControls';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gymApi } from '@/services/api';
import { useAppSelector } from '@/store/hooks';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';
import { toast } from '@/components/ui/sonner';

type MemberStatus = 'active' | 'paused' | 'expired' | 'blacklisted';

type Member = {
  id: string;
  countryCode: string;
  name: string;
  phone: string;
  plan: 'monthly' | 'quarterly' | 'yearly';
  fee: number;
  joinDate: string;
  nextDueDate: string;
  status: MemberStatus;
  paymentStatus: 'paid' | 'pending';
  notes: string;
  lastPaymentDate?: string;
  lastPaymentMethod?: 'cash' | 'upi' | 'card' | 'online';
};

const statusStyles: Record<MemberStatus, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  paused: 'bg-warning/10 text-warning hover:bg-warning/20',
  expired: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
  blacklisted: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const toDateInputValue = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getTodayDateInput = (): string => toDateInputValue(new Date());

const getNextMonthFirstDateInput = (baseDateInput?: string): string => {
  const baseDate = baseDateInput ? new Date(baseDateInput) : new Date();
  if (Number.isNaN(baseDate.getTime())) {
    return getNextMonthFirstDateInput();
  }
  return toDateInputValue(new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 1));
};

const formatPhoneWithCode = (countryCode: string, phone: string): string => {
  const normalizedPhone = phone.trim();
  if (!normalizedPhone) return '';
  if (normalizedPhone.startsWith('+')) return normalizedPhone;
  return `${countryCode.trim() || '91'} ${normalizedPhone}`.trim();
};

const GymMembers = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const labels = getBusinessLabel(user?.platformType || user?.businessType || 'gym');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending'>('all');
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [profileMember, setProfileMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [editingMemberId, setEditingMemberId] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [newMember, setNewMember] = useState({
    name: '',
    countryCode: '91',
    phone: '',
    plan: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    fee: '',
    joinDate: getTodayDateInput(),
    nextDueDate: getNextMonthFirstDateInput(getTodayDateInput()),
    status: 'active' as MemberStatus,
    notes: '',
  });
  const [newMemberFieldErrors, setNewMemberFieldErrors] = useState<Record<string, string>>({});
  const [newMemberError, setNewMemberError] = useState('');
  const [editMember, setEditMember] = useState({
    name: '',
    countryCode: '91',
    phone: '',
    plan: 'monthly' as 'monthly' | 'quarterly' | 'yearly',
    fee: '',
    nextDueDate: getNextMonthFirstDateInput(getTodayDateInput()),
    status: 'active' as MemberStatus,
    notes: '',
  });
  const [editMemberFieldErrors, setEditMemberFieldErrors] = useState<Record<string, string>>({});
  const [editMemberError, setEditMemberError] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paidDate: '',
    method: 'cash',
    isPartial: false,
    notes: '',
  });
  const [paymentError, setPaymentError] = useState('');

  const table = useServerTableControls({
    searchFields: ['name', 'phone', 'plan', 'status', 'paymentStatus'],
    pageSize: 10,
  });

  const constantsData = useAppSelector(state => state.app.constants) as Record<string, any> | null;

  const platformType = user?.platformType || user?.businessType || 'gym';
  const platformOptions = constantsData?.[`${platformType}_options`] || {};
  const categoryOptions: string[] = Array.isArray(platformOptions?.categories) ? platformOptions.categories : labels.categories;
  const paymentMethods: string[] = Array.isArray(platformOptions?.paymentMethods) ? platformOptions.paymentMethods : ['cash', 'upi', 'card', 'online'];

  const resetNewMemberForm = () => {
    const today = getTodayDateInput();
    setNewMember({
      name: '',
      countryCode: '91',
      phone: '',
      plan: 'monthly',
      fee: '',
      joinDate: today,
      nextDueDate: getNextMonthFirstDateInput(today),
      status: 'active',
      notes: '',
    });
    setNewMemberFieldErrors({});
    setNewMemberError('');
  };

  const resetEditMemberForm = () => {
    setEditMember({
      name: '',
      countryCode: '91',
      phone: '',
      plan: 'monthly',
      fee: '',
      nextDueDate: getNextMonthFirstDateInput(getTodayDateInput()),
      status: 'active',
      notes: '',
    });
    setEditingMemberId('');
    setEditMemberFieldErrors({});
    setEditMemberError('');
  };

  const { data, isLoading } = useQuery({
    queryKey: ['gym-members', table.search, table.sort, table.page, filterStatus],
    queryFn: () =>
      gymApi.listMembers(
        table.toPayload(filterStatus === 'all' ? {} : { paymentStatus: filterStatus }),
      ),
  });

  const memberList = useMemo(() => {
    return (data?.tableData || []).map((row: any) => ({
      id: String(row?._id || ''),
      countryCode: String(row?.countryCode || '91'),
      name: String(row?.name || ''),
      phone: String(row?.phone || ''),
      plan: row?.plan === 'quarterly' ? 'quarterly' : row?.plan === 'yearly' ? 'yearly' : 'monthly',
      fee: Number(row?.fee || 0),
      joinDate: row?.joinDate ? new Date(row.joinDate).toISOString().split('T')[0] : '-',
      nextDueDate: row?.nextDueDate ? new Date(row.nextDueDate).toISOString().split('T')[0] : '-',
      status: row?.status === 'paused' ? 'paused' : row?.status === 'expired' ? 'expired' : row?.status === 'blacklisted' ? 'blacklisted' : 'active',
      paymentStatus: row?.paymentStatus === 'paid' ? 'paid' : 'pending',
      notes: String(row?.notes || ''),
      lastPaymentDate: row?.lastPaymentDate ? new Date(row.lastPaymentDate).toISOString().split('T')[0] : undefined,
      lastPaymentMethod: row?.lastPaymentMethod || undefined,
    })) as Member[];
  }, [data]);

  const totalCount = data?.totalCount || 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / table.pageSize));

  const { data: billingData } = useQuery({
    queryKey: ['gym-billing-lite'],
    queryFn: () => gymApi.billingSummary(),
  });

  const currentGym = billingData?.gym || {};

  const paymentMutation = useMutation({
    mutationFn: (payload: { member: Member; amount: number; paidDate: string; method: string; isPartial: boolean; notes: string }) =>
      gymApi.createPayment({
        memberId: payload.member.id,
        amount: payload.amount,
        paidDate: new Date(payload.paidDate).toISOString(),
        monthLabel: new Date(payload.paidDate).toLocaleString('default', { month: 'long', year: 'numeric' }),
        method: payload.method,
        isPartial: payload.isPartial,
        notes: payload.notes.trim() || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      queryClient.invalidateQueries({ queryKey: ['gym-payments'] });
      queryClient.invalidateQueries({ queryKey: ['gym-dashboard-live'] });
      setPayOpen(false);
      setSelectedMember(null);
      setPaymentError('');
    },
  });

  const createMemberMutation = useMutation({
    mutationFn: () =>
      gymApi.createMember({
        name: newMember.name.trim(),
        countryCode: newMember.countryCode.trim(),
        phone: newMember.phone.trim(),
        plan: newMember.plan,
        fee: Number(newMember.fee || 0),
        joinDate: newMember.joinDate || new Date().toISOString(),
        nextDueDate: newMember.nextDueDate || undefined,
        status: newMember.status,
        notes: newMember.notes.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      queryClient.invalidateQueries({ queryKey: ['gym-dashboard-live'] });
      setAddOpen(false);
      resetNewMemberForm();
    },
    onError: (error: unknown) => {
      setNewMemberError(error instanceof Error ? error.message : 'Unable to create member');
    },
  });

  const updateMemberMutation = useMutation({
    mutationFn: () =>
      gymApi.updateMember(editingMemberId, {
        name: editMember.name.trim(),
        countryCode: editMember.countryCode.trim(),
        phone: editMember.phone.trim(),
        plan: editMember.plan,
        fee: Number(editMember.fee || 0),
        nextDueDate: editMember.nextDueDate || undefined,
        status: editMember.status,
        notes: editMember.notes.trim(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      queryClient.invalidateQueries({ queryKey: ['gym-dashboard-live'] });
      setEditOpen(false);
      resetEditMemberForm();
      toast.success('Member updated successfully');
    },
    onError: (error: unknown) => {
      setEditMemberError(error instanceof Error ? error.message : 'Unable to update member');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => gymApi.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
      queryClient.invalidateQueries({ queryKey: ['gym-dashboard-live'] });
    },
  });

  const sendAllPaymentRequestsMutation = useMutation({
    mutationFn: () => gymApi.sendCurrentMonthPaymentRequests(),
    onSuccess: (response: any) => {
      const queuedCount = Number(response?.queuedCount || 0);
      const failedCount = Number(response?.failedCount || 0);
      toast.success(`Payment requests queued: ${queuedCount * 2} messages`);
      if (failedCount > 0) {
        toast.error(`${failedCount} members failed while sending payment requests`);
      }
      queryClient.invalidateQueries({ queryKey: ['gym-members'] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unable to send payment requests');
    },
  });

  const sendMemberPaymentRequestMutation = useMutation({
    mutationFn: (memberId: string) => gymApi.sendPaymentRequestToMember(memberId),
    onSuccess: () => {
      toast.success('Payment request sent (reminder + UPI link)');
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : 'Unable to send payment request');
    },
  });

  const handleMarkPaid = (member: Member) => {
    setSelectedMember(member);
    setPaymentForm({
      amount: String(member.fee || 0),
      paidDate: new Date().toISOString().split('T')[0],
      method: paymentMethods[0] || 'cash',
      isPartial: false,
      notes: '',
    });
    setPaymentError('');
    setPayOpen(true);
  };

  const handleSendPaymentRequest = (member: Member) => {
    sendMemberPaymentRequestMutation.mutate(member.id);
  };

  const handleSaveMember = () => {
    const errors: Record<string, string> = {};
    if (!newMember.name.trim()) errors.name = 'Name is required';
    if (!newMember.countryCode.trim()) {
      errors.countryCode = 'Country code is required';
    } else if (!/^\d{1,4}$/.test(newMember.countryCode.trim())) {
      errors.countryCode = 'Use country code like 91';
    }
    if (!newMember.phone.trim()) errors.phone = 'Phone is required';
    if (!newMember.fee.trim()) errors.fee = 'Fee is required';
    if (Number(newMember.fee) < 0) errors.fee = 'Fee must be zero or more';
    setNewMemberFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setNewMemberError('');
    createMemberMutation.mutate();
  };

  const handleEditMember = (member: Member) => {
    setEditingMemberId(member.id);
    setEditMember({
      name: member.name,
      countryCode: member.countryCode || '91',
      phone: member.phone,
      plan: 'monthly',
      fee: String(member.fee || 0),
      nextDueDate: member.nextDueDate && member.nextDueDate !== '-' ? member.nextDueDate : getNextMonthFirstDateInput(),
      status: member.status,
      notes: member.notes || '',
    });
    setEditMemberFieldErrors({});
    setEditMemberError('');
    setEditOpen(true);
  };

  const handleUpdateMember = () => {
    const errors: Record<string, string> = {};
    if (!editMember.name.trim()) errors.name = 'Name is required';
    if (!editMember.countryCode.trim()) {
      errors.countryCode = 'Country code is required';
    } else if (!/^\d{1,4}$/.test(editMember.countryCode.trim())) {
      errors.countryCode = 'Use country code like 91';
    }
    if (!editMember.phone.trim()) errors.phone = 'Phone is required';
    if (!editMember.fee.trim()) errors.fee = 'Fee is required';
    if (Number(editMember.fee) < 0) errors.fee = 'Fee must be zero or more';
    if (!editMember.nextDueDate) {
      errors.nextDueDate = 'Next due date is required';
    } else {
      const dueDate = new Date(editMember.nextDueDate);
      if (Number.isNaN(dueDate.getTime()) || dueDate.getDate() !== 1) {
        errors.nextDueDate = "Next due date must be the 1st day of month";
      }
    }
    setEditMemberFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    setEditMemberError('');
    updateMemberMutation.mutate();
  };

  const confirmPayment = () => {
    if (!selectedMember) return;
    const amount = Number(paymentForm.amount);
    if (!paymentForm.paidDate) {
      setPaymentError('Paid date is required');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setPaymentError('Amount must be greater than zero');
      return;
    }
    setPaymentError('');
    paymentMutation.mutate({
      member: selectedMember,
      amount,
      paidDate: paymentForm.paidDate,
      method: paymentForm.method,
      isPartial: paymentForm.isPartial,
      notes: paymentForm.notes,
    });
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === memberList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(memberList.map(m => m.id));
    }
  };

  const handleDeleteMember = (member: Member) => {
    const confirmed = window.confirm(`Blacklist ${member.name}?`);
    if (!confirmed) return;
    deleteMemberMutation.mutate(member.id);
  };

  const { data: profileData } = useQuery({
    queryKey: ['gym-member-profile', profileMember?.id],
    queryFn: () => gymApi.getMemberById(profileMember!.id),
    enabled: Boolean(profileMember?.id),
  });

  const memberPayments = profileData?.payments
    ? profileData.payments.map((payment: any) => ({
      id: String(payment?._id || ''),
      paidDate: payment?.paidDate ? new Date(payment.paidDate).toISOString().split('T')[0] : '-',
      amount: Number(payment?.amount || 0),
      method: payment?.method || 'cash',
      notes: payment?.notes || '',
    }))
    : [];
  const totalPaid = memberPayments.reduce((sum, p) => sum + p.amount, 0);

  if (isLoading && !data) {
    return <TablePageSkeleton columns={11} />;
  }

  // UPI link generation
  const generateUpiLink = (member: Member) => {
    const upiId = currentGym?.upiId || '';
    if (!upiId) return '';
    const now = new Date();
    const month = now.toLocaleString('default', { month: 'long' });
    return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(currentGym?.gymDisplayName || currentGym?.name || 'Gym')}&am=${member.fee}&tn=Gym Fee ${month}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{labels.entityLabelPlural}</h1>
          <p className="text-sm text-muted-foreground">{totalCount} total {labels.entityLabelPlural.toLowerCase()}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            onClick={() => sendAllPaymentRequestsMutation.mutate()}
            disabled={sendAllPaymentRequestsMutation.isPending}
          >
            <SendHorizontal className="mr-2 h-4 w-4" />
            {sendAllPaymentRequestsMutation.isPending ? 'Sending...' : 'Send Payment Requests'}
          </Button>
          <Dialog
            open={addOpen}
            onOpenChange={open => {
              setAddOpen(open);
              if (!open) resetNewMemberForm();
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={resetNewMemberForm}><Plus className="mr-2 h-4 w-4" /> Add Member</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New {labels.entityLabel}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder={`${labels.entityLabel} name`}
                    value={newMember.name}
                    onChange={event => setNewMember(prev => ({ ...prev, name: event.target.value }))}
                  />
                  {newMemberFieldErrors.name && <p className="text-xs text-destructive">{newMemberFieldErrors.name}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Country Code</Label>
                    <Input
                      placeholder="91"
                      value={newMember.countryCode}
                      onChange={event => setNewMember(prev => ({ ...prev, countryCode: event.target.value }))}
                    />
                    {newMemberFieldErrors.countryCode && (
                      <p className="text-xs text-destructive">{newMemberFieldErrors.countryCode}</p>
                    )}
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="9876543210"
                      value={newMember.phone}
                      onChange={event => setNewMember(prev => ({ ...prev, phone: event.target.value }))}
                    />
                    {newMemberFieldErrors.phone && <p className="text-xs text-destructive">{newMemberFieldErrors.phone}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Plan</Label>
                    <Input value="Monthly" readOnly />
                    <p className="text-xs text-muted-foreground">Plan is fixed to monthly.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.feeLabel} (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1500"
                      value={newMember.fee}
                      onChange={event => setNewMember(prev => ({ ...prev, fee: event.target.value }))}
                    />
                    {newMemberFieldErrors.fee && <p className="text-xs text-destructive">{newMemberFieldErrors.fee}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Join Date</Label>
                    <Input
                      type="date"
                      value={newMember.joinDate}
                      onChange={event =>
                        setNewMember(prev => ({
                          ...prev,
                          joinDate: event.target.value,
                          nextDueDate: getNextMonthFirstDateInput(event.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Next Due Date</Label>
                    <Input
                      type="date"
                      value={newMember.nextDueDate}
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">
                      Scheduled notifications are sent automatically on every month&apos;s 1st.
                    </p>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={newMember.status} onValueChange={value => setNewMember(prev => ({ ...prev, status: value as MemberStatus }))}>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="blacklisted">Blacklisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>{labels.categoryLabel}</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder={`Select ${labels.categoryLabel.toLowerCase()}`} /></SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map(c => <SelectItem key={c} value={c.toLowerCase().replace(/\s+/g, '_')}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Optional notes..."
                    value={newMember.notes}
                    onChange={event => setNewMember(prev => ({ ...prev, notes: event.target.value }))}
                  />
                </div>
                {newMemberError && <p className="text-xs text-destructive">{newMemberError}</p>}
                <Button className="mt-2" onClick={handleSaveMember} disabled={createMemberMutation.isPending}>
                  {createMemberMutation.isPending ? 'Saving...' : `Save ${labels.entityLabel}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={editOpen}
            onOpenChange={open => {
              setEditOpen(open);
              if (!open) resetEditMemberForm();
            }}
          >
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit {labels.entityLabel}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    placeholder={`${labels.entityLabel} name`}
                    value={editMember.name}
                    onChange={event => setEditMember(prev => ({ ...prev, name: event.target.value }))}
                  />
                  {editMemberFieldErrors.name && <p className="text-xs text-destructive">{editMemberFieldErrors.name}</p>}
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="grid gap-2">
                    <Label>Country Code</Label>
                    <Input
                      placeholder="91"
                      value={editMember.countryCode}
                      onChange={event => setEditMember(prev => ({ ...prev, countryCode: event.target.value }))}
                    />
                    {editMemberFieldErrors.countryCode && (
                      <p className="text-xs text-destructive">{editMemberFieldErrors.countryCode}</p>
                    )}
                  </div>
                  <div className="grid gap-2 sm:col-span-2">
                    <Label>Phone</Label>
                    <Input
                      placeholder="9876543210"
                      value={editMember.phone}
                      onChange={event => setEditMember(prev => ({ ...prev, phone: event.target.value }))}
                    />
                    {editMemberFieldErrors.phone && <p className="text-xs text-destructive">{editMemberFieldErrors.phone}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Plan</Label>
                    <Input value="Monthly" readOnly />
                    <p className="text-xs text-muted-foreground">Plan is fixed to monthly.</p>
                  </div>
                  <div className="grid gap-2">
                    <Label>{labels.feeLabel} (₹)</Label>
                    <Input
                      type="number"
                      placeholder="1500"
                      value={editMember.fee}
                      onChange={event => setEditMember(prev => ({ ...prev, fee: event.target.value }))}
                    />
                    {editMemberFieldErrors.fee && <p className="text-xs text-destructive">{editMemberFieldErrors.fee}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label>Next Due Date</Label>
                    <Input
                      type="date"
                      value={editMember.nextDueDate}
                      onChange={event =>
                        setEditMember(prev => ({
                          ...prev,
                          nextDueDate: event.target.value,
                        }))
                      }
                    />
                    {editMemberFieldErrors.nextDueDate && (
                      <p className="text-xs text-destructive">{editMemberFieldErrors.nextDueDate}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Scheduled notifications are sent automatically on every month&apos;s 1st.
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <Select value={editMember.status} onValueChange={value => setEditMember(prev => ({ ...prev, status: value as MemberStatus }))}>
                      <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Optional notes..."
                    value={editMember.notes}
                    onChange={event => setEditMember(prev => ({ ...prev, notes: event.target.value }))}
                  />
                </div>
                {editMemberError && <p className="text-xs text-destructive">{editMemberError}</p>}
                <Button className="mt-2" onClick={handleUpdateMember} disabled={updateMemberMutation.isPending}>
                  {updateMemberMutation.isPending ? 'Saving...' : `Update ${labels.entityLabel}`}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or phone..."
            className="pl-9"
            value={table.search}
            onChange={e => table.setSearch(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: 'all' | 'paid' | 'pending') => { setFilterStatus(v); table.setPage(1); }}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isLoading && memberList.length === 0 ? (
        <EmptyState icon={Users} title={`No ${labels.entityLabelPlural.toLowerCase()} found`} description={`No ${labels.entityLabelPlural.toLowerCase()} match your search or filter criteria.`} />
      ) : (
        <Card className="card-shadow border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={selectedIds.length === memberList.length && memberList.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead><SortableHeader label="Name" sortKey="name" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead><SortableHeader label="Plan" sortKey="plan" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead><SortableHeader label="Fee" sortKey="fee" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead><SortableHeader label="Next Due" sortKey="nextDueDate" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Last Payment</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead><SortableHeader label="Status" sortKey="status" currentSort={table.sort} onSort={table.toggleSort} /></TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                        Loading members...
                      </TableCell>
                    </TableRow>
                  )}
                  {!isLoading && memberList.map(m => (
                    <TableRow key={m.id}>
                      <TableCell>
                        <Checkbox checked={selectedIds.includes(m.id)} onCheckedChange={() => toggleSelect(m.id)} />
                      </TableCell>
                      <TableCell>
                        <button className="font-medium text-primary hover:underline" onClick={() => setProfileMember(m)}>
                          {m.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatPhoneWithCode(m.countryCode, m.phone)}</TableCell>
                      <TableCell className="capitalize">{m.plan}</TableCell>
                      <TableCell>₹{m.fee.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground">{m.nextDueDate}</TableCell>
                      <TableCell className="text-muted-foreground">{m.lastPaymentDate || '—'}</TableCell>
                      <TableCell>
                        {m.lastPaymentMethod ? (
                          <Badge variant="secondary" className="text-xs uppercase">{m.lastPaymentMethod}</Badge>
                        ) : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[m.status]}>
                          {m.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={m.paymentStatus === 'paid' ? 'bg-success/10 text-success hover:bg-success/20' : 'bg-warning/10 text-warning hover:bg-warning/20'}>
                          {m.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {m.paymentStatus === 'pending' && (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleMarkPaid(m)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          {m.paymentStatus === 'pending' && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary"
                              onClick={() => handleSendPaymentRequest(m)}
                              disabled={sendMemberPaymentRequestMutation.isPending}
                            >
                              <SendHorizontal className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setProfileMember(m)}>
                            <UserCircle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEditMember(m)}><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDeleteMember(m)}><Trash2 className="h-4 w-4" /></Button>
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
      )}

      {/* Mark Payment Dialog - Enhanced */}
      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mark Payment</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Recording payment for <strong>{selectedMember.name}</strong></p>
              <div className="grid gap-2">
                <Label>Amount (₹)</Label>
                <Input
                  type="number"
                  value={paymentForm.amount}
                  onChange={event => setPaymentForm(prev => ({ ...prev, amount: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Paid Date</Label>
                <Input
                  type="date"
                  value={paymentForm.paidDate}
                  onChange={event => setPaymentForm(prev => ({ ...prev, paidDate: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label>Payment Method</Label>
                <Select
                  value={paymentForm.method}
                  onValueChange={value => setPaymentForm(prev => ({ ...prev, method: value }))}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {paymentMethods.map(method => (
                      <SelectItem key={method} value={method}>{method.toUpperCase()}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="partial"
                  checked={paymentForm.isPartial}
                  onCheckedChange={value => setPaymentForm(prev => ({ ...prev, isPartial: Boolean(value) }))}
                />
                <Label htmlFor="partial">Partial Payment</Label>
              </div>
              <div className="grid gap-2">
                <Label>Transaction Note (optional)</Label>
                <Textarea
                  placeholder="Payment notes..."
                  value={paymentForm.notes}
                  onChange={event => setPaymentForm(prev => ({ ...prev, notes: event.target.value }))}
                />
              </div>
              {paymentError && <p className="text-xs text-destructive">{paymentError}</p>}
              <Button variant="success" onClick={confirmPayment} disabled={paymentMutation.isPending}>
                <CheckCircle className="mr-2 h-4 w-4" /> Confirm Payment
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Member Profile Sheet - Enhanced with tabs */}
      <Sheet open={!!profileMember} onOpenChange={(open) => { if (!open) setProfileMember(null); }}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Member Profile</SheetTitle>
          </SheetHeader>
          {profileMember && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {profileMember.name.charAt(0)}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{profileMember.name}</p>
                  <p className="text-sm text-muted-foreground">{formatPhoneWithCode(profileMember.countryCode, profileMember.phone)}</p>
                </div>
              </div>

              <Tabs defaultValue="details">
                <TabsList className="w-full">
                  <TabsTrigger value="details" className="flex-1">Details</TabsTrigger>
                  <TabsTrigger value="payments" className="flex-1">Payment History</TabsTrigger>
                  <TabsTrigger value="upi" className="flex-1">Payment Link</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Plan</p>
                      <p className="text-sm font-medium capitalize text-foreground">{profileMember.plan}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Fee</p>
                      <p className="text-sm font-medium text-foreground">₹{profileMember.fee.toLocaleString()}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge className={statusStyles[profileMember.status]}>{profileMember.status}</Badge>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Payment</p>
                      <Badge className={profileMember.paymentStatus === 'paid' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}>{profileMember.paymentStatus}</Badge>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Join Date</p>
                      <p className="text-sm font-medium text-foreground">{profileMember.joinDate}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Next Due</p>
                      <p className="text-sm font-medium text-foreground">{profileMember.nextDueDate}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Scheduled notifications go on every month&apos;s 1st.
                      </p>
                    </div>
                  </div>
                  {profileMember.notes && (
                    <div className="rounded-lg bg-muted/50 p-3">
                      <p className="text-xs text-muted-foreground">Notes</p>
                      <p className="text-sm text-foreground">{profileMember.notes}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4 mt-4">
                  <div className="flex items-center justify-between rounded-lg bg-primary/5 p-3">
                    <span className="text-sm text-muted-foreground">Total Paid</span>
                    <span className="text-lg font-bold text-foreground">₹{totalPaid.toLocaleString()}</span>
                  </div>
                  {memberPayments.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No payment records found.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {memberPayments.map(p => (
                          <TableRow key={p.id}>
                            <TableCell className="text-muted-foreground">{p.paidDate}</TableCell>
                            <TableCell>₹{p.amount.toLocaleString()}</TableCell>
                            <TableCell><Badge variant="secondary" className="text-xs uppercase">{p.method}</Badge></TableCell>
                            <TableCell className="text-xs text-muted-foreground">{p.notes || '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </TabsContent>

                <TabsContent value="upi" className="space-y-4 mt-4">
                  {currentGym?.upiId ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium text-foreground">Payment Link Preview</p>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-mono text-muted-foreground break-all">{generateUpiLink(profileMember)}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(generateUpiLink(profileMember))}>
                          <Copy className="mr-1 h-3 w-3" /> Copy Link
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Set up UPI ID in Settings to generate payment links.</p>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default GymMembers;
