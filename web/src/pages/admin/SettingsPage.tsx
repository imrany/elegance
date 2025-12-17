import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, API_URL, SiteSetting, WebsiteSettingKey } from "@/lib/api";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {
  Upload,
  Facebook,
  Instagram,
  Twitter,
  Store,
  MessageCircle,
  Loader2,
  X,
  MailQuestionMarkIcon,
} from "lucide-react";
import { useGeneralContext } from "@/contexts/GeneralContext";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [emailFromEmail, setEmailFromEmail] = useState("");
  const [emailApiKey, setEmailApiKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { websiteConfig, saveWebsiteConfig: $saveWebsiteConfig } =
    useGeneralContext();
  const store = websiteConfig?.store;
  const smtp = websiteConfig?.smtp;
  const whatsapp = websiteConfig?.whatsapp;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const saveWebsiteConfig = (key: WebsiteSettingKey, value: any) => {
    $saveWebsiteConfig.mutate({ key: key, sectionData: value });
  };

  // Initialize email enabled state
  useEffect(() => {
    setEmailEnabled(smtp?.enabled || false);
    setEmailFromEmail(smtp?.from_email || "");
    setEmailApiKey(smtp?.resend_api_key || "");
  }, [smtp?.enabled, smtp?.from_email, smtp?.resend_api_key]);

  // Upload image mutation
  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      // Assuming your API has an upload endpoint
      const response = await api.uploadImage(formData);
      return response.data.url; // Adjust based on your API response
    },
    onSuccess: (path) => {
      setLogoPreview(path);
      //update store settings with new logo URL
      saveWebsiteConfig("store", {
        name: store.name,
        description: store.description,
        currency: store.currency,
        free_delivery_threshold: store.free_delivery_threshold,
        logo: path,
        announcement: store.announcement,
      });
      toast.success("Logo uploaded successfully");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload logo");
    },
    onSettled: () => {
      setIsUploadingLogo(false);
    },
  });

  // Handle store settings update
  const handleStoreUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    saveWebsiteConfig("store", {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      currency: formData.get("currency") as string,
      free_delivery_threshold: Number(formData.get("free_delivery_threshold")),
      logo: logoPreview || store?.logo || "",
      announcement: formData.get("announcement") as string,
    });
  };

  // Handle WhatsApp settings update
  const handleWhatsAppUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    saveWebsiteConfig("whatsapp", {
      phone: formData.get("phone") as string,
      message: formData.get("message") as string,
    });
  };

  // Handle email settings update
  const handleEmailUpdate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate email settings if enabled
    if (emailEnabled) {
      if (!emailFromEmail || !emailApiKey) {
        toast.error("Please fill in all required fields when email is enabled");
        return;
      }
    }

    saveWebsiteConfig("smtp", {
      enabled: emailEnabled,
      from_email: emailFromEmail,
      resend_api_key: emailApiKey,
    });
  };

  // Handle logo upload with cleanup
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      e.target.value = ""; // Reset input
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    setIsUploadingLogo(true);

    // Upload the image to the server
    uploadImageMutation.mutate(file);
  };

  // Remove logo preview
  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Check if email form is valid
  const isEmailFormValid = () => {
    if (!emailEnabled) return true;
    return emailFromEmail.trim() !== "" && emailApiKey.trim() !== "";
  };

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
            <span className="hidden md:inline">Store</span>
          </TabsTrigger>
          <TabsTrigger value="whatsapp">
            <MessageCircle className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">WhatsApp</span>
          </TabsTrigger>
          <TabsTrigger value="smtp">
            <MailQuestionMarkIcon className="mr-2 h-4 w-4" />
            <span className="hidden md:inline">SMTP</span>
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
                    <div className="relative h-24 w-24 rounded border border-border bg-muted flex items-center justify-center overflow-hidden">
                      {isUploadingLogo ? (
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      ) : logoPreview || store?.logo ? (
                        <>
                          <img
                            src={API_URL + (logoPreview || store?.logo)}
                            alt="Store logo"
                            className="h-full w-full object-cover"
                          />
                          {logoPreview && (
                            <button
                              type="button"
                              onClick={handleRemoveLogo}
                              className="absolute top-1 right-1 p-1 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            >
                              <X className="h-3 w-3 text-white" />
                            </button>
                          )}
                        </>
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={isUploadingLogo}
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
                    defaultValue={store?.name || ""}
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
                    defaultValue={store?.description || ""}
                    placeholder="Tell customers about your store..."
                    maxLength={255}
                    rows={4}
                  />
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    name="currency"
                    defaultValue={store?.currency || "KES"}
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
                    defaultValue={store?.free_delivery_threshold || 10000}
                    min="0"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Orders above this amount get free delivery
                  </p>
                </div>

                {/* Store Announcement */}
                <div className="space-y-2">
                  <Label htmlFor="announcement">Store Announcement</Label>
                  <Textarea
                    id="announcement"
                    name="announcement"
                    rows={2}
                    maxLength={155}
                    defaultValue={store?.announcement || ""}
                    placeholder={store?.announcement || "Welcome to ÉLÉGANCE!"}
                    required
                  />
                </div>

                <Button type="submit" disabled={$saveWebsiteConfig.isPending}>
                  {$saveWebsiteConfig.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
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
                    defaultValue={whatsapp?.phone || ""}
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
                    defaultValue={whatsapp?.message || ""}
                    placeholder="Hello! I am interested in your products."
                    rows={3}
                    required
                  />
                </div>

                <Button type="submit" disabled={$saveWebsiteConfig.isPending}>
                  {$saveWebsiteConfig.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>SMTP Configuration</CardTitle>
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
                    checked={emailEnabled}
                    onChange={(e) => setEmailEnabled(e.target.checked)}
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
                    value={emailFromEmail}
                    onChange={(e) => setEmailFromEmail(e.target.value)}
                    placeholder="noreply@yourstore.com"
                    required={emailEnabled}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="resend_api_key">Resend API Key</Label>
                  <Input
                    id="resend_api_key"
                    name="resend_api_key"
                    type="password"
                    value={emailApiKey}
                    onChange={(e) => setEmailApiKey(e.target.value)}
                    placeholder="re_..."
                    required={emailEnabled}
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
                  disabled={!isEmailFormValid() || $saveWebsiteConfig.isPending}
                >
                  {$saveWebsiteConfig.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
