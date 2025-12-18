import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { faqCategories } from "@/lib/utils";
import { useGeneralContext } from "@/contexts/GeneralContext";

export function FAQsPage() {
  const { websiteConfig } = useGeneralContext();
  const contact = websiteConfig?.contact;
  const searchUrlQuery = useLocation().search;
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>(["faq-0"]);

  const filteredFaqs = faqCategories
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    }))
    .filter((category) => category.faqs.length > 0);

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(searchUrlQuery);
    const initialSearchQuery = urlParams.get("search") || "";
    setSearchQuery(initialSearchQuery);

    scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [searchUrlQuery]);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-secondary/30 to-background py-16 md:py-24">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-accent/10 p-4">
                <HelpCircle className="h-12 w-12 text-accent" />
              </div>
            </div>
            <h1 className="font-serif text-4xl font-light text-foreground md:text-5xl mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Find answers to common questions about orders, shipping, returns,
              and more
            </p>

            {/* Search */}
            <div className="relative mx-auto max-w-2xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-14 pl-12 text-base"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQs Content */}
      <section className="py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            {filteredFaqs.length === 0 ? (
              <Card className="p-12 text-center">
                <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground">
                  Try different keywords or browse all categories below
                </p>
              </Card>
            ) : (
              <div className="space-y-8">
                {filteredFaqs.map((category, categoryIndex) => (
                  <div key={categoryIndex}>
                    <div className="mb-6 flex items-center gap-3">
                      <div className="rounded-lg bg-accent/10 p-2">
                        <category.icon className="h-5 w-5 text-accent" />
                      </div>
                      <h2 className="text-2xl font-semibold text-foreground">
                        {category.title}
                      </h2>
                    </div>

                    <div className="space-y-3">
                      {category.faqs.map((faq, faqIndex) => {
                        const itemId = `faq-${categoryIndex}-${faqIndex}`;
                        return (
                          <Collapsible
                            key={itemId}
                            open={openItems.includes(itemId)}
                            onOpenChange={() => toggleItem(itemId)}
                          >
                            <Card className="overflow-hidden transition-shadow hover:shadow-md">
                              <CollapsibleTrigger className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-secondary/50">
                                <span className="font-medium text-foreground pr-4">
                                  {faq.question}
                                </span>
                                <ChevronDown
                                  className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform ${
                                    openItems.includes(itemId)
                                      ? "rotate-180"
                                      : ""
                                  }`}
                                />
                              </CollapsibleTrigger>
                              <CollapsibleContent className="border-t border-border">
                                <div className="p-4 text-muted-foreground leading-relaxed">
                                  {faq.answer}
                                </div>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className="py-16 bg-secondary/30">
        <div className="container">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-semibold mb-4">Still need help?</h2>
            <p className="text-muted-foreground mb-8">
              Can't find what you're looking for? Our support team is here to
              help
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" asChild>
                <a
                  href={`mailto:${contact?.email || "imranmat254@gmail.com"}?subject=I%20need%20help`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/guide">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Guides
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
