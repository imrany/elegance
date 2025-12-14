const API_URL = import.meta.env.DEV
  ? "http://localhost:8080"
  : window.location.origin;

interface ApiError {
  error: string;
  status: number;
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
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string; // Assuming ISO 8601 string for time.Time
  updated_at: string; // Assuming ISO 8601 string for time.Time
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
  id: string;
  user_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]; // json.RawMessage maps to any, can be refined if structure is known
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: string;
  payment_method: string | null;
  payment_status: string;
  notes: string | null;
  created_at: string; // Assuming ISO 8601 string for time.Time
  updated_at: string; // Assuming ISO 8601 string for time.Time
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

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        error: data.error || "Something went wrong",
        status: response.status,
      } as ApiError;
    }

    return data;
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
      data: {
        user: User;
      };
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
      data: {
        token: string;
        user: User;
      };
    }>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  }

  async getMe() {
    return this.request<{
      data: {
        user: User;
      };
    }>("/api/auth/me");
  }

  // Products
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getProducts(params?: Record<string, any>) {
    const queryString = params
      ? "?" + new URLSearchParams(params).toString()
      : "";
    return this.request<{ data: Product[] }>(`/api/products${queryString}`);
  }

  async getProductBySlug(slug: string) {
    return this.request<{ data: Product }>(`/api/products/${slug}`);
  }

  async getFeaturedProducts() {
    return this.request<{ data: Product[] }>("/api/products?featured=true");
  }

  async getNewProducts() {
    return this.request<{ data: Product[] }>("/api/products?is_new=true");
  }

  // Categories
  async getCategories() {
    return this.request<{ data: Category[] }>("/api/categories");
  }

  async getCategoryBySlug(slug: string) {
    return this.request<{ data: Category }>(`/api/categories/${slug}`);
  }

  // Orders
  async createOrder(orderData: Order) {
    return this.request<{ data: Order }>("/api/orders", {
      method: "POST",
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(id: string) {
    return this.request<{ data: Order }>(`/api/orders/${id}`);
  }

  async updateOrderStatus(
    id: string,
    orderStatus: {
      status: string;
      payment_status: string;
    },
  ) {
    return this.request<{ data: Order }>(`/api/orders/${id}/status`, {
      method: "PUT",
      body: JSON.stringify(orderStatus),
    });
  }

  // Products
  async createProduct(productData: Product) {
    return this.request<{ data: Product }>("/api/products", {
      method: "POST",
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request<{ data: string }>(`/api/products/${id}`, {
      method: "DELETE",
    });
  }

  async updateProduct(id: string, productData: Product) {
    return this.request<{ data: Product }>(`/api/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(productData),
    });
  }

  // Settings
  async getSetting(key: string) {
    return this.request<{ data: SiteSetting }>(`/api/settings/${key}`);
  }

  // Admin: Get all orders
  async getAllOrders() {
    return this.request<{ data: Order[] }>("/api/admin/orders");
  }

  // Admin: Update setting
  async updateSetting(key: string, value: SiteSettingValue) {
    return this.request<{ data: SiteSetting }>(`/api/admin/settings/${key}`, {
      method: "PUT",
      body: JSON.stringify({ value }),
    });
  }

  // Admin: User management
  async getAllUsers() {
    return this.request<{ data: User[] }>("/api/admin/users");
  }

  async updateUserRole(userId: string, role: string) {
    return this.request<{ data: User }>(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    return this.request<{ data: string }>(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
  }

  // setup
  async getSetupStatus() {
    return this.request<{ data: SetupStatus }>(`/api/setup/status`);
  }

  async setupAdmin(
    email: string,
    password: string,
    first_name: string,
    last_name: string,
    phone_number: string,
  ) {
    return this.request<{ data: { admin: User; token: string } }>(
      `/api/setup/admin`,
      {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          first_name,
          last_name,
          phone_number,
        }),
      },
    );
  }
}

export const api = new ApiClient(API_URL);
