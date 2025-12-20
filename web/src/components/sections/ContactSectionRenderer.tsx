import { ContactSectionData } from "@/lib/page-types";
import { Mail, Phone, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function ContactSectionRenderer({ data }: { data: ContactSectionData }) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <section
      className="py-16 md:py-24"
      style={{ backgroundColor: data.background_color }}
    >
      <div className="container">
        {/* Header */}
        <div className="text-center">
          {data.subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide text-accent">
              {data.subtitle}
            </p>
          )}
          <h2 className="mt-2 text-3xl font-bold text-foreground md:text-4xl">
            {data.title}
          </h2>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-2">
          {/* Contact Info */}
          {data.show_info && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <Mail className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <p className="mt-1 text-muted-foreground">{data.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <Phone className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Phone</h3>
                  <p className="mt-1 text-muted-foreground">{data.phone}</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <MapPin className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="font-semibold text-foreground">Address</h3>
                  <p className="mt-1 text-muted-foreground">{data.address}</p>
                </div>
              </div>

              {data.show_map && data.map_url && (
                <iframe
                  src={data.map_url}
                  className="mt-6 h-64 w-full rounded-lg"
                  loading="lazy"
                />
              )}
            </div>
          )}

          {/* Contact Form */}
          {data.show_form && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input placeholder="Your Name" required />
              <Input type="email" placeholder="Your Email" required />
              <Input placeholder="Subject" required />
              <Textarea placeholder="Your Message" rows={5} required />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
