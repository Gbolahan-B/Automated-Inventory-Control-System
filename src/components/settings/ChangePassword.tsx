import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Lock, Eye, EyeOff, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ChangePasswordProps {
  onBack: () => void;
}

export function ChangePassword({ onBack }: ChangePasswordProps) {
  const { changePassword, changeEmail, user, loading: authLoading } = useAuth();
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [emailData, setEmailData] = useState({
    newEmail: '',
    confirmEmail: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    new: false,
    confirm: false
  });
  const [activeTab, setActiveTab] = useState<'password' | 'email'>('password');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState({ password: false, email: false });
  const [error, setError] = useState('');

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleEmailChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const togglePasswordVisibility = (field: 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess({ password: false, email: false });

    // Validation
    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const result = await changePassword(passwordData.newPassword);
      
      if (result.success) {
        setSuccess({ password: true, email: false });
        setPasswordData({
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(result.error || 'Failed to change password. Please try again.');
      }
    } catch (err) {
      setError('Failed to change password. Please try again.');
      console.error('Password change error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess({ password: false, email: false });

    // Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (emailData.newEmail !== emailData.confirmEmail) {
      setError('Email addresses do not match');
      setLoading(false);
      return;
    }

    if (emailData.newEmail === user?.email) {
      setError('New email must be different from current email');
      setLoading(false);
      return;
    }

    try {
      const result = await changeEmail(emailData.newEmail);
      
      if (result.success) {
        setSuccess({ password: false, email: true });
        setEmailData({
          newEmail: '',
          confirmEmail: ''
        });
      } else {
        setError(result.error || 'Failed to change email. Please try again.');
      }
    } catch (err) {
      setError('Failed to change email. Please try again.');
      console.error('Email change error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h1 className="flex items-center">
          <Lock className="w-6 h-6 mr-2" />
          Security Settings
        </h1>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 p-1 bg-muted rounded-lg max-w-md">
        <Button
          variant={activeTab === 'password' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('password')}
          className="flex-1"
        >
          <Lock className="w-4 h-4 mr-2" />
          Change Password
        </Button>
        <Button
          variant={activeTab === 'email' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('email')}
          className="flex-1"
        >
          <Mail className="w-4 h-4 mr-2" />
          Change Email
        </Button>
      </div>

      {/* Password Change Section */}
      {activeTab === 'password' && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Update Your Password</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter a new password for your account. You'll remain signed in after changing your password.
            </p>
          </CardHeader>
          <CardContent>
            {success.password && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Password changed successfully!
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Password must be at least 6 characters long
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                    required
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={loading || authLoading} className="flex-1">
                  {(loading || authLoading) ? 'Changing Password...' : 'Change Password'}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Email Change Section */}
      {activeTab === 'email' && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Update Your Email</CardTitle>
            <p className="text-sm text-muted-foreground">
              Change your email address. You'll receive a confirmation email to verify the new address.
            </p>
          </CardHeader>
          <CardContent>
            {success.email && (
              <Alert className="mb-6 border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  Email change initiated! Please check your new email for confirmation.
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="mb-4 p-3 bg-muted rounded-lg">
              <Label className="text-sm">Current Email</Label>
              <p className="text-sm font-medium">{user?.email}</p>
            </div>

            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => handleEmailChange('newEmail', e.target.value)}
                  required
                  placeholder="Enter new email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmEmail">Confirm New Email</Label>
                <Input
                  id="confirmEmail"
                  type="email"
                  value={emailData.confirmEmail}
                  onChange={(e) => handleEmailChange('confirmEmail', e.target.value)}
                  required
                  placeholder="Confirm new email address"
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <Button type="submit" disabled={loading || authLoading} className="flex-1">
                  {(loading || authLoading) ? 'Changing Email...' : 'Change Email'}
                </Button>
                <Button type="button" variant="outline" onClick={onBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}