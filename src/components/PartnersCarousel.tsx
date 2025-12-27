import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useRef } from "react";

interface Partner {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
}

const PartnersCarousel = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: partners = [] } = useQuery({
    queryKey: ["partners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("partners")
        .select("*")
        .eq("active", true)
        .order("display_order", { ascending: true });

      if (error) throw error;
      return data as Partner[];
    },
  });

  // Auto-scroll effect
  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (!scrollContainer || partners.length === 0) return;

    let animationId: number;
    let scrollPosition = 0;
    const scrollSpeed = 0.5;

    const scroll = () => {
      scrollPosition += scrollSpeed;
      
      // Reset when we've scrolled through half (since we duplicate the content)
      const halfWidth = scrollContainer.scrollWidth / 2;
      if (scrollPosition >= halfWidth) {
        scrollPosition = 0;
      }
      
      scrollContainer.scrollLeft = scrollPosition;
      animationId = requestAnimationFrame(scroll);
    };

    animationId = requestAnimationFrame(scroll);

    // Pause on hover
    const handleMouseEnter = () => cancelAnimationFrame(animationId);
    const handleMouseLeave = () => {
      animationId = requestAnimationFrame(scroll);
    };

    scrollContainer.addEventListener("mouseenter", handleMouseEnter);
    scrollContainer.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      cancelAnimationFrame(animationId);
      scrollContainer.removeEventListener("mouseenter", handleMouseEnter);
      scrollContainer.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [partners]);

  if (partners.length === 0) return null;

  // Duplicate partners for seamless loop
  const duplicatedPartners = [...partners, ...partners];

  return (
    <section className="py-12 md:py-16 bg-muted/30">
      <div className="md:container md:mx-auto md:max-w-6xl md:px-8 px-4">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-foreground mb-8">
          Nasi Partnerzy
        </h2>
        
        <div 
          ref={scrollRef}
          className="overflow-hidden"
          style={{ scrollBehavior: 'auto' }}
        >
          <div className="flex gap-8 md:gap-12 items-center">
            {duplicatedPartners.map((partner, index) => (
              <a
                key={`${partner.id}-${index}`}
                href={partner.website_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-shrink-0 grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <div className="flex flex-col items-center gap-2 min-w-[120px] md:min-w-[150px]">
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="h-12 md:h-16 w-auto object-contain max-w-[120px] md:max-w-[150px]"
                    />
                  ) : (
                    <div className="h-12 md:h-16 w-24 md:w-32 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">{partner.name}</span>
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground font-medium">
                    {partner.name}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PartnersCarousel;
