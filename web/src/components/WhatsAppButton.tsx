import { useQuery } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export function WhatsAppButton() {
  const { data: settings } = useQuery({
    queryKey: ["whatsapp-settings"],
    queryFn: async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "whatsapp")
        .maybeSingle();
      return data?.value as { phone: string; message: string } | null;
    },
  });

  const phone = settings?.phone || "+254700000000";
  const message = settings?.message || "Hello! I am interested in your products.";

  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50"
    >
      <Button
        size="sm"
        className="h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#20BA5C]"
      >
        <MessageCircle className="h-6 w-6" />
        <span className="sr-only">Chat on WhatsApp</span>
      </Button>
    </a>
  );
}
