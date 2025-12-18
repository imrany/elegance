import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Pencil,
  Trash2,
  ShoppingBag,
  Truck,
  Shield,
  Heart,
  Zap,
  Star,
} from "lucide-react";
import { FeaturesType } from "@/lib/api";

const AVAILABLE_ICONS = [
  { name: "ShoppingBag", label: "Shopping Bag", icon: ShoppingBag },
  { name: "Truck", label: "Truck/Delivery", icon: Truck },
  { name: "Shield", label: "Shield/Security", icon: Shield },
  { name: "Heart", label: "Heart", icon: Heart },
  { name: "Zap", label: "Zap/Fast", icon: Zap },
  { name: "Star", label: "Star/Quality", icon: Star },
];

interface FeaturesSectionProps {
  data: FeaturesType;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function FeaturesSection({ data, onChange }: FeaturesSectionProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [currentFeature, setCurrentFeature] = useState({
    icon: "ShoppingBag",
    title: "",
    description: "",
  });

  const handleAddFeature = () => {
    setEditingIndex(null);
    setCurrentFeature({
      icon: "ShoppingBag",
      title: "",
      description: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditFeature = (index: number) => {
    setEditingIndex(index);
    setCurrentFeature(data.items[index]);
    setIsDialogOpen(true);
  };

  const handleSaveFeature = () => {
    if (!currentFeature.title.trim() || !currentFeature.description.trim()) {
      return;
    }

    const newItems = [...data.items];
    if (editingIndex !== null) {
      newItems[editingIndex] = currentFeature;
    } else {
      newItems.push(currentFeature);
    }

    onChange({ items: newItems });
    setIsDialogOpen(false);
    setCurrentFeature({
      icon: "ShoppingBag",
      title: "",
      description: "",
    });
  };

  const handleDeleteFeature = (index: number) => {
    if (confirm("Are you sure you want to delete this feature?")) {
      onChange({ items: data.items.filter((_, i) => i !== index) });
    }
  };

  const getIconComponent = (iconName: string) => {
    const icon = AVAILABLE_ICONS.find((i) => i.name === iconName);
    return icon?.icon || ShoppingBag;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Features Section</CardTitle>
        <CardDescription>
          Highlight the key features and benefits of your store
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Section Title */}
        <div className="space-y-2">
          <Label htmlFor="features-title">Section Title</Label>
          <Input
            id="features-title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Why Choose Us"
          />
        </div>

        {/* Section Subtitle */}
        <div className="space-y-2">
          <Label htmlFor="features-subtitle">Section Subtitle</Label>
          <Input
            id="features-subtitle"
            value={data.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="Discover what makes us special"
          />
        </div>

        {/* Feature Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Feature Items</Label>
            <Button onClick={handleAddFeature} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data &&
              data.items &&
              data.items.map((item, index) => {
                const IconComponent = getIconComponent(item.icon);
                return (
                  <Card key={index} className="relative">
                    <CardHeader className="pb-3">
                      <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <IconComponent className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        {item.description}
                      </p>
                      <div className="mt-3 flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditFeature(index)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteFeature(index)}
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>

          {data && data.items?.length === 0 && (
            <div className="rounded-lg border border-dashed border-border p-8 text-center">
              <p className="text-sm text-muted-foreground">
                No features added yet. Click "Add Feature" to get started.
              </p>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label>Preview</Label>
          <div className="rounded-lg border border-border p-6">
            <section className="bg-secondary/50">
              <div className="container mx-auto">
                <div className="mb-12 text-center">
                  <p className="text-sm font-medium tracking-luxury uppercase text-accent">
                    {data.title || "Why Choose Us"}
                  </p>
                  <h2 className="mt-2 font-serif text-3xl font-light text-foreground md:text-4xl">
                    {data.subtitle || "Discover what makes us special"}
                  </h2>
                  <div className="mx-auto mt-4 h-px w-16 bg-accent" />
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                  {data &&
                    data.items &&
                    data.items.map((item, index) => {
                      const IconComponent = getIconComponent(item.icon);
                      return (
                        <Card
                          key={index}
                          className="p-8 bg-inherit shadow-none border-none flex flex-col justify-center items-center"
                        >
                          <div className="text-6xl mb-4">
                            <IconComponent className="h-8 w-8 text-primary" />
                          </div>
                          <h3 className="text-xl font-medium capitalize mb-3">
                            {item.title}
                          </h3>
                          <p className="text-muted-foreground text-center">
                            {item.description}
                          </p>
                        </Card>
                      );
                    })}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Feature Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingIndex !== null ? "Edit Feature" : "Add Feature"}
              </DialogTitle>
              <DialogDescription>
                Configure the feature details and icon
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feature-icon">Icon</Label>
                <Select
                  value={currentFeature.icon}
                  onValueChange={(value) =>
                    setCurrentFeature({ ...currentFeature, icon: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_ICONS.map((icon) => {
                      const Icon = icon.icon;
                      return (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-title">Title</Label>
                <Input
                  id="feature-title"
                  value={currentFeature.title}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g., Fast Delivery"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="feature-description">Description</Label>
                <Textarea
                  id="feature-description"
                  value={currentFeature.description}
                  onChange={(e) =>
                    setCurrentFeature({
                      ...currentFeature,
                      description: e.target.value,
                    })
                  }
                  placeholder="Describe this feature..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveFeature}>
                {editingIndex !== null ? "Update" : "Add"} Feature
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
