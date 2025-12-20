import { Page } from "./page-types";

export const API_URL = import.meta.env.DEV
  ? "http://localhost:8082"
  : window.location.origin;

export interface ApiResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export interface ApiError {
  success: false;
  message: string;
  status: number;
  error?: string; // Compatibility with your toast.error(error.error) logic
}

export interface HeroType {
  background_image: string;
  cta_link: string;
  cta_text: string;
  overlay: boolean;
  overlay_opacity: number;
  subtitle: string;
  title: string;
}

export interface AboutType {
  description: string;
  features: string[];
  image: string;
  title: string;
}

export interface FeaturesType {
  items: {
    icon: string;
    title: string;
    description: string;
  }[];
  subtitle: string;
  title: string;
}

export interface ContactType {
  address: string;
  email: string;
  map_url: string;
  phone: string;
  show_map: boolean;
  subtitle: string;
  title: string;
}

export interface ThemeType {
  accent_color: string;
  border_radius: string;
  font_family: string;
  primary_color: string;
  secondary_color: string;
}

export interface SeoType {
  description: string;
  favicon: string;
  keywords: string;
  og_image: string;
  title: string;
}

export interface SocialType {
  facebook: string;
  instagram: string;
  linkedin: string;
  tiktok: string;
  twitter: string;
  youtube: string;
}

export interface StoreType {
  announcement: string;
  currency: string;
  description: string;
  free_delivery_threshold: number;
  logo: string;
  name: string;
}

export interface SmtpType {
  enabled: boolean;
  from_email: string;
  resend_api_key: string;
}

export interface WhatsappType {
  phone: string;
  message: string;
}

export type MpesaSettlementType = "till" | "paybill";

export interface MpesaType {
  /** The settlement method chosen by the merchant */
  type: MpesaSettlementType;
  /** The 10-digit Kenyan phone number registered for M-Pesa notifications */
  phone: string;

  /**
   * 6-7 digit number for "Buy Goods and Services".
   * Required only if type is "till".
   */
  till_number?: string;

  /**
   * The Business Shortcode for the Paybill.
   * Required only if type is "paybill".
   */
  paybill_number?: string;

  /**
   * The specific account identifier (e.g., "ONLINE-STORE").
   * Required only if type is "paybill".
   */
  account_number?: string;
}

export interface SectionData {
  hero?: HeroType;
  about?: AboutType;
  features?: FeaturesType;
  contact?: ContactType;
  theme?: ThemeType;
  seo?: SeoType;
  social?: SocialType;
  store: StoreType;
  smtp: SmtpType;
  whatsapp: WhatsappType;
  mpesa: MpesaType;
  pages?: Page[];
}

export type WebsiteSettingKey = keyof SectionData;

export interface WebsiteConfig {
  id: string;
  key: WebsiteSettingKey;
  value: SiteSettingValue;
  createdAt: string; // Assuming ISO 8601 string for time.Time
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  role: string;
  created_at: string; // Assuming ISO 8601 string for time.Time
  updated_at: string; // Assuming ISO 8601 string for time.Time
}

export interface Category {
  id: string | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string | null; // Assuming ISO 8601 string for time.Time
  updated_at: string | null; // Assuming ISO 8601 string for time.Time
}

export interface Product {
  id: string | null;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: string | null;
  category_name: string | null;
  images: string[];
  sizes: string[];
  colors: string[];
  stock: number;
  featured: boolean;
  is_new: boolean;
  created_at: string | null; // Assuming ISO 8601 string for time.Time
  updated_at: string | null; // Assuming ISO 8601 string for time.Time
}

export interface Order {
  id: string | null;
  customer: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  };
  shipping: {
    address: string;
    city: string;
    postalCode: string;
  };
  items: {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    size: string;
    color: string;
    image: string;
  }[];
  subtotal: number;
  delivery_fee: number;
  total: number;
  notes: string;
  payment_method: "mpesa";
  created_at: string | null;
  updated_at: string | null;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed";
}

export type SiteSettingKeys = {
  WHATSAPP: "whatsapp";
  EMAIL: "email";
  STORE: "store";
  SOCIAL_MEDIA: "social_media";
};

