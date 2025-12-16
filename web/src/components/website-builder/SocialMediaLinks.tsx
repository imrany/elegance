import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

// Social Media Links Component
interface SocialMediaLinksProps {
  data: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
    tiktok: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onChange: (data: any) => void;
}

export function SocialMediaLinks({ data, onChange }: SocialMediaLinksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Add links to your social media profiles
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.keys(data).map((platform) => (
          <div key={platform} className="space-y-2">
            <Label htmlFor={`social-${platform}`} className="capitalize">
              {platform}
            </Label>
            <Input
              id={`social-${platform}`}
              value={data[platform as keyof typeof data]}
              onChange={(e) => onChange({ [platform]: e.target.value })}
              placeholder={`https://${platform}.com/yourusername`}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
