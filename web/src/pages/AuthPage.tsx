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
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const step1Schema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

const step2Schema = z.object({
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(12, "Phone number must be at most 14 characters")
    .regex(/^(07|254)/, "Phone number must start with 07 or 254"),
  password: z.string().min(6, "Password must be at least 6 characters"),
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
  const [cpassword, setCpassword] = useState("");
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
    cpassword?: string;
  }>({});
  const { websiteConfig } = useGeneralContext();
  const store = websiteConfig?.store;
  const siteName = store.name || "[Your Store Name]";
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  useEffect(() => {
    if (user && !isLoading) {
      const redirect = searchParams.get("redirect") || "/";
      navigate(redirect);
    }
  }, [user, isLoading, navigate, searchParams]);

  const validateStep = (step: number): boolean => {
    setErrors({});
    let result;

    if (step === 1) {
      result = step1Schema.safeParse({ firstName, lastName, email });
    } else {
      result = step2Schema.safeParse({ phoneNumber, password, cpassword });
    }

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof errors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return false;
    }

    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setErrors({});
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = signInSchema.safeParse({ email, password });

    if (!result.success) {
      const fieldErrors: typeof errors = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof typeof errors;
        fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      if (error) {
        console.error(error);
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
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!validateStep(2)) return;
    if (password !== cpassword) {
      setErrors({ cpassword: "Passwords do not match" });
      return;
    }

    setLoading(true);

    try {
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
        setCurrentStep(1);
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

    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setCpassword("");
    setErrors({});
    setCurrentStep(1);
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

  const steps = [
    { number: 1, title: "Personal Info", description: "Your basic details" },
    { number: 2, title: "Security", description: "Phone and password" },
  ];

  return (
    <Layout>
      <div className="container flex min-h-[60vh] items-center justify-center py-12">
        <div className="mx-auto w-full max-w-2xl space-y-8">
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

          {/* Sign Up - Multi-step */}
          {isSignUp && (
            <>
              {/* Step Indicator */}
              <div className="flex items-center justify-between mb-8">
                {steps.map((step, index) => (
                  <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                          currentStep > step.number
                            ? "bg-primary border-primary text-primary-foreground"
                            : currentStep === step.number
                              ? "border-primary text-primary"
                              : "border-border text-gray-400"
                        }`}
                      >
                        {currentStep > step.number ? (
                          <Check className="w-5 h-5" />
                        ) : (
                          step.number
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p
                          className={`text-sm font-medium ${
                            currentStep >= step.number
                              ? "text-foreground"
                              : "text-gray-400"
                          }`}
                        >
                          {step.title}
                        </p>
                        <p className="text-xs text-muted-foreground hidden sm:block">
                          {step.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-2 transition-all ${
                          currentStep > step.number
                            ? "bg-primary"
                            : "bg-gray-300"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Form Container */}
              <div className="space-y-6">
                {/* Step 1: Personal Information */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 max-md:space-y-2 gap-2 max-md:flex-col">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className={
                            errors.firstName ? "border-destructive" : ""
                          }
                          disabled={loading}
                          autoFocus
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
                          className={
                            errors.lastName ? "border-destructive" : ""
                          }
                          disabled={loading}
                        />
                        {errors.lastName && (
                          <p className="text-sm text-destructive">
                            {errors.lastName}
                          </p>
                        )}
                      </div>
                    </div>
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
                        <p className="text-sm text-destructive">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 2: Phone and Password */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">Phone Number</Label>
                      <Input
                        id="phoneNumber"
                        type="tel"
                        placeholder="0712345678 or 254712345678"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className={
                          errors.phoneNumber ? "border-destructive" : ""
                        }
                        disabled={loading}
                        autoFocus
                      />
                      {errors.phoneNumber && (
                        <p className="text-sm text-destructive">
                          {errors.phoneNumber}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must start with 07 or 254
                      </p>
                    </div>
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
                        <p className="text-sm text-destructive">
                          {errors.password}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must be at least 6 characters
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpassword">Confirm Password</Label>
                      <Input
                        id="cpassword"
                        type="password"
                        placeholder="••••••••"
                        value={cpassword}
                        onChange={(e) => setCpassword(e.target.value)}
                        className={errors.cpassword ? "border-destructive" : ""}
                        disabled={loading}
                      />
                      {errors.cpassword && (
                        <p className="text-sm text-destructive">
                          {errors.cpassword}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Must match password
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex items-center justify-between pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentStep === 1 || loading}
                    className="gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>

                  <div className="text-sm text-muted-foreground">
                    Step {currentStep} of {totalSteps}
                  </div>

                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gap-2"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSignUp}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? "Creating..." : "Create Account"}
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Sign In - Single Form */}
          {!isSignUp && (
            <form onSubmit={handleSignIn} className="space-y-6">
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
                {loading ? "Please wait..." : "Sign In"}
              </Button>
            </form>
          )}

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
