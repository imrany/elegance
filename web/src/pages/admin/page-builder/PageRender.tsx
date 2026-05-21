import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/Layout";
import { Loader2 } from "lucide-react";
import { Page, PageSectionData } from "@/lib/page-types";
import { api } from "@/lib/api";
import { Helmet } from "react-helmet-async";

// Import section components
import { TestimonialsSectionRenderer } from "@/components/sections/TestimonialsSectionRenderer";
import { GallerySectionRenderer } from "@/components/sections/GallerySectionRenderer";
import { ContactSectionRenderer } from "@/components/sections/ContactSectionRenderer";
import { CTASectionRenderer } from "@/components/sections/CTASectionRenderer";
import { TextSectionRenderer } from "@/components/sections/TextSectionRenderer";
import { VideoSectionRenderer } from "@/components/sections/VideoSectionRenderer";
import { SpacerSectionRenderer } from "@/components/sections/SpacerSectionRenderer";
import { HeroSectionRenderer } from "@/components/sections/HeroSectionRender";
import { AboutSectionRenderer } from "@/components/sections/AboutSectionRender";
import { FeaturesSectionRenderer } from "@/components/sections/FeaturesSectionRender";
import { ProductsSectionRenderer } from "@/components/sections/ProductsSectionRender";
import NotFound from "@/pages/NotFound";

export default function PageRenderer() {
  const { slug } = useParams();
  const pageSlug = slug ? `${slug}` : "home";

  const {
    data: pageData,
    isLoading,
    error,
  } = useQuery<Page>({
    queryKey: ["public-page", pageSlug],
    queryFn: () => api.getPage(pageSlug),
    retry: 1,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  // Catch non-existent entries or fetch failures directly into styled boundary
  if (error || !pageData) {
    return <NotFound />;
  }

  // Handle standard unpublished guard page structure smoothly
  if (pageData.status !== "published") {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
          <h1 className="font-serif text-3xl font-light tracking-tight text-foreground sm:text-4xl">
            Coming Soon
          </h1>
          <p className="mt-3 text-base text-muted-foreground max-w-sm">
            This custom page is draft status and not yet publicly available.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <>
      <Helmet>
        <title>{pageData.meta_title || pageData.title}</title>
        <meta name="description" content={pageData.meta_description || ""} />
        <meta name="keywords" content={pageData.meta_keywords || ""} />
        {pageData.og_image && (
          <>
            <meta property="og:image" content={pageData.og_image} />
            <meta name="twitter:image" content={pageData.og_image} />
          </>
        )}
        <meta
          property="og:title"
          content={pageData.meta_title || pageData.title}
        />
        <meta
          property="og:description"
          content={pageData.meta_description || ""}
        />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      <Layout>
        <div className="w-full">
          {pageData.sections?.map((section) => (
            <SectionRenderer key={section.id} section={section} />
          ))}
        </div>
      </Layout>
    </>
  );
}

function SectionRenderer({ section }: { section: PageSectionData }) {
  switch (section.type) {
    case "hero":
      return <HeroSectionRenderer data={section} />;
    case "about":
      return <AboutSectionRenderer data={section} />;
    case "features":
      return <FeaturesSectionRenderer data={section} />;
    case "products":
      return <ProductsSectionRenderer data={section} />;
    case "testimonials":
      return <TestimonialsSectionRenderer data={section} />;
    case "gallery":
      return <GallerySectionRenderer data={section} />;
    case "contact":
      return <ContactSectionRenderer data={section} />;
    case "cta":
      return <CTASectionRenderer data={section} />;
    case "text":
      return <TextSectionRenderer data={section} />;
    case "video":
      return <VideoSectionRenderer data={section} />;
    case "spacer":
      return <SpacerSectionRenderer data={section} />;
    default:
      return null;
  }
}
