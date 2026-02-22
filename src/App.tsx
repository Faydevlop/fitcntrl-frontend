import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./layouts/DashboardLayout";
import PublicLayout from "./layouts/PublicLayout";
import Home from "./pages/public/Home";
import Features from "./pages/public/Features";
import Pricing from "./pages/public/Pricing";
import Contact from "./pages/public/Contact";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyCode from "./pages/VerifyCode";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminGyms from "./pages/admin/Gyms";
import AdminPlans from "./pages/admin/Plans";
import AdminSubscriptions from "./pages/admin/Subscriptions";
import AdminUsage from "./pages/admin/Usage";
import AdminAnnouncements from "./pages/admin/Announcements";
import AdminActivityLogs from "./pages/admin/ActivityLogs";
import AdminSettings from "./pages/admin/Settings";
import AdminWhatsAppPhones from "./pages/admin/WhatsAppPhones";
import AdminEnquiries from "./pages/admin/Enquiries";
import AdminOwnerSupport from "./pages/admin/OwnerSupport";
import GymDashboard from "./pages/gym/Dashboard";
import GymMembers from "./pages/gym/Members";
import GymPayments from "./pages/gym/Payments";
import GymSettings from "./pages/gym/Settings";
import GymBilling from "./pages/gym/Billing";
import GymSupport from "./pages/gym/Support";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/features" element={<Features />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/contact" element={<Contact />} />
            </Route>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-code" element={<VerifyCode />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected routes */}
            <Route path="/admin" element={<DashboardLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="gyms" element={<AdminGyms />} />
              <Route path="plans" element={<AdminPlans />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="usage" element={<AdminUsage />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="activity-logs" element={<AdminActivityLogs />} />
              <Route path="whatsapp-phones" element={<AdminWhatsAppPhones />} />
              <Route path="enquiries" element={<AdminEnquiries />} />
              <Route path="owner-support" element={<AdminOwnerSupport />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="/gym" element={<DashboardLayout />}>
              <Route index element={<GymDashboard />} />
              <Route path="members" element={<GymMembers />} />
              <Route path="payments" element={<GymPayments />} />
              <Route path="billing" element={<GymBilling />} />
              <Route path="support" element={<GymSupport />} />
              <Route path="settings" element={<GymSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
