import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Search,
  Menu,
  User,
  LogOut,
  ShoppingCart,
  UserCog,
  LogIn,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { useGeneralContext } from "@/contexts/GeneralContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { itemCount } = useCart();
  const { orderStatusCount } = useOrder();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const { categories, websiteConfig } = useGeneralContext();
  const store = websiteConfig?.store;
  const navLinks = [
    ...(categories
      ?.slice(0, 3)
      .sort((a, b) => b.name.localeCompare(a.name))
      .map((category) => ({
        name: category.name,
        href: `/category/${category.slug}`,
      })) || []),
    { name: "New Arrivals", href: "/category/new-arrivals" },
  ];

  const {
    isSubscribed,
    subscribe,
    unsubscribe,
    isSupported,
    checkSubscriptionStatus,
    permissionStatus,
  } = usePushNotifications();

  const showNotifications = ref(false);
  const notifications = ref<any[]>([]);
  const unreadCount = ref(0);
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  async function fetchNotifications() {
    try {
      if (!isSubscribed.value) return;
      const [notifs, count] = await Promise.all([
        api.notifications.list(),
        api.notifications.unreadCount(),
      ]);
      notifications.value = notifs.slice(0, 10);
      unreadCount.value = count.count;
    } catch {
      // silently fail
    }
  }

  async function handleSubscribe() {
    if (user.value?.id) {
      await subscribe(user.value.id);
      await fetchNotifications();
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.notifications.markRead(id);
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  async function markAllRead() {
    try {
      await api.notifications.markAllRead();
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  async function deleteNotification(id: string) {
    try {
      await api.notifications.delete(id);
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  function toggleNotifications() {
    showNotifications.value = !showNotifications.value;
    if (showNotifications.value) {
      fetchNotifications();
    }
  }

  function closeNotifications() {
    showNotifications.value = false;
  }

  const eventColors: Record<string, string> = {
    new_application: "bg-teal-50 text-teal-700",
    new_subscriber: "bg-blue-50 text-blue-700",
    new_message: "bg-amber-50 text-amber-700",
    application_status_change: "bg-green-50 text-green-700",
  };

  useEffect(() => {
    // Await the status check BEFORE polling for notifications
    if (isSupported.value) {
      await checkSubscriptionStatus();
    }

    await fetchNotifications();
    pollInterval = setInterval(fetchNotifications, 30000);
  }, []);

  onUnmounted(() => {
    if (pollInterval) clearInterval(pollInterval);
  });
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        {store.announcement && (
          <div className="container text-center flex h-8 items-center justify-center text-xs tracking-elegant">
            {store.announcement.length > 45
              ? store.announcement.slice(0, 44) + "..."
              : store.announcement}
          </div>
        )}
      </div>

      {/* Main header */}
      <div className="container flex h-16 items-center justify-between">
        {/* Mobile menu */}
        <div className="flex lg:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 bg-background p-6">
              <nav className="flex flex-col gap-6 pt-8">
                {navLinks
                  ? navLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`font-serif text-lg tracking-wide transition-colors hover:text-accent ${location.pathname === link.href ? "text-accent" : "text-foreground"}`}
                        onClick={() => setIsOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))
                  : isAdmin && (
                      <Link
                        to="/admin/products"
                        className="font-medium text-sm tracking-wide text-accent transition-colors hover:text-accent/80"
                      >
                        + [Add new product category]
                      </Link>
                    )}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="font-serif text-lg tracking-wide text-accent transition-colors hover:text-accent/80"
                    onClick={() => setIsOpen(false)}
                  >
                    Admin Panel
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo */}
        <Link to="/" className="flex items-center">
          <h1 className="font-serif text-2xl font-semibold tracking-elegant text-foreground md:text-3xl">
            {store?.name || "[Your Store Name]"}
          </h1>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks
            ? navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`text-sm font-medium tracking-wide transition-colors hover:text-accent ${location.pathname === link.href ? "text-accent underline underline-offset-4" : "text-foreground link-underline"}`}
                >
                  {link.name}
                </Link>
              ))
            : isAdmin && (
                <Link
                  to="/admin/products"
                  className="font-medium text-sm tracking-wide text-accent transition-colors hover:text-accent/80"
                >
                  + [Add New Product Category]
                </Link>
              )}
          {isAdmin && (
            <Link
              to="/admin"
              className="text-sm link-underline font-medium tracking-wide text-accent transition-colors hover:text-accent/80"
            >
              Admin
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Search: Hidden on XS, shown on SM+ */}
          <Button variant="ghost" size="icon" className="hidden sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          {user ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                    <span className="sr-only">Account</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user.email}
                  </div>
                  <DropdownMenuSeparator />
                  {!isAdmin ? (
                    <DropdownMenuItem
                      onClick={() => navigate("/account")}
                      className="cursor-pointer"
                    >
                      <UserCog className="mr-2 h-4 w-4" />
                      Manage Account
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem
                      onClick={() => navigate("/admin")}
                      className="cursor-pointer"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Manage Website
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={signOut}
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Orders Badge */}
              <Button
                variant="ghost"
                size="icon"
                className="relative hidden xs:flex"
                asChild
              >
                <Link to="/orders">
                  <ShoppingCart className="h-5 w-5" />
                  {(orderStatusCount?.pending ?? 0) +
                    (orderStatusCount?.processing ?? 0) +
                    (orderStatusCount?.shipped ?? 0) >
                    0 && (
                    <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-medium text-accent-foreground">
                      {(orderStatusCount?.pending ?? 0) +
                        (orderStatusCount?.processing ?? 0) +
                        (orderStatusCount?.shipped ?? 0)}
                    </span>
                  )}
                  <span className="sr-only">Orders page</span>
                </Link>
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" asChild>
              <Link to="/auth">
                <LogIn className="h-5 w-5" />
                <span className="sr-only">Sign in</span>
              </Link>
            </Button>
          )}

          {/* Cart: Always visible */}
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground border-2 border-background">
                  {itemCount}
                </span>
              )}
            </Link>
          </Button>

          <!-- Notification Bell -->
          <div v-if="isSubscribed" class="relative">
              <button
                  @click="toggleNotifications"
                  class="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                  <Bell :size="20" />
                  <span
                      v-if="unreadCount > 0"
                      class="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                  >
                      {{ unreadCount > 9 ? "9+" : unreadCount }}
                  </span>
              </button>

              <!-- Notification Dropdown -->
              <div
                  v-if="showNotifications"
                  class="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                  @click.stop
              >
                  <div
                      class="flex items-center justify-between px-4 py-3 border-b border-gray-100"
                  >
                      <h3 class="text-sm font-bold text-gray-900">
                          Notifications
                      </h3>
                      <button
                          v-if="unreadCount > 0"
                          @click="markAllRead"
                          class="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700 transition-colors"
                      >
                          <CheckCheck :size="12" /> Mark all read
                      </button>
                  </div>
                  <div
                      class="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-gray-50"
                  >
                      <div
                          v-for="notif in notifications"
                          :key="notif.id"
                          class="px-4 py-3 hover:bg-gray-50/50 transition-colors cursor-pointer"
                          :class="
                              !notif.is_read ? 'bg-teal-50/20' : ''
                          "
                          @click="markAsRead(notif.id)"
                      >
                          <div class="flex items-start gap-3">
                              <div
                                  class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs"
                                  :class="
                                      eventColors[notif.event_type] ||
                                      'bg-gray-100 text-gray-500'
                                  "
                              >
                                  <component
                                      :is="
                                          notif.event_type ===
                                          'new_application'
                                              ? Briefcase
                                              : notif.event_type ===
                                                  'new_subscriber'
                                                ? MailOpen
                                                : notif.event_type ===
                                                    'new_message'
                                                  ? Mail
                                                  : FileText
                                      "
                                      :size="14"
                                  />
                              </div>
                              <div class="flex-1 min-w-0">
                                  <div
                                      class="text-sm font-medium text-gray-900 truncate"
                                  >
                                      {{ notif.title }}
                                  </div>
                                  <div
                                      class="text-xs text-gray-500 line-clamp-2 mt-0.5"
                                  >
                                      {{ notif.body }}
                                  </div>
                                  <div
                                      class="text-[10px] text-gray-400 mt-1"
                                  >
                                      {{
                                          formatTime(notif.created_at)
                                      }}
                                  </div>
                              </div>
                              <button
                                  @click.stop="
                                      deleteNotification(notif.id)
                                  "
                                  class="p-1 text-gray-300 hover:text-red-500 transition-colors shrink-0"
                              >
                                  <Trash2 :size="12" />
                              </button>
                          </div>
                      </div>
                      <div
                          v-if="!notifications.length"
                          class="px-4 py-8 text-center text-gray-400 text-sm"
                      >
                          No notifications yet.
                      </div>
                  </div>
              </div>
          </div>
          <div v-if="isSupported && !isSubscribed">
              <button
                  @click="handleSubscribe"
                  class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
              >
                  <BellRing :size="16" />
              </button>
          </div>
          <div
              v-if="!isSupported && !isSubscribed"
              class="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
              <BellOff :size="16" />
          </div>
        </div>
      </div >

      <!-- Click outside to close notifications -->
      <div
          v-if="showNotifications"
          class="fixed inset-0 z-40"
          @click="closeNotifications"
      ></div>

      <Modal
          :show="permissionStatus === 'denied'"
          size="md"
          @close="permissionStatus = 'default'"
      >
          <ModalHeader class="text-gray-900 font-bold">
              Notification Permission Denied
          </ModalHeader>

          <ModalBody>
              <p class="text-sm text-gray-600 mb-4">
                  You have blocked notifications for this site. To receive
                  real-time updates, you must manually reset your browser
                  preferences.
              </p>

              <div
                  class="flex gap-3 p-3 bg-amber-50 rounded-lg border border-amber-100 text-amber-800"
              >
                  <Info class="w-5 h-5 shrink-0 mt-0.5" />
                  <div class="text-xs leading-relaxed">
                      <span class="font-semibold block mb-1"
                          >How to fix this:</span
                      >
                      Click the site settings/lock icon next to the URL bar in
                      your browser address row, change
                      <span class="font-semibold">Notifications</span> to
                      <span class="font-semibold">Allow</span>, and then click
                      "Try again".
                  </div>
              </div>
          </ModalBody>

          <ModalFooter>
              <div class="flex justify-end gap-3 w-full">
                  <button
                      @click="permissionStatus = 'default'"
                      class="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                      Close
                  </button>
              </div>
          </ModalFooter>
      </Modal>
    </header>
  );
}
