import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Send, Plus } from 'lucide-react';
import { announcements as initialAnnouncements, gyms, type Announcement } from '@/data/mockData';

const AdminAnnouncements = () => {
  const [list] = useState<Announcement[]>(initialAnnouncements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectAll, setSelectAll] = useState(true);
  const [selectedGyms, setSelectedGyms] = useState<string[]>([]);

  const toggleGym = (id: string) => {
    setSelectedGyms(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Announcements</h1>
          <p className="text-sm text-muted-foreground">Send notifications to gyms</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> New Announcement</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Send Announcement</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Message</Label>
                <Textarea placeholder="Write your announcement..." rows={4} />
              </div>
              <div className="grid gap-2">
                <Label>Target Gyms</Label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={selectAll} onCheckedChange={(c) => setSelectAll(!!c)} />
                  All Gyms
                </label>
                {!selectAll && (
                  <div className="grid gap-2 rounded-lg border border-border p-3 mt-1">
                    {gyms.map(g => (
                      <label key={g.id} className="flex items-center gap-2 text-sm">
                        <Checkbox checked={selectedGyms.includes(g.id)} onCheckedChange={() => toggleGym(g.id)} />
                        {g.name}
                      </label>
                    ))}
                  </div>
                )}
              </div>
              <Button onClick={() => setDialogOpen(false)}>
                <Send className="mr-2 h-4 w-4" /> Send Notification
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="card-shadow border-0">
        <CardHeader>
          <CardTitle className="text-lg">Sent Announcements</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Message</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Sent By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {list.map(a => (
                  <TableRow key={a.id}>
                    <TableCell className="max-w-xs truncate font-medium">{a.message}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {a.targetGyms === 'all' ? 'All Gyms' : `${a.targetGyms.length} Gym(s)`}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{a.sentAt}</TableCell>
                    <TableCell className="text-muted-foreground">{a.sentBy}</TableCell>
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

export default AdminAnnouncements;
