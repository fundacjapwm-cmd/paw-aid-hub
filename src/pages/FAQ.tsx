import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, ShoppingCart, CreditCard, Package, Building2, Mail, Heart } from "lucide-react";

export default function FAQ() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <HelpCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Najczęściej zadawane pytania
          </h1>
          <p className="text-lg text-muted-foreground">
            Znajdź odpowiedzi na pytania dotyczące platformy Pączki w Maśle
          </p>
        </div>

        <Card className="p-8 md:p-12 space-y-8 shadow-bubbly border-0">
          {/* Sekcja: O platformie */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">O platformie</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-1" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czym jest Pączki w Maśle?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Pączki w Maśle to platforma charytatywna, która umożliwia bezpośrednie wspieranie schronisk, 
                  fundacji i organizacji prozwierzęcych poprzez zakup konkretnych produktów z ich list potrzeb. 
                  Każdy zakup to realna pomoc - produkty trafiają bezpośrednio do zwierząt i organizacji, 
                  które ich potrzebują.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jak działa platforma?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  <ol className="space-y-2 list-decimal ml-5">
                    <li>Wybierasz organizację lub konkretne zwierzę, które chcesz wesprzeć</li>
                    <li>Przeglądasz ich listę potrzeb (wishlistę) z konkretnymi produktami</li>
                    <li>Dodajesz wybrane produkty do koszyka i dokonujesz bezpiecznej płatności</li>
                    <li>My kupujemy produkty hurtowo od sprawdzonych dostawców</li>
                    <li>Produkty są dostarczane bezpośrednio do organizacji</li>
                    <li>Otrzymujesz potwierdzenie realizacji wsparcia</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy muszę mieć konto, żeby wesprzeć organizację?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Nie, założenie konta nie jest wymagane. Możesz dokonać zakupu jako gość, podając tylko podstawowe 
                  dane potrzebne do realizacji (email do potwierdzenia). Jednak posiadanie konta pozwala śledzić 
                  historię wsparcia i otrzymywać aktualizacje o organizacjach, które wspierasz.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Skąd pochodzą organizacje na platformie?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Wszystkie organizacje na platformie zostały zweryfikowane przez nasz zespół. Sprawdzamy dokumenty 
                  rejestrowe (KRS, NIP), weryfikujemy ich działalność oraz przeglądamy opinie o organizacji. 
                  Na platformę trafiają tylko zaufane fundacje, stowarzyszenia i schroniska.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sekcja: Zakupy i płatności */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Zakupy i płatności</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-5" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jakie metody płatności są dostępne?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Akceptujemy płatności elektroniczne za pośrednictwem PayU:
                  <ul className="mt-2 space-y-1 ml-5">
                    <li>• Przelewy online (przelewy24, mBank, ING, PKO BP i inne)</li>
                    <li>• Karty płatnicze (Visa, Mastercard)</li>
                    <li>• BLIK</li>
                  </ul>
                  Wszystkie płatności są szyfrowane i w pełni bezpieczne.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-6" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy moje dane płatności są bezpieczne?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Tak! Wszystkie płatności są obsługiwane przez PayU S.A., licencjonowanego operatora płatności. 
                  Nie przechowujemy danych kart płatniczych. Połączenie jest szyfrowane certyfikatem SSL. 
                  Platforma jest zgodna z wymogami RODO i PCI DSS.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-7" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy mogę anulować lub zmienić zamówienie?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Ze względu na charakter charytatywny platformy, po dokonaniu płatności zamówienie nie może być 
                  anulowane zgodnie z art. 38 pkt 12 ustawy o prawach konsumenta. Przed płatnością dokładnie 
                  sprawdź wybrane produkty. W szczególnych przypadkach skontaktuj się z nami: 
                  <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline ml-1">
                    fundacjapwm@gmail.com
                  </a>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-8" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy otrzymam fakturę?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Po zrealizowaniu płatności otrzymasz potwierdzenie zamówienia na podany adres email. 
                  Faktury wystawiamy na życzenie - wystarczy o to poprosić w wiadomości po złożeniu zamówienia.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-9" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy mogę wesprzeć więcej niż jedną organizację naraz?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Tak! Możesz dodać produkty z list potrzeb różnych organizacji i zwierząt do jednego koszyka. 
                  Zrealizujesz wszystko w ramach jednej płatności, a my zadbamy o to, żeby każda organizacja 
                  otrzymała odpowiednie produkty.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sekcja: Realizacja i dostawa */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Realizacja i dostawa</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-10" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jak długo trwa realizacja wsparcia?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Standardowo realizacja trwa 7-14 dni roboczych. Zbieramy zamówienia i realizujemy je zbiorczo, 
                  co pozwala nam obniżyć koszty i skierować więcej środków bezpośrednio na pomoc zwierzętom. 
                  Otrzymasz powiadomienie email, gdy produkty dotrą do organizacji.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-11" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy otrzymam zakupione produkty do domu?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Nie. Produkty zakupione przez platformę trafiają bezpośrednio do organizacji i zwierząt. 
                  To forma wsparcia charytatywnego - kupujesz konkretną pomoc dla potrzebujących, nie towary 
                  dla siebie. Jeśli chcesz coś dla swojego pupila, skontaktuj się bezpośrednio z dostawcami.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-12" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Skąd będę wiedzieć, że wsparcie dotarło?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Po zrealizowaniu dostawy do organizacji otrzymasz powiadomienie email z potwierdzeniem. 
                  Jeśli masz konto, możesz śledzić status wszystkich swoich wsparć w historii zamówień. 
                  Dodatkowo organizacje często dzielą się zdjęciami i relacjami z wykorzystania darów.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-13" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Co jeśli produkt jest niedostępny?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  W przypadku braku dostępności produktu skontaktujemy się z Tobą mailowo, aby zaproponować 
                  zamiennik lub zwrot środków za niedostępną pozycję. Organizacje aktualizują swoje listy 
                  potrzeb, więc zazwyczaj są to produkty dostępne u naszych dostawców.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sekcja: Dla organizacji */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Dla organizacji</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-14" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jak dołączyć moją organizację do platformy?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Aby dołączyć do platformy, wypełnij formularz zgłoszeniowy dostępny w sekcji 
                  <a href="/kontakt" className="text-primary hover:underline mx-1">Kontakt</a>
                  lub napisz bezpośrednio na adres: 
                  <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline ml-1">
                    fundacjapwm@gmail.com
                  </a>. 
                  Proces weryfikacji trwa 2-5 dni roboczych. Potrzebujemy: dokumentów rejestrowych (KRS/zaświadczenie), 
                  danych kontaktowych oraz informacji o działalności.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-15" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy korzystanie z platformy jest płatne dla organizacji?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Nie! Platforma jest całkowicie bezpłatna dla organizacji. Nie pobieramy żadnych prowizji ani 
                  opłat. Naszym celem jest maksymalizacja wsparcia trafiającego do zwierząt, dlatego pokrywamy 
                  koszty działania platformy z własnych środków i dotacji.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-16" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jak zarządzam listą potrzeb mojej organizacji?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Po weryfikacji otrzymasz dostęp do panelu organizacji, gdzie możesz:
                  <ul className="mt-2 space-y-1 ml-5">
                    <li>• Dodawać i edytować profile zwierząt</li>
                    <li>• Tworzyć i aktualizować listy potrzeb dla zwierząt i organizacji</li>
                    <li>• Śledzić status otrzymanych wsparć</li>
                    <li>• Zarządzać dostawami i zamówieniami</li>
                    <li>• Aktualizować dane kontaktowe i opis organizacji</li>
                  </ul>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-17" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Co jeśli brakuje produktu, którego potrzebuję?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  W panelu organizacji znajdziesz opcję "Zgłoś produkt". Możesz zaproponować dodanie nowego 
                  produktu do bazy, podając nazwę, link do produktu u dostawcy oraz uzasadnienie potrzeby. 
                  Nasz zespół oceni zgłoszenie i w miarę możliwości doda produkt do oferty w ciągu 3-7 dni.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Sekcja: Inne pytania */}
          <section className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Inne pytania</h2>
            </div>
            
            <Accordion type="single" collapsible className="space-y-3">
              <AccordionItem value="item-18" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy mogę przekazać darowiznę pieniężną zamiast kupować produkty?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Obecnie platforma skupia się na zakupie konkretnych produktów z list potrzeb, co gwarantuje, 
                  że wsparcie trafia dokładnie tam, gdzie jest najbardziej potrzebne. Jeśli chcesz przekazać 
                  darowiznę pieniężną, skontaktuj się bezpośrednio z wybraną organizacją - ich dane znajdziesz 
                  na ich profilu (dostępne dla zalogowanych użytkowników).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-19" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Czy mogę odliczyć wsparcie od podatku?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Wsparcie przez naszą platformę ma charakter zakupu produktów, a nie bezpośredniej darowizny, 
                  dlatego nie stanowi podstawy do odliczenia od podatku. Jeśli zależy Ci na odliczeniu podatkowym, 
                  rozważ bezpośrednie przekazanie darowizny pieniężnej na konto organizacji pożytku publicznego (OPP).
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-20" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Jak mogę śledzić, ile zwierząt już wsparłem?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Po założeniu konta w sekcji "Profil" znajdziesz pełną historię swoich wsparć - liczbę wspartych 
                  zwierząt, organizacje, które wsparłeś, oraz łączną wartość pomocy. To świetna motywacja i 
                  podsumowanie Twojego pozytywnego wpływu!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-21" className="border rounded-xl px-6 bg-muted/30">
                <AccordionTrigger className="hover:no-underline">
                  <span className="text-left font-semibold">Co zrobić, jeśli mam problem techniczny?</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pt-2">
                  Jeśli napotkasz problemy techniczne (błędy płatności, problemy z logowaniem, błędne wyświetlanie), 
                  skontaktuj się z naszym wsparciem technicznym:
                  <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline ml-1">
                    fundacjapwm@gmail.com
                  </a>. 
                  Opisz dokładnie problem, dołącz zrzut ekranu jeśli to możliwe, i podaj przeglądarkę, z której 
                  korzystasz. Odpowiadamy w ciągu 24 godzin.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Kontakt */}
          <section className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20 mt-8">
            <h2 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              Nie znalazłeś odpowiedzi na swoje pytanie?
            </h2>
            <p className="text-muted-foreground mb-4">
              Skontaktuj się z nami, a chętnie pomożemy!
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href="mailto:fundacjapwm@gmail.com"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
              >
                <Mail className="h-4 w-4" />
                Napisz do nas
              </a>
              <a 
                href="/kontakt"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-background border-2 border-border rounded-xl hover:bg-muted transition-colors font-medium"
              >
                Formularz kontaktowy
              </a>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}