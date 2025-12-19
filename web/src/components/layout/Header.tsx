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
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useOrder } from "@/contexts/OrderContext";
import { useGeneralContext } from "@/contexts/GeneralContext";

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
        </div>
      </div>
    </header>
  );
}
