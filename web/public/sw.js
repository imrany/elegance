self.addEventListener("push", function (event) {
  console.log("Push event received:", event);

  let data = {
    body: "",
  };
  // Check if event has data
  if (!event.data) {
    console.error("Push event has no data");
    return;
  } else {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "You have a new notification",
    icon: data.icon || "/favicon.svg",
    badge: data.badge || "/logo.svg",
    image: data.image || "",
    actions: data.actions || [],
    silent: false,
    tag: data.tag || "default-tag",
    requireInteraction: data.require_interaction || true,
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Elegance", options),
  );
});

self.addEventListener("notificationclick", (event) => {
  console.log("Notification clicked:", event.notification);
  event.notification.close();

  const link = event.notification.data.url || "/";
  const action = event.action;

  if (action) {
    console.log("Action clicked:", action);
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windowClients) => {
        const matchingClient = windowClients.find(
          (client) => client.url === link,
        );
        if (matchingClient) {
          return matchingClient.focus();
        } else {
          return clients.openWindow(link);
        }
      }),
  );
});
