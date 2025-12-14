import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
});

const contactInfoSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 characters")
    .max(14, "Phone number must be at most 14 characters")
    .regex(/^(07|254)/, "Phone number must start with 07 or 254"),
});

const passwordSchema = z
  .object({
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export default function SetupPage() {
  const { createInitialAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [checkingSetup, setCheckingSetup] = useState(true);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phoneNumber?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  useEffect(() => {
    checkIfSetupNeeded();
  }, []);

  const checkIfSetupNeeded = async () => {
    try {
      const { data } = await api.getSetupStatus();
      if (data.setup_complete) {
        navigate("/");
      }
    } catch (error) {
      console.error("Error checking setup status:", error);
      toast.error("Failed to check setup status");
    } finally {
      setCheckingSetup(false);
    }
  };

  const validateStep = (step: number): boolean => {
    setErrors({});
    let result;

    switch (step) {
      case 1:
        result = personalInfoSchema.safeParse({ firstName, lastName });
        break;
      case 2:
        result = contactInfoSchema.safeParse({ email, phoneNumber });
        break;
      case 3:
        result = passwordSchema.safeParse({ password, confirmPassword });
        break;
      default:
        return false;
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

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);

    try {
      await createInitialAdmin(
        email,
        password,
        firstName,
        lastName,
        phoneNumber,
      );

      toast.success("Admin account created successfully!", {
        duration: 4000,
      });

      setTimeout(() => {
        window.location.href = "/admin";
      }, 1000);
    } catch (error) {
      console.error("Setup error:", error);
      toast.error(error.error || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (checkingSetup) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent-50 to-accent-100">
        <div className="animate-pulse text-muted-foreground">
          Checking setup status...
        </div>
      </div>
    );
  }

  const steps = [
    { number: 1, title: "Personal Info", description: "Your basic details" },
    { number: 2, title: "Contact Info", description: "Email and phone" },
    { number: 3, title: "Security", description: "Set your password" },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-accent-50 to-accent-100 py-12 px-4">
      <div className="mx-auto w-full max-w-2xl space-y-8">
        <div className="text-center">
          <h1 className="font-serif text-3xl font-light text-foreground">
            Welcome! Let's Get Started
          </h1>
          <p className="mt-2 text-muted-foreground">
            Create your admin account to set up your store
          </p>
        </div>

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
                    currentStep > step.number ? "bg-primary" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Form Container */}
        <div className="rounded-lg bg-white p-8 shadow-lg">
          {/* Step 1: Personal Information */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Personal Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  Let's start with your name
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className={errors.firstName ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.firstName && (
                  <p className="text-sm text-destructive">{errors.firstName}</p>
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
                />
                {errors.lastName && (
                  <p className="text-sm text-destructive">{errors.lastName}</p>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Contact Information */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Contact Information
                </h2>
                <p className="text-sm text-muted-foreground">
                  How can we reach you?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "border-destructive" : ""}
                  autoFocus
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="0712345678 or 254712345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className={errors.phoneNumber ? "border-destructive" : ""}
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
            </div>
          )}

          {/* Step 3: Password */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-1">
                  Set Your Password
                </h2>
                <p className="text-sm text-muted-foreground">
                  Choose a secure password for your account
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
                  autoFocus
                />
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={errors.confirmPassword ? "border-destructive" : ""}
                />
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="card-luxury bg-card border border-border p-4 text-xs text-foreground">
                <p className="font-medium">Admin Account</p>
                <p className="mt-1 text-muted-foreground">
                  This account will have full administrative access to manage
                  your store settings, products, and orders.
                </p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
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
              <Button type="button" onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="gap-2"
              >
                {loading ? "Creating..." : "Create Account"}
                {!loading && <Check className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
