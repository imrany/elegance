import { AboutSectionData } from "@/lib/page-types";
import { Check } from "lucide-react";

export function AboutSectionRenderer({ data }: { data: AboutSectionData }) {
  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        <div
          className={`grid items-center gap-12 md:grid-cols-2 ${
            data.image_position === "right" ? "" : "md:grid-flow-dense"
          }`}
        >
          {/* Image */}
          <div
            className={data.image_position === "right" ? "md:col-start-2" : ""}
          >
            {data.image && (
              <img
                src={data.image}
                alt={data.title}
                className="w-full rounded-lg object-cover shadow-lg"
              />
            )}
          </div>

          {/* Content */}
          <div>
            {data.subtitle && (
              <p className="text-sm font-semibold uppercase tracking-wide text-accent">
                {data.subtitle}
              </p>
            )}
            <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
              {data.title}
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              {data.description}
            </p>

            {data.features && data.features.length > 0 && (
              <ul className="mt-8 space-y-3">
                {data.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-accent" />
                    <span className="text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            )}

            {data.button_text && (
              <a
                href={data.button_link}
                className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {data.button_text}
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
