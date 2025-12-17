import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, API_URL, HeroType } from "@/lib/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { X, Loader2, ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  data: HeroType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function HeroSection({ data, onChange }: HeroSectionProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadImageMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.uploadImage(formData);
      return response.data.url;
    },
    onSuccess: (url) => {
      const fullUrl = url.startsWith("http") ? url : `${API_URL}${url}`;
      onChange({ background_image: fullUrl });
      toast.success("Background image uploaded successfully");
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onError: (error: any) => {
      toast.error(error?.message || "Failed to upload image");
    },
    onSettled: () => {
      setUploadingImage(false);
    },
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      e.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      e.target.value = "";
      return;
    }

    setUploadingImage(true);
    uploadImageMutation.mutate(file);
  };

  const handleRemoveImage = () => {
    onChange({ background_image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>
          Configure your homepage hero section with title, subtitle, and
          call-to-action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="hero-title">Hero Title</Label>
          <Input
            id="hero-title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Welcome to Our Store"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero-subtitle"
            value={data.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Discover amazing products at great prices"
            rows={3}
          />
        </div>

        {/* CTA Button */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="cta-text">Button Text</Label>
            <Input
              id="cta-text"
              value={data.cta_text}
              onChange={(e) => onChange({ cta_text: e.target.value })}
              placeholder="Shop Now"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-link">Button Link</Label>
            <Input
              id="cta-link"
              value={data.cta_link}
              onChange={(e) => onChange({ cta_link: e.target.value })}
              placeholder="/products"
            />
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-3">
          <Label>Background Image</Label>
          {data.background_image ? (
            <div className="relative aspect-video w-full h-[350px] overflow-hidden rounded-lg border border-border bg-secondary">
              {uploadingImage ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <img
                    src={data.background_image}
                    alt="Hero background"
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-2 text-destructive-foreground shadow-sm transition-opacity hover:opacity-80"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="relative aspect-video w-full">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="hero-bg-upload"
              />
              <label
                htmlFor="hero-bg-upload"
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
              >
                {uploadingImage ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <span className="mt-2 text-sm font-medium text-foreground">
                      Upload Background Image
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      Recommended: 1920x1080px, Max 5MB
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Overlay Settings */}
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="overlay-toggle">Dark Overlay</Label>
              <p className="text-xs text-muted-foreground">
                Add a dark overlay to improve text readability
              </p>
            </div>
            <Switch
              id="overlay-toggle"
              checked={data.overlay}
              onCheckedChange={(checked) => onChange({ overlay: checked })}
            />
          </div>

          {data.overlay && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Overlay Opacity</Label>
                <span className="text-sm text-muted-foreground">
                  {Math.round(data.overlay_opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[data.overlay_opacity * 100]}
                onValueChange={(value) =>
                  onChange({ overlay_opacity: value[0] / 100 })
                }
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div
            className="relative overflow-hidden rounded-lg border border-border"
            style={{ minHeight: "300px" }}
          >
            {data.background_image && (
              <img
                src={data.background_image}
                alt="Hero preview"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
            {data.overlay && data.background_image && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: data.overlay_opacity }}
              />
            )}
            <div className="relative flex h-full min-h-[300px] flex-col items-center justify-center p-8 text-center">
              <h1 className="mb-4 text-3xl font-bold text-white drop-shadow-lg md:text-4xl">
                {data.title || "Hero Title"}
              </h1>
              <p className="mb-6 max-w-2xl text-lg text-white/90 drop-shadow-md">
                {data.subtitle || "Hero subtitle goes here"}
              </p>
              <Button size="lg" className="shadow-lg">
                {data.cta_text || "Call to Action"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
