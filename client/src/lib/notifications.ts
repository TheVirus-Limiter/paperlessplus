// Notification handling for document reminders

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: any;
}

class NotificationManager {
  private permission: NotificationPermission = "default";

  constructor() {
    this.permission = this.getPermission();
  }

  private getPermission(): NotificationPermission {
    if ("Notification" in window) {
      return Notification.permission;
    }
    return "denied";
  }

  async requestPermission(): Promise<NotificationPermission> {
    if ("Notification" in window) {
      this.permission = await Notification.requestPermission();
      return this.permission;
    }
    return "denied";
  }

  canShowNotifications(): boolean {
    return this.permission === "granted" && "Notification" in window;
  }

  showNotification(options: NotificationOptions): Notification | null {
    if (!this.canShowNotifications()) {
      console.warn("Notifications not available or permission denied");
      return null;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || "/icon-192.png",
      badge: options.badge || "/icon-192.png",
      tag: options.tag,
      data: options.data,
      requireInteraction: false,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  }

  scheduleExpirationReminder(document: any, daysBeforeExpiry: number = 30): void {
    if (!document.expirationDate) return;

    const expirationDate = new Date(document.expirationDate);
    const reminderDate = new Date(expirationDate.getTime() - daysBeforeExpiry * 24 * 60 * 60 * 1000);
    const now = new Date();

    if (reminderDate <= now) {
      // Document is expiring soon or has expired
      this.showNotification({
        title: "Document Expiring Soon",
        body: `${document.title} expires on ${expirationDate.toLocaleDateString()}`,
        tag: `expiry-${document.id}`,
        data: { documentId: document.id, type: "expiry" },
      });
      return;
    }

    // Schedule future notification using service worker (if available)
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        if ("showNotification" in registration) {
          // Use service worker for background notifications
          registration.showNotification("Document Expiring Soon", {
            body: `${document.title} expires on ${expirationDate.toLocaleDateString()}`,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: `expiry-${document.id}`,
            data: { documentId: document.id, type: "expiry" },
          });
        }
      });
    }
  }

  checkExpiringDocuments(documents: any[]): void {
    const today = new Date();
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    documents.forEach((doc) => {
      if (!doc.expirationDate) return;

      const expirationDate = new Date(doc.expirationDate);
      
      // Check if document expires within 30 days
      if (expirationDate >= today && expirationDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil(
          (expirationDate.getTime() - today.getTime()) / (24 * 60 * 60 * 1000)
        );

        this.showNotification({
          title: "Document Expiring Soon",
          body: `${doc.title} expires in ${daysUntilExpiry} day${daysUntilExpiry === 1 ? "" : "s"}`,
          tag: `expiry-${doc.id}`,
          data: { documentId: doc.id, type: "expiry", daysUntilExpiry },
        });
      }
    });
  }
}

export const notificationManager = new NotificationManager();

// Initialize periodic check for expiring documents
export function initializeNotificationChecks(): void {
  // Check for expiring documents every hour
  setInterval(async () => {
    if (notificationManager.canShowNotifications()) {
      try {
        // This would need to be implemented to work with the API
        const response = await fetch("/api/documents/expiring?days=30");
        const expiringDocs = await response.json();
        notificationManager.checkExpiringDocuments(expiringDocs);
      } catch (error) {
        console.error("Failed to check expiring documents:", error);
      }
    }
  }, 60 * 60 * 1000); // 1 hour
}
