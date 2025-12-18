import {
  HeartIcon,
  ShieldIcon,
  ShoppingBagIcon,
  StarIcon,
  TruckIcon,
  ZapIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { useGeneralContext } from "@/contexts/GeneralContext";

// Icon mapping for features
const iconMap: Record<string, React.ReactNode> = {
  ShoppingBag: <ShoppingBagIcon />,
  Truck: <TruckIcon />,
  Shield: <ShieldIcon />,
  Heart: <HeartIcon />,
  Zap: <ZapIcon />,
  Star: <StarIcon />,
};

export function FeaturesSections() {
  const { isAdmin } = useAuth();
  const { websiteConfig } = useGeneralContext();
  const features = websiteConfig?.features;

  return (
    <>
      {features.items.length > 0 && (
        <section className="bg-secondary/50 py-20">
          <div className="container mx-auto">
            <div className="mb-12 text-center">
              <p className="text-sm font-medium tracking-luxury uppercase text-accent">
                {features.title}
              </p>
              <h2 className="mt-2 font-serif text-3xl font-light text-foreground md:text-4xl">
                {features.subtitle}
              </h2>
              <div className="mx-auto mt-4 h-px w-16 bg-accent" />
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {features.items.map((item, index) => (
                <Card
                  key={index}
                  className="p-8 bg-inherit shadow-none border-none flex flex-col justify-center items-center"
                >
                  <div className="text-6xl mb-4">
                    {iconMap[item.icon] || "📦"}
                  </div>
                  <h3 className="text-xl font-medium capitalize mb-3">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-center">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
