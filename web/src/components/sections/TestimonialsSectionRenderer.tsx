import { TestimonialsSectionData } from "@/lib/page-types";
import { Star } from "lucide-react";

export function TestimonialsSectionRenderer({
  data,
}: {
  data: TestimonialsSectionData;
}) {
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

        {/* Testimonials */}
        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {data.items.map((testimonial) => (
            <div
              key={testimonial.id}
              className="rounded-lg border border-border bg-card p-6"
            >
              {/* Rating */}
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mt-4 text-muted-foreground">{testimonial.text}</p>

              {/* Author */}
              <div className="mt-6 flex items-center gap-3">
                {testimonial.avatar && (
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
