import Header from "@/components/header";
import BottomNavigation from "@/components/bottom-navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings as SettingsIcon, Download, Bell, Shield, Info, HelpCircle } from "lucide-react";
import { useState } from "react";
import { exportDocuments } from "@/lib/export";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen relative">
      <Header hideSearch />
      
      <main className="pb-20 px-4 pt-4">
        <div className="flex items-center gap-3 mb-6">
          <SettingsIcon className="h-6 w-6 text-[var(--papertrail-primary)]" />
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>

        <div className="space-y-4">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
              <CardDescription>
                Get reminders about expiring documents
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="notifications">Enable Notifications</Label>
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
                  <Label>Remind me before expiration</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[7, 30, 90].map((days) => (
                      <Button
                        key={days}
                        variant={reminderDays === days ? "default" : "outline"}
                        size="sm"
                        onClick={() => setReminderDays(days)}
                        className="text-xs"
                      >
                        {days} days
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Data & Privacy
              </CardTitle>
              <CardDescription>
                Manage your document data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={handleExport}
              >
                <Download className="h-4 w-4 mr-2" />
                Export Documents
              </Button>
              
              <div className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">
                <Shield className="h-4 w-4 inline mr-2" />
                Your data is stored locally on your device. No information is uploaded to external servers.
              </div>
            </CardContent>
          </Card>

          {/* About */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Info className="h-4 w-4" />
                About PaperTrail
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-gray-600">
                <p className="mb-2">Version 1.0.0</p>
                <p>
                  A privacy-focused document organization app that helps you track important papers without scanning or uploading them.
                </p>
              </div>
              
              <Separator />
              
              <Button 
                variant="ghost" 
                className="w-full justify-start"
                onClick={() => window.open("mailto:support@papertrail.app", "_blank")}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <BottomNavigation />
    </div>
  );
}
