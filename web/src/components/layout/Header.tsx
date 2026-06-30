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
  Bell,
  BellRing,
  BellOff,
  CheckCheck,
  Briefcase,
  MailOpen,
  Mail,
  FileText,
  Trash2,
  Info,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { useGeneralContext } from "@/contexts/GeneralContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { api, EventType, formatTime, Notification } from "@/lib";

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
    isSupported,
    checkSubscriptionStatus,
    permissionStatus,
    setPermissionStatus,
  } = usePushNotifications();

  // --- Fixed Vue refs converted to React state ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  async function fetchNotifications() {
    try {
      if (!isSubscribed) return;
      const [notifs, countData] = await Promise.all([
        api.listNotifications(),
        api.unreadNotifications(user.id),
      ]);
      setNotifications(notifs.slice(0, 10));
      setUnreadCount(countData);
    } catch {
      // silently fail
    }
  }

  async function handleSubscribe() {
    if (user?.id) {
      await subscribe(user.id);
      await fetchNotifications();
    }
  }

  async function markAsRead(id: string) {
    try {
      await api.markAsReadNotifications(id);
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  async function markAllRead() {
    try {
      await api.markAsReadNotifications();
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  async function deleteNotification(id: string, e: React.MouseEvent) {
    e.stopPropagation(); // Stop click from triggering item layout events
    try {
      await api.deleteNotification(id);
      await fetchNotifications();
    } catch {
      // silently fail
    }
  }

  function toggleNotifications() {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState) {
      fetchNotifications();
    }
  }

  const eventColors: Record<string, string> = {
    new_application: "bg-teal-50 text-teal-700",
    new_subscriber: "bg-blue-50 text-blue-700",
    new_message: "bg-amber-50 text-amber-700",
    application_status_change: "bg-green-50 text-green-700",
  };

  const getEventIcon = (eventType: EventType) => {
    switch (eventType) {
      case "new_application":
        return <Briefcase size={14} />;
      case "new_subscriber":
        return <MailOpen size={14} />;
      case "new_message":
        return <Mail size={14} />;
      default:
        return <FileText size={14} />;
    }
  };

  // --- Fixed Effect lifecycle hooks ---
  useEffect(() => {
    let pollInterval: ReturnType<typeof setInterval> | null = null;

    async function initNotifications() {
      if (isSupported) {
        await checkSubscriptionStatus();
      }
      await fetchNotifications();
      pollInterval = setInterval(fetchNotifications, 30000);
    }

    initNotifications();

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [isSupported, isSubscribed]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Top bar */}
      <div className="bg-primary text-primary-foreground">
        {store?.announcement && (
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

          {/* Cart */}
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

          {/* Fixed React Notification Bell Dropdown layout */}
          {isSubscribed ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleNotifications}
                className="relative text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-destructive-foreground text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>

              {showNotifications && (
                <>
                  {/* Click outside backdrop layer wrapper */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotifications(false)}
                  />

                  <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] sm:w-96 bg-popover text-popover-foreground rounded-xl border border-border shadow-xl z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/60">
                      <h3 className="text-sm font-bold">Notifications</h3>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="flex items-center gap-1 text-xs text-primary hover:underline transition-colors"
                        >
                          <CheckCheck size={12} /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-[60vh] sm:max-h-80 overflow-y-auto divide-y divide-border/40">
                      {notifications.map((notif) => (
                        <div
                          key={notif.user_id}
                          className={`px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex items-start gap-3 ${!notif.is_read ? "bg-muted/30" : ""}`}
                          onClick={() => markAsRead(notif.user_id)}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs ${eventColors[notif.event_type] || "bg-muted text-muted-foreground"}`}
                          >
                            {getEventIcon(notif.event_type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {notif.title}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                              {notif.body}
                            </div>
                            <div className="text-[10px] text-muted-foreground/70 mt-1">
                              {formatTime(notif.created_at)}
                            </div>
                          </div>
                          <button
                            onClick={(e) =>
                              deleteNotification(notif.user_id, e)
                            }
                            className="p-1 text-muted-foreground/60 hover:text-destructive transition-colors shrink-0"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))}
                      {notifications.length === 0 && (
                        <div className="px-4 py-8 text-center text-muted-foreground text-sm">
                          No notifications yet.
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : isSupported ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSubscribe}
              className="text-muted-foreground hover:text-foreground"
            >
              <BellRing className="h-5 w-5" />
            </Button>
          ) : (
            <div className="p-2 text-muted-foreground/40">
              <BellOff className="h-5 w-5" />
            </div>
          )}
        </div>
      </div>

      {/* Replaced raw custom Modal layouts with Radix/Shadcn UI standard Dialog context */}
      <Dialog
        open={permissionStatus === "denied"}
        onOpenChange={(open) => !open && setPermissionStatus?.("default")}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground font-bold">
              Notification Permission Denied
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You have blocked notifications for this site. To receive real-time
              updates, you must manually reset your browser preferences.
            </p>
            <div className="flex gap-3 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-100 dark:border-amber-900/30 text-amber-800 dark:text-amber-200">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs leading-relaxed">
                <span className="font-semibold block mb-1">
                  How to fix this:
                </span>
                Click the site settings/lock icon next to the URL bar in your
                browser address row, change{" "}
                <span className="font-semibold">Notifications</span> to{" "}
                <span className="font-semibold">Allow</span>, and then click
                "Try again".
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setPermissionStatus?.("default")}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}
