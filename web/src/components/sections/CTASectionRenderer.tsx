import { CTASectionData } from "@/lib/page-types";

export function CTASectionRenderer({ data }: { data: CTASectionData }) {
  const getBackgroundStyle = () => {
    if (data.background_type === "image" && data.background_image) {
      return { backgroundImage: `url(${data.background_image})` };
    }
    if (data.background_type === "gradient") {
      return {
        background: `linear-gradient(135deg, ${data.background_color || "#667eea"} 0%, ${data.background_color ? data.background_color + "80" : "#764ba2"} 100%)`,
      };
    }
    return { backgroundColor: data.background_color };
  };

  return (
    <section className="py-16 md:py-24" style={getBackgroundStyle()}>
      <div className="container">
        <div className={`text-${data.text_alignment}`}>
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            {data.title}
          </h2>
          <p className="mt-4 text-lg text-white/90">{data.description}</p>
          <a
            href={data.button_link}
            className={`mt-8 inline-block rounded-lg px-8 py-3 font-medium transition-colors ${
              data.button_style === "primary"
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : data.button_style === "secondary"
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  : "border-2 border-white text-white hover:bg-white hover:text-foreground"
            }`}
          >
            {data.button_text}
          </a>
        </div>
      </div>
    </section>
  );
}
