import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save, CreditCard, QrCode } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessTypeName } from '@/data/businessTypes';
import PasswordResetCard from '@/components/PasswordResetCard';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gymApi } from '@/services/api';
import { toast } from '@/components/ui/sonner';
import TablePageSkeleton from '@/components/loaders/TablePageSkeleton';

const PHONE_REGEX = /^[+0-9][0-9\s-]{7,}$/;

const GymSettings = () => {
  const queryClient = useQueryClient();
  const { user, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [phone, setPhone] = useState('');
  const [upiId, setUpiId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saveError, setSaveError] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['gym-billing-summary'],
    queryFn: () => gymApi.billingSummary(),
  });

  const gym = data?.gym;

  useEffect(() => {
    setName(String(gym?.name || ''));
    setOwnerName(String(gym?.ownerName || user?.name || ''));
    setPhone(String(gym?.phone || user?.phone || ''));
    setUpiId(String(gym?.upiId || ''));
    setDisplayName(String(gym?.gymDisplayName || gym?.name || ''));
    setAutoRenewal(Boolean(gym?.subscription?.autoRenewal));
  }, [
    gym?.name,
    gym?.ownerName,
    gym?.phone,
    gym?.upiId,
    gym?.gymDisplayName,
    gym?.subscription?.autoRenewal,
    user?.name,
    user?.phone,
  ]);

  const updateSettingsMutation = useMutation({
    mutationFn: () =>
      gymApi.updateSettings({
        name: name.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim(),
        upiId: upiId.trim() || undefined,
        gymDisplayName: displayName.trim() || undefined,
        autoRenewal,
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['gym-billing-summary'] }),
        queryClient.invalidateQueries({ queryKey: ['gym-billing-lite'] }),
        queryClient.invalidateQueries({ queryKey: ['gym-billing-lite-support'] }),
        queryClient.invalidateQueries({ queryKey: ['gym-dashboard-live'] }),
      ]);
      await refreshProfile();
      setSaveError('');
      toast.success('Settings saved');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save settings';
      setSaveError(message);
      toast.error(message);
    },
  });

  const upiLink = useMemo(
    () => (upiId.trim() ? `upi://pay?pa=${upiId.trim()}&pn=${encodeURIComponent(displayName.trim() || name.trim() || 'Business')}` : ''),
    [upiId, displayName, name],
  );

  const handleSave = () => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Business name is required';
    if (!ownerName.trim()) errors.ownerName = 'Owner name is required';
    if (!phone.trim()) {
      errors.phone = 'Phone is required';
    } else if (!PHONE_REGEX.test(phone.trim())) {
      errors.phone = 'Enter a valid phone number';
    }
    if (upiId.trim() && upiId.trim().length < 3) {
      errors.upiId = 'Enter a valid UPI ID';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaveError('');
    updateSettingsMutation.mutate();
  };

  if (isLoading && !data) {
    return <TablePageSkeleton columns={2} rows={6} />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your business preferences</p>
      </div>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>Business Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Business Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} />
            {fieldErrors.name && <p className="text-xs text-destructive">{fieldErrors.name}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Owner Name</Label>
            <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} />
            {fieldErrors.ownerName && <p className="text-xs text-destructive">{fieldErrors.ownerName}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Owner Phone</Label>
            <Input value={phone} onChange={e => setPhone(e.target.value)} />
            {fieldErrors.phone && <p className="text-xs text-destructive">{fieldErrors.phone}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Business Type</Label>
            <Input value={getBusinessTypeName(user?.platformType || user?.businessType || gym?.platformType || 'gym')} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Input value="INR" disabled />
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" /> Payment Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>UPI ID</Label>
            <Input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
            {fieldErrors.upiId && <p className="text-xs text-destructive">{fieldErrors.upiId}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Display Name (for payment links)</Label>
            <Input placeholder="Your Business Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          {upiId.trim() && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground">UPI Link Preview</p>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">{upiLink}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>Subscription Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label>Auto Renewal</Label>
              <p className="text-xs text-muted-foreground">Automatically renew your subscription at the end of each cycle</p>
            </div>
            <Switch checked={autoRenewal} onCheckedChange={setAutoRenewal} />
          </div>
        </CardContent>
      </Card>

      <PasswordResetCard />

      {saveError && <p className="text-sm text-destructive">{saveError}</p>}
      <Button onClick={handleSave} disabled={updateSettingsMutation.isPending}>
        <Save className="mr-2 h-4 w-4" /> {updateSettingsMutation.isPending ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
};

export default GymSettings;
