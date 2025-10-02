import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { ArrowLeft, Bell, Mail, Smartphone, Monitor } from 'lucide-react';
import { Separator } from '../ui/separator';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface NotificationSettingsProps {
  onBack: () => void;
}

export function NotificationSettings({ onBack }: NotificationSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState({
    lowStock: true,
    dailyReports: false,
    stockUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
    criticalAlerts: true
  });

  const [pushNotifications, setPushNotifications] = useState({
    lowStock: true,
    stockUpdates: false,
    systemAlerts: true,
    criticalAlerts: true
  });

  const [preferences, setPreferences] = useState({
    frequency: 'immediate',
    quietHours: false,
    quietStart: '22:00',
    quietEnd: '08:00'
  });

  const [loading, setLoading] = useState(false);

  const handleEmailToggle = (key: keyof typeof emailNotifications) => {
    setEmailNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePushToggle = (key: keyof typeof pushNotifications) => {
    setPushNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      alert('Notification settings saved successfully!');
    } catch (error) {
      alert('Failed to save settings. Please try again.');
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
          <Bell className="w-6 h-6 mr-2" />
          Notification Settings
        </h1>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Mail className="w-5 h-5 mr-2" />
              Email Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified when products reach reorder level</p>
              </div>
              <Switch
                checked={emailNotifications.lowStock}
                onCheckedChange={() => handleEmailToggle('lowStock')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Daily Reports</p>
                <p className="text-sm text-muted-foreground">Receive daily inventory summary reports</p>
              </div>
              <Switch
                checked={emailNotifications.dailyReports}
                onCheckedChange={() => handleEmailToggle('dailyReports')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stock Updates</p>
                <p className="text-sm text-muted-foreground">Get notified about stock changes</p>
              </div>
              <Switch
                checked={emailNotifications.stockUpdates}
                onCheckedChange={() => handleEmailToggle('stockUpdates')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-muted-foreground">Important system notifications and maintenance updates</p>
              </div>
              <Switch
                checked={emailNotifications.systemAlerts}
                onCheckedChange={() => handleEmailToggle('systemAlerts')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Weekly Reports</p>
                <p className="text-sm text-muted-foreground">Comprehensive weekly inventory reports</p>
              </div>
              <Switch
                checked={emailNotifications.weeklyReports}
                onCheckedChange={() => handleEmailToggle('weeklyReports')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Critical Alerts</p>
                <p className="text-sm text-muted-foreground">Emergency notifications and security alerts</p>
              </div>
              <Switch
                checked={emailNotifications.criticalAlerts}
                onCheckedChange={() => handleEmailToggle('criticalAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Push Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Smartphone className="w-5 h-5 mr-2" />
              Push Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Low Stock Alerts</p>
                <p className="text-sm text-muted-foreground">Instant push notifications for low stock</p>
              </div>
              <Switch
                checked={pushNotifications.lowStock}
                onCheckedChange={() => handlePushToggle('lowStock')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Stock Updates</p>
                <p className="text-sm text-muted-foreground">Real-time stock change notifications</p>
              </div>
              <Switch
                checked={pushNotifications.stockUpdates}
                onCheckedChange={() => handlePushToggle('stockUpdates')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">System Alerts</p>
                <p className="text-sm text-muted-foreground">System status and maintenance notifications</p>
              </div>
              <Switch
                checked={pushNotifications.systemAlerts}
                onCheckedChange={() => handlePushToggle('systemAlerts')}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Critical Alerts</p>
                <p className="text-sm text-muted-foreground">Emergency and security notifications</p>
              </div>
              <Switch
                checked={pushNotifications.criticalAlerts}
                onCheckedChange={() => handlePushToggle('criticalAlerts')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Monitor className="w-5 h-5 mr-2" />
              Notification Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select 
                value={preferences.frequency} 
                onValueChange={(value) => setPreferences(prev => ({ ...prev, frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="hourly">Hourly Digest</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Quiet Hours</p>
                  <p className="text-sm text-muted-foreground">Disable non-critical notifications during specified hours</p>
                </div>
                <Switch
                  checked={preferences.quietHours}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, quietHours: checked }))}
                />
              </div>

              {preferences.quietHours && (
                <div className="grid grid-cols-2 gap-4 ml-4">
                  <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Select 
                      value={preferences.quietStart} 
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, quietStart: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>End Time</Label>
                    <Select 
                      value={preferences.quietEnd} 
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, quietEnd: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 24 }, (_, i) => {
                          const hour = i.toString().padStart(2, '0');
                          return (
                            <SelectItem key={hour} value={`${hour}:00`}>
                              {hour}:00
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={loading}>
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>
    </div>
  );
}