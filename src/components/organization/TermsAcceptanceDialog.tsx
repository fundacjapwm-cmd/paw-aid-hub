import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { FileText, Scale, ShoppingCart, Package, CreditCard, AlertCircle, LogOut, Check } from "lucide-react";

interface TermsAcceptanceDialogProps {
  organizationId: string;
  onAccepted: () => void;
}

export default function TermsAcceptanceDialog({ organizationId, onAccepted }: TermsAcceptanceDialogProps) {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          const { scrollTop, scrollHeight, clientHeight } = viewport;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;
          if (isAtBottom) {
            setHasScrolledToBottom(true);
          }
        }
      }
    };

    const viewport = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (viewport) {
      viewport.addEventListener('scroll', handleScroll);
      return () => viewport.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleReject = async () => {
    await signOut();
    navigate("/");
    toast.info("Wylogowano. Aby korzystać z panelu organizacji, musisz zaakceptować regulamin.");
  };

  const handleAccept = async () => {
    if (!user) return;
    
    setIsAccepting(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          terms_accepted_at: new Date().toISOString(),
          terms_accepted_by: user.id,
        })
        .eq("id", organizationId);

      if (error) throw error;

      toast.success("Regulamin i umowa pośrednictwa zostały zaakceptowane");
      onAccepted();
    } catch (error: any) {
      toast.error("Błąd podczas akceptacji regulaminu: " + error.message);
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Header */}
      <div className="border-b bg-card p-4 md:p-6 text-center shrink-0">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Akceptacja Regulaminu i Umowy Pośrednictwa
        </h1>
        <p className="text-muted-foreground mt-2">
          Przeczytaj poniższy regulamin i przewiń do końca, aby móc go zaakceptować
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-hidden p-4 md:p-6">
        <Card className="h-full max-w-4xl mx-auto">
          <ScrollArea ref={scrollAreaRef} className="h-full">
            <div className="p-6 md:p-8 space-y-8">
              {/* Section 1 */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 1. Postanowienia ogólne
                    </h2>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>Niniejszy Regulamin określa zasady korzystania z platformy internetowej Pączki w Maśle (dalej: "Platforma").</li>
                      <li>Administratorem Platformy jest <strong>Fundacja Pączki w Maśle</strong> z siedzibą pod adresem: Maciejów 6, 34-325 Bierna (KRS: 0001171916, NIP: 5532598992, REGON: 541682360) - dalej: "Administrator", "Fundacja" lub "Pośrednik".</li>
                      <li>Fundacja pełni rolę pośrednika między osobami chcącymi wspierać zwierzęta (Użytkownikami) a organizacjami opiekującymi się zwierzętami (Organizacjami).</li>
                      <li>Środki wpłacone przez Użytkowników przeznaczane są na zakup produktów dla zwierząt oraz pokrycie kosztów ich dostawy.</li>
                      <li>Korzystanie z Platformy oznacza akceptację niniejszego Regulaminu.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Section 2 - Definitions */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 2. Definicje
                    </h2>
                    <div className="space-y-2">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h3 className="font-semibold text-foreground text-sm">Organizacja</h3>
                        <p className="text-xs text-muted-foreground">
                          Fundacja, stowarzyszenie lub schronisko, które zostało zweryfikowane i dodane do Platformy przez Administratora.
                        </p>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h3 className="font-semibold text-foreground text-sm">Usługa Pośrednictwa</h3>
                        <p className="text-xs text-muted-foreground">
                          Usługa świadczona przez Fundację, polegająca na zakupie produktów wybranych przez Użytkownika od dostawców oraz ich dostarczeniu do wskazanej Organizacji.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 - Platform Usage */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <ShoppingCart className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 3. Zasady korzystania z Platformy
                    </h2>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>Korzystanie z podstawowych funkcji Platformy nie wymaga rejestracji.</li>
                      <li>Dokonanie zakupu wymaga podania danych osobowych niezbędnych do realizacji transakcji.</li>
                      <li>Użytkownik zobowiązuje się do podawania prawdziwych danych i korzystania z Platformy zgodnie z prawem.</li>
                      <li>Administrator zastrzega sobie prawo do zablokowania dostępu w przypadku naruszenia Regulaminu.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Section 4 - Service Character */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Package className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 4. Charakter usługi i zasady realizacji
                    </h2>
                    <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-3">
                      <p className="text-sm text-muted-foreground">
                        <strong className="text-foreground">WAŻNE:</strong> Fundacja świadczy usługę pośrednictwa. Użytkownik zleca Fundacji zakup wybranych produktów i ich dostarczenie do Organizacji.
                      </p>
                    </div>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>Fundacja nabywa produkty od zweryfikowanych dostawców i dostarcza je do Organizacji.</li>
                      <li>Ceny produktów zawierają podatek VAT i koszty dostawy.</li>
                      <li>Czas realizacji wynosi standardowo 7-14 dni roboczych.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Section 4a - Organization Agreement - HIGHLIGHTED */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Scale className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 4a. Umowa pośrednictwa z Organizacjami
                    </h2>
                    <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-muted-foreground mb-2">
                        <strong className="text-foreground">WAŻNE:</strong> Każda Organizacja, która zgłasza się do współpracy lub zakłada konto na Platformie, zawiera z Fundacją <strong>umowę pośrednictwa</strong> i akceptuje niniejszy Regulamin jako integralną część tej umowy.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Rejestracja konta lub przesłanie formularza zgłoszeniowego jest równoznaczne z zawarciem umowy pośrednictwa na warunkach określonych w niniejszym Regulaminie.
                      </p>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">1. Zawarcie umowy:</h3>
                        <p className="text-xs text-muted-foreground ml-4">
                          Umowa pośrednictwa zostaje zawarta z chwilą aktywacji konta Organizacji na Platformie lub pozytywnej weryfikacji zgłoszenia.
                        </p>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">2. Obowiązki Organizacji:</h3>
                        <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                          <li>• Podawanie prawdziwych i aktualnych informacji o sobie i podopiecznych</li>
                          <li>• Prowadzenie aktualnych list potrzeb (wishlist)</li>
                          <li>• Przyjmowanie dostaw produktów w uzgodnionych terminach</li>
                          <li>• Wykorzystywanie produktów wyłącznie na cele statutowe</li>
                          <li>• Informowanie Fundacji o zmianach statusu zwierząt</li>
                          <li>• Przestrzeganie postanowień Regulaminu</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">3. Oświadczenia Organizacji:</h3>
                        <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                          <li>• Jest podmiotem legalnie działającym na terytorium RP</li>
                          <li>• Posiada status fundacji, stowarzyszenia lub schroniska</li>
                          <li>• Osoba zakładająca konto jest upoważniona do reprezentowania Organizacji</li>
                          <li>• Wszystkie podane informacje są prawdziwe i aktualne</li>
                          <li>• Zapoznała się z Regulaminem i akceptuje jego postanowienia</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">4. Odpowiedzialność Organizacji:</h3>
                        <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                          <li>• Organizacja ponosi pełną odpowiedzialność za prawdziwość podanych informacji</li>
                          <li>• Organizacja odpowiada za prawidłowe wykorzystanie otrzymanych produktów</li>
                          <li>• W przypadku nieprawdziwych informacji Fundacja może natychmiastowo rozwiązać umowę</li>
                        </ul>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold text-foreground text-sm mb-2">5. Rozwiązanie umowy:</h3>
                        <ul className="text-xs text-muted-foreground ml-4 space-y-1">
                          <li>• Przez każdą ze stron z 14-dniowym wypowiedzeniem</li>
                          <li>• Ze skutkiem natychmiastowym przez Fundację przy naruszeniu Regulaminu</li>
                          <li>• Wskutek likwidacji Organizacji lub zakończenia działalności statutowej</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 5 - Payments */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 5. Płatności
                    </h2>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>Płatności za usługę pośrednictwa realizowane są za pośrednictwem operatora HotPay.</li>
                      <li>Kwota wpłacona przez Użytkownika pokrywa koszt produktów oraz kosztów dostawy do Organizacji.</li>
                      <li>Fundacja wystawia potwierdzenie wpłaty na życzenie Użytkownika.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Section 6 - Complaints */}
              <section className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <AlertCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 6. Reklamacje
                    </h2>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>Reklamacje dotyczące działania Platformy można składać mailowo na adres kontakt@pączkiwmaśle.pl</li>
                      <li>Administrator rozpatruje reklamacje w terminie 14 dni roboczych.</li>
                      <li>Ze względu na charakter usługi (zakup produktów dla zwierząt), nie ma możliwości zwrotu zakupionych produktów.</li>
                      <li>W przypadku wadliwości dostarczonych produktów, Fundacja organizuje ich wymianę na koszt dostawcy.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Final section */}
              <section className="space-y-4 pb-8">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground mb-3">
                      § 7. Postanowienia końcowe
                    </h2>
                    <ol className="space-y-2 text-muted-foreground list-decimal ml-6 text-sm">
                      <li>W sprawach nieuregulowanych niniejszym Regulaminem mają zastosowanie przepisy prawa polskiego.</li>
                      <li>Administrator zastrzega sobie prawo do zmiany Regulaminu.</li>
                      <li>Regulamin wchodzi w życie z dniem publikacji na stronie internetowej.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Scroll indicator */}
              {!hasScrolledToBottom && (
                <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-transparent py-8 text-center">
                  <p className="text-sm text-muted-foreground animate-pulse">
                    ↓ Przewiń w dół, aby zobaczyć przyciski akceptacji ↓
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </Card>
      </div>

      {/* Footer with buttons */}
      <div className="border-t bg-card p-4 md:p-6 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={handleReject}
            className="gap-2"
          >
            <LogOut className="h-5 w-5" />
            Nie akceptuję (wyloguj)
          </Button>
          <Button
            size="lg"
            onClick={handleAccept}
            disabled={!hasScrolledToBottom || isAccepting}
            className="gap-2"
          >
            <Check className="h-5 w-5" />
            {isAccepting ? "Akceptowanie..." : hasScrolledToBottom ? "Akceptuję regulamin i umowę" : "Przewiń do końca, aby zaakceptować"}
          </Button>
        </div>
        {!hasScrolledToBottom && (
          <p className="text-center text-xs text-muted-foreground mt-3">
            Musisz przewinąć regulamin do końca, aby móc go zaakceptować
          </p>
        )}
      </div>
    </div>
  );
}
