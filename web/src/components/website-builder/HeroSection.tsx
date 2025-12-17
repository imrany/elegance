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
import { X, Loader2, ImageIcon, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useGeneralContext } from "@/contexts/GeneralContext";

interface HeroSectionProps {
  data: HeroType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function HeroSection({ data, onChange }: HeroSectionProps) {
  const currentYear = new Date().getFullYear();
  const { categories, websiteConfig } = useGeneralContext();
  const storeDetails = websiteConfig.store;
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
      const filename = data.background_image.split("/").pop();
      if (filename) {
        api.deleteImage(filename).catch((error) => {
          console.error("Error deleting image:", error);
        });
      }
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader>
        <CardTitle>Hero Section</CardTitle>
        <CardDescription>
          Configure your homepage hero section with title, subtitle, and
          call-to-action
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-4 sm:p-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="hero-title">Hero Title</Label>
          <Input
            id="hero-title"
            value={data.title ?? ""}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Welcome to Our Store"
          />
        </div>

        {/* Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
          <Textarea
            id="hero-subtitle"
            value={data.subtitle ?? ""}
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
              value={data.cta_text ?? ""}
              onChange={(e) => onChange({ cta_text: e.target.value })}
              placeholder="Shop Now"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cta-link">Button Link</Label>
            <Input
              id="cta-link"
              value={data.cta_link ?? ""}
              onChange={(e) => onChange({ cta_link: e.target.value })}
              placeholder="/products"
            />
          </div>
        </div>

        {/* Background Image */}
        <div className="space-y-3">
          <Label>Background Image</Label>
          <div className="relative w-full overflow-hidden rounded-lg border border-border bg-secondary">
            {/*
                       Replaced fixed h-[350px] with aspect-video (16:9).
                       On very small screens, this maintains proportion without overflow.
                    */}
            <div className="relative aspect-video w-full min-h-[200px] max-h-[400px]">
              {data.background_image && !uploadingImage ? (
                <>
                  <img
                    src={data.background_image}
                    alt="Hero background"
                    className="h-full w-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={handleRemoveImage}
                    className="absolute right-2 top-2 h-8 w-8 rounded-full shadow-md"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-4">
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
                    className="flex h-full w-full cursor-pointer flex-col items-center justify-center text-center"
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    ) : (
                      <>
                        <ImageIcon className="mb-2 h-10 w-10 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          Upload Image
                        </span>
                        <span className="hidden text-xs text-muted-foreground sm:block">
                          1920x1080px recommended
                        </span>
                      </>
                    )}
                  </label>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Overlay Settings */}
        <div className="space-y-4 rounded-lg border border-border p-3 sm:p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <Label htmlFor="overlay-toggle" className="text-sm font-semibold">
                Dark Overlay
              </Label>
              <p className="text-xs text-muted-foreground">
                Improves text readability on bright images
              </p>
            </div>
            <Switch
              id="overlay-toggle"
              checked={data.overlay}
              onCheckedChange={(checked) => onChange({ overlay: checked })}
            />
          </div>

          {data.overlay && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Opacity</Label>
                <span className="text-xs font-mono font-medium">
                  {Math.round(data.overlay_opacity * 100)}%
                </span>
              </div>
              <Slider
                value={[data.overlay_opacity * 100]}
                max={100}
                step={1}
                onValueChange={(val) =>
                  onChange({ overlay_opacity: val[0] / 100 })
                }
                className="py-2"
              />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="relative overflow-hidden rounded-lg border border-border min-h-[400px]">
            {/* Background Image */}
            {data.background_image && (
              <img
                src={data.background_image}
                alt="Hero background"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}

            {/* Overlay */}
            {data.overlay && data.background_image && (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: data.overlay_opacity }}
              />
            )}

            {/* Content */}
            <div className="relative flex items-center justify-start min-h-[400px] p-8">
              <div className="max-w-3xl w-full space-y-6">
                {/* Badge */}
                <p className="text-sm font-medium tracking-luxury uppercase text-accent">
                  New Collection {currentYear}
                </p>

                {/* Title */}
                <h1 className="font-serif text-5xl font-light leading-tight text-primary-foreground md:text-6xl lg:text-7xl">
                  {data.title || storeDetails?.name || "Welcome to Our Store"}
                  <br />
                  <span className="font-semibold italic">
                    {data.subtitle
                      ? `${data.subtitle.slice(0, 9)}...`
                      : "Redefined"}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-lg leading-relaxed text-primary-foreground/80">
                  {storeDetails?.description || "+ [Add Store Description]"}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="group gap-2 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Link
                      to={data.cta_link || `/category/${categories[0].slug}`}
                      className="capitalize"
                    >
                      {data.cta_text || `Shop ${categories[0].name}`}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  {categories && categories.length > 1 && (
                    <Button
                      asChild
                      size="lg"
                      variant="outline"
                      className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                    >
                      <Link
                        to={`/category/${categories[1].slug}`}
                        className="capitalize"
                      >
                        Shop {categories[1].name}
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            This is a preview of how your hero section will appear on the
            homepage
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
