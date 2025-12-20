import { TextSectionData } from "@/lib/page-types";

export function TextSectionRenderer({ data }: { data: TextSectionData }) {
  const maxWidthMap = {
    small: "max-w-2xl",
    medium: "max-w-4xl",
    large: "max-w-6xl",
    full: "max-w-full",
  };

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        <div
          className={`mx-auto ${maxWidthMap[data.max_width]} text-${data.alignment}`}
        >
          <div
            className="prose prose-lg max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
      </div>
    </section>
  );
}
