import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dumbbell, ArrowLeft, Mail } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { authApi } from '@/services/api';
import { ApiError } from '@/lib/api';

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type ForgotForm = z.infer<typeof forgotSchema>;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values: ForgotForm) => {
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: values.email });
      setLoading(false);
      toast.success('Verification code sent to your email');
      navigate('/verify-code', { state: { email: values.email } });
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiError ? error.message : 'Failed to send verification code';
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
          <h2 className="text-2xl font-bold text-foreground">Forgot Password</h2>
          <p className="text-sm text-muted-foreground">Enter your email and we'll send you a verification code</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              <Mail className="mr-2 h-4 w-4" />
              {loading ? 'Sending...' : 'Send Verification Code'}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
              <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;
