import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGeneralContext } from "@/contexts/GeneralContext";
import {
  ChevronDown,
  HelpCircle,
  BookOpen,
  MessageCircle,
  RotateCcw,
  User,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export function GuidePage() {
  const { websiteConfig } = useGeneralContext();
  const contact = websiteConfig?.contact;
  const [activeGuide, setActiveGuide] = useState<string | null>(null);

  const guides = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: User,
      description: "Learn the basics of shopping with us",
      steps: [
        {
          title: "Create Your Account",
          content:
            "Click 'Sign Up' in the top right corner. Fill in your details and verify your email address to unlock exclusive member benefits and faster checkout.",
        },
        {
          title: "Browse Products",
          content:
            "Use the search bar or browse by category. Filter products by price, brand, or features to find exactly what you need.",
        },
        {
          title: "Add to Cart",
          content:
            "Click 'Add to Cart' on any product page. Review your cart anytime by clicking the cart icon in the navigation bar.",
        },
        {
          title: "Checkout",
          content:
            "Proceed to checkout, enter your shipping address, select a payment method, and review your order before confirming.",
        },
        {
          title: "Track Your Order",
          content:
            "Once your order ships, you'll receive a tracking number. Monitor your delivery status in real-time from your account dashboard.",
        },
      ],
    },
    {
      id: "placing-orders",
      title: "Placing Orders",
      icon: ShoppingCart,
      description: "Step-by-step guide to completing your purchase",
      steps: [
        {
          title: "Select Your Items",
          content:
            "Browse our catalog and add items to your cart. You can adjust quantities or remove items before checkout.",
        },
        {
          title: "Review Your Cart",
          content:
            "Click the cart icon to review your selections. Apply promo codes here if you have any.",
        },
        {
          title: "Enter Shipping Information",
          content:
            "Provide your delivery address. Make sure all details are accurate to avoid delivery issues.",
        },
        {
          title: "Choose Shipping Method",
          content:
            "Select from available shipping options. Faster shipping methods may have additional costs.",
        },
        {
          title: "Payment",
          content: "Enter your payment details securely. We only accept M-Pesa",
        },
        {
          title: "Order Confirmation",
          content:
            "Review your order summary and confirm. You'll receive an email confirmation with order details.",
        },
      ],
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      icon: RotateCcw,
      description: "How to return or exchange products",
      steps: [
        {
          title: "Check Return Eligibility",
          content:
            "Items must be returned within 30 days, unused, in original packaging with all tags attached. Some items may not be eligible for return.",
        },
        {
          title: "Initiate Return Request",
          content:
            "Log into your account, find the order in 'Order History', and click 'Return Items'. Select the items you wish to return and provide a reason.",
        },
        {
          title: "Print Return Label",
          content:
            "After your return is approved, you'll receive a prepaid return shipping label via email. Print it out.",
        },
        {
          title: "Package Your Return",
          content:
            "Securely package the items in their original packaging if possible. Attach the return label to the outside of the package.",
        },
        {
          title: "Ship Your Return",
          content:
            "Drop off your package at any authorized shipping location. Keep your receipt as proof of return.",
        },
        {
          title: "Refund Processing",
          content:
            "Once we receive and inspect your return, we'll process your refund within 5-7 business days.",
        },
      ],
    },
    {
      id: "account-management",
      title: "Account Management",
      icon: Settings,
      description: "Manage your account settings and preferences",
      steps: [
        {
          title: "Access Account Settings",
          content:
            "Click on your profile icon and select 'Account Settings' from the dropdown menu.",
        },
        {
          title: "Update Personal Information",
          content:
            "Edit your name, email, phone number, and other personal details. Click 'Save Changes' to update.",
        },
        {
          title: "Manage Addresses",
          content:
            "Add, edit, or delete shipping and billing addresses. Set a default address for faster checkout.",
        },
        {
          title: "Change Password",
          content:
            "Go to 'Security' section, enter your current password, then create a new secure password.",
        },
        {
          title: "Email Preferences",
          content:
            "Manage your email subscription preferences. Choose which types of emails you want to receive.",
        },
        {
          title: "Order History",
          content:
            "View all your past orders, track current shipments, and download invoices from the 'Orders' section.",
        },
      ],
    },
  ];

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-accent/10 p-4">
                <BookOpen className="h-12 w-12 text-accent" />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-light text-foreground md:text-5xl mb-4">
              How-To Guides
            </h1>
            <p className="text-lg text-muted-foreground">
              Step-by-step instructions to help you make the most of your
              experience
            </p>
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-6 md:grid-cols-2">
              {guides.map((guide) => (
                <Card
                  key={guide.id}
                  className="p-6 hover:shadow-lg transition-all cursor-pointer"
                  onClick={() =>
                    setActiveGuide(activeGuide === guide.id ? null : guide.id)
                  }
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="rounded-lg bg-accent/10 p-3">
                      <guide.icon className="h-6 w-6 text-accent" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold mb-2">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {guide.description}
                      </p>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-muted-foreground transition-transform ${
                        activeGuide === guide.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>

                  {activeGuide === guide.id && (
                    <div className="mt-6 space-y-4 border-t border-border pt-6">
                      {guide.steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex-shrink-0">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-accent-foreground text-sm font-semibold">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-1">{step.title}</h4>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {step.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Need More Help */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold mb-4">Need more help?</h2>
            <p className="text-muted-foreground mb-8">
              Check our FAQs or contact our support team for assistance
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/faqs">
                  <HelpCircle className="mr-2 h-4 w-4" />
                  View FAQs
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href={`mailto:${contact?.email || "imranmat254@gmail.com"}?subject=I%20need%20help`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
