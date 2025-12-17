import { useState, useRef } from "react";
import { AboutType, api, API_URL } from "@/lib/api";
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, ImageIcon, Plus } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";

interface AboutSectionProps {
  data: AboutType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function AboutSection({ data, onChange }: AboutSectionProps) {
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newFeature, setNewFeature] = useState("");
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
      onChange({ image: fullUrl });
      toast.success("Image uploaded successfully");
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
    onChange({ image: "" });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    onChange({ features: [...data.features, newFeature.trim()] });
    setNewFeature("");
  };

  const handleRemoveFeature = (index: number) => {
    onChange({ features: data.features.filter((_, i) => i !== index) });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>About Section</CardTitle>
        <CardDescription>
          Tell your customers about your business and what makes you special
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="about-title">Section Title</Label>
          <Input
            id="about-title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="About Us"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="about-description">Description</Label>
          <Textarea
            id="about-description"
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder="Tell your story..."
            rows={6}
          />
          <p className="text-xs text-muted-foreground">
            {data.description?.length} characters
          </p>
        </div>

        {/* Image */}
        <div className="space-y-3">
          <Label>About Image</Label>
          {data.image ? (
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-lg border border-border bg-secondary">
              {uploadingImage ? (
                <div className="flex h-full w-full items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <>
                  <img
                    src={data.image}
                    alt="About"
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
            <div className="relative aspect-video w-full max-w-md">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                className="hidden"
                id="about-image-upload"
              />
              <label
                htmlFor="about-image-upload"
                className="flex h-full w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/50 transition-colors hover:bg-secondary"
              >
                {uploadingImage ? (
                  <Loader2 className="h-12 w-12 animate-spin text-primary" />
                ) : (
                  <>
                    <ImageIcon className="h-12 w-12 text-muted-foreground" />
                    <span className="mt-2 text-sm font-medium text-foreground">
                      Upload Image
                    </span>
                    <span className="mt-1 text-xs text-muted-foreground">
                      Max 5MB
                    </span>
                  </>
                )}
              </label>
            </div>
          )}
        </div>

        {/* Features/Highlights */}
        <div className="space-y-3">
          <Label>Key Features/Highlights</Label>
          <div className="flex flex-wrap gap-2">
            {data &&
              data.features &&
              data.features.map((feature, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="gap-2 py-1.5 pr-1"
                >
                  {feature}
                  <button
                    type="button"
                    onClick={() => handleRemoveFeature(index)}
                    className="rounded-full p-1 hover:bg-destructive/10"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddFeature();
                }
              }}
              placeholder="Add a feature (e.g., Free Shipping)"
            />
            <Button
              type="button"
              onClick={handleAddFeature}
              size="icon"
              variant="outline"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Press Enter or click + to add a feature
          </p>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="rounded-lg border border-border p-6">
            <div className="grid gap-6 md:grid-cols-2 md:items-center">
              <div>
                <h2 className="mb-4 text-2xl font-bold">
                  {data.title || "About Us"}
                </h2>
                <p className="mb-4 text-muted-foreground">
                  {data.description || "Your description will appear here..."}
                </p>
                {data && data.features?.length > 0 && (
                  <ul className="space-y-2">
                    {data.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-lg bg-secondary/50 p-4">
                {data.image ? (
                  <img
                    src={data.image}
                    alt="About"
                    className="h-full w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex aspect-square items-center justify-center text-muted-foreground">
                    <ImageIcon className="h-16 w-16" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
