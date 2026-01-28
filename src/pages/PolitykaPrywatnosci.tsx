import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, Eye, Database, UserCheck, Cookie, Settings } from "lucide-react";
import { CookieSettingsManager } from "@/components/CookieSettingsManager";

export default function PolitykaPrywatnosci() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-20">
      <div className="md:container md:mx-auto md:px-8 md:max-w-4xl px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <Shield className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Polityka Prywatności
          </h1>
          <p className="text-lg text-muted-foreground">
            Zgodnie z RODO - ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Card className="p-8 md:p-12 space-y-8 shadow-bubbly border-0">
          {/* Sekcja 1 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  1. Administrator danych osobowych
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-3">
                  Administratorem danych osobowych jest <strong>Fundacja Pączki w Maśle</strong> z siedzibą pod adresem: <strong>Maciejów 6, 34-325 Bierna</strong>.
                </p>
                <div className="bg-muted/30 rounded-xl p-4 text-sm text-muted-foreground space-y-1">
                  <p><strong>KRS:</strong> 0001171916</p>
                  <p><strong>NIP:</strong> 5532598992</p>
                  <p><strong>REGON:</strong> 541682360</p>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-3">
                  Możesz skontaktować się z nami pod adresem email: <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline">fundacjapwm@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* Sekcja 2 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  2. Zakres przetwarzania danych
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  W ramach świadczonych usług przetwarzamy następujące kategorie danych osobowych:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dane identyfikacyjne:</strong> imię, nazwisko, adres email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dane kontaktowe:</strong> numer telefonu, adres korespondencyjny (opcjonalnie)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dane transakcyjne:</strong> historia zakupów, kwoty płatności, metody płatności</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dane organizacji:</strong> nazwa, NIP, REGON, adres siedziby (dla organizacji partnerskich)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dane techniczne:</strong> adres IP, informacje o urządzeniu, dane logowania</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sekcja 3 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  3. Cele i podstawy prawne przetwarzania
                </h2>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">a) Realizacja zamówień</h3>
                    <p className="text-sm text-muted-foreground">
                      Podstawa prawna: Art. 6 ust. 1 lit. b) RODO - wykonanie umowy
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">b) Marketing i newsletter</h3>
                    <p className="text-sm text-muted-foreground">
                      Podstawa prawna: Art. 6 ust. 1 lit. a) RODO - zgoda (możliwość wycofania w każdej chwili)
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">c) Obowiązki prawne i księgowe</h3>
                    <p className="text-sm text-muted-foreground">
                      Podstawa prawna: Art. 6 ust. 1 lit. c) RODO - wypełnienie obowiązku prawnego
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">d) Prawnie uzasadniony interes administratora</h3>
                    <p className="text-sm text-muted-foreground">
                      Podstawa prawna: Art. 6 ust. 1 lit. f) RODO - dochodzenie roszczeń, zapobieganie nadużyciom
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 4 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  4. Odbiorcy danych
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Twoje dane osobowe mogą być udostępniane następującym kategoriom odbiorców:
                </p>
                <ul className="space-y-2 text-muted-foreground ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Operatorzy płatności:</strong> PayU S.A. - w celu realizacji płatności</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dostawcy usług IT:</strong> hosting, bazy danych (Lovable Cloud/Supabase)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Firmy kurierskie:</strong> w zakresie niezbędnym do dostawy produktów</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Dostawcy usług mailingowych:</strong> Resend - w celu wysyłki powiadomień email</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Organizacje partnerskie:</strong> w zakresie niezbędnym do realizacji wsparcia</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Sekcja 4a - Przekazywanie danych poza EOG */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  4a. Przekazywanie danych poza Europejski Obszar Gospodarczy
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  W związku z korzystaniem z usług zewnętrznych dostawców, Twoje dane osobowe mogą być przekazywane poza Europejski Obszar Gospodarczy (EOG):
                </p>
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">PayU S.A.</h3>
                    <p className="text-sm text-muted-foreground">
                      Operator płatności z siedzibą w Polsce (ul. Grunwaldzka 186, 60-166 Poznań). 
                      Dane przetwarzane są na terenie EOG. PayU S.A. jest podmiotem nadzorowanym przez Komisję Nadzoru Finansowego.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Resend (dostawca usług mailingowych)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Resend, Inc. jest spółką z siedzibą w Stanach Zjednoczonych. Przekazywanie danych do USA odbywa się 
                      na podstawie Standardowych Klauzul Umownych (SCC) zatwierdzonych przez Komisję Europejską, 
                      zapewniających odpowiedni poziom ochrony danych osobowych.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Zakres przekazywanych danych: adres email, treść wiadomości systemowych (potwierdzenia zamówień, powiadomienia).
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Lovable Cloud / Supabase (hosting i bazy danych)</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Usługi hostingowe świadczone przez Supabase Inc. (USA). Przekazywanie danych odbywa się na podstawie 
                      Standardowych Klauzul Umownych (SCC) oraz dodatkowych zabezpieczeń technicznych (szyfrowanie end-to-end).
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Serwery zlokalizowane są w regionie EU (Frankfurt), co minimalizuje transfer danych poza EOG.
                    </p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  We wszystkich przypadkach przekazywania danych poza EOG stosujemy odpowiednie zabezpieczenia prawne 
                  zgodne z art. 46 RODO, w tym Standardowe Klauzule Umowne zatwierdzone przez Komisję Europejską.
                </p>
              </div>
            </div>
          </section>

          {/* Sekcja 5 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  5. Twoje prawa
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Zgodnie z RODO przysługują Ci następujące prawa:
                </p>
                <div className="space-y-3">
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo dostępu do danych</h3>
                    <p className="text-sm text-muted-foreground">Możesz uzyskać informacje o przetwarzanych danych</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo do sprostowania</h3>
                    <p className="text-sm text-muted-foreground">Możesz poprawić nieprawidłowe dane</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo do usunięcia danych</h3>
                    <p className="text-sm text-muted-foreground">"Prawo do bycia zapomnianym"</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo do ograniczenia przetwarzania</h3>
                    <p className="text-sm text-muted-foreground">W określonych sytuacjach</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo do przenoszenia danych</h3>
                    <p className="text-sm text-muted-foreground">Otrzymanie danych w ustrukturyzowanym formacie</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo sprzeciwu</h3>
                    <p className="text-sm text-muted-foreground">Wobec przetwarzania w celach marketingowych</p>
                  </div>
                  <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-4">
                    <h3 className="font-semibold text-foreground mb-1">Prawo do cofnięcia zgody</h3>
                    <p className="text-sm text-muted-foreground">W dowolnym momencie bez wpływu na zgodność z prawem</p>
                  </div>
                </div>
                <p className="text-muted-foreground leading-relaxed mt-4">
                  Aby skorzystać z powyższych praw, skontaktuj się z nami: <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline font-medium">fundacjapwm@gmail.com</a>
                </p>
              </div>
            </div>
          </section>

          {/* Sekcja 6 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              6. Okres przechowywania danych
            </h2>
            <ul className="space-y-2 text-muted-foreground ml-4">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Dane transakcyjne:</strong> 5 lat od końca roku podatkowego (zgodnie z przepisami podatkowymi)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Dane marketingowe:</strong> do momentu wycofania zgody lub wniesienia sprzeciwu</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span><strong>Dane konta użytkownika:</strong> do czasu usunięcia konta lub braku aktywności przez 3 lata</span>
              </li>
            </ul>
          </section>

          {/* Sekcja 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              7. Bezpieczeństwo danych
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Stosujemy odpowiednie środki techniczne i organizacyjne zapewniające bezpieczeństwo przetwarzanych danych, w tym:
            </p>
            <ul className="space-y-2 text-muted-foreground ml-4 mt-3">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Szyfrowanie połączeń SSL/TLS</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Zabezpieczenie dostępu do systemów (uwierzytelnianie, role użytkowników)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Regularne kopie zapasowe danych</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Monitoring bezpieczeństwa i audyty</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Ograniczenie dostępu do danych osobowych tylko do upoważnionych osób</span>
              </li>
            </ul>
            
            <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mt-6">
              <h3 className="font-semibold text-foreground mb-3">Bezpieczeństwo u podmiotów współpracujących</h3>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Wszystkie podmioty przetwarzające dane osobowe na nasze zlecenie (podmioty przetwarzające) są starannie 
                weryfikowane pod kątem stosowania odpowiednich środków bezpieczeństwa. Wymagamy od nich:
              </p>
              <ul className="space-y-2 text-muted-foreground ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Zawarcia umowy powierzenia przetwarzania danych zgodnej z art. 28 RODO</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Wdrożenia odpowiednich środków technicznych i organizacyjnych ochrony danych</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Stosowania szyfrowania danych w transmisji i w spoczynku</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Posiadania certyfikatów bezpieczeństwa (np. SOC 2, ISO 27001) lub równoważnych gwarancji</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Regularnego testowania i oceny skuteczności środków bezpieczeństwa</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Niezwłocznego informowania nas o wszelkich incydentach bezpieczeństwa</span>
                </li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-3">
                Regularnie weryfikujemy zgodność podmiotów współpracujących z wymaganiami bezpieczeństwa i zastrzegamy 
                sobie prawo do przeprowadzania audytów w tym zakresie.
              </p>
            </div>
          </section>

          {/* Sekcja 8 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  8. Pliki cookies
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Nasza strona wykorzystuje pliki cookies w celu zapewnienia prawidłowego funkcjonowania, personalizacji treści oraz analizy ruchu. 
                  Możesz zarządzać ustawieniami cookies poniżej lub w swojej przeglądarce.
                </p>
                
                <CookieSettingsManager />
              </div>
            </div>
          </section>

          {/* Sekcja 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              9. Prawo wniesienia skargi
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Masz prawo wnieść skargę do organu nadzorczego - Prezesa Urzędu Ochrony Danych Osobowych (UODO), 
              ul. Stawki 2, 00-193 Warszawa, jeśli uznasz, że przetwarzanie Twoich danych osobowych narusza przepisy RODO.
            </p>
          </section>

          {/* Sekcja 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              10. Zmiany w Polityce Prywatności
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności. 
              O wszelkich zmianach poinformujemy użytkowników za pośrednictwem komunikatu na stronie głównej lub poprzez email. 
              Zmiany wchodzą w życie w terminie wskazanym w komunikacie.
            </p>
          </section>

          {/* Kontakt */}
          <section className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20">
            <h2 className="text-xl font-bold text-foreground mb-3">Kontakt w sprawie danych osobowych</h2>
            <div className="space-y-2 text-muted-foreground">
              <p className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline font-medium">
                  fundacjapwm@gmail.com
                </a>
              </p>
              <p className="text-sm">
                Odpowiemy na Twoje pytania dotyczące przetwarzania danych osobowych w ciągu 30 dni od otrzymania zapytania.
              </p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}