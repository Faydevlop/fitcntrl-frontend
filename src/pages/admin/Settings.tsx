import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import PasswordResetCard from '@/components/PasswordResetCard';

const AdminSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Platform configuration</p>
      </div>

      <Card className="card-shadow border-0 max-w-2xl">
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label>Platform Name</Label>
            <Input defaultValue="fitcntrl" />
          </div>
          <div className="grid gap-2">
            <Label>Admin Email</Label>
            <Input defaultValue="admin@fitcntrl.com" />
          </div>
          <div className="grid gap-2">
            <Label>Support Phone</Label>
            <Input defaultValue="+91 98765 00000" />
          </div>
          <div className="grid gap-2">
            <Label>Default Currency</Label>
            <Input defaultValue="INR" />
          </div>
      <Button><Save className="mr-2 h-4 w-4" /> Save Changes</Button>
        </CardContent>
      </Card>

      <PasswordResetCard />
    </div>
  );
};

export default AdminSettings;
