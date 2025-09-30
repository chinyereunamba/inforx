// Service Worker for Push Notifications
const CACHE_NAME = "inforx-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/offline.html",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request);
    })
  );
});

// Push event
self.addEventListener("push", (event) => {
  console.log("Push event received:", event);

  let notificationData = {
    title: "InfoRx Notification",
    body: "You have a new notification",
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    tag: "inforx-notification",
    data: {},
  };

  if (event.data) {
    try {
      const payload = event.data.json();
      notificationData = {
        ...notificationData,
        ...payload,
      };
    } catch (error) {
      console.error("Error parsing push payload:", error);
      notificationData.body = event.data.text();
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    requireInteraction: notificationData.data?.priority === "critical",
    actions: [
      {
        action: "view",
        title: "View",
        icon: "/icons/view-action.png",
      },
      {
        action: "dismiss",
        title: "Dismiss",
        icon: "/icons/dismiss-action.png",
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(
      notificationData.title,
      notificationOptions
    )
  );
});

// Notification click event
self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event);

  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  // Handle notification click
  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus();
          }
        }

        // If no window/tab is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background sync event (for offline functionality)
self.addEventListener("sync", (event) => {
  console.log("Background sync event:", event);

  if (event.tag === "background-sync") {
    event.waitUntil(
      // Handle background sync tasks
      syncData()
    );
  }
});

// Sync data function
async function syncData() {
  try {
    // Implement background sync logic here
    console.log("Syncing data in background...");

    // Example: Sync pending notifications, uploads, etc.
    const pendingRequests = await getPendingRequests();

    for (const request of pendingRequests) {
      try {
        await fetch(request.url, request.options);
        await removePendingRequest(request.id);
      } catch (error) {
        console.error("Failed to sync request:", error);
      }
    }
  } catch (error) {
    console.error("Background sync failed:", error);
  }
}

// Helper functions for background sync
async function getPendingRequests() {
  // Implement logic to get pending requests from IndexedDB
  return [];
}

async function removePendingRequest(id) {
  // Implement logic to remove synced request from IndexedDB
  console.log("Removing pending request:", id);
}

// Message event (for communication with main thread)
self.addEventListener("message", (event) => {
  console.log("Service worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
