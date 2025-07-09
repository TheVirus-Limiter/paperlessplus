import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Download, Bell, Shield, Info, HelpCircle, LogOut } from "lucide-react";
import { useState } from "react";
import { exportDocuments } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";
import SyncSettings from "@/components/sync-settings";
import { cleanupSync } from "@/lib/syncManager";

export default function Settings() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(30);
  const { toast } = useToast();

  const handleExport = async () => {
    try {
      await exportDocuments();
      toast({
        title: "Export Successful",
        description: "Your documents have been exported to a JSON file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your documents.",
        variant: "destructive",
      });
    }
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive reminders about expiring documents.",
        });
      }
    }
  };

  const handleLogout = () => {
    cleanupSync();
    window.location.href = "/api/logout";
  };

  return (
    <div className="max-w-md mx-auto bg-slate-900 min-h-screen relative">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-6 w-6 text-purple-400" />
          <h1 className="text-xl font-semibold text-white">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Notifications */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Bell className="h-4 w-4 text-purple-400" />
                Notifications
              </CardTitle>
              <CardDescription className="text-slate-400">
                Get reminders about expiring documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications" className="text-white">Enable Notifications</Label>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={(checked) => {
                    setNotificationsEnabled(checked);
                    if (checked) {
                      requestNotificationPermission();
                    }
                  }}
                />
              </div>
              
              {notificationsEnabled && (
                <div className="space-y-2">
                  <Label className="text-white">Remind me before expiration</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 30, 90].map((days) => (
                      <Button
                        key={days}
                        variant={reminderDays === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReminderDays(days)}
                        className={`text-xs ${reminderDays === days ? 'bg-purple-600 text-white hover:bg-purple-700' : 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                      >
                        {days} days
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cloud Sync Settings */}
          <SyncSettings />

          {/* Data Management */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Shield className="h-4 w-4 text-purple-400" />
                Data & Privacy
              </CardTitle>
              <CardDescription className="text-slate-400">
                Manage your document data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Documents
              </Button>
              
              <div className="text-sm text-slate-300 p-3 bg-slate-700 rounded-lg">
                <Shield className="h-4 w-4 inline mr-2 text-green-400" />
                Your data is stored locally on your device. No information is uploaded to external servers.
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base text-white">
                <Info className="h-4 w-4 text-purple-400" />
                About PaperTrail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-slate-300">
                <p className="mb-2"><strong className="text-white">Version:</strong> 1.0.0</p>
                <p>
                  A privacy-focused document organization app that helps you track important papers without scanning or uploading them.
                </p>
              </div>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-slate-300 hover:bg-slate-700 hover:text-white"
                onClick={() => window.open("mailto:support@papertrail.app", "_blank")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-slate-700"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
