import { api } from "@/lib";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useState } from "react";

const VAPID_PUBLIC_KEY =
  import.meta.env.VAPID_PUBLIC_KEY ||
  "BPbYWrHTioEjXF5ZUDyI-K1Pf7f0ZNWj7oSH5-C5MzTZk7RtbbIXdDp1cudLtoCiD62a32F-b-n4Lzmhs5F8BsA";

export function usePushNotifications() {
  // Global singleton tracking states so multiple components can share the same pipeline
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");
  const isSupported = useState(
    typeof window !== "undefined" &&
      "Notification" in window &&
      "serviceWorker" in navigator &&
      "PushManager" in window,
  );

  // Checks the active client state dynamically to ensure accuracy on browser reload
  async function checkSubscriptionStatus() {
    if (!isSupported) return;
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setIsSubscribed(false);
        return;
      }
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch {
      setIsSubscribed(false);
    }
  }

  async function registerServiceWorker() {
    if (!isSupported) return null;
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      return registration;
    } catch (err) {
      console.error("❌ Service Worker Registration Failed:", err);
      return null;
    }
  }

  async function subscribe(userId: string) {
    if (!isSupported || !VAPID_PUBLIC_KEY) {
      console.warn("⚠️ Push not supported or missing VAPID key");
      return false;
    }

    console.log("Asking for notification permissions...");
    const permission = await Notification.requestPermission();
    console.log("Permission status:", permission);
    if (permission !== "granted") {
      setPermissionStatus(permission);
      return false;
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn("⚠️ No service worker registration found.");
      return false;
    }

    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      const subJson = subscription.toJSON();

      await api.subscribeWebPush({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth_key: subJson.keys?.auth,
        user_agent: navigator.userAgent,
      });

      setIsSubscribed(true);
      return true;
    } catch (err) {
      console.error("❌ PushManager Subscription Failed:", err); // <-- Add this
      return false;
    }
  }

  async function unsubscribe() {
    if (!isSupported) return false;

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) return false;

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await api.unsubscribeWebPush({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch {
      return false;
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    permissionStatus,
  };
}
