import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { useGeneralContext } from "@/contexts/GeneralContext";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(12, "Phone number must be at most 14 characters")
    .regex(/^(07|254)/, "Phone number must start with 07 or 254"),
});

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, isLoading } = useAuth();

  const [isSignUp, setIsSignUp] = useState(
    searchParams.get("mode") === "signup",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
  }>({});
  const { websiteConfig } = useGeneralContext();
  const store = websiteConfig?.store;
  const siteName = store.name || "[Your Store Name]";

  useEffect(() => {
    if (user && !isLoading) {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    }
  }, [user, isLoading, navigate, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validate input
    let result;
    if (isSignUp) {
      result = signUpSchema.safeParse({
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      });
    } else {
      result = signInSchema.safeParse({ email, password });
    }

    if (!result.success) {
      const fieldErrors: {
        email?: string;
        password?: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
      } = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0] === "email") fieldErrors.email = issue.message;
        if (issue.path[0] === "password") fieldErrors.password = issue.message;
        if (issue.path[0] === "firstName")
          fieldErrors.firstName = issue.message;
        if (issue.path[0] === "lastName") fieldErrors.lastName = issue.message;
        if (issue.path[0] === "phoneNumber")
          fieldErrors.phoneNumber = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(
          email,
          password,
          firstName,
          lastName,
          phoneNumber,
        );
        if (error) {
          if (
            error.message.includes("already registered") ||
            error.message.includes("already exists")
          ) {
            toast.error(
              "This email is already registered. Please sign in instead.",
            );
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Account created successfully! You can now sign in.", {
            duration: 4000,
          });
          setIsSignUp(false);
          setPassword("");
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (
            error.message.includes("Invalid") ||
            error.message.includes("credentials")
          ) {
            toast.error("Invalid email or password. Please try again.");
          } else {
            toast.error(error.message);
          }
        } else {
          toast.success("Welcome back!");
          const redirect = searchParams.get("redirect") || "/";
          navigate(redirect);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });

    /*
      Reset form fields and errors when
      switching between sign-up and sign-in modes
    */
    setEmail("");
    setPassword("");
    setPassword("");
    setEmail("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setErrors({});
  }, [isSignUp]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container flex min-h-[60vh] items-center justify-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="font-serif text-3xl font-light text-foreground">
              {isSignUp ? "Create Account" : "Welcome Back"}
            </h1>
            <p className="mt-2 text-muted-foreground">
              {isSignUp
                ? `Join ${siteName} for exclusive access`
                : "Sign in to your account"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {isSignUp && (
              <div className="flex max-md:space-y-2 gap-2 max-md:flex-col">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={errors.firstName ? "border-destructive" : ""}
                    disabled={loading}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive">
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={errors.lastName ? "border-destructive" : ""}
                    disabled={loading}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive">
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={errors.email ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>
            {isSignUp && (
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={errors.phoneNumber ? "border-destructive" : ""}
                  disabled={loading}
                />
                {errors.phoneNumber && (
                  <p className="text-sm text-destructive">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={errors.password ? "border-destructive" : ""}
                disabled={loading}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading
                ? "Please wait..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </Button>
          </form>

          <div className="text-center text-sm text-muted-foreground">
            {isSignUp
              ? `Already have an account?  `
              : `Don't have an account?  `}
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setErrors({});
                setPassword("");
              }}
              className="link-underline text-sm font-medium tracking-wide text-accent transition-colors hover:text-accent/80"
              disabled={loading}
            >
              {isSignUp ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
