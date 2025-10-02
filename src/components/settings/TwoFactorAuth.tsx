import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { ArrowLeft, Shield, Smartphone, Key, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface TwoFactorAuthProps {
  onBack: () => void;
}

export function TwoFactorAuth({ onBack }: TwoFactorAuthProps) {
  const [isEnabled, setIsEnabled] = useState(false);
  const [setupStep, setSetupStep] = useState<'overview' | 'setup' | 'verify'>('overview');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [backupCodes] = useState([
    '8f3a-9d2c-1e4b',
    '5a7b-3c8d-9f2e',
    '2d6a-8c1f-4e7b',
    '9b5e-7f3a-1d8c',
    '4c2f-6a9d-3e8b'
  ]);

  const handleEnable2FA = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSetupStep('setup');
    } catch (error) {
      console.error('Failed to start 2FA setup');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 6) return;
    
    setLoading(true);
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEnabled(true);
      setSetupStep('overview');
      setVerificationCode('');
    } catch (error) {
      console.error('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsEnabled(false);
    } catch (error) {
      console.error('Failed to disable 2FA');
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
          <Shield className="w-6 h-6 mr-2" />
          Two-Factor Authentication
        </h1>
      </div>

      {setupStep === 'overview' && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Two-Factor Authentication Status</span>
                <Badge variant={isEnabled ? "default" : "secondary"}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Two-factor authentication adds an extra layer of security to your account by requiring 
                  a verification code from your phone in addition to your password.
                </p>

                {isEnabled ? (
                  <div className="space-y-4">
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Two-factor authentication is currently enabled for your account.
                      </AlertDescription>
                    </Alert>
                    <Button 
                      variant="destructive" 
                      onClick={handleDisable2FA}
                      disabled={loading}
                    >
                      {loading ? 'Disabling...' : 'Disable 2FA'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <Smartphone className="w-5 h-5 mt-0.5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">Authenticator App</h4>
                        <p className="text-sm text-muted-foreground">
                          Use an authenticator app like Google Authenticator or Authy
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleEnable2FA} disabled={loading}>
                      {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {isEnabled && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Key className="w-5 h-5 mr-2" />
                  Backup Codes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Save these backup codes in a safe place. You can use them to access your account if you lose your phone.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {backupCodes.map((code, index) => (
                    <code key={index} className="p-2 bg-gray-100 rounded text-sm font-mono">
                      {code}
                    </code>
                  ))}
                </div>
                <Button variant="outline" size="sm">
                  Download Backup Codes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {setupStep === 'setup' && (
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Set Up Authenticator App</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <div className="w-48 h-48 bg-gray-100 rounded-lg mx-auto flex items-center justify-center">
                <div className="text-center">
                  <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-400 rounded flex items-center justify-center mb-2">
                    <span className="text-sm text-gray-500">QR Code</span>
                  </div>
                  <p className="text-xs text-gray-500">Scan with your authenticator app</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm">Can't scan? Enter this code manually:</p>
                <code className="block p-2 bg-gray-100 rounded text-sm font-mono">
                  JBSWY3DPEHPK3PXP
                </code>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="verificationCode">Enter 6-digit code from your app</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  className="text-center font-mono text-lg"
                />
              </div>

              <div className="flex space-x-3">
                <Button 
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || loading}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </Button>
                <Button variant="outline" onClick={() => setSetupStep('overview')}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}