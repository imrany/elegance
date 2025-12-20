import { VideoSectionData } from "@/lib/page-types";

export function VideoSectionRenderer({ data }: { data: VideoSectionData }) {
  const getEmbedUrl = () => {
    if (data.video_type === "youtube") {
      const videoId =
        data.video_url.split("v=")[1] || data.video_url.split("/").pop();
      return `https://www.youtube.com/embed/${videoId}`;
    }
    if (data.video_type === "vimeo") {
      const videoId = data.video_url.split("/").pop();
      return `https://player.vimeo.com/video/${videoId}`;
    }
    return data.video_url;
  };

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        {data.title && (
          <h2 className="mb-8 text-center text-3xl font-bold text-foreground md:text-4xl">
            {data.title}
          </h2>
        )}
        <div className="mx-auto max-w-4xl">
          {data.video_type === "file" ? (
            <video
              src={data.video_url}
              controls={data.controls}
              autoPlay={data.autoplay}
              loop={data.loop}
              className="w-full rounded-lg"
            />
          ) : (
            <div className="relative aspect-video">
              <iframe
                src={getEmbedUrl()}
                className="h-full w-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
