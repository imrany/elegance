import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Theme Customizer Component
interface ThemeCustomizerProps {
  data: {
    primary_color: string;
    secondary_color: string;
    accent_color: string;
    font_family: string;
    border_radius: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function ThemeCustomizer({ data, onChange }: ThemeCustomizerProps) {
  const fontOptions = [
    { value: "Inter", label: "Inter (Default)" },
    { value: "Roboto", label: "Roboto" },
    { value: "Open Sans", label: "Open Sans" },
    { value: "Lato", label: "Lato" },
    { value: "Montserrat", label: "Montserrat" },
    { value: "Poppins", label: "Poppins" },
  ];

  const radiusOptions = [
    { value: "0", label: "None (Sharp)" },
    { value: "0.25rem", label: "Small" },
    { value: "0.5rem", label: "Medium (Default)" },
    { value: "0.75rem", label: "Large" },
    { value: "1rem", label: "Extra Large" },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Theme Customization</CardTitle>
        <CardDescription>
          Customize colors, fonts, and visual style of your website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="primary-color">Primary Color</Label>
            <div className="flex gap-2">
              <Input
                id="primary-color"
                type="color"
                value={data.primary_color}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                value={data.primary_color}
                onChange={(e) => onChange({ primary_color: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary-color">Secondary Color</Label>
            <div className="flex gap-2">
              <Input
                id="secondary-color"
                type="color"
                value={data.secondary_color}
                onChange={(e) => onChange({ secondary_color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                value={data.secondary_color}
                onChange={(e) => onChange({ secondary_color: e.target.value })}
                placeholder="#666666"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accent-color">Accent Color</Label>
            <div className="flex gap-2">
              <Input
                id="accent-color"
                type="color"
                value={data.accent_color}
                onChange={(e) => onChange({ accent_color: e.target.value })}
                className="h-10 w-20"
              />
              <Input
                value={data.accent_color}
                onChange={(e) => onChange({ accent_color: e.target.value })}
                placeholder="#007bff"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="font-family">Font Family</Label>
            <Select
              value={data.font_family}
              onValueChange={(value) => onChange({ font_family: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="border-radius">Border Radius</Label>
            <Select
              value={data.border_radius}
              onValueChange={(value) => onChange({ border_radius: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {radiusOptions.map((radius) => (
                  <SelectItem key={radius.value} value={radius.value}>
                    {radius.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Color Preview */}
        <div className="space-y-2">
          <Label>Color Preview</Label>
          <div className="flex gap-4 rounded-lg border border-border p-4">
            <div className="flex-1 space-y-2">
              <div
                className="h-20 rounded"
                style={{ backgroundColor: data.primary_color }}
              />
              <p className="text-center text-xs text-muted-foreground">
                Primary
              </p>
            </div>
            <div className="flex-1 space-y-2">
              <div
                className="h-20 rounded"
                style={{ backgroundColor: data.secondary_color }}
              />
              <p className="text-center text-xs text-muted-foreground">
                Secondary
              </p>
            </div>
            <div className="flex-1 space-y-2">
              <div
                className="h-20 rounded"
                style={{ backgroundColor: data.accent_color }}
              />
              <p className="text-center text-xs text-muted-foreground">
                Accent
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
