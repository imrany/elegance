import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SectionData } from "./api";
import {
  CreditCard,
  Package,
  RotateCcw,
  ShoppingCart,
  User,
} from "lucide-react";
import { Page, PageSectionData, PageTemplate, SectionType } from "./page-types";

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

export function generateSectionId(): string {
  return `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createDefaultSection(type: SectionType): PageSectionData {
  const defaultSection = DEFAULT_SECTIONS[type];
  return {
    ...defaultSection,
    id: generateSectionId(),
  } as PageSectionData;
}

export function createDefaultPage(template: PageTemplate): Page {
  const now = new Date().toISOString();

  let sections: PageSectionData[] = [];

  switch (template) {
    case "home":
      sections = [
        createDefaultSection("hero"),
        createDefaultSection("features"),
        createDefaultSection("products"),
        createDefaultSection("cta"),
      ];
      break;
    case "about":
      sections = [
        createDefaultSection("about"),
        createDefaultSection("features"),
        createDefaultSection("testimonials"),
      ];
      break;
    case "contact":
      sections = [createDefaultSection("contact")];
      break;
    default:
      sections = [];
  }

  return {
    id: `page_${Date.now()}`,
    title: template.charAt(0).toUpperCase() + template.slice(1),
    slug: template === "home" ? "/" : `/${template}`,
    template,
    status: "draft",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    og_image: "",
    sections,
    created_at: now,
    updated_at: now,
  };
}

export const DEFAULT_SECTIONS: Record<SectionType, Partial<PageSectionData>> = {
  hero: {
    type: "hero",
    title: "Welcome to Our Store",
    subtitle: "Discover amazing products at great prices",
    cta_text: "Shop Now",
    cta_link: "/products",
    background_image: "",
    background_type: "image",
    overlay: true,
    overlay_opacity: 0.5,
    overlay_color: "#000000",
    text_alignment: "center",
    height: "large",
    show_scroll_indicator: true,
  },
  about: {
    type: "about",
    title: "About Us",
    subtitle: "Our Story",
    description:
      "We are dedicated to providing the best products and services.",
    image: "",
    image_position: "right",
    features: ["Quality Products", "Fast Shipping", "Great Support"],
  },
  features: {
    type: "features",
    title: "Why Choose Us",
    subtitle: "Discover what makes us special",
    layout: "grid",
    columns: 3,
    items: [
      {
        id: "1",
        icon: "ShoppingBag",
        title: "Quality Products",
        description: "We offer only the best quality products",
      },
      {
        id: "2",
        icon: "Truck",
        title: "Fast Delivery",
        description: "Get your orders delivered quickly",
      },
      {
        id: "3",
        icon: "Shield",
        title: "Secure Payments",
        description: "Your transactions are always secure",
      },
    ],
  },
  products: {
    type: "products",
    title: "Featured Products",
    subtitle: "Check out our best sellers",
    display_type: "featured",
    limit: 8,
    columns: 4,
    show_price: true,
    show_add_to_cart: true,
  },
  testimonials: {
    type: "testimonials",
    title: "What Our Customers Say",
    subtitle: "Real reviews from real people",
    layout: "carousel",
    items: [],
  },
  gallery: {
    type: "gallery",
    title: "Gallery",
    subtitle: "Explore our collection",
    layout: "grid",
    columns: 4,
    images: [],
  },
  contact: {
    type: "contact",
    title: "Get In Touch",
    subtitle: "We'd love to hear from you",
    show_form: true,
    show_info: true,
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, Country",
    show_map: false,
    map_url: "",
    social_links: true,
  },
  cta: {
    type: "cta",
    title: "Ready to Get Started?",
    description: "Join thousands of satisfied customers today",
    button_text: "Shop Now",
    button_link: "/products",
    button_style: "primary",
    background_type: "gradient",
    text_alignment: "center",
  },
  text: {
    type: "text",
    content: "<p>Add your text content here...</p>",
    alignment: "left",
    max_width: "large",
  },
  video: {
    type: "video",
    video_url: "",
    video_type: "youtube",
    autoplay: false,
    loop: false,
    controls: true,
  },
  spacer: {
    type: "spacer",
    height: "medium",
  },
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
  mpesa: {
    type: "till",
    phone: "",
    till_number: "",
    paybill_number: "",
    account_number: "",
  },
  pages: [],
};

export const faqCategories = [
  {
    title: "Orders & Shipping",
    icon: Package,
    faqs: [
      {
        question: "How long does shipping take?",
        answer:
          "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 business day delivery. International orders may take 7-14 business days depending on the destination.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "No, we do not ship internationally. We ship locally inside Kenya. Shipping costs and delivery times vary by location. You can check available shipping options at checkout.",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and visiting the 'Orders' section.",
      },
      {
        question: "Can I change my shipping address after placing an order?",
        answer:
          "If your order hasn't shipped yet, contact us immediately and we'll do our best to update the address. Once shipped, we cannot modify the delivery address.",
      },
    ],
  },
  {
    title: "Returns & Refunds",
    icon: RotateCcw,
    faqs: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy for most items. Products must be unused, in original packaging, and with all tags attached. Some items like personalized products may not be eligible for return.",
      },
      {
        question: "How do I initiate a return?",
        answer:
          "Log into your account, go to 'Order History', select the order, and click 'Return Items'. Follow the prompts to complete your return request. You'll receive a return shipping label via email.",
      },
      {
        question: "When will I receive my refund?",
        answer:
          "Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method. Please allow additional time for your bank to process the refund.",
      },
      {
        question: "Can I exchange an item?",
        answer:
          "Yes! Follow the return process and place a new order for the item you want. This ensures you get your preferred item as quickly as possible.",
      },
    ],
  },
  {
    title: "Payment & Pricing",
    icon: CreditCard,
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "Currently We only accept manual M-Pesa payment. All transactions would be handled on your side.",
      },
      {
        question: "Is it safe to use my credit card?",
        answer:
          "Absolutely! We use industry-standard SSL encryption to protect your payment information. We never store your complete credit card details on our servers.",
      },
      {
        question: "Do you offer discounts or promotions?",
        answer:
          "Yes! Sign up for our newsletter to receive exclusive offers and be the first to know about sales. We also offer seasonal promotions throughout the year.",
      },
    ],
  },
  {
    title: "Account & Profile",
    icon: User,
    faqs: [
      {
        question: "Do I need an account to place an order?",
        answer:
          "No, you can checkout as a guest. However, creating an account allows you to track orders, save addresses, and access exclusive member benefits.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Click 'Sign In', then 'Forgot Password'. Enter your email address and we'll send you a password reset link. Follow the instructions in the email to create a new password.",
      },
      {
        question: "Can I update my account information?",
        answer:
          "Yes! Log into your account and go to 'Account Settings' to update your email, password, shipping addresses, and other preferences.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Contact our customer support team and we'll process your account deletion request. Please note this action is permanent and cannot be undone.",
      },
    ],
  },
  {
    title: "Products & Stock",
    icon: ShoppingCart,
    faqs: [
      {
        question: "How do I know if an item is in stock?",
        answer:
          "Product availability is shown on each product page. If an item is out of stock, you can sign up for restock notifications to be alerted when it's available again.",
      },
      {
        question: "Do you offer product warranties?",
        answer:
          "Yes, most products come with a manufacturer's warranty. Warranty details and duration vary by product and are listed on the product page.",
      },
      {
        question: "Can I request a product that's not in your catalog?",
        answer:
          "We love hearing from our customers! Send us your product suggestions through our contact form, and we'll consider adding them to our inventory.",
      },
      {
        question: "Are your products authentic?",
        answer:
          "Yes, we only sell 100% authentic products. All items are sourced directly from authorized distributors and manufacturers.",
      },
    ],
  },
];
