self.addEventListener("push", function (event) {
  let data = {
    // title: "Elegance",
    // body: "New notification",
    // icon: "/favicon.png",
  };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.png", // The prompt's JSON structure does not explicitly include 'icon' at the root level, so this will default to '/favicon.png' unless 'icon' is added to the root of the incoming JSON payload.
    badge: data.badge || "/favicon.png",
    data: data.data || {},
    vibrate: [100, 50, 100],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Elegance", options),
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.url || "/admin";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then(function (clientList) {
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url.includes("/admin") && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      }),
  );
});
