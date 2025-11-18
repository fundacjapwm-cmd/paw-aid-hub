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
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Partnerzy
          </h2>
          <p className="text-muted-foreground">
            Współpracujemy z najlepszymi organizacjami i specjalistami
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {partners.map((partner, index) => (
            <a
              key={index}
              href={partner.url}
              className="bg-card rounded-2xl p-8 shadow-card hover:shadow-bubbly transition-all duration-300 hover:-translate-y-1 flex items-center justify-center text-center group"
            >
              <div>
                <Heart className="h-12 w-12 text-primary mx-auto mb-3 group-hover:fill-primary transition-all" />
                <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">
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