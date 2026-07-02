import { fireFireworks } from "@/components/Confetti";
import { api } from "@/lib";
import { urlBase64ToUint8Array } from "@/lib/utils";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

const VAPID_PUBLIC_KEY =
  import.meta.env.VAPID_PUBLIC_KEY ||
  "BMsDdmehAo9cbq_ruyR0G53nEGqvD6XZlh-FWbBHNod672yP74LtWK_DRzmBXK2azLgyNmOg8_2s0dNk32cZxKI";

export function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionStatus, setPermissionStatus] =
    useState<NotificationPermission>("default");

  // FIXED: Evaluated as a clean boolean variable rather than an array state container
  const isSupported =
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator &&
    "PushManager" in window;

  // Checks the active client state dynamically to ensure accuracy on browser reload
  const checkSubscriptionStatus = useCallback(async () => {
    if (!isSupported) return;
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setIsSubscribed(false);
        return;
      }
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      if (typeof window !== "undefined" && "Notification" in window) {
        setPermissionStatus(Notification.permission);
      }
    } catch {
      setIsSubscribed(false);
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  // Sync state cleanly on client initialization mount
  useEffect(() => {
    checkSubscriptionStatus();
  }, [checkSubscriptionStatus]);

  async function registerServiceWorker() {
    if (!isSupported) return null;
    try {
      const registration =
        (await navigator.serviceWorker.getRegistration()) ||
        (await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        }));

      await navigator.serviceWorker.ready;
      return registration;
    } catch (err) {
      console.error("❌ Service Worker Registration Failed:", err);
      return null;
    }
  }

  async function subscribe() {
    setIsLoading(true);
    if (!isSupported || !VAPID_PUBLIC_KEY) {
      console.warn("⚠️ Push not supported or missing VAPID key");
      setIsLoading(false);
      return false;
    }

    console.log("Asking for notification permissions...");
    const permission = await Notification.requestPermission();
    console.log("Permission status:", permission);
    setPermissionStatus(permission);

    if (permission !== "granted") {
      setIsLoading(false);
      return false;
    }

    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn("⚠️ No service worker registration found.");
      setIsLoading(false);
      return false;
    }

    try {
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      const subJson = subscription.toJSON();

      console.log(subJson, subscription);
      await api.subscribeWebPush({
        endpoint: subscription.endpoint,
        p256dh: subJson.keys?.p256dh,
        auth: subJson.keys?.auth,
        user_agent: navigator.userAgent,
      });

      setIsSubscribed(true);
      setIsLoading(false);
      fireFireworks();

      await api.sendWebPushNotification({
        endpoints: [subscription.endpoint],
        payload: {
          title: "🔔 Thanks for subscribing to Elegance",
          body: "Welcome",
          data: { url: "/" },
          require_interaction: false,
        },
      });
      return true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setIsLoading(false);
      console.error("❌ PushManager Subscription Failed:", err);
      toast.error(err.message || "Subscription failed");
      return false;
    }
  }

  async function unsubscribe() {
    if (!isSupported) return false;
    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setIsLoading(false);
        return false;
      }

      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        await api.unsubscribeWebPush({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setIsLoading(false);
      return true;
    } catch {
      setIsLoading(false);
      return false;
    }
  }

  function setPermissionStatusFunc(value: NotificationPermission) {
    setPermissionStatus(value);
  }

  return {
    isLoading,
    isSupported,
    isSubscribed,
    subscribe,
    unsubscribe,
    checkSubscriptionStatus,
    permissionStatus,
    setPermissionStatus: setPermissionStatusFunc,
  };
}