export type SiteSettingKey =
  | SiteSettingKeys["WHATSAPP" | "EMAIL" | "STORE" | "SOCIAL_MEDIA"]
  | string;

export type SiteSettingValue =
  | string
  | number
  | boolean
  | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  | { [key: string]: any };

export interface SiteSetting {
  id: string;
  key: SiteSettingKey;
  value: SiteSettingValue;
  createdAt: string; // Assuming ISO 8601 string for time.Time
  updatedAt: string; // Assuming ISO 8601 string for time.Time
}

export interface ProductFilters {
  category_id?: string; // *string maps to optional string
  featured?: boolean; // *bool maps to optional boolean
  is_new?: boolean; // *bool maps to optional boolean
  search?: string; // *string maps to optional string
  limit: number;
  offset: number;
  order?: string;
}
export interface SetupStatus {
  setup_complete: boolean;
  has_admin: boolean;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private getAuthToken(): string | null {
    return localStorage.getItem("auth_token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<T> {
    const token = this.getAuthToken();
    // Start with authorization header if available
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // when options.body is an instance of FormData.
    if (!(options.body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const finalHeaders = {
      ...headers, // Our computed Auth/Content-Type headers
      ...options.headers, // Any extra headers passed in by the caller
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: finalHeaders, // Use the final combined headers
      });

      const result: ApiResponse<T> = await response.json();

      // If the server returned an error status or success: false
      if (!response.ok || !result.success) {
        throw {
          success: false,
          message: result.message || "An unexpected error occurred",
          status: result.status || response.status,
          error: result.message || "An unexpected error occurred",
        };
      }

      return result.data;
    } catch (error) {
      throw {
        success: false,
        message: error.message || "Something went wrong",
        status: error.status,
        error: error.message || "An unexpected error occurred",
      } as ApiError;
    }
  }

  // Auth endpoints
  async signUp(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) {
    return this.request<{
      user: User;
    }>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      }),
    });
  }

  async signIn(email: string, password: string) {
    return this.request<{
      token: string;
      user: User;
    }>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{
      user: User;
    }>("/api/auth/me");
  }

  async updateUserAccount(userData: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  }) {
    return this.request<User>(`/api/auth/me`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async changeUserPassword(data: {
    current_password: string;
    new_password: string;
  }) {
    return this.request<User>(`/api/auth/me/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  //pages
  async getPages() {
    return this.request<Page[]>(`/api/pages`);
  }

  // Get a single page by ID
  async getPage(pageId: string) {
    return this.request<Page>(`/api/pages/${pageId}`);
  }

  async createPage(page: Partial<Page>) {
    return this.request<Page>(`/api/admin/pages`, {
      method: "POST",
      body: JSON.stringify(page),
    });
  }

  async updatePage(pageId: string, page: Partial<Page>) {
    return this.request<Page>(`/api/admin/pages/${pageId}`, {
      method: "PUT",
      body: JSON.stringify(page),
    });
  }

  async deletePage(pageId: string) {
    return this.request<void>(`/api/admin/pages/${pageId}`, {
      method: "DELETE",
    });
  }

  async publishPage(pageId: string) {
    return this.request<void>(`/api/admin/pages/${pageId}/publish`, {
      method: "POST",
    });
  }

  async unpublishPage(pageId: string) {
    return this.request<void>(`/api/admin/pages/${pageId}/unpublish`, {
      method: "POST",
    });
  }

  // Duplicate a page
  async duplicatePage(pageId: string) {
    return this.request<Page>(`/api/admin/pages/${pageId}/duplicate`, {
      method: "POST",
    });
  }

  // Reorder page sections
  async reorderPageSections(pageId: string, sectionIds: string[]) {
    return this.request<void>(`/api/admin/pages/${pageId}/reorder-sections`, {
      method: "POST",
      body: JSON.stringify({ section_ids: sectionIds }),
    });
  }

  // Products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProducts(params?: Record<string, any>) {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<Product[]>(`/api/products${queryString}`);
  }

  async getProductBySlug(slug: string) {
    return this.request<Product>(`/api/products/${slug}`);
  }

  async getFeaturedProducts() {
    return this.request<Product[]>("/api/products?featured=true");
  }

  async getNewProducts() {
    return this.request<Product[]>("/api/products?is_new=true");
  }

  // Categories
  async getCategories() {
    return this.request<Category[]>("/api/categories");
  }

  async getCategoryBySlug(slug: string) {
    return this.request<Category>(`/api/categories/${slug}`);
  }

  async createCategory(categoryData: Category) {
    return this.request<Category>("/api/admin/categories", {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  }

  async updateCategory(categoryData: Category) {
    return this.request<Category>(
      `/api/admin/categories/${categoryData.slug}`,
      {
        method: "PUT",
        body: JSON.stringify(categoryData),
      },
    );
  }

  async deleteCategory(key: string) {
    return this.request<void>(`/api/admin/categories/${key}`, {
      method: "DELETE",
    });
  }

  // Orders
  async createOrder(orderData: Order) {
    return this.request<Order>("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  // /api/orders?key=user_id&&value=123
  async getOrders(key?: string, value?: string) {
    return this.request<Order[]>(
      `/api/orders?key=${key || ""}&value=${value || ""}`,
    );
  }

  async updateOrderStatus(
    id: string,
    orderStatus: {
      status: string;
      payment_status: string;
    },
  ) {
    return this.request<Order>(`/api/admin/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(orderStatus),
    });
  }

  async deleteOrder(id: string) {
    return this.request<void>(`/api/orders/${id}`, {
      method: "DELETE",
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async updateOrder(order_id: string, updatedPayload: any) {
    return this.request<Order>(`/api/orders/${order_id}`, {
      method: "PUT",
      body: JSON.stringify(updatedPayload),
    });
  }

  // Products (admin)
  async createProduct(productData: Product) {
    return this.request<Product>(`/api/admin/products`, {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request<void>(`/api/admin/products/${id}`, {
      method: "DELETE",
    });
  }

  async updateProduct(id: string, productData: Product) {
    return this.request<Product>(`/api/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  // Admin: Get all orders
  async getAllOrders() {
    return this.request<Order[]>("/api/admin/orders");
  }

  async updateUser(userData: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
  }) {
    return this.request<User>(`/api/admin/users`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async changePassword(data: {
    current_password: string;
    new_password: string;
  }) {
    return this.request<User>(`/api/admin/users/password`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async getUserOrders(userId: string) {
    return this.request<Order[]>(`/api/admin/users/${userId}/orders`);
  }

  // Admin: Upload logo
  async uploadImage(formData: FormData) {
    return this.request<{
      url: string;
    }>(`/api/admin/upload/image`, {
      method: "POST",
      body: formData,
    });
  }

  async deleteImage(filename: string) {
    return this.request<void>(`/api/admin/images/${filename}`, {
      method: "DELETE",
    });
  }

  // Admin: User management
  async getAllUsers() {
    return this.request<User[]>("/api/admin/users");
  }

  async updateUserRole(userId: string, role: string) {
    return this.request<User>(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    return this.request<void>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  // Website Builder
  async getAllWebsiteConfig() {
    const url = `/api/website-builder`;
    return this.request<WebsiteConfig[]>(url, {
      method: "GET",
    });
  }

  async getWebsiteConfig(key: string) {
    const url = `/api/website-builder/${key}`;
    return this.request<WebsiteConfig>(url, {
      method: "GET",
    });
  }

  async updateWebsiteConfig(key: string, value: string) {
    return await this.request<WebsiteConfig>(
      `/api/admin/website-builder/${key}`,
      {
        method: "PUT",
        body: JSON.stringify({ value }),
      },
    );
  }

  // setup
  async getSetupStatus() {
    return this.request<SetupStatus>(`/api/setup/status`);
  }

  async setupAdmin(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) {
    return this.request<{ admin: User; token: string }>(`/api/setup/admin`, {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        first_name,
        last_name,
        phone_number,
      }),
    });
  }
}

export const api = new ApiClient(API_URL);
