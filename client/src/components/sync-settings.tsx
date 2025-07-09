import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Cloud, 
  RefreshCw, 
  Smartphone, 
  Trash2, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Monitor,
  Tablet
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { syncManager, initializeSync, cleanupSync } from "@/lib/syncManager";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface SyncHistory {
  id: string;
  action: string;
  documentCount: string;
  status: string;
  createdAt: string;
}

interface UserDevice {
  id: string;
  deviceName: string;
  deviceType: string;
  lastSeenAt: string;
  isActive: string;
}

export default function SyncSettings() {
  const [autoSync, setAutoSync] = useState(true);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user devices
  const { data: devices = [], refetch: refetchDevices } = useQuery({
    queryKey: ["/api/devices"],
    enabled: !!user,
  });

  // Fetch sync history
  const { data: syncHistory = [] } = useQuery<SyncHistory[]>({
    queryKey: ["/api/sync/history"],
    enabled: !!user,
  });

  // Manual sync mutation
  const syncMutation = useMutation({
    mutationFn: async () => {
      setSyncInProgress(true);
      const success = await syncManager.syncDocuments({ forceSync: true });
      if (!success) {
        throw new Error("Sync failed");
      }
    },
    onSuccess: () => {
      toast({
        title: "Sync Complete",
        description: "Your documents have been synchronized across all devices.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sync/history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "There was an error syncing your documents.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setSyncInProgress(false);
    },
  });

  // Device deactivation mutation
  const deactivateDeviceMutation = useMutation({
    mutationFn: async (deviceId: string) => {
      const success = await syncManager.deactivateDevice(deviceId);
      if (!success) {
        throw new Error("Failed to deactivate device");
      }
    },
    onSuccess: () => {
      toast({
        title: "Device Removed",
        description: "The device has been successfully removed from your account.",
      });
      refetchDevices();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove device.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (user && autoSync) {
      initializeSync();
    } else {
      cleanupSync();
    }

    return () => {
      cleanupSync();
    };
  }, [user, autoSync]);

  const handleManualSync = () => {
    syncMutation.mutate();
  };

  const handleAutoSyncToggle = (enabled: boolean) => {
    setAutoSync(enabled);
    if (enabled && user) {
      initializeSync();
    } else {
      cleanupSync();
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const formatLastSeen = (lastSeenAt: string) => {
    const date = new Date(lastSeenAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Cloud Sync Settings */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Cloud className="h-5 w-5 text-purple-400" />
            Cloud Sync
          </CardTitle>
          <CardDescription className="text-slate-400">
            Keep your documents synchronized across all your devices
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="auto-sync" className="text-white">Automatic Sync</Label>
              <p className="text-xs text-slate-400">
                Sync documents automatically every 15 minutes
              </p>
            </div>
            <Switch
              id="auto-sync"
              checked={autoSync}
              onCheckedChange={handleAutoSyncToggle}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-white">Manual Sync</Label>
              <p className="text-xs text-slate-400">
                Last sync: {syncManager.getLastSyncAt()?.toLocaleString() || "Never"}
              </p>
            </div>
            <Button
              onClick={handleManualSync}
              disabled={syncInProgress || syncMutation.isPending}
              size="sm"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${syncInProgress ? 'animate-spin' : ''}`} />
              {syncInProgress ? "Syncing..." : "Sync Now"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Devices */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Smartphone className="h-5 w-5 text-purple-400" />
            Connected Devices
          </CardTitle>
          <CardDescription className="text-slate-400">
            Manage devices that have access to your documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          {devices.length === 0 ? (
            <p className="text-sm text-slate-400">No devices connected</p>
          ) : (
            <div className="space-y-3">
              {devices.map((device: UserDevice) => (
                <div
                  key={device.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-600 bg-slate-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-purple-400">
                      {getDeviceIcon(device.deviceType)}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-white">{device.deviceName}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatLastSeen(device.lastSeenAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {device.id === syncManager.getDeviceId() && (
                      <Badge variant="secondary" className="text-xs">
                        This Device
                      </Badge>
                    )}
                    {device.id !== syncManager.getDeviceId() && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deactivateDeviceMutation.mutate(device.id)}
                        disabled={deactivateDeviceMutation.isPending}
                        className="text-red-400 hover:text-red-300 hover:bg-slate-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sync History */}
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Clock className="h-5 w-5 text-purple-400" />
            Sync History
          </CardTitle>
          <CardDescription className="text-slate-400">
            Recent synchronization activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          {syncHistory.length === 0 ? (
            <p className="text-sm text-slate-400">No sync history available</p>
          ) : (
            <div className="space-y-2">
              {syncHistory.slice(0, 5).map((history: SyncHistory) => (
                <div
                  key={history.id}
                  className="flex items-center justify-between p-2 rounded border-l-4 border-l-purple-400 bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    {history.status === "success" ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-white">
                        {history.action === "sync_down" ? "Downloaded" : "Uploaded"} {history.documentCount} documents
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={history.status === "success" ? "default" : "destructive"}
                    className="text-xs"
                  >
                    {history.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}