import { Logo } from "@/components/Logo";
import arquivetLogo from "@/assets/logo-arquivet.svg";
import hotpayLogo from "@/assets/logo-hotpay.png";
const Footer = () => {
  return <footer className="bg-foreground/5 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center justify-start gap-6 mb-4">
              <Logo className="h-12 w-auto md:h-14" />
              <a href="https://arquivet.pl/" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity">
                <img src={arquivetLogo} alt="Arquivet" className="h-[28px] w-auto md:h-[32px]" />
                <span className="text-muted-foreground text-[6px] md:text-[7px] font-medium uppercase tracking-wide mt-1">Partner strategiczny</span>
              </a>
              <a href="https://hotpay.pl" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center hover:opacity-80 transition-opacity">
                <img src={hotpayLogo} alt="HotPay" className="h-[18px] w-auto md:h-[22px]" />
                <span className="text-muted-foreground text-[6px] md:text-[7px] font-medium uppercase tracking-wide mt-[11px] md:mt-[11px]">Operator płatności</span>
              </a>
            </div>
            <p className="text-muted-foreground max-w-md">Platforma umożliwiająca wspieranie zwierząt i organizacji poprzez zakup potrzebnych produktów.</p>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Nawigacja</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/o-nas" className="hover:text-primary-dark transition-colors">O nas</a></li>
              <li><a href="/#jak-to-dziala" className="hover:text-primary-dark transition-colors">Jak to działa?</a></li>
              <li><a href="/organizacje" className="hover:text-primary-dark transition-colors">Organizacje</a></li>
              <li><a href="/kontakt" className="hover:text-primary-dark transition-colors">Kontakt</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-foreground mb-4">Pomoc</h4>
            <ul className="space-y-2 text-muted-foreground">
              <li><a href="/faq" className="hover:text-primary-dark transition-colors">FAQ</a></li>
              <li><a href="/regulamin" className="hover:text-primary-dark transition-colors">Regulamin</a></li>
              <li><a href="/prywatnosc" className="hover:text-primary-dark transition-colors">Prywatność</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 text-center text-muted-foreground space-y-2">
          <p>&copy; 2024 Pączki w Maśle. Wszystkie prawa zastrzeżone.</p>
          <p className="text-sm">
            Stworzone przez{" "}
            <a href="https://magdalenaminor.com" target="_blank" rel="noopener noreferrer" className="text-primary-dark hover:underline">
              Magdalenę Minor
            </a>
          </p>
        </div>
      </div>
    </footer>;
};
export default Footer;