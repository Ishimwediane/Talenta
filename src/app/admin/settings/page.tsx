"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Bell, Shield, Globe, Palette, Database, Save } from "lucide-react"

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    security: {
      twoFactor: true,
      sessionTimeout: "30",
      passwordExpiry: "90"
    },
    appearance: {
      theme: "light",
      language: "en",
      timezone: "UTC"
    },
    system: {
      autoBackup: true,
      analytics: true,
      debugMode: false
    }
  })

  const handleSettingChange = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }))
  }

  const handleSave = () => {
    // Here you would typically save to your backend
    console.log('Saving settings:', settings)
  }

  return (
    <div className="settings-page space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences and system configuration.
          </p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      <div className="grid gap-6">
        {/* Notifications */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Configure how you receive notifications and alerts.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Email Notifications</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'email', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Push Notifications</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'push', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">SMS Notifications</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Receive notifications via SMS
                </p>
              </div>
              <Switch
                checked={settings.notifications.sms}
                onCheckedChange={(checked) => handleSettingChange('notifications', 'sms', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Security
            </CardTitle>
            <CardDescription>
              Manage your security preferences and authentication settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Two-Factor Authentication</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Enable 2FA for enhanced security
                </p>
              </div>
              <Switch
                checked={settings.security.twoFactor}
                onCheckedChange={(checked) => handleSettingChange('security', 'twoFactor', checked)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="block">Session Timeout (minutes)</Label>
                <Select
                  value={settings.security.sessionTimeout}
                  onValueChange={(value) => handleSettingChange('security', 'sessionTimeout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="block">Password Expiry (days)</Label>
                <Select
                  value={settings.security.passwordExpiry}
                  onValueChange={(value) => handleSettingChange('security', 'passwordExpiry', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                    <SelectItem value="180">180 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Appearance
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your application.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="block">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleSettingChange('appearance', 'theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="block">Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => handleSettingChange('appearance', 'language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="block">Timezone</Label>
                <Select
                  value={settings.appearance.timezone}
                  onValueChange={(value) => handleSettingChange('appearance', 'timezone', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UTC">UTC</SelectItem>
                    <SelectItem value="EST">EST</SelectItem>
                    <SelectItem value="PST">PST</SelectItem>
                    <SelectItem value="GMT">GMT</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              System
            </CardTitle>
            <CardDescription>
              Configure system-level preferences and maintenance settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Automatic Backups</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Enable automatic system backups
                </p>
              </div>
              <Switch
                checked={settings.system.autoBackup}
                onCheckedChange={(checked) => handleSettingChange('system', 'autoBackup', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Analytics Collection</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Allow collection of usage analytics
                </p>
              </div>
              <Switch
                checked={settings.system.analytics}
                onCheckedChange={(checked) => handleSettingChange('system', 'analytics', checked)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="block">Debug Mode</Label>
                <p className="text-sm text-muted-foreground truncate">
                  Enable debug logging and features
                </p>
              </div>
              <Switch
                checked={settings.system.debugMode}
                onCheckedChange={(checked) => handleSettingChange('system', 'debugMode', checked)}
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Test section with long text to verify scrolling */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Test Long Content</CardTitle>
            <CardDescription>
              This section tests scrolling and text overflow handling with long content.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="block">Long Description Test</Label>
              <div className="p-4 bg-gray-50 rounded border text-sm text-gray-600 max-h-32 overflow-y-auto">
                <p>This is a comprehensive test section to verify that long text content is properly handled and scrolling works correctly across all admin pages. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                <p className="mt-2">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
                <p className="mt-2">Totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
