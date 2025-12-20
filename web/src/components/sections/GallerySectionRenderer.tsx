import { GallerySectionData } from "@/lib/page-types";

export function GallerySectionRenderer({ data }: { data: GallerySectionData }) {
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

        {/* Gallery */}
        <div
          className={`mt-12 grid gap-4 md:grid-cols-${data.columns}`}
          style={{
            gridTemplateColumns: `repeat(${data.columns}, minmax(0, 1fr))`,
          }}
        >
          {data.images.map((image) => (
            <div
              key={image.id}
              className="group relative overflow-hidden rounded-lg"
            >
              {image.link ? (
                <a href={image.link}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </a>
              ) : (
                <img
                  src={image.url}
                  alt={image.alt}
                  className="h-full w-full object-cover"
                />
              )}
              {image.caption && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <p className="text-sm text-white">{image.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
