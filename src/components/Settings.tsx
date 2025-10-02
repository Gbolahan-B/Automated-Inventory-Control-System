import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { User, Settings as SettingsIcon, Bell, Lock, Shield, Monitor, ChevronRight } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { ChangePassword } from './settings/ChangePassword';
import { TwoFactorAuth } from './settings/TwoFactorAuth';
import { SessionManagement } from './settings/SessionManagement';
import { NotificationSettings } from './settings/NotificationSettings';
import { ProfileInfo } from './settings/ProfileInfo';

interface SettingsProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function Settings({ currentSection, onSectionChange }: SettingsProps) {
  const [profile, setProfile] = useState({
    name: 'John Smith',
    email: 'john.smith@company.com',
    role: 'Inventory Manager'
  });

  const [notifications, setNotifications] = useState({
    lowStock: true,
    dailyReports: false,
    stockUpdates: true
  });

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Profile updated successfully!');
  };

  const handleNotificationToggle = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSectionNavigation = (section: string) => {
    onSectionChange(section);
  };

  const handleBackToOverview = () => {
    onSectionChange('overview');
  };

  // Render specific section components
  switch (currentSection) {
    case 'change-password':
      return <ChangePassword onBack={handleBackToOverview} />;
    case 'two-factor':
      return <TwoFactorAuth onBack={handleBackToOverview} />;
    case 'session-management':
      return <SessionManagement onBack={handleBackToOverview} />;
    case 'notifications':
      return <NotificationSettings onBack={handleBackToOverview} />;
    case 'profile':
      return <ProfileInfo onBack={handleBackToOverview} />;
    default:
      // Show overview/main settings page
      break;
  }

  return (
    <div className="space-y-6">
      <h1>Settings</h1>
      
      {/* Settings Menu */}
      <div className="grid gap-4">
        {/* Profile Section */}
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSectionNavigation('profile')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium">Profile Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Manage your personal information and preferences
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Lock className="w-5 h-5 mr-2" />
              Security Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4"
              onClick={() => handleSectionNavigation('change-password')}
            >
              <div className="flex items-center space-x-3">
                <Lock className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your account password</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4"
              onClick={() => handleSectionNavigation('two-factor')}
            >
              <div className="flex items-center space-x-3">
                <Shield className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-between h-auto p-4"
              onClick={() => handleSectionNavigation('session-management')}
            >
              <div className="flex items-center space-x-3">
                <Monitor className="w-4 h-4" />
                <div className="text-left">
                  <p className="font-medium">Session Management</p>
                  <p className="text-sm text-muted-foreground">Manage your active sessions</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => handleSectionNavigation('notifications')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Notification Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure your notification preferences
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        {/* System Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              System Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              Configure default settings for your inventory system
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Default Reorder Level</Label>
                <Input type="number" defaultValue="10" />
              </div>
              
              <div className="space-y-2">
                <Label>Currency</Label>
                <Input defaultValue="NGN (₦)" />
              </div>
              
              <div className="space-y-2">
                <Label>Date Format</Label>
                <Input defaultValue="MM/DD/YYYY" />
              </div>
              
              <div className="space-y-2">
                <Label>Time Zone</Label>
                <Input defaultValue="UTC-5 (EST)" />
              </div>
            </div>
            
            <Button className="w-full">Save System Settings</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}