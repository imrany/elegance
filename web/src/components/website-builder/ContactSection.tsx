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

// Contact Section Component
interface ContactSectionProps {
  data: {
    title: string;
    subtitle: string;
    email: string;
    phone: string;
    address: string;
    show_map: boolean;
    map_url: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function ContactSection({ data, onChange }: ContactSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Section</CardTitle>
        <CardDescription>
          Configure your contact information and display settings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="contact-title">Section Title</Label>
          <Input
            id="contact-title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder="Get In Touch"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-subtitle">Subtitle</Label>
          <Input
            id="contact-subtitle"
            value={data.subtitle}
            onChange={(e) => onChange({ subtitle: e.target.value })}
            placeholder="We'd love to hear from you"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-email">Email</Label>
          <Input
            id="contact-email"
            type="email"
            value={data.email}
            onChange={(e) => onChange({ email: e.target.value })}
            placeholder="hello@example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-phone">Phone</Label>
          <Input
            id="contact-phone"
            type="tel"
            value={data.phone}
            onChange={(e) => onChange({ phone: e.target.value })}
            placeholder="+1 (555) 123-4567"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-address">Address</Label>
          <Textarea
            id="contact-address"
            value={data.address}
            onChange={(e) => onChange({ address: e.target.value })}
            placeholder="123 Main St, City, Country"
            rows={3}
          />
        </div>

        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-map">Show Google Map</Label>
              <p className="text-xs text-muted-foreground">
                Display an embedded Google Map
              </p>
            </div>
            <Switch
              id="show-map"
              checked={data.show_map}
              onCheckedChange={(checked) => onChange({ show_map: checked })}
            />
          </div>

          {data.show_map && (
            <div className="space-y-2">
              <Label htmlFor="map-url">Google Maps Embed URL</Label>
              <Input
                id="map-url"
                value={data.map_url}
                onChange={(e) => onChange({ map_url: e.target.value })}
                placeholder="https://www.google.com/maps/embed?..."
              />
              <p className="text-xs text-muted-foreground">
                Get the embed URL from Google Maps → Share → Embed a map
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
