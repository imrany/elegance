import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, MessageCircle, Mail, Store } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

interface WhatsAppSettings {
  phone: string;
  message: string;
}

interface EmailSettings {
  enabled: boolean;
  from_email: string;
  resend_api_key: string;
}

interface StoreSettings {
  name: string;
  currency: string;
  free_delivery_threshold: number;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("*");
      
      const settingsMap: Record<string, any> = {};
      data?.forEach((s) => {
        settingsMap[s.key] = s.value;
      });
      
      return settingsMap;
    },
  });

  const [whatsapp, setWhatsapp] = useState<WhatsAppSettings>({
    phone: "",
    message: "",
  });

  const [email, setEmail] = useState<EmailSettings>({
    enabled: false,
    from_email: "",
    resend_api_key: "",
  });

  const [store, setStore] = useState<StoreSettings>({
    name: "",
    currency: "KES",
    free_delivery_threshold: 10000,
  });

  useEffect(() => {
    if (settings) {
      if (settings.whatsapp) setWhatsapp(settings.whatsapp);
      if (settings.email) setEmail(settings.email);
      if (settings.store) setStore(settings.store);
    }
  }, [settings]);

  const updateSetting = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: any }) => {
      const { error } = await supabase
        .from("site_settings")
        .update({ value })
        .eq("key", key);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved successfully");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSaveWhatsApp = () => {
    updateSetting.mutate({ key: "whatsapp", value: whatsapp });
  };

  const handleSaveEmail = () => {
    updateSetting.mutate({ key: "email", value: email });
  };

  const handleSaveStore = () => {
    updateSetting.mutate({ key: "store", value: store });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-light text-foreground md:text-3xl">
          Settings
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure your store settings
        </p>
      </div>

      {/* Store Settings */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="rounded-lg bg-accent/10 p-2">
            <Store className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">Store Settings</h2>
            <p className="text-sm text-muted-foreground">
              General store configuration
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="store-name">Store Name</Label>
            <Input
              id="store-name"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
              placeholder="ÉLÉGANCE"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={store.currency}
              onChange={(e) => setStore({ ...store, currency: e.target.value })}
              placeholder="KES"
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="free-delivery">Free Delivery Threshold (KES)</Label>
            <Input
              id="free-delivery"
              type="number"
              value={store.free_delivery_threshold}
              onChange={(e) =>
                setStore({ ...store, free_delivery_threshold: Number(e.target.value) })
              }
            />
            <p className="text-xs text-muted-foreground">
              Orders above this amount qualify for free delivery
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveStore} disabled={updateSetting.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Store Settings
          </Button>
        </div>
      </div>

      {/* WhatsApp Settings */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="rounded-lg bg-green-500/10 p-2">
            <MessageCircle className="h-5 w-5 text-green-500" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">WhatsApp Settings</h2>
            <p className="text-sm text-muted-foreground">
              Configure WhatsApp chat button
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="space-y-2">
            <Label htmlFor="whatsapp-phone">WhatsApp Phone Number</Label>
            <Input
              id="whatsapp-phone"
              value={whatsapp.phone}
              onChange={(e) => setWhatsapp({ ...whatsapp, phone: e.target.value })}
              placeholder="+254700000000"
            />
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +254 for Kenya)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp-message">Default Message</Label>
            <Textarea
              id="whatsapp-message"
              value={whatsapp.message}
              onChange={(e) => setWhatsapp({ ...whatsapp, message: e.target.value })}
              placeholder="Hello! I am interested in your products."
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Pre-filled message when customers click the WhatsApp button
            </p>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveWhatsApp} disabled={updateSetting.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save WhatsApp Settings
          </Button>
        </div>
      </div>

      {/* Email Settings */}
      <div className="rounded-lg border border-border bg-background p-6">
        <div className="flex items-center gap-3 border-b border-border pb-4">
          <div className="rounded-lg bg-blue-500/10 p-2">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h2 className="font-medium text-foreground">Email Settings</h2>
            <p className="text-sm text-muted-foreground">
              Configure email notifications (via Resend)
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send order confirmations and updates via email
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={email.enabled}
              onCheckedChange={(checked) => setEmail({ ...email, enabled: checked })}
            />
          </div>

          {email.enabled && (
            <>
              <div className="space-y-2">
                <Label htmlFor="from-email">From Email Address</Label>
                <Input
                  id="from-email"
                  type="email"
                  value={email.from_email}
                  onChange={(e) => setEmail({ ...email, from_email: e.target.value })}
                  placeholder="orders@yourdomain.com"
                />
                <p className="text-xs text-muted-foreground">
                  Must be a verified domain in Resend
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="resend-key">Resend API Key</Label>
                <Input
                  id="resend-key"
                  type="password"
                  value={email.resend_api_key}
                  onChange={(e) => setEmail({ ...email, resend_api_key: e.target.value })}
                  placeholder="re_xxxxxxxxxx"
                />
                <p className="text-xs text-muted-foreground">
                  Get your API key from{" "}
                  <a
                    href="https://resend.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-accent hover:underline"
                  >
                    resend.com
                  </a>
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={handleSaveEmail} disabled={updateSetting.isPending}>
            <Save className="mr-2 h-4 w-4" />
            Save Email Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
