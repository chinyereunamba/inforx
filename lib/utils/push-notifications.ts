// Client-side push notification utilities

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
}

export class PushNotificationManager {
  private static instance: PushNotificationManager;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  public static getInstance(): PushNotificationManager {
    if (!PushNotificationManager.instance) {
      PushNotificationManager.instance = new PushNotificationManager();
    }
    return PushNotificationManager.instance;
  }

  /**
   * Check if push notifications are supported
   */
  isSupported(): boolean {
    return (
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    );
  }

  /**
   * Register service worker
   */
  async registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported()) {
      console.warn("Push notifications are not supported");
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register("/sw.js");
      console.log("Service Worker registered successfully");
      return this.registration;
    } catch (error) {
      console.error("Service Worker registration failed:", error);
      return null;
    }
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      return "denied";
    }

    if (Notification.permission === "granted") {
      return "granted";
    }

    if (Notification.permission === "denied") {
      return "denied";
    }

    const permission = await Notification.requestPermission();
    return permission;
  }

  /**
   * Subscribe to push notifications
   */
  async subscribe(): Promise<PushSubscriptionData | null> {
    try {
      const permission = await this.requestPermission();

      if (permission !== "granted") {
        console.warn("Push notification permission not granted");
        return null;
      }

      if (!this.registration) {
        this.registration = await this.registerServiceWorker();
      }

      if (!this.registration) {
        console.error("Service Worker registration failed");
        return null;
      }

      // Generate VAPID keys (in production, these should be generated server-side)
      const vapidPublicKey =
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
        "BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9f8HnKJuOmqmkFWJ3QJYdPiQfwdNQFUYDaG0_BjXmqiHpGcNBOmE";

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(vapidPublicKey),
      });

      const subscriptionData: PushSubscriptionData = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
        userAgent: navigator.userAgent,
      };

      // Save subscription to server
      await this.saveSubscriptionToServer(subscriptionData);

      return subscriptionData;
    } catch (error) {
      console.error("Push subscription failed:", error);
      return null;
    }
  }

  /**
   * Unsubscribe from push notifications
   */
  async unsubscribe(): Promise<boolean> {
    try {
      if (!this.registration) {
        return false;
      }

      const subscription =
        await this.registration.pushManager.getSubscription();

      if (!subscription) {
        return false;
      }

      // Remove subscription from server
      await this.removeSubscriptionFromServer(subscription.endpoint);

      // Unsubscribe locally
      const success = await subscription.unsubscribe();

      if (success) {
        console.log("Successfully unsubscribed from push notifications");
      }

      return success;
    } catch (error) {
      console.error("Push unsubscription failed:", error);
      return false;
    }
  }

  /**
   * Get current subscription status
   */
  async getSubscription(): Promise<PushSubscriptionData | null> {
    try {
      if (!this.registration) {
        this.registration = await navigator.serviceWorker.getRegistration();
      }

      if (!this.registration) {
        return null;
      }

      const subscription =
        await this.registration.pushManager.getSubscription();

      if (!subscription) {
        return null;
      }

      return {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
          auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
        },
        userAgent: navigator.userAgent,
      };
    } catch (error) {
      console.error("Error getting subscription:", error);
      return null;
    }
  }

  /**
   * Show local notification (for testing)
   */
  async showLocalNotification(
    title: string,
    options: NotificationOptions = {}
  ): Promise<void> {
    const permission = await this.requestPermission();

    if (permission !== "granted") {
      console.warn("Cannot show notification: permission not granted");
      return;
    }

    if (!this.registration) {
      this.registration = await this.registerServiceWorker();
    }

    if (this.registration) {
      await this.registration.showNotification(title, {
        icon: "/icons/icon-192x192.png",
        badge: "/icons/badge-72x72.png",
        ...options,
      });
    } else {
      // Fallback to browser notification
      new Notification(title, {
        icon: "/icons/icon-192x192.png",
        ...options,
      });
    }
  }

  /**
   * Save subscription to server
   */
  private async saveSubscriptionToServer(
    subscription: PushSubscriptionData
  ): Promise<void> {
    try {
      const response = await fetch("/api/notifications/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription to server");
      }

      console.log("Subscription saved to server successfully");
    } catch (error) {
      console.error("Error saving subscription to server:", error);
      throw error;
    }
  }

  /**
   * Remove subscription from server
   */
  private async removeSubscriptionFromServer(endpoint: string): Promise<void> {
    try {
      const response = await fetch(
        `/api/notifications/push-subscription?endpoint=${encodeURIComponent(
          endpoint
        )}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to remove subscription from server");
      }

      console.log("Subscription removed from server successfully");
    } catch (error) {
      console.error("Error removing subscription from server:", error);
      throw error;
    }
  }

  /**
   * Convert VAPID key to Uint8Array
   */
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
  }

  /**
   * Convert ArrayBuffer to Base64
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";

    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }

    return window.btoa(binary);
  }
}

export const pushNotificationManager = PushNotificationManager.getInstance();
