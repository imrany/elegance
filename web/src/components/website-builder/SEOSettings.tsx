import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, API_URL, SeoType } from "@/lib/api";
import { toast } from "sonner";
import { Textarea } from "../ui/textarea";
import { ImageIcon, Loader2, X } from "lucide-react";

// SEO Settings Component
interface SEOSettingsProps {
  data: SeoType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function SEOSettings({ data, onChange }: SEOSettingsProps) {
  const [uploadingOgImage, setUploadingOgImage] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const ogImageRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useMutation({
    mutationFn: async ({
      file,
      type,
    }: {
      file: File;
      type: "og_image" | "favicon";
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.uploadImage(formData);
      return { url: response.data.url, type };
    },
    onSuccess: ({ url, type }) => {
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
      onChange({ [type]: fullUrl });
      toast.success(
        `${type === "og_image" ? "OG Image" : "Favicon"} uploaded successfully`,
      );
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload image");
    },
    onSettled: () => {
      setUploadingOgImage(false);
      setUploadingFavicon(false);
    },
  });

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "og_image" | "favicon",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    if (type === "og_image") {
      setUploadingOgImage(true);
    } else {
      setUploadingFavicon(true);
    }

    uploadImageMutation.mutate({ file, type });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO Settings</CardTitle>
        <CardDescription>
          Optimize your website for search engines and social media
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="seo-title">Page Title</Label>
          <Input
            id="seo-title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="My Store - Quality Products"
            maxLength={60}
          />
          <p className="text-xs text-muted-foreground">
            {data.title?.length}/60 characters (recommended)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-description">Meta Description</Label>
          <Textarea
            id="seo-description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Shop the best products at amazing prices..."
            rows={3}
            maxLength={160}
          />
          <p className="text-xs text-muted-foreground">
            {data.description?.length}/160 characters (recommended)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="seo-keywords">Keywords</Label>
          <Input
            id="seo-keywords"
            value={data.keywords}
            onChange={(e) => onChange({ keywords: e.target.value })}
            placeholder="store, shop, products, ecommerce"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated keywords for SEO
          </p>
        </div>

        <div className="space-y-3">
          <Label>Open Graph Image (Social Media Preview)</Label>
          {data.og_image ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border">
              {uploadingOgImage ? (
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <img
                    src={data.og_image}
                    alt="OG"
                    className="h-full w-full object-cover"
                  />
                  <button
                    onClick={() => {
                      onChange({ og_image: "" });
                      if (ogImageRef.current) ogImageRef.current.value = "";
                    }}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-2"
                  >
                    <X className="h-4 w-4 text-white" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="relative aspect-video w-full max-w-md">
              <input
                ref={ogImageRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "og_image")}
                className="hidden"
                id="og-image-upload"
              />
              <label
                htmlFor="og-image-upload"
                className="flex h-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed hover:bg-secondary/50"
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                <span className="mt-2 text-sm">Upload OG Image</span>
                <span className="text-xs text-muted-foreground">
                  1200x630px recommended
                </span>
              </label>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <Label>Favicon</Label>
          {data.favicon ? (
            <div className="relative h-16 w-16 overflow-hidden rounded border">
              <img
                src={data.favicon}
                alt="Favicon"
                className="h-full w-full object-cover"
              />
              <button
                onClick={() => {
                  onChange({ favicon: "" });
                  if (faviconRef.current) faviconRef.current.value = "";
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="relative h-16 w-16">
              <input
                ref={faviconRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, "favicon")}
                className="hidden"
                id="favicon-upload"
              />
              <label
                htmlFor="favicon-upload"
                className="flex h-full cursor-pointer items-center justify-center rounded border-2 border-dashed hover:bg-secondary/50"
              >
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              </label>
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            32x32px or 64x64px recommended
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
