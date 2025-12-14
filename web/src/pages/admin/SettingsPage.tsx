import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, SiteSetting, SiteSettingValue } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
  Upload,
  Facebook,
  Instagram,
  Twitter,
  Store,
  MessageCircle,
  Mail,
} from "lucide-react";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Helper function to parse setting values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parseSettingValue = (setting: SiteSetting | undefined): any => {
    if (!setting?.value) return {};

    // If value is already an object, return it
    if (typeof setting.value === "object") {
      return setting.value;
    }

    // If value is a string, try to parse it
    if (typeof setting.value === "string") {
      try {
        return JSON.parse(setting.value);
      } catch (e) {
        console.error("Error parsing setting value:", e);
        return {};
      }
    }

    return {};
  };

  // Fetch all settings
  const { data: storeSettings, isLoading: storeLoading } = useQuery({
    queryKey: ["settings", "store"],
    queryFn: async () => {
      const response = await api.getSetting("store");
      return response.data;
    },
  });

  const { data: whatsappSettings, isLoading: whatsappLoading } = useQuery({
    queryKey: ["settings", "whatsapp"],
    queryFn: async () => {
      const response = await api.getSetting("whatsapp");
      return response.data;
    },
  });

  const { data: emailSettings, isLoading: emailLoading } = useQuery({
    queryKey: ["settings", "email"],
    queryFn: async () => {
      const response = await api.getSetting("email");
      return response.data;
    },
  });

  const { data: socialSettings, isLoading: socialLoading } = useQuery({
    queryKey: ["settings", "social_media"],
    queryFn: async () => {
      const response = await api.getSetting("social_media");
      return response.data;
    },
  });

  // Parse setting values
  const storeValue = parseSettingValue(storeSettings);
  const whatsappValue = parseSettingValue(whatsappSettings);
  const emailValue = parseSettingValue(emailSettings);
  const socialValue = parseSettingValue(socialSettings);

  // Update settings mutation
  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: SiteSettingValue }) =>
      api.updateSetting(key, value),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["settings", variables.key] });
      toast.success("Settings updated successfully");
    },
    onError: () => {
      toast.error("Failed to update settings");
    },
  });

  // Handle store settings update
  const handleStoreUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateSettingMutation.mutate({
      key: "store",
      value: JSON.stringify({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        currency: formData.get("currency") as string,
        free_delivery_threshold: Number(
          formData.get("free_delivery_threshold"),
        ),
        logo: logoPreview || storeValue?.logo || "",
      }),
    });
  };

  // Handle WhatsApp settings update
  const handleWhatsAppUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateSettingMutation.mutate({
      key: "whatsapp",
      value: JSON.stringify({
        phone: formData.get("phone") as string,
        message: formData.get("message") as string,
      }),
    });
  };

  // Handle social media update
  const handleSocialUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateSettingMutation.mutate({
      key: "social_media",
      value: JSON.stringify({
        facebook: formData.get("facebook") as string,
        instagram: formData.get("instagram") as string,
        twitter: formData.get("twitter") as string,
      }),
    });
  };

  // Handle email settings update
  const handleEmailUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    updateSettingMutation.mutate({
      key: "email",
      value: {
        enabled: formData.get("enabled") === "on",
        from_email: formData.get("from_email") as string,
        resend_api_key: formData.get("resend_api_key") as string,
      },
    });
  };

  // Handle logo upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (storeLoading || whatsappLoading || emailLoading || socialLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <span className="text-lg text-muted-foreground">
            Loading settings...
          </span>
        </div>
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
          Manage your store configuration
        </p>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="store">
            <Store className="mr-2 h-4 w-4" />
            Store
          </TabsTrigger>
          <TabsTrigger value="social">
            <Facebook className="mr-2 h-4 w-4" />
            Social Media
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="mr-2 h-4 w-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="mr-2 h-4 w-4" />
            Email
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store">
          <Card>
            <CardHeader>
              <CardTitle>Store Information</CardTitle>
              <CardDescription>
                Update your store name, logo, and description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStoreUpdate} className="space-y-6">
                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="h-24 w-24 rounded border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {logoPreview || storeValue?.logo ? (
                        <img
                          src={logoPreview || storeValue?.logo}
                          alt="Store logo"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        className="max-w-xs"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Recommended: Square image, max 2MB
                      </p>
                    </div>
                  </div>
                </div>

                {/* Store Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Store Name</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={storeValue?.name || ""}
                    placeholder="ÉLÉGANCE"
                    required
                  />
                </div>

                {/* Store Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Store Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    defaultValue={storeValue?.description || ""}
                    placeholder="Tell customers about your store..."
                    rows={4}
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={storeValue?.currency || "KES"}
                    placeholder="KES"
                    required
                  />
                </div>

                {/* Free Delivery Threshold */}
                <div className="space-y-2">
                  <Label htmlFor="free_delivery_threshold">
                    Free Delivery Threshold
                  </Label>
                  <Input
                    id="free_delivery_threshold"
                    name="free_delivery_threshold"
                    type="number"
                    defaultValue={storeValue?.free_delivery_threshold || 10000}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Orders above this amount get free delivery
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Settings */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Add your social media profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSocialUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="facebook">
                    <Facebook className="inline mr-2 h-4 w-4" />
                    Facebook
                  </Label>
                  <Input
                    id="facebook"
                    name="facebook"
                    type="url"
                    defaultValue={socialValue?.facebook || ""}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagram">
                    <Instagram className="inline mr-2 h-4 w-4" />
                    Instagram
                  </Label>
                  <Input
                    id="instagram"
                    name="instagram"
                    type="url"
                    defaultValue={socialValue?.instagram || ""}
                    placeholder="https://instagram.com/yourprofile"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">
                    <Twitter className="inline mr-2 h-4 w-4" />
                    Twitter / X
                  </Label>
                  <Input
                    id="twitter"
                    name="twitter"
                    type="url"
                    defaultValue={socialValue?.twitter || ""}
                    placeholder="https://twitter.com/yourprofile"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Settings */}
        <TabsContent value="whatsapp">
          <Card>
            <CardHeader>
              <CardTitle>WhatsApp Configuration</CardTitle>
              <CardDescription>
                Configure WhatsApp contact button
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleWhatsAppUpdate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    defaultValue={whatsappValue?.phone || ""}
                    placeholder="+254700000000"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Include country code (e.g., +254 for Kenya)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Default Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    defaultValue={whatsappValue?.message || ""}
                    placeholder="Hello! I am interested in your products."
                    rows={3}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email notifications (Resend)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleEmailUpdate} className="space-y-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enabled"
                    name="enabled"
                    defaultChecked={emailValue?.enabled || false}
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="enabled" className="cursor-pointer">
                    Enable email notifications
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="from_email">From Email</Label>
                  <Input
                    id="from_email"
                    name="from_email"
                    type="email"
                    defaultValue={emailValue?.from_email || ""}
                    placeholder="noreply@yourstore.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resend_api_key">Resend API Key</Label>
                  <Input
                    id="resend_api_key"
                    name="resend_api_key"
                    type="password"
                    defaultValue={emailValue?.resend_api_key || ""}
                    placeholder="re_..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your API key from{" "}
                    <a
                      href="https://resend.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      resend.com
                    </a>
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={updateSettingMutation.isPending}
                >
                  {updateSettingMutation.isPending
                    ? "Saving..."
                    : "Save Changes"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
