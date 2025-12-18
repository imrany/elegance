import { Layout } from "@/components/layout/Layout";
import { useGeneralContext } from "@/contexts/GeneralContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Mail, Phone, MapPin, Clock, Send, Check } from "lucide-react";
import { useEffect, useState } from "react";

export default function AboutUs() {
  const { websiteConfig } = useGeneralContext();
  const about = websiteConfig?.about;
  const store = websiteConfig?.store;
  const contact = websiteConfig?.contact;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    const message = `
      Hello ${store?.name || ""},

      I'm ${formData.name},
      ${formData.message}
      `;
    window.location.href = `mailto:${contact?.email}?cc=imranmat254@gmail.com&subject=${formData.subject}&body=${message}`;

    setIsSubmitting(false);
    setIsSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({ name: "", email: "", subject: "", message: "" });
      setIsSubmitted(false);
    }, 3000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, []);
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-secondary py-24">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium tracking-luxury uppercase text-accent">
              {store?.name || "Our Story"}
            </p>
            <h1 className="mt-4 font-serif text-4xl font-light text-foreground md:text-5xl">
              {about?.title || "About Us"}
            </h1>
            <p className="mt-4 text-base text-muted-foreground">
              {about?.description || store?.description || ""}
            </p>
          </div>
        </div>
      </section>

      {/* Image & Features Section */}
      {about?.image && (
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
              {/* Image */}
              <div className="order-2 lg:order-1">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
                  <img
                    src={about.image}
                    alt={about.title}
                    className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>
              </div>

              {/* Features List */}
              <div className="order-1 lg:order-2 space-y-8">
                <div>
                  <h2 className="font-serif text-3xl font-light text-foreground mb-4">
                    What Makes Us Different
                  </h2>
                  <p className="text-muted-foreground">
                    Our commitment to excellence sets us apart
                  </p>
                </div>

                <div className="space-y-4">
                  {(about?.features || []).map((feature, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 rounded-lg bg-secondary/50"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10">
                          <Check className="h-4 w-4 text-accent" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{feature}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Contact Us Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-12 lg:grid-cols-2">
              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="font-serif text-3xl font-light text-foreground md:text-4xl mb-4">
                    {contact?.title || "Get In Touch"}
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    {contact?.subtitle ||
                      "We'd love to hear from you. Send us a message and we'll respond as soon as possible."}
                  </p>
                </div>

                <div className="space-y-6">
                  {/* Email */}
                  {contact?.email && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <Mail className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Email Us
                        </h3>
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-muted-foreground hover:text-accent transition-colors"
                        >
                          {contact.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Phone */}
                  {contact?.phone && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <Phone className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Call Us
                        </h3>
                        <a
                          href={`tel:${contact.phone}`}
                          className="text-muted-foreground hover:text-accent transition-colors"
                        >
                          {contact.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Address */}
                  {contact?.address && (
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                        <MapPin className="h-5 w-5 text-accent" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          Visit Us
                        </h3>
                        <p className="text-muted-foreground">
                          {contact.address}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Business Hours */}
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent/10">
                      <Clock className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">
                        Business Hours
                      </h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* Map */}
                {contact?.show_map && contact?.map_url && (
                  <div className="rounded-lg overflow-hidden border border-border shadow-lg">
                    <iframe
                      src={contact.map_url}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              {/* Contact Form */}
              <Card className="p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
                      Your Name *
                    </label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      disabled={isSubmitting || isSubmitted}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
                      Email Address *
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                      disabled={isSubmitting || isSubmitted}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="subject"
                      className="text-sm font-medium text-foreground"
                    >
                      Subject *
                    </label>
                    <Input
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help you?"
                      required
                      disabled={isSubmitting || isSubmitted}
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="message"
                      className="text-sm font-medium text-foreground"
                    >
                      Message *
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us more about your inquiry..."
                      rows={5}
                      required
                      disabled={isSubmitting || isSubmitted}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting || isSubmitted}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending...
                      </>
                    ) : isSubmitted ? (
                      <>
                        <Check className="mr-2 h-4 w-4" />
                        Message Sent!
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Send Message
                      </>
                    )}
                  </Button>

                  {isSubmitted && (
                    <div className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-center">
                      <p className="text-sm text-green-600 dark:text-green-400">
                        Thank you for reaching out! We'll get back to you soon.
                      </p>
                    </div>
                  )}
                </form>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-accent text-accent-foreground">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-light md:text-4xl mb-4">
              Ready to Experience Excellence?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join thousands of satisfied customers who trust us for quality and
              service
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-background text-foreground hover:bg-background/90"
                onClick={() => (window.location.href = "/products")}
              >
                Browse Products
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-accent-foreground/30 bg-transparent text-accent-foreground hover:bg-accent-foreground hover:text-accent"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                Back to Top
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
