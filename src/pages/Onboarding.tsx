import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dumbbell, Flower2, PersonStanding, Music, Target, Building2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { type BusinessType, BUSINESS_TYPE_OPTIONS } from '@/data/businessTypes';

const iconMap: Record<string, React.ElementType> = {
  Dumbbell, Flower2, PersonStanding, Music, Target, Building2,
};

const Onboarding = () => {
  const { isAuthenticated, user, completeOnboarding } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [businessType, setBusinessType] = useState<BusinessType | ''>('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState(user?.name || '');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (user.onboardingComplete) return <Navigate to="/gym" replace />;

  const handleFinish = () => {
    if (businessType) {
      completeOnboarding(businessType as BusinessType, businessName);
      navigate('/gym');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-8 py-6 border-b border-border bg-card">
        <Dumbbell className="h-7 w-7 text-primary" />
        <span className="text-xl font-bold text-foreground">FitCntrl</span>
        <Badge variant="secondary" className="ml-2">Setup</Badge>
      </div>

      {/* Progress */}
      <div className="flex justify-center py-6">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${s <= step ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {s < step ? <CheckCircle className="h-4 w-4" /> : s}
              </div>
              {s < 4 && <div className={`h-0.5 w-8 ${s < step ? 'bg-primary' : 'bg-muted'}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 py-4">
        <div className="w-full max-w-2xl">
          {/* Step 1: Business Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">What type of business do you run?</h2>
                <p className="text-sm text-muted-foreground mt-1">This helps us customize your dashboard</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {BUSINESS_TYPE_OPTIONS.map(opt => {
                  const Icon = iconMap[opt.icon] || Building2;
                  return (
                    <Card
                      key={opt.value}
                      className={`cursor-pointer transition-all hover:shadow-md ${businessType === opt.value ? 'ring-2 ring-primary bg-primary/5' : 'border-border'}`}
                      onClick={() => setBusinessType(opt.value)}
                    >
                      <CardContent className="flex flex-col items-center gap-3 p-6">
                        <Icon className={`h-10 w-10 ${businessType === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <span className={`text-sm font-medium ${businessType === opt.value ? 'text-primary' : 'text-foreground'}`}>{opt.label}</span>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!businessType}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Business Details */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Business Details</h2>
                <p className="text-sm text-muted-foreground mt-1">Tell us about your business</p>
              </div>
              <Card className="card-shadow border-0">
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-2">
                    <Label>Business Name</Label>
                    <Input placeholder="Your business name" value={businessName} onChange={e => setBusinessName(e.target.value)} />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>Owner Name</Label>
                      <Input value={ownerName} onChange={e => setOwnerName(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Phone</Label>
                      <Input placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="grid gap-2">
                      <Label>City</Label>
                      <Input placeholder="City" value={city} onChange={e => setCity(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Default Currency</Label>
                      <Input value="INR" disabled />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label>Address</Label>
                    <Input placeholder="Business address" value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(3)} disabled={!businessName}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Setup */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-foreground">Payment Setup</h2>
                <p className="text-sm text-muted-foreground mt-1">Optional — you can set this up later</p>
              </div>
              <Card className="card-shadow border-0">
                <CardContent className="p-6 space-y-4">
                  <div className="grid gap-2">
                    <Label>UPI ID</Label>
                    <Input placeholder="yourname@upi" value={upiId} onChange={e => setUpiId(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Display Name for QR</Label>
                    <Input placeholder="Business name for payments" value={displayName} onChange={e => setDisplayName(e.target.value)} />
                  </div>
                </CardContent>
              </Card>
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setStep(2)}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back
                </Button>
                <Button onClick={() => setStep(4)}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Finish */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-success/10">
                <CheckCircle className="h-10 w-10 text-success" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Your dashboard is ready!</h2>
              <p className="text-muted-foreground">You're all set. Start managing your {BUSINESS_TYPE_OPTIONS.find(o => o.value === businessType)?.label.toLowerCase() || 'business'} now.</p>
              <Button size="lg" onClick={handleFinish}>
                Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
