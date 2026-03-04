import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Dumbbell, ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { authApi } from '@/services/api';
import { ApiError } from '@/lib/api';

const verifySchema = z.object({
  code: z.string().length(6, 'Enter the full 6-digit code'),
});

type VerifyForm = z.infer<typeof verifySchema>;

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = (location.state as any)?.email || '';
  const [loading, setLoading] = useState(false);
  const { handleSubmit, setValue, watch, formState: { errors } } = useForm<VerifyForm>({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '' },
  });

  const code = watch('code');

  const onSubmit = (values: VerifyForm) => {
    navigate('/reset-password', { state: { email, code: values.code } });
  };

  const handleResend = async () => {
    if (!email) {
      toast.error('Email is missing. Go back and request a new code.');
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setLoading(false);
      toast.success(`New code sent to ${email}`);
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiError ? error.message : 'Failed to resend code';
      toast.error(message);
    }
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
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={code}
                onChange={value => setValue('code', value, { shouldValidate: true, shouldDirty: true })}
              >
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
            {errors.code && <p className="text-xs text-center text-destructive">{errors.code.message}</p>}
            <Button type="submit" className="w-full" size="lg">
              <ShieldCheck className="mr-2 h-4 w-4" />
              Verify Code
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={handleResend} className="text-sm text-primary hover:underline" disabled={loading}>
              {loading ? 'Sending...' : "Didn't receive code? Resend"}
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
