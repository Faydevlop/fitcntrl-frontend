import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dumbbell, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) {
      toast.error('Please enter the full 6-digit code');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success('Code verified successfully');
      navigate('/reset-password', { state: { email, code } });
    }, 1000);
  };

  const handleResend = () => {
    toast.success('New code sent to ' + email);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-0 card-shadow">
        <CardHeader className="space-y-1 pb-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Dumbbell className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Verify Code</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code sent to<br />
            <span className="font-medium text-foreground">{email || 'your email'}</span>
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP maxLength={6} value={code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {loading ? 'Verifying...' : 'Verify Code'}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={handleResend} className="text-sm text-primary hover:underline">
              Didn't receive code? Resend
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerifyCode;
