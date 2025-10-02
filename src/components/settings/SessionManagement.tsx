import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ArrowLeft, Monitor, Smartphone, MapPin, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface SessionManagementProps {
  onBack: () => void;
}

interface Session {
  id: string;
  device: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  location: string;
  ipAddress: string;
  lastActive: string;
  isCurrent: boolean;
}

export function SessionManagement({ onBack }: SessionManagementProps) {
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([
    {
      id: '1',
      device: 'Chrome on Windows 11',
      deviceType: 'desktop',
      location: 'New York, NY',
      ipAddress: '192.168.1.100',
      lastActive: 'Active now',
      isCurrent: true
    },
    {
      id: '2',
      device: 'Safari on iPhone 15',
      deviceType: 'mobile',
      location: 'New York, NY',
      ipAddress: '192.168.1.105',
      lastActive: '2 hours ago',
      isCurrent: false
    },
    {
      id: '3',
      device: 'Chrome on MacBook Pro',
      deviceType: 'desktop',
      location: 'Boston, MA',
      ipAddress: '10.0.0.45',
      lastActive: '1 day ago',
      isCurrent: false
    },
    {
      id: '4',
      device: 'Firefox on Ubuntu',
      deviceType: 'desktop',
      location: 'San Francisco, CA',
      ipAddress: '172.16.0.23',
      lastActive: '3 days ago',
      isCurrent: false
    }
  ]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="w-5 h-5" />;
      case 'desktop':
      default:
        return <Monitor className="w-5 h-5" />;
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSessions(prev => prev.filter(session => session.id !== sessionId));
    } catch (error) {
      console.error('Failed to terminate session');
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateAllOtherSessions = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSessions(prev => prev.filter(session => session.isCurrent));
    } catch (error) {
      console.error('Failed to terminate sessions');
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
          <Monitor className="w-6 h-6 mr-2" />
          Session Management
        </h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground">
                These are the devices and locations where your account is currently signed in. 
                If you don't recognize a session, terminate it immediately.
              </p>

              {sessions.length > 1 && (
                <Alert>
                  <AlertDescription>
                    You have {sessions.length} active sessions. Consider terminating sessions you don't recognize.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button 
                  variant="outline" 
                  onClick={handleTerminateAllOtherSessions}
                  disabled={loading || sessions.filter(s => !s.isCurrent).length === 0}
                >
                  {loading ? 'Terminating...' : 'Terminate All Other Sessions'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className={session.isCurrent ? 'border-green-200 bg-green-50' : ''}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{session.device}</h4>
                        {session.isCurrent && (
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            Current Session
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{session.location}</span>
                          <span>•</span>
                          <span>{session.ipAddress}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>Last active: {session.lastActive}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {!session.isCurrent && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleTerminateSession(session.id)}
                      disabled={loading}
                    >
                      Terminate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Security Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                <p>Always sign out when using shared or public computers</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                <p>Regularly review your active sessions and terminate unfamiliar ones</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                <p>Enable two-factor authentication for additional security</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
                <p>Use strong, unique passwords for your account</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}