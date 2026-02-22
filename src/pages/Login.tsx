import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Dumbbell, LogIn } from 'lucide-react';

const Login = () => {
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/gym'} replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const success = login(email, password);
    if (!success) setError('Invalid email or password');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left - Branding */}
      <div className="hidden flex-1 flex-col justify-between bg-primary p-12 lg:flex">
        <div className="flex items-center gap-3">
          <Dumbbell className="h-8 w-8 text-primary-foreground" />
          <span className="text-2xl font-bold text-primary-foreground">GymFlow</span>
        </div>
        <div>
          <h1 className="text-4xl font-bold leading-tight text-primary-foreground">
            Manage your gym<br />with confidence.
          </h1>
          <p className="mt-4 max-w-md text-lg text-primary-foreground/70">
            All-in-one platform for gym management, member tracking, payments, and WhatsApp automation.
          </p>
        </div>
        <p className="text-sm text-primary-foreground/50">© 2025 GymFlow. All rights reserved.</p>
      </div>

      {/* Right - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background p-8">
        <Card className="w-full max-w-md border-0 card-shadow">
          <CardHeader className="space-y-1 pb-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 lg:hidden">
              <Dumbbell className="h-7 w-7 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground">Sign in to your GymFlow account</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@gymflow.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <div className="flex justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot Password?
                </Link>
              </div>
              <Button type="submit" className="w-full" size="lg">
                <LogIn className="mr-2 h-4 w-4" /> Sign In
              </Button>
            </form>
            <div className="mt-6 rounded-lg bg-muted p-3">
              <p className="mb-1 text-xs font-medium text-muted-foreground">Demo Credentials</p>
              <p className="text-xs text-muted-foreground">Admin: admin@gymflow.com / admin123</p>
              <p className="text-xs text-muted-foreground">Gym Owner: owner@gymflow.com / owner123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
