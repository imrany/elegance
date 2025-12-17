import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SectionData } from "./api";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency: string = "KES"): string {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

// Format date
export function formatDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// short format date
export function formatShortDate(date: string | Date | null | undefined) {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  processing: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-green-500/10 text-green-600",
  cancelled: "bg-red-500/10 text-red-600",
};

// Get status badge variant
export const getStatusBadge = (status: string) => {
  const variants: Record<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { variant: any; label: string; color: string }
  > = {
    pending: {
      variant: "secondary",
      label: "Pending",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    processing: {
      variant: "default",
      label: "Processing",
      color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
    },
    shipped: {
      variant: "default",
      label: "Shipped",
      color:
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
    },
    delivered: {
      variant: "default",
      label: "Delivered",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    cancelled: {
      variant: "destructive",
      label: "Cancelled",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  return variants[status] || { variant: "secondary", label: status, color: "" };
};

// Get payment status badge
export const getPaymentBadge = (status: string) => {
  const variants: Record<string, { label: string; color: string }> = {
    pending: {
      label: "Payment Pending",
      color:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
    },
    paid: {
      label: "Paid",
      color:
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
    },
    failed: {
      label: "Failed",
      color: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
    },
  };
  return (
    variants[status] || { label: status, color: "bg-gray-100 text-gray-800" }
  );
};

export const DEFAULT_CONFIG: SectionData = {
  hero: {
    title: "Welcome to Our Store",
    subtitle: "Discover amazing products at great prices",
    cta_text: "Shop Now",
    cta_link: "/products",
    background_image: "",
    overlay: true,
    overlay_opacity: 0.5,
  },
  about: {
    title: "About Us",
    description:
      "We are dedicated to providing the best products and services to our customers.",
    image: "",
    features: ["Quality Products", "Fast Shipping", "Great Support"],
  },
  features: {
    title: "Why Choose Us",
    subtitle: "Discover what makes us special",
    items: [
      {
        icon: "ShoppingBag",
        title: "Quality Products",
        description: "We offer only the best quality products",
      },
      {
        icon: "Truck",
        title: "Fast Delivery",
        description: "Get your orders delivered quickly",
      },
      {
        icon: "Shield",
        title: "Secure Payments",
        description: "Your transactions are always secure",
      },
    ],
  },
  contact: {
    title: "Get In Touch",
    subtitle: "We'd love to hear from you",
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, Country",
    show_map: false,
    map_url: "",
  },
  theme: {
    primary_color: "#000000",
    secondary_color: "#666666",
    accent_color: "#007bff",
    font_family: "Inter",
    border_radius: "0.5rem",
  },
  seo: {
    title: "My Store - Quality Products",
    description: "Shop the best products at amazing prices",
    keywords: "store, shop, products, ecommerce",
    og_image: "",
    favicon: "",
  },
  social: {
    facebook: "",
    twitter: "",
    instagram: "",
    linkedin: "",
    youtube: "",
    tiktok: "",
  },
  store: {
    name: "ÉLÉGANCE",
    currency: "KES",
    free_delivery_threshold: 10000,
    logo: "/logo.png",
    announcement:
      "Free Delivery on Orders Over KES 10,000 | Luxury Fashion, Made in Kenya",
    description:
      "Discover the finest luxury fashion in Kenya, crafted with passion and precision.",
  },
  smtp: {
    enabled: false,
    from_email: "",
    resend_api_key: "",
  },
  whatsapp: {
    phone: "",
    message: "",
  },
};
