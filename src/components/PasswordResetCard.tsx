import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Lock, KeyRound, ShieldCheck, ArrowLeft, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { authApi } from '@/services/api';
import { ApiError } from '@/lib/api';

type Step = 'idle' | 'password' | 'otp-send' | 'otp-verify' | 'new-password';

const PasswordResetCard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('idle');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const resetFields = () => {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setOtp('');
    setFieldErrors({});
  };

  const handleBack = () => {
    resetFields();
    setStep('idle');
  };

  const handlePasswordSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!oldPassword) errors.oldPassword = 'Old password is required';
    if (!newPassword || newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);
    try {
      await authApi.resetPassword({ oldPassword, newPassword });
      setLoading(false);
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      handleBack();
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiError ? error.message : 'Failed to update password';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleSendOtp = async () => {
    if (!user?.email) {
      toast({ title: 'Error', description: 'User email is unavailable.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email: user.email });
      setLoading(false);
      toast({ title: 'OTP Sent', description: `A verification code has been sent to ${user?.email || 'your email'}.` });
      setStep('otp-verify');
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiError ? error.message : 'Failed to send OTP';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const handleVerifyOtp = () => {
    if (otp.length < 4) {
      setFieldErrors({ otp: 'Please enter a valid OTP' });
      return;
    }
    setFieldErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({ title: 'OTP Verified', description: 'You can now set a new password.' });
      setStep('new-password');
    }, 1000);
  };

  const handleNewPasswordSubmit = async () => {
    const errors: Record<string, string> = {};
    if (!newPassword || newPassword.length < 8) errors.newPassword = 'New password must be at least 8 characters';
    if (newPassword !== confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    if (!user?.email) {
      toast({ title: 'Error', description: 'User email is unavailable.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyCode({ email: user.email, code: otp, newPassword });
      setLoading(false);
      toast({ title: 'Password Updated', description: 'Your password has been reset successfully.' });
      handleBack();
    } catch (error) {
      setLoading(false);
      const message = error instanceof ApiError ? error.message : 'Failed to reset password';
      toast({ title: 'Error', description: message, variant: 'destructive' });
    }
  };

  const maskedEmail = user?.email
    ? user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')
    : '***@***.com';

  return (
    <Card className="card-shadow border-0 max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" /> Password & Security
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'idle' && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-muted-foreground">
              Manage your password to keep your account secure.
            </p>
            <Button onClick={() => setStep('password')} className="w-fit">
              <KeyRound className="mr-2 h-4 w-4" /> Reset Password
            </Button>
          </div>
        )}

        {step === 'password' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium text-foreground">Reset using old password</p>
            </div>
            <div className="grid gap-2">
              <Label>Old Password</Label>
              <Input
                type="password"
                placeholder="Enter your old password"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
              {fieldErrors.oldPassword && <p className="text-xs text-destructive">{fieldErrors.oldPassword}</p>}
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              {fieldErrors.newPassword && <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Button onClick={handlePasswordSubmit} disabled={loading}>
                {loading ? 'Updating…' : 'Update Password'}
              </Button>
              <Button
                variant="link"
                className="text-sm px-0"
                onClick={() => {
                  resetFields();
                  setStep('otp-send');
                }}
              >
                <Mail className="mr-1 h-3 w-3" /> Don't know old password? Get OTP
              </Button>
            </div>
          </div>
        )}

        {step === 'otp-send' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium text-foreground">Verify via OTP</p>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll send a verification code to <span className="font-medium text-foreground">{maskedEmail}</span>.
            </p>
            <Button onClick={handleSendOtp} disabled={loading}>
              {loading ? 'Sending…' : 'Send OTP'}
            </Button>
          </div>
        )}

        {step === 'otp-verify' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setStep('otp-send')} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium text-foreground">Enter Verification Code</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter the code sent to <span className="font-medium text-foreground">{maskedEmail}</span>.
            </p>
            <div className="grid gap-2">
              <Label>OTP Code</Label>
              <Input
                type="text"
                placeholder="Enter OTP"
                maxLength={6}
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                className="max-w-[200px] tracking-widest text-center text-lg"
              />
              {fieldErrors.otp && <p className="text-xs text-destructive">{fieldErrors.otp}</p>}
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <Button onClick={handleVerifyOtp} disabled={loading}>
                <ShieldCheck className="mr-2 h-4 w-4" />
                {loading ? 'Verifying…' : 'Verify OTP'}
              </Button>
              <Button variant="link" className="text-sm px-0" onClick={handleSendOtp} disabled={loading}>
                Resend OTP
              </Button>
            </div>
          </div>
        )}

        {step === 'new-password' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <p className="text-sm font-medium text-foreground">Set New Password</p>
            </div>
            <div className="grid gap-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
              />
              {fieldErrors.newPassword && <p className="text-xs text-destructive">{fieldErrors.newPassword}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Confirm New Password</Label>
              <Input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {fieldErrors.confirmPassword && <p className="text-xs text-destructive">{fieldErrors.confirmPassword}</p>}
            </div>
            <Button onClick={handleNewPasswordSubmit} disabled={loading}>
              {loading ? 'Updating…' : 'Update Password'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PasswordResetCard;
