import { FeaturesSectionData } from "@/lib/page-types";
import * as Icons from "lucide-react";

export function FeaturesSectionRenderer({
  data,
}: {
  data: FeaturesSectionData;
}) {
  const getIcon = (iconName: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Icon = (Icons as any)[iconName] || Icons.Circle;
    return <Icon className="h-6 w-6" />;
  };

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center">
          {data.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              {data.subtitle}
            </p>
          )}
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {data.title}
          </h2>
        </div>

        {/* Features Grid */}
        <div
          className={`mt-12 grid gap-8 md:grid-cols-${data.columns}`}
          style={{
            gridTemplateColumns: `repeat(${data.columns}, minmax(0, 1fr))`,
          }}
        >
          {data.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-border bg-card p-6 text-center transition-shadow hover:shadow-lg"
            >
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10 text-accent">
                {getIcon(item.icon)}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-muted-foreground">{item.description}</p>
              {item.link && (
                <a
                  href={item.link}
                  className="mt-4 inline-block text-sm font-medium text-accent hover:underline"
                >
                  Learn more →
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
