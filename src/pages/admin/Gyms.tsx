import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Eye, Ban, Snowflake, Play, AlertTriangle, RotateCcw, Pause, Phone, ArrowLeft } from 'lucide-react';
import { gyms as initialGyms, plans, whatsappPhones, type Gym, type AccountStatus } from '@/data/mockData';
import { BUSINESS_TYPE_OPTIONS, getBusinessTypeName, type BusinessType } from '@/data/businessTypes';
import WhatsAppUsageBar from '@/components/WhatsAppUsageBar';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTableControls } from '@/hooks/useTableControls';
import { TableSearchBar, SortableHeader, TablePagination } from '@/components/TableControls';

const statusStyles: Record<AccountStatus, string> = {
  active: 'bg-success/10 text-success hover:bg-success/20',
  grace_period: 'bg-warning/10 text-warning hover:bg-warning/20',
  frozen: 'bg-primary/10 text-primary hover:bg-primary/20',
  suspended: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
};

const AdminGyms = () => {
  const [gymList, setGymList] = useState<Gym[]>(initialGyms);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [graceOpen, setGraceOpen] = useState(false);
  const [selectedGym, setSelectedGym] = useState<Gym | null>(null);
  const [detailGym, setDetailGym] = useState<Gym | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [selectedPhoneId, setSelectedPhoneId] = useState<string>('');
  const [filterBusinessType, setFilterBusinessType] = useState<string>('all');
  const [newBusinessType, setNewBusinessType] = useState<string>('');

  const availablePhones = whatsappPhones.filter(p => !p.assignedGymId);
  const selectedPlanName = plans.find(p => p.id === selectedPlanId)?.name || '';
  const isPro = selectedPlanName === 'Pro';

  const handleFreeze = (gym: Gym) => {
    setGymList(prev => prev.map(g => g.id === gym.id ? { ...g, status: 'frozen' as const } : g));
  };

  const handleUnfreeze = (gym: Gym) => {
    setGymList(prev => prev.map(g => g.id === gym.id ? { ...g, status: 'active' as const } : g));
  };

  const openGrace = (gym: Gym) => {
    setSelectedGym(gym);
    setGraceOpen(true);
  };

  const handleResetCounter = (gym: Gym) => {
    setGymList(prev => prev.map(g => g.id === gym.id ? {
      ...g,
      whatsappUsage: { ...g.whatsappUsage, messagesUsed: 0 }
    } : g));
  };

  const handlePauseWhatsApp = (gym: Gym) => {
    setGymList(prev => prev.map(g => g.id === gym.id ? {
      ...g,
      whatsappUsage: { ...g.whatsappUsage, whatsappPaused: true }
    } : g));
  };

  const handleResumeWhatsApp = (gym: Gym) => {
    setGymList(prev => prev.map(g => g.id === gym.id ? {
      ...g,
      whatsappUsage: { ...g.whatsappUsage, whatsappPaused: false }
    } : g));
  };

  // If viewing gym details
  if (detailGym) {
    const gym = gymList.find(g => g.id === detailGym.id) || detailGym;
    const pct = gym.whatsappUsage.planLimit > 0 ? Math.round((gym.whatsappUsage.messagesUsed / gym.whatsappUsage.planLimit) * 100) : 0;
    const remaining = Math.max(0, gym.whatsappUsage.planLimit - gym.whatsappUsage.messagesUsed);
    const planName = plans.find(p => p.id === gym.planId)?.name || '';

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setDetailGym(null)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{gym.name}</h1>
            <p className="text-sm text-muted-foreground">Owner: {gym.ownerName} · Plan: {planName} · Mode: {gym.wa_mode === 'shared' ? 'Shared' : 'Dedicated'}</p>
          </div>
        </div>

        {/* WhatsApp Usage Section */}
        {gym.wa_mode === 'shared' ? (
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-success" /> WhatsApp Usage (Shared Line)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Messages Used</p>
                  <p className="text-xl font-bold text-foreground">{gym.whatsappUsage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Plan Limit</p>
                  <p className="text-xl font-bold text-foreground">{gym.whatsappUsage.planLimit.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Usage %</p>
                  <p className="text-xl font-bold text-foreground">{pct}%</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Remaining</p>
                  <p className="text-xl font-bold text-foreground">{remaining.toLocaleString()}</p>
                </div>
              </div>
              <WhatsAppUsageBar used={gym.whatsappUsage.messagesUsed} limit={gym.whatsappUsage.planLimit} />
            </CardContent>
          </Card>
        ) : (
          <Card className="card-shadow border-0">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" /> Dedicated WhatsApp Line
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number</p>
                  <p className="text-sm font-medium text-foreground">{gym.whatsappUsage.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">WABA ID</p>
                  <p className="text-sm font-medium text-foreground">{gym.whatsappUsage.wabaId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Phone Number ID</p>
                  <p className="text-sm font-medium text-foreground">{gym.whatsappUsage.phoneNumberId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Conversations</p>
                  <p className="text-xl font-bold text-foreground">{(gym.whatsappUsage.conversationsThisMonth || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Messages Sent</p>
                  <p className="text-xl font-bold text-foreground">{gym.whatsappUsage.messagesUsed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Messages Failed</p>
                  <p className="text-xl font-bold text-destructive">{(gym.whatsappUsage.messagesFailed || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery Rate</p>
                  <p className="text-xl font-bold text-success">{gym.whatsappUsage.deliveryRate || 0}%</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Daily Safe Limit</p>
                  <p className="text-lg font-bold text-foreground">{gym.whatsappUsage.dailySafeLimit}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Monthly Plan Limit</p>
                  <p className="text-lg font-bold text-foreground">{gym.whatsappUsage.planLimit.toLocaleString()}</p>
                </div>
              </div>

              <WhatsAppUsageBar used={gym.whatsappUsage.messagesUsed} limit={gym.whatsappUsage.planLimit} />

              {/* Charts */}
              {gym.whatsappUsage.dailyData && gym.whatsappUsage.dailyData.length > 0 && (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Messages per Day</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={gym.whatsappUsage.dailyData.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" tickFormatter={d => d.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" />
                        <Tooltip />
                        <Line type="monotone" dataKey="messagesSent" stroke="hsl(230 80% 56%)" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Conversations per Day</p>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={gym.whatsappUsage.dailyData.slice(-14)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220 13% 90%)" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" tickFormatter={d => d.slice(5)} />
                        <YAxis tick={{ fontSize: 10 }} stroke="hsl(220 10% 46%)" />
                        <Tooltip />
                        <Bar dataKey="conversations" fill="hsl(142 70% 45%)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Admin Actions */}
        <Card className="card-shadow border-0">
          <CardHeader>
            <CardTitle className="text-lg">Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleResetCounter(gym)}>
                <RotateCcw className="mr-1 h-3 w-3" /> Reset Monthly Counter
              </Button>
              {gym.whatsappUsage.whatsappPaused ? (
                <Button variant="outline" size="sm" className="text-success" onClick={() => handleResumeWhatsApp(gym)}>
                  <Play className="mr-1 h-3 w-3" /> Resume WhatsApp
                </Button>
              ) : (
                <Button variant="outline" size="sm" className="text-warning" onClick={() => handlePauseWhatsApp(gym)}>
                  <Pause className="mr-1 h-3 w-3" /> Pause WhatsApp
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredGyms = filterBusinessType === 'all' ? gymList : gymList.filter(g => g.businessType === filterBusinessType);

  const gymTable = useTableControls({
    data: filteredGyms,
    searchFields: ['name', 'ownerName'],
    pageSize: 10,
  });

  // Gym list view
  return (
    <div className="space-y-6">
      {gymList.some(g => g.status === 'frozen') && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">Frozen Accounts Detected</p>
            <p className="text-xs text-muted-foreground">
              {gymList.filter(g => g.status === 'frozen').map(g => g.name).join(', ')} — currently frozen due to subscription issues.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Businesses</h1>
          <p className="text-sm text-muted-foreground">Manage all registered businesses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" /> Add Business</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Business</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Business Type</Label>
                <Select value={newBusinessType} onValueChange={setNewBusinessType}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Business Name</Label>
                <Input placeholder="Enter business name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Owner Name</Label>
                  <Input placeholder="Owner name" />
                </div>
                <div className="grid gap-2">
                  <Label>Owner Phone</Label>
                  <Input placeholder="+91 XXXXX XXXXX" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Plan</Label>
                  <Select value={selectedPlanId} onValueChange={(val) => { setSelectedPlanId(val); setSelectedPhoneId(''); }}>
                    <SelectTrigger><SelectValue placeholder="Select plan" /></SelectTrigger>
                    <SelectContent>
                      {plans.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Account Status</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="grace_period">Grace Period</SelectItem>
                      <SelectItem value="frozen">Frozen</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {isPro && (
                <div className="grid gap-2">
                  <Label>Assign WhatsApp Phone Number</Label>
                  {availablePhones.length > 0 ? (
                    <Select value={selectedPhoneId} onValueChange={setSelectedPhoneId}>
                      <SelectTrigger><SelectValue placeholder="Select a phone number" /></SelectTrigger>
                      <SelectContent>
                        {availablePhones.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.phone} ({p.wabaId})</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-sm text-destructive">No available phone numbers. Add one in WA Phone Numbers section first.</p>
                  )}
                </div>
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label>Start Date</Label>
                  <Input type="date" />
                </div>
                <div className="grid gap-2">
                  <Label>Expiry Date</Label>
                  <Input type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Grace Period Days</Label>
                <Input type="number" placeholder="0" min={0} />
              </div>
              <Button className="mt-2" onClick={() => setDialogOpen(false)}>Save Business</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-3">
        <TableSearchBar value={gymTable.search} onChange={gymTable.setSearch} placeholder="Search businesses..." />
        <Select value={filterBusinessType} onValueChange={setFilterBusinessType}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {BUSINESS_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <Card className="card-shadow border-0">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><SortableHeader label="Name" sortKey="name" currentSort={gymTable.sort} onSort={gymTable.toggleSort} /></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead><SortableHeader label="Owner" sortKey="ownerName" currentSort={gymTable.sort} onSort={gymTable.toggleSort} /></TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>WA Mode</TableHead>
                  <TableHead>Messages Used</TableHead>
                  <TableHead>Usage %</TableHead>
                  <TableHead><SortableHeader label="Account Status" sortKey="status" currentSort={gymTable.sort} onSort={gymTable.toggleSort} /></TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gymTable.paginatedData.map(gym => {
                  const pct = gym.whatsappUsage.planLimit > 0 ? Math.round((gym.whatsappUsage.messagesUsed / gym.whatsappUsage.planLimit) * 100) : 0;
                  return (
                    <TableRow key={gym.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          {gym.name}
                          {gym.status === 'frozen' && (
                            <Badge className="bg-primary/10 text-primary text-[10px] px-1.5">⚠ Frozen</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">{getBusinessTypeName(gym.businessType || 'gym')}</Badge>
                      </TableCell>
                      <TableCell>{gym.ownerName}</TableCell>
                      <TableCell>{plans.find(p => p.id === gym.planId)?.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {gym.wa_mode === 'shared' ? 'Shared' : 'Dedicated'}
                        </Badge>
                      </TableCell>
                      <TableCell>{gym.whatsappUsage.messagesUsed.toLocaleString()} / {gym.whatsappUsage.planLimit.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <WhatsAppUsageBar used={gym.whatsappUsage.messagesUsed} limit={gym.whatsappUsage.planLimit} className="w-20" />
                          {pct > 100 && (
                            <Badge className="bg-destructive/10 text-destructive text-[10px] px-1.5">Exceeded</Badge>
                          )}
                          {pct > 80 && pct <= 100 && (
                            <Badge className="bg-warning/10 text-warning text-[10px] px-1.5">Warning</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusStyles[gym.status]}>
                          {gym.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setDetailGym(gym)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                          {gym.status !== 'frozen' ? (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary" onClick={() => handleFreeze(gym)} title="Freeze">
                              <Snowflake className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-success" onClick={() => handleUnfreeze(gym)} title="Unfreeze">
                              <Play className="h-4 w-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-warning" onClick={() => openGrace(gym)} title="Set Grace Period">
                            <AlertTriangle className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive"><Ban className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <TablePagination page={gymTable.page} totalPages={gymTable.totalPages} totalItems={gymTable.totalFiltered} onPageChange={gymTable.setPage} />
        </CardContent>
      </Card>

      {/* Grace Period Dialog */}
      <Dialog open={graceOpen} onOpenChange={setGraceOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Set Grace Period</DialogTitle>
          </DialogHeader>
          {selectedGym && (
            <div className="grid gap-4 py-4">
              <p className="text-sm text-muted-foreground">Setting grace period for <strong>{selectedGym.name}</strong></p>
              <div className="grid gap-2">
                <Label>Grace Period (days)</Label>
                <Input type="number" defaultValue={7} min={0} />
              </div>
              <Button onClick={() => {
                setGymList(prev => prev.map(g => g.id === selectedGym.id ? { ...g, status: 'grace_period' as const, gracePeriodDays: 7 } : g));
                setGraceOpen(false);
              }}>
                Confirm
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminGyms;
