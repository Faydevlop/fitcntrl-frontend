import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Features', path: '/features' },
  { label: 'Pricing', path: '/pricing' },
  { label: 'Contact', path: '/contact' },
];

const PublicLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <Dumbbell className="h-7 w-7 text-primary" />
            <span className="text-xl font-bold text-foreground">GymFlow</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                  location.pathname === link.path
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground">
              Log In
            </Link>
            <Button asChild size="sm" className="rounded-full">
              <Link to="/contact">Start Now</Link>
            </Button>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile nav */}
        {mobileOpen && (
          <div className="border-t border-border bg-card px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="mt-2 flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link to="/login" onClick={() => setMobileOpen(false)}>Log In</Link>
                </Button>
                <Button asChild size="sm" className="flex-1">
                  <Link to="/contact" onClick={() => setMobileOpen(false)}>Start Now</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <Outlet />

      {/* Footer */}
      <footer className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <Dumbbell className="h-6 w-6" />
                <span className="text-lg font-bold">GymFlow</span>
              </div>
              <p className="mt-3 text-sm text-primary-foreground/60">
                Smart gym management platform for modern fitness businesses.
              </p>
              <div className="mt-3 space-y-1 text-sm text-primary-foreground/60">
                <p>📧 hello@gymflow.com</p>
                <p>📞 +91 98765 43210</p>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Solution</h4>
              <div className="flex flex-col gap-2">
                <Link to="/features" className="text-sm text-primary-foreground/60 hover:text-primary-foreground">Features</Link>
                <Link to="/pricing" className="text-sm text-primary-foreground/60 hover:text-primary-foreground">Pricing</Link>
                <span className="text-sm text-primary-foreground/60">Security</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <div className="flex flex-col gap-2">
                <Link to="/contact" className="text-sm text-primary-foreground/60 hover:text-primary-foreground">Contact Sales</Link>
                <span className="text-sm text-primary-foreground/60">About</span>
                <span className="text-sm text-primary-foreground/60">Blog</span>
              </div>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold">Resources</h4>
              <div className="flex flex-col gap-2">
                <span className="text-sm text-primary-foreground/60">Privacy</span>
                <span className="text-sm text-primary-foreground/60">Terms</span>
                <span className="text-sm text-primary-foreground/60">Changelog</span>
              </div>
            </div>
          </div>
          <div className="mt-10 border-t border-primary-foreground/10 pt-6 text-center text-sm text-primary-foreground/40">
            © 2026 GymFlow. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
