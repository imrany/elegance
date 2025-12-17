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
  Facebook,
  Instagram,
  Linkedin,
  Twitter,
  Youtube,
  Globe,
  Link2,
} from "lucide-react";
import { SocialType } from "@/lib/api";

interface SocialMediaLinksProps {
  data: SocialType;
  onChange: (data: Partial<SocialMediaLinksProps["data"]>) => void;
}

// Icon mapping for cleaner logic
const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-4 h-4" />,
  twitter: <Twitter className="w-4 h-4" />,
  instagram: <Instagram className="w-4 h-4" />,
  linkedin: <Linkedin className="w-4 h-4" />,
  youtube: <Youtube className="w-4 h-4" />,
  tiktok: <Link2 className="w-4 h-4" />,
};

export function SocialMediaLinks({ data, onChange }: SocialMediaLinksProps) {
  const platforms: Array<keyof SocialMediaLinksProps["data"]> = [
    "facebook",
    "twitter",
    "instagram",
    "linkedin",
    "youtube",
    "tiktok",
  ];

  // Helper to extract username from a full URL for display
  const getUsername = (url: string, platform: string) => {
    if (!url) return "";
    return url.replace(`https://${platform}.com/`, "");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Social Media Links</CardTitle>
        <CardDescription>
          Enter your usernames for each platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {platforms.map((name) => (
          <div key={name} className="space-y-2">
            <Label
              htmlFor={`social-${name}`}
              className="capitalize flex items-center gap-2"
            >
              {PLATFORM_ICONS[name] || <Globe className="w-4 h-4" />}
              {name}
            </Label>
            <div className="flex items-center">
              {/* Visual prefix so user knows it's a URL */}
              {/*<span className="bg-muted px-3 py-2 border border-r-0 rounded-l-md text-xs text-muted-foreground whitespace-nowrap">
                {name}.com/
              </span>*/}
              <Input
                id={`social-${name}`}
                className="rounded-l-none"
                // DISPLAY: Show only the username part
                value={getUsername(data[name] ?? "", name)}
                // SEND: Send the full URL to the parent
                onChange={(e) => {
                  const username = e.target.value;
                  const fullUrl = username
                    ? `https://${name}.com/${username}`
                    : "";
                  onChange({ [name]: fullUrl });
                }}
                placeholder={`Your ${name} username`}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
