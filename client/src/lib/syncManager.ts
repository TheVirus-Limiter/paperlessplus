import { apiRequest } from "./queryClient";

interface SyncOptions {
  forceSync?: boolean;
  maxRetries?: number;
}

interface DeviceInfo {
  deviceName: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  userAgent: string;
}

class SyncManager {
  private deviceId: string | null = null;
  private syncInProgress = false;
  private lastSyncAt: Date | null = null;
  private syncInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.deviceId = localStorage.getItem('papertrail-device-id');
    const lastSync = localStorage.getItem('papertrail-last-sync');
    this.lastSyncAt = lastSync ? new Date(lastSync) : null;
  }

  // Device registration and management
  async registerDevice(): Promise<string> {
    try {
      const deviceInfo = this.getDeviceInfo();
      const response = await apiRequest('POST', '/api/devices/register', deviceInfo);
      const device = await response.json();
      
      this.deviceId = device.id;
      localStorage.setItem('papertrail-device-id', device.id);
      
      return device.id;
    } catch (error) {
      console.error('Failed to register device:', error);
      throw error;
    }
  }

  private getDeviceInfo(): DeviceInfo {
    const userAgent = navigator.userAgent;
    let deviceType: 'mobile' | 'desktop' | 'tablet' = 'desktop';
    
    if (/Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      deviceType = /iPad/i.test(userAgent) ? 'tablet' : 'mobile';
    }

    return {
      deviceName: this.generateDeviceName(deviceType),
      deviceType,
      userAgent
    };
  }

  private generateDeviceName(deviceType: string): string {
    const platform = navigator.platform;
    const timestamp = new Date().toLocaleDateString();
    return `${deviceType.charAt(0).toUpperCase() + deviceType.slice(1)} (${platform}) - ${timestamp}`;
  }

  async ensureDeviceRegistered(): Promise<string> {
    if (!this.deviceId) {
      return await this.registerDevice();
    }
    
    try {
      // Send heartbeat to ensure device is still active
      await apiRequest('PUT', `/api/devices/${this.deviceId}/heartbeat`);
      return this.deviceId;
    } catch (error) {
      // If heartbeat fails, re-register device
      console.warn('Device heartbeat failed, re-registering device');
      return await this.registerDevice();
    }
  }

  // Sync operations
  async syncDocuments(options: SyncOptions = {}): Promise<boolean> {
    if (this.syncInProgress) {
      console.log('Sync already in progress');
      return false;
    }

    this.syncInProgress = true;
    let retries = 0;
    const maxRetries = options.maxRetries || 3;

    try {
      await this.ensureDeviceRegistered();

      while (retries < maxRetries) {
        try {
          const syncResult = await this.performSync(options.forceSync);
          this.syncInProgress = false;
          return syncResult;
        } catch (error) {
          retries++;
          console.error(`Sync attempt ${retries} failed:`, error);
          
          if (retries < maxRetries) {
            // Wait before retrying (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000));
          }
        }
      }

      throw new Error(`Sync failed after ${maxRetries} attempts`);
    } catch (error) {
      this.syncInProgress = false;
      console.error('Sync failed:', error);
      return false;
    }
  }

  private async performSync(forceSync = false): Promise<boolean> {
    try {
      // Get documents that need syncing
      const lastSyncParam = forceSync ? undefined : this.lastSyncAt?.toISOString();
      const response = await apiRequest('GET', `/api/sync/documents${lastSyncParam ? `?lastSync=${lastSyncParam}` : ''}`);
      const documents = await response.json();

      console.log(`Syncing ${documents.length} documents`);

      // Complete the sync
      const syncResponse = await apiRequest('POST', '/api/sync/complete', {
        documentIds: documents.map((doc: any) => doc.id),
        deviceId: this.deviceId,
        action: 'sync_down'
      });

      if (syncResponse.ok) {
        this.lastSyncAt = new Date();
        localStorage.setItem('papertrail-last-sync', this.lastSyncAt.toISOString());
        
        // Trigger a broadcast to update other components
        window.dispatchEvent(new CustomEvent('papertrail-sync-complete', { 
          detail: { documentCount: documents.length }
        }));

        return true;
      }

      return false;
    } catch (error) {
      console.error('Sync operation failed:', error);
      throw error;
    }
  }

  // Auto-sync functionality
  startAutoSync(intervalMinutes = 15): void {
    if (this.syncInterval) {
      this.stopAutoSync();
    }

    this.syncInterval = setInterval(() => {
      this.syncDocuments({ forceSync: false });
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto-sync started with ${intervalMinutes} minute interval`);
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto-sync stopped');
    }
  }

  // Sync status and history
  async getSyncHistory(limit = 10) {
    try {
      const response = await apiRequest('GET', `/api/sync/history?limit=${limit}`);
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch sync history:', error);
      return [];
    }
  }

  async getSyncConflicts() {
    try {
      const response = await apiRequest('GET', '/api/sync/conflicts');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch sync conflicts:', error);
      return [];
    }
  }

  // Device management
  async getUserDevices() {
    try {
      const response = await apiRequest('GET', '/api/devices');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch user devices:', error);
      return [];
    }
  }

  async deactivateDevice(deviceId: string): Promise<boolean> {
    try {
      const response = await apiRequest('DELETE', `/api/devices/${deviceId}`);
      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Failed to deactivate device:', error);
      return false;
    }
  }

  // Getters
  getDeviceId(): string | null {
    return this.deviceId;
  }

  getLastSyncAt(): Date | null {
    return this.lastSyncAt;
  }

  isSyncInProgress(): boolean {
    return this.syncInProgress;
  }
}

export const syncManager = new SyncManager();

// Auto-initialize sync when user is authenticated
export function initializeSync(): void {
  // Start auto-sync with 15 minute interval
  syncManager.startAutoSync(15);
  
  // Perform initial sync
  syncManager.syncDocuments({ forceSync: false });
}

export function cleanupSync(): void {
  syncManager.stopAutoSync();
}