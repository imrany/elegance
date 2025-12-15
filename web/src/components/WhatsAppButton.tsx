import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSiteSetting } from "@/hooks/useSiteSetting";

export function WhatsAppButton() {
  const { data: setting, isLoading } = useSiteSetting("whatsapp");
  const value = (() => {
    if (typeof setting?.value === "string" && setting) {
      try {
        return JSON.parse(setting?.value);
      } catch (e) {
        console.error("Error parsing store settings value:", e);
        return null;
      }
    }
    return null;
  })();
  const phone = value?.["phone"];
  const message =
    value?.["message"] || "Hello! I am interested in your products.";
  const whatsappUrl = `https://wa.me/${phone?.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <>
      {setting && phone && !isLoading && (
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
