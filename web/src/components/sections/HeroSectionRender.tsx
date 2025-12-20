import { HeroSectionData } from "@/lib/page-types";
import { ChevronDown } from "lucide-react";

export function HeroSectionRenderer({ data }: { data: HeroSectionData }) {
  const heightMap = {
    small: "300px",
    medium: "400px",
    large: "600px",
    full: "100vh",
  };

  return (
    <section
      className="relative flex items-center justify-center overflow-hidden"
      style={{ minHeight: heightMap[data.height] }}
    >
      {/* Background */}
      {data.background_type === "image" && data.background_image && (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${data.background_image})` }}
        />
      )}

      {data.background_type === "video" && data.background_video && (
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={data.background_video} type="video/mp4" />
        </video>
      )}

      {/* Overlay */}
      {data.overlay && (
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: data.overlay_color,
            opacity: data.overlay_opacity,
          }}
        />
      )}

      {/* Content */}
      <div className={`container relative z-10 text-${data.text_alignment}`}>
        <h1 className="text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          {data.title}
        </h1>
        <p className="mt-4 text-lg text-white/90 md:text-xl">{data.subtitle}</p>
        {data.cta_text && (
          <a
            href={data.cta_link}
            className="mt-8 inline-block rounded-lg bg-primary px-8 py-3 text-lg font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {data.cta_text}
          </a>
        )}
      </div>

      {/* Scroll Indicator */}
      {data.show_scroll_indicator && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-white" />
        </div>
      )}
    </section>
  );
}
