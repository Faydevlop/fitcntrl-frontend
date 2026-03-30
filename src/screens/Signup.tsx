import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dumbbell, UserPlus } from 'lucide-react';
import AuthPageSkeleton from '@/components/loaders/AuthPageSkeleton';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  countryCode: z.string().regex(/^\d{1,4}$/, 'Use country code like 91'),
  phone: z.string().min(6, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(8, 'Confirm password is required'),
}).refine(values => values.password === values.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type SignupForm = z.infer<typeof signupSchema>;

const Signup = () => {
  const { isAuthenticated, user, signup, isInitializing } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupForm>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      countryCode: '91',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  if (isInitializing) {
    return <AuthPageSkeleton />;
  }

  if (isAuthenticated && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (!user.onboardingComplete) return <Navigate to="/onboarding" replace />;
    return <Navigate to="/gym" replace />;
  }

  const onSubmit = async (values: SignupForm) => {
    setError('');
    setLoading(true);
    const result = await signup(
      values.name,
      values.email,
      values.countryCode,
      values.phone,
      values.password,
    );
    setLoading(false);
    if (result.success) {
      navigate('/onboarding');
      return;
    }
    setError(result.message || 'Email already registered');
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-primary-foreground" />
          <span className="text-2xl font-bold text-primary-foreground">FitCntrl</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-primary-foreground">
            Start managing your<br />business today.
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/70">
            Gym, yoga, dance, fitness - one platform for all. Sign up and set up in minutes.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">© 2025 FitCntrl. All rights reserved.</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border-0 card-shadow">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 lg:hidden">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Create your account</h2>
            <p className="text-sm text-muted-foreground">Start your free trial today</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" {...register('name')} />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="countryCode">Country Code</Label>
                  <Input id="countryCode" placeholder="91" {...register('countryCode')} />
                  {errors.countryCode && <p className="text-xs text-destructive">{errors.countryCode.message}</p>}
                </div>
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" placeholder="9876543210" {...register('phone')} />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
                  {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" {...register('confirmPassword')} />
                  {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg" disabled={loading}>
                <UserPlus className="mr-2 h-4 w-4" /> {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
