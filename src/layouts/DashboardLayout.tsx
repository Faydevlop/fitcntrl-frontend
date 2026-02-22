import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dumbbell, LayoutDashboard, Building2, CreditCard, BarChart3, Settings, Users,
  Wallet, Menu, X, LogOut, Bell, Tag, Megaphone, ClipboardList, Phone, Inbox,
  Moon, Sun, PanelLeftClose, PanelLeft, PanelLeftOpen, HeadsetIcon, LifeBuoy,
  type LucideIcon,
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NavItem {
  title: string;
  path: string;
  icon: LucideIcon;
}

const adminNav: NavItem[] = [
  { title: 'Dashboard', path: '/admin', icon: LayoutDashboard },
  { title: 'Gyms', path: '/admin/gyms', icon: Building2 },
  { title: 'Plans & Pricing', path: '/admin/plans', icon: Tag },
  { title: 'Subscriptions', path: '/admin/subscriptions', icon: CreditCard },
  { title: 'Enquiries', path: '/admin/enquiries', icon: Inbox },
  { title: 'Usage', path: '/admin/usage', icon: BarChart3 },
  { title: 'Announcements', path: '/admin/announcements', icon: Megaphone },
  { title: 'Activity Logs', path: '/admin/activity-logs', icon: ClipboardList },
  { title: 'WA Phone Numbers', path: '/admin/whatsapp-phones', icon: Phone },
  { title: 'Owner Support', path: '/admin/owner-support', icon: HeadsetIcon },
  { title: 'Settings', path: '/admin/settings', icon: Settings },
];

const gymNav: NavItem[] = [
  { title: 'Dashboard', path: '/gym', icon: LayoutDashboard },
  { title: 'Members', path: '/gym/members', icon: Users },
  { title: 'Payments', path: '/gym/payments', icon: Wallet },
  { title: 'Billing', path: '/gym/billing', icon: CreditCard },
  { title: 'Support', path: '/gym/support', icon: LifeBuoy },
  { title: 'Settings', path: '/gym/settings', icon: Settings },
];

const mockNotifications = [
  { id: '1', title: 'New Enquiry', message: 'Rahul from FitZone submitted an enquiry.', time: '5 min ago', read: false },
  { id: '2', title: 'Payment Received', message: '₹699 received from Iron Paradise gym.', time: '1 hour ago', read: false },
  { id: '3', title: 'Subscription Expiring', message: 'PowerHouse Gym subscription expires in 3 days.', time: '2 hours ago', read: true },
  { id: '4', title: 'WhatsApp Limit Warning', message: 'FlexFit Gym reached 80% of message limit.', time: '5 hours ago', read: true },
];

type SidebarState = 'full' | 'icons' | 'hidden';

const DashboardLayout = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarState, setSidebarState] = useState<SidebarState>('full');
  const [notifOpen, setNotifOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => document.documentElement.classList.contains('dark'));
  const [notifications, setNotifications] = useState(mockNotifications);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  const cycleSidebar = () => {
    setSidebarState(prev => {
      if (prev === 'full') return 'icons';
      if (prev === 'icons') return 'hidden';
      return 'full';
    });
  };

  const sidebarToggleIcon = sidebarState === 'full'
    ? PanelLeftClose
    : sidebarState === 'icons'
      ? PanelLeft
      : PanelLeftOpen;

  const sidebarToggleTitle = sidebarState === 'full'
    ? 'Collapse to icons'
    : sidebarState === 'icons'
      ? 'Hide sidebar'
      : 'Show sidebar';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    if (notifOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [notifOpen]);

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;

  const navItems = user.role === 'admin' ? adminNav : gymNav;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const sidebarWidth = sidebarState === 'full' ? 'w-64' : sidebarState === 'icons' ? 'w-16' : 'w-0';

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-foreground/20 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-200 lg:static lg:translate-x-0 ${sidebarWidth} ${sidebarState === 'hidden' ? 'lg:border-r-0 lg:overflow-hidden' : ''} ${sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className={`flex h-16 items-center border-b border-border ${sidebarState === 'icons' && !sidebarOpen ? 'justify-center px-2' : 'gap-3 px-6'}`}>
            <Dumbbell className="h-7 w-7 text-primary flex-shrink-0" />
            {(sidebarState === 'full' || sidebarOpen) && (
              <span className="text-xl font-bold text-foreground whitespace-nowrap">GymFlow</span>
            )}
            <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>

          <nav className={`flex-1 overflow-y-auto ${sidebarState === 'icons' && !sidebarOpen ? 'flex flex-col items-center gap-1 py-2 px-0' : 'space-y-1 p-4'}`}>
            {navItems.map(item => {
              const linkContent = (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/admin' || item.path === '/gym'}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    sidebarState === 'icons' && !sidebarOpen
                      ? `flex items-center justify-center rounded-lg h-10 w-10 transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                      : `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors w-full ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`
                  }
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {(sidebarState === 'full' || sidebarOpen) && item.title}
                </NavLink>
              );

              if (sidebarState === 'icons' && !sidebarOpen) {
                return (
                  <Tooltip key={item.path}>
                    <TooltipTrigger asChild>
                      <div className="flex justify-center w-full">{linkContent}</div>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }
              return linkContent;
            })}
          </nav>

          <div className={`border-t border-border ${sidebarState === 'icons' && !sidebarOpen ? 'flex justify-center p-2' : 'p-4'}`}>
            {sidebarState === 'icons' && !sidebarOpen ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="w-full text-muted-foreground" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Logout</TooltipContent>
              </Tooltip>
            ) : (
              <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
            <div className="flex items-center gap-2">
              <button className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-6 w-6 text-foreground" />
              </button>
              {/* Desktop sidebar toggle */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="hidden lg:flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                    onClick={cycleSidebar}
                    title={sidebarToggleTitle}
                  >
                    {(() => {
                      const Icon = sidebarToggleIcon;
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </button>
                </TooltipTrigger>
                <TooltipContent side="bottom">{sidebarToggleTitle}</TooltipContent>
              </Tooltip>
              <div className="hidden lg:block">
                <p className="text-sm text-muted-foreground">
                  {user.role === 'admin' ? 'Platform Admin' : 'Gym Owner'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Dark mode toggle */}
              <button
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                onClick={() => setDarkMode(prev => !prev)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Notification bell */}
              <div className="relative" ref={notifRef}>
                <button
                  className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                  onClick={() => setNotifOpen(prev => !prev)}
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-card shadow-lg">
                    <div className="flex items-center justify-between border-b border-border px-4 py-3">
                      <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                      <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                          <button className="text-xs text-primary hover:underline" onClick={markAllRead}>
                            Mark all read
                          </button>
                        )}
                        <button
                          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted"
                          onClick={() => setNotifOpen(false)}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <p className="px-4 py-8 text-center text-sm text-muted-foreground">No notifications</p>
                      ) : (
                        notifications.map(n => (
                          <div
                            key={n.id}
                            className={`border-b border-border px-4 py-3 last:border-0 ${!n.read ? 'bg-primary/5' : ''}`}
                          >
                            <div className="flex items-start gap-2">
                              {!n.read && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                              <div className={!n.read ? '' : 'pl-4'}>
                                <p className="text-sm font-medium text-foreground">{n.title}</p>
                                <p className="text-xs text-muted-foreground">{n.message}</p>
                                <p className="mt-1 text-[11px] text-muted-foreground/60">{n.time}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
                  {user.name.charAt(0)}
                </div>
                <span className="hidden text-sm font-medium text-foreground sm:inline">{user.name}</span>
              </div>
            </div>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-y-auto p-4 lg:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default DashboardLayout;
