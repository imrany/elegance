// ============================================
// PAGE BUILDER TYPES
// ============================================

export type PageStatus = "draft" | "published";
export type PageTemplate = "home" | "about" | "contact" | "custom";

// Section Types
export type SectionType =
  | "hero"
  | "about"
  | "features"
  | "products"
  | "testimonials"
  | "gallery"
  | "contact"
  | "cta"
  | "text"
  | "video"
  | "spacer";

// ============================================
// SECTION INTERFACES
// ============================================

export interface HeroSectionData {
  type: "hero";
  id: string;
  title: string;
  subtitle: string;
  cta_text: string;
  cta_link: string;
  background_image: string;
  background_type: "image" | "gradient" | "video";
  background_video?: string;
  overlay: boolean;
  overlay_opacity: number;
  overlay_color: string;
  text_alignment: "left" | "center" | "right";
  height: "small" | "medium" | "large" | "full";
  show_scroll_indicator: boolean;
}

export interface AboutSectionData {
  type: "about";
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  image_position: "left" | "right";
  features: string[];
  button_text?: string;
  button_link?: string;
  background_color?: string;
}

export interface FeaturesSectionData {
  type: "features";
  id: string;
  title: string;
  subtitle: string;
  layout: "grid" | "list" | "carousel";
  columns: 2 | 3 | 4;
  items: {
    id: string;
    icon: string;
    title: string;
    description: string;
    link?: string;
  }[];
  background_color?: string;
}

export interface ProductsSectionData {
  type: "products";
  id: string;
  title: string;
  subtitle: string;
  display_type: "featured" | "new" | "category" | "manual";
  category_id?: string;
  product_ids?: string[];
  limit: number;
  columns: 2 | 3 | 4;
  show_price: boolean;
  show_add_to_cart: boolean;
  background_color?: string;
}

export interface TestimonialsSectionData {
  type: "testimonials";
  id: string;
  title: string;
  subtitle: string;
  layout: "grid" | "carousel";
  items: {
    id: string;
    name: string;
    role: string;
    avatar: string;
    rating: number;
    text: string;
  }[];
  background_color?: string;
}

export interface GallerySectionData {
  type: "gallery";
  id: string;
  title: string;
  subtitle: string;
  layout: "grid" | "masonry" | "carousel";
  columns: 2 | 3 | 4 | 5;
  images: {
    id: string;
    url: string;
    alt: string;
    caption?: string;
    link?: string;
  }[];
  background_color?: string;
}

export interface ContactSectionData {
  type: "contact";
  id: string;
  title: string;
  subtitle: string;
  show_form: boolean;
  show_info: boolean;
  email: string;
  phone: string;
  address: string;
  show_map: boolean;
  map_url: string;
  social_links: boolean;
  background_color?: string;
}

export interface CTASectionData {
  type: "cta";
  id: string;
  title: string;
  description: string;
  button_text: string;
  button_link: string;
  button_style: "primary" | "secondary" | "outline";
  background_type: "solid" | "gradient" | "image";
  background_color?: string;
  background_image?: string;
  text_alignment: "left" | "center" | "right";
}

export interface TextSectionData {
  type: "text";
  id: string;
  content: string;
  alignment: "left" | "center" | "right";
  max_width: "small" | "medium" | "large" | "full";
  background_color?: string;
}

export interface VideoSectionData {
  type: "video";
  id: string;
  title?: string;
  video_url: string;
  video_type: "youtube" | "vimeo" | "file";
  thumbnail?: string;
  autoplay: boolean;
  loop: boolean;
  controls: boolean;
  background_color?: string;
}

export interface SpacerSectionData {
  type: "spacer";
  id: string;
  height: "small" | "medium" | "large";
}

// Union type for all sections
export type PageSectionData =
  | HeroSectionData
  | AboutSectionData
  | FeaturesSectionData
  | ProductsSectionData
  | TestimonialsSectionData
  | GallerySectionData
  | ContactSectionData
  | CTASectionData
  | TextSectionData
  | VideoSectionData
  | SpacerSectionData;

// ============================================
// PAGE INTERFACE
// ============================================

export interface Page {
  id: string;
  title: string;
  slug: string;
  template: PageTemplate;
  status: PageStatus;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  sections: PageSectionData[];
  created_at: string;
  updated_at: string;
  published_at?: string;
}
