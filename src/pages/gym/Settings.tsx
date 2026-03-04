import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Save, Phone, CreditCard, Download, QrCode } from 'lucide-react';
import { gyms } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';
import { getBusinessTypeName } from '@/data/businessTypes';
import PasswordResetCard from '@/components/PasswordResetCard';

const GymSettings = () => {
  const currentGym = gyms.find(g => g.id === '1')!;
  const { user } = useAuth();
  const [upiId, setUpiId] = useState(currentGym.upiId || '');
  const [displayName, setDisplayName] = useState(currentGym.gymDisplayName || currentGym.name);

  const upiLink = upiId ? `upi://pay?pa=${upiId}&pn=${encodeURIComponent(displayName)}` : '';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your gym preferences</p>
      </div>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>Gym Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Gym Name</Label>
            <Input defaultValue="FitZone Gym" />
          </div>
          <div className="grid gap-2">
            <Label>Owner Phone</Label>
            <Input defaultValue="+91 98765 43210" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Reminder Day of Month (1-31)</Label>
              <Input type="number" defaultValue={1} min={1} max={31} />
            </div>
            <div className="grid gap-2">
              <Label>Days Before Due Reminder</Label>
              <Input type="number" defaultValue={3} min={0} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Business Type</Label>
            <Input value={getBusinessTypeName(user?.businessType || currentGym.businessType || 'gym')} disabled />
          </div>
          <div className="grid gap-2">
            <Label>Currency</Label>
            <Input defaultValue="INR" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Payment Settings */}
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
          </div>
          <div className="grid gap-2">
            <Label>Gym Display Name (for QR)</Label>
            <Input placeholder="Your Gym Name" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          </div>
          {upiId && (
            <div className="rounded-lg border border-border p-4 space-y-3">
              <div className="flex items-center gap-2">
                <QrCode className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-foreground">QR Code Preview</p>
              </div>
              <div className="flex h-40 w-40 items-center justify-center rounded-lg bg-muted/50 border border-border">
                <div className="text-center">
                  <QrCode className="h-16 w-16 text-muted-foreground mx-auto" />
                  <p className="text-[10px] text-muted-foreground mt-1">QR for {upiId}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground font-mono break-all">{upiLink}</p>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-3 w-3" /> Download QR
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-success" /> WhatsApp Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Enable Reminders</Label>
              <p className="text-xs text-muted-foreground">Send WhatsApp reminders to members</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Max Reminders per Day</Label>
              <Input type="number" defaultValue={50} min={1} />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>Quiet Hours Start</Label>
              <Input type="time" defaultValue="21:00" />
            </div>
            <div className="grid gap-2">
              <Label>Quiet Hours End</Label>
              <Input type="time" defaultValue="08:00" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>Automation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>Auto Reminder</Label>
              <p className="text-xs text-muted-foreground">Send WhatsApp reminders automatically before due date</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Daily Summary</Label>
              <p className="text-xs text-muted-foreground">Receive a daily collection summary via WhatsApp</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <PasswordResetCard />

      <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
    </div>
  );
};

export default GymSettings;
