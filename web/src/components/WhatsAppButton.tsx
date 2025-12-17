import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useGeneralContext } from "@/contexts/GeneralContext";

export function WhatsAppButton() {
  const { websiteConfig } = useGeneralContext();
  const whatsapp = websiteConfig?.whatsapp;
  const phone = whatsapp?.["phone"];
  const message =
    whatsapp?.["message"] || "Hello! I am interested in your products.";
  const whatsappUrl = `https://wa.me/${phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {whatsapp && phone && (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-40"
        >
          <Button
            size="sm"
            className="h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20BA5C]"
          >
            <MessageCircle className="h-6 w-6" />
            <span className="sr-only">Chat on WhatsApp</span>
          </Button>
        </a>
      )}
    </>
  );
}
