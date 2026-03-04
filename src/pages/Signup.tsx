import { useState } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dumbbell, UserPlus } from 'lucide-react';

const Signup = () => {
  const { isAuthenticated, user, signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/gym'} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    const success = signup(name, email, phone, password);
    if (success) {
      navigate('/onboarding');
    } else {
      setError('Email already registered');
    }
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
            Gym, yoga, dance, fitness — one platform for all. Sign up and set up in minutes.
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" placeholder="+91 XXXXX XXXXX" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm Password</Label>
                  <Input id="confirm" type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" size="lg">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
