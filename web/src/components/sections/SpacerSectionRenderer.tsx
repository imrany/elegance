import { SpacerSectionData } from "@/lib/page-types";

export function SpacerSectionRenderer({ data }: { data: SpacerSectionData }) {
  const heightMap = {
    small: "h-8 md:h-12",
    medium: "h-16 md:h-24",
    large: "h-32 md:h-48",
  };

  return <div className={heightMap[data.height]} />;
}
