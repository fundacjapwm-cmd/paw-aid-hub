import { Heart } from "lucide-react";

const PartnersSection = () => {
  const partners = [
    { name: "Przychodnia weterynaryjna Górska", url: "#" },
    { name: "Fundacja Most Nadziei", url: "#" },
    { name: "Stowarzyszenie Futrzany Los", url: "#" },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 md:mb-4">
            Partnerzy
          </h2>
          <p className="text-base md:text-lg text-muted-foreground">
            Współpracujemy z najlepszymi organizacjami i specjalistami
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.url}
              className="bg-card rounded-2xl p-6 sm:p-8 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-1 flex items-center justify-center text-center group"
            >
              <div>
                <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-primary mx-auto mb-2 md:mb-3 group-hover:fill-primary transition-all" />
                <h3 className="text-sm sm:text-base font-bold text-foreground group-hover:text-primary transition-colors">
                  {partner.name}
                </h3>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;