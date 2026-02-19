import { Card } from "@/components/ui/card";
import { FileText, ShoppingCart, Package, CreditCard, AlertCircle, Scale } from "lucide-react";

export default function Regulamin() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-20">
      <div className="md:container md:mx-auto md:px-8 md:max-w-4xl px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <FileText className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Regulamin Platformy
          </h1>
          <p className="text-lg text-muted-foreground">
            Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}
          </p>
        </div>

        <Card className="p-8 md:p-12 space-y-8 shadow-bubbly border-0">
          {/* Sekcja 1 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 1. Postanowienia ogólne
                </h2>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    Niniejszy Regulamin określa zasady korzystania z platformy internetowej Pączki w Maśle (dalej: "Platforma"), 
                    dostępnej pod adresem www.pączkiwmaśle.pl.
                  </li>
                  <li>
                    Administratorem Platformy jest <strong>Fundacja Pączki w Maśle</strong> z siedzibą pod adresem: Maciejów 6, 34-325 Bierna, 
                    wpisana do rejestru stowarzyszeń, innych organizacji społecznych i zawodowych, fundacji oraz samodzielnych publicznych zakładów opieki zdrowotnej 
                    Krajowego Rejestru Sądowego pod numerem <strong>KRS 0001171916</strong>, <strong>NIP 5532598992</strong>, <strong>REGON 541682360</strong> 
                    (dalej: "Administrator", "Fundacja" lub "Pośrednik").
                  </li>
                  <li>
                    Fundacja pełni rolę pośrednika między osobami chcącymi wspierać zwierzęta (Użytkownikami) 
                    a organizacjami opiekującymi się zwierzętami (Organizacjami). Fundacja świadczy usługę 
                    pośrednictwa w zakupie i dostawie produktów.
                  </li>
                  <li>
                    Środki wpłacone przez Użytkowników przeznaczane są na zakup produktów dla zwierząt 
                    oraz pokrycie kosztów ich dostawy do Organizacji.
                  </li>
                  <li>
                    Platforma umożliwia Użytkownikom zlecenie Fundacji zakupu produktów z list potrzeb zwierząt 
                    i ich dostarczenia do wskazanych Organizacji.
                  </li>
                  <li>
                    Korzystanie z Platformy oznacza akceptację niniejszego Regulaminu.
                  </li>
                  <li>
                    Regulamin jest dostępny nieodpłatnie na stronie internetowej w formie umożliwiającej jego pobranie, 
                    utrwalenie i wydrukowanie.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sekcja 2 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 2. Definicje
                </h2>
                <div className="space-y-3">
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Użytkownik</h3>
                    <p className="text-sm text-muted-foreground">
                      Osoba fizyczna, prawna lub jednostka organizacyjna nieposiadająca osobowości prawnej, 
                      korzystająca z Platformy w celu zlecenia zakupu produktów dla zwierząt.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Organizacja</h3>
                    <p className="text-sm text-muted-foreground">
                      Fundacja, stowarzyszenie lub schronisko, które zostało zweryfikowane i dodane do Platformy 
                      przez Administratora, będące beneficjentem zakupionych produktów.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Usługa Pośrednictwa</h3>
                    <p className="text-sm text-muted-foreground">
                      Usługa świadczona przez Fundację, polegająca na zakupie produktów wybranych przez Użytkownika 
                      od dostawców oraz ich dostarczeniu do wskazanej Organizacji. Fundacja działa jako pośrednik 
                      między Użytkownikiem a Organizacją.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-2">Konto</h3>
                    <p className="text-sm text-muted-foreground">
                      Indywidualny panel użytkownika umożliwiający korzystanie z dodatkowych funkcji Platformy.
                    </p>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4">
                    <h3 className="font-semibold text-foreground mb-3">Wishlist (Lista potrzeb)</h3>
                    <p className="text-sm text-muted-foreground">
                      Lista produktów potrzebnych dla danego zwierzęcia lub organizacji, tworzona przez Organizację.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 3 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <ShoppingCart className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 3. Zasady korzystania z Platformy
                </h2>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    Korzystanie z podstawowych funkcji Platformy (przeglądanie organizacji, zwierząt i produktów) 
                    nie wymaga rejestracji.
                  </li>
                  <li>
                    Dokonanie zakupu wymaga podania danych osobowych niezbędnych do realizacji transakcji 
                    (imię, nazwisko, adres email).
                  </li>
                  <li>
                    Użytkownik może utworzyć Konto w celu śledzenia historii wsparcia i otrzymywania powiadomień.
                  </li>
                  <li>
                    Użytkownik zobowiązuje się do:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Podawania prawdziwych i aktualnych danych</li>
                      <li>• Korzystania z Platformy zgodnie z obowiązującym prawem</li>
                      <li>• Niepodejmowania działań mogących zakłócić funkcjonowanie Platformy</li>
                      <li>• Zachowania poufności danych logowania do Konta</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Procedura w przypadku naruszenia Regulaminu:</strong>
                    <ul className="mt-2 ml-6 space-y-2">
                      <li>• W przypadku stwierdzenia naruszenia Regulaminu, Administrator przesyła Użytkownikowi ostrzeżenie 
                          na podany adres email z opisem naruszenia i wezwaniem do zaprzestania naruszeń lub złożenia wyjaśnień 
                          w terminie 7 dni.</li>
                      <li>• Jeśli Użytkownik nie zastosuje się do wezwania lub nie złoży wyjaśnień w wyznaczonym terminie, 
                          Administrator może zablokować dostęp do Konta.</li>
                      <li>• <strong>Prawo odwołania:</strong> Użytkownik ma prawo odwołać się od decyzji o zablokowaniu Konta 
                          w terminie 14 dni od daty blokady, przesyłając odwołanie na adres: 
                          <a href="mailto:kontakt@paczkiwmasle.pl" className="text-primary hover:underline font-medium ml-1">
                            kontakt@paczkiwmasle.pl
                          </a>. 
                          Administrator rozpatrzy odwołanie w ciągu 14 dni roboczych.</li>
                      <li>• W przypadku poważnych naruszeń zagrażających bezpieczeństwu Platformy lub innych użytkowników 
                          (np. działania hakerskie, oszustwa), Administrator może natychmiast zablokować dostęp, 
                          informując o tym Użytkownika wraz z uzasadnieniem.</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sekcja 4 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 4. Charakter usługi i zasady realizacji
                </h2>
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mb-4">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">WAŻNE:</strong> Fundacja Pączki w Maśle świadczy <strong>usługę pośrednictwa</strong>. 
                    Użytkownik zleca Fundacji zakup wybranych produktów i ich dostarczenie do Organizacji. 
                    Fundacja jest pośrednikiem realizującym zakup w imieniu Użytkownika.
                  </p>
                </div>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    Fundacja nabywa produkty od zweryfikowanych dostawców i dostarcza je do Organizacji 
                    wskazanych przez Użytkownika.
                  </li>
                  <li>
                    Ceny produktów zawierają podatek VAT i są podane w złotych polskich (PLN). 
                    Cena obejmuje koszt produktu oraz koszty dostawy.
                  </li>
                  <li>
                    Proces zlecenia:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Wybór produktów z listy potrzeb zwierzęcia lub organizacji</li>
                      <li>• Dodanie do koszyka i określenie ilości</li>
                      <li>• Wypełnienie danych niezbędnych do realizacji</li>
                      <li>• Dokonanie płatności za usługę pośrednictwa</li>
                      <li>• Otrzymanie potwierdzenia zlecenia na email</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Użytkownik nie otrzymuje fizycznie produktów</strong> - są one dostarczane bezpośrednio 
                    do Organizacji opiekującej się danym zwierzęciem.
                  </li>
                  <li>
                    Fundacja zbiera zlecenia i realizuje je zbiorczo w celu optymalizacji kosztów zakupu i dostawy.
                  </li>
                  <li>
                    Czas realizacji zlecenia wynosi standardowo 7-14 dni roboczych od momentu zamknięcia zbiorczego zamówienia.
                  </li>
                  <li>
                    Fundacja potwierdza dostarczenie produktów do Organizacji i informuje o tym Użytkownika.
                  </li>
                  <li>
                    <strong>Ograniczenia terytorialne:</strong> Usługa pośrednictwa jest realizowana wyłącznie na terenie 
                    Rzeczypospolitej Polskiej. Produkty są dostarczane tylko do Organizacji z siedzibą w Polsce.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sekcja 4a - Umowa z Organizacjami */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Scale className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 4a. Umowa pośrednictwa z Organizacjami
                </h2>
                <div className="bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800 rounded-xl p-6 mb-4">
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong className="text-foreground">WAŻNE:</strong> Każda Organizacja, która zgłasza się do współpracy lub zakłada konto 
                    na Platformie, zawiera z Fundacją <strong>umowę pośrednictwa</strong> i akceptuje niniejszy Regulamin jako integralną część tej umowy.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Rejestracja konta lub przesłanie formularza zgłoszeniowego jest równoznaczne z zawarciem umowy pośrednictwa 
                    na warunkach określonych w niniejszym Regulaminie.
                  </p>
                </div>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    <strong>Zawarcie umowy:</strong> Umowa pośrednictwa pomiędzy Fundacją a Organizacją zostaje zawarta z chwilą:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Aktywacji konta Organizacji na Platformie, lub</li>
                      <li>• Pozytywnej weryfikacji zgłoszenia Organizacji i jej dodania do Platformy</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Przedmiot umowy:</strong> Fundacja zobowiązuje się do pośrednictwa w pozyskiwaniu wsparcia rzeczowego 
                    dla zwierząt znajdujących się pod opieką Organizacji, poprzez:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Udostępnienie profilu Organizacji i jej podopiecznych na Platformie</li>
                      <li>• Przyjmowanie i realizację zamówień od Użytkowników</li>
                      <li>• Organizację zakupu i dostawy produktów do Organizacji</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Obowiązki Organizacji:</strong>
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Podawanie prawdziwych i aktualnych informacji o sobie, swoich podopiecznych i ich potrzebach</li>
                      <li>• Prowadzenie aktualnych list potrzeb (wishlist) dla swoich podopiecznych</li>
                      <li>• Przyjmowanie dostaw produktów zamówionych przez Użytkowników w uzgodnionych terminach</li>
                      <li>• Wykorzystywanie otrzymanych produktów wyłącznie na cele statutowe związane z opieką nad zwierzętami</li>
                      <li>• Niezwłoczne informowanie Fundacji o zmianach w statusie zwierząt (adopcja, śmierć, itp.)</li>
                      <li>• Współpraca z Fundacją w zakresie dokumentowania otrzymanego wsparcia</li>
                      <li>• Przestrzeganie postanowień niniejszego Regulaminu</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Obowiązki Fundacji wobec Organizacji:</strong>
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Zapewnienie funkcjonowania Platformy i jej dostępności</li>
                      <li>• Rzetelna prezentacja profilu Organizacji i jej podopiecznych</li>
                      <li>• Terminowa realizacja i dostawa zamówień</li>
                      <li>• Transparentne informowanie o statusie zamówień</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Oświadczenia Organizacji:</strong> Przystępując do współpracy, Organizacja oświadcza, że:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Jest podmiotem legalnie działającym na terytorium Rzeczypospolitej Polskiej</li>
                      <li>• Posiada status fundacji, stowarzyszenia, schroniska lub innej organizacji zajmującej się opieką nad zwierzętami</li>
                      <li>• Osoba zakładająca konto jest upoważniona do reprezentowania Organizacji</li>
                      <li>• Wszystkie podane informacje są prawdziwe i aktualne</li>
                      <li>• Zapoznała się z Regulaminem i akceptuje jego postanowienia w całości</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Odpowiedzialność Organizacji:</strong>
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Organizacja ponosi pełną odpowiedzialność za prawdziwość podanych informacji</li>
                      <li>• Organizacja odpowiada za prawidłowe wykorzystanie otrzymanych produktów</li>
                      <li>• W przypadku podania nieprawdziwych informacji, Fundacja zastrzega sobie prawo do natychmiastowego 
                          rozwiązania umowy i usunięcia Organizacji z Platformy</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Rozwiązanie umowy:</strong> Umowa pośrednictwa może zostać rozwiązana:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Przez każdą ze stron z zachowaniem 14-dniowego okresu wypowiedzenia</li>
                      <li>• Ze skutkiem natychmiastowym przez Fundację w przypadku naruszenia Regulaminu przez Organizację</li>
                      <li>• Ze skutkiem natychmiastowym przez Fundację w przypadku podania nieprawdziwych danych</li>
                      <li>• Wskutek likwidacji Organizacji lub zakończenia jej działalności statutowej</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Skutki rozwiązania umowy:</strong>
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Dezaktywacja konta i profilu Organizacji na Platformie</li>
                      <li>• Realizacja zamówień złożonych przed rozwiązaniem umowy (o ile to możliwe)</li>
                      <li>• Brak wpływu na zamówienia już zrealizowane i dostarczone</li>
                    </ul>
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sekcja 5 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 5. Płatności
                </h2>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    Platforma akceptuje płatności elektroniczne za pośrednictwem operatora płatności HotPay (ePłatności sp. z o.o. sp.k.).
                  </li>
                  <li>
                    Dostępne metody płatności:
                    <ul className="mt-2 ml-6 space-y-1">
                      <li>• Przelewy online</li>
                      <li>• Karty płatnicze (Visa, Mastercard)</li>
                      <li>• BLIK</li>
                    </ul>
                  </li>
                  <li>
                    Płatność pokrywa koszt produktów oraz koszty dostawy do Organizacji.
                  </li>
                  <li>
                    Zlecenie jest przetwarzane po otrzymaniu potwierdzenia płatności.
                  </li>
                  <li>
                    W przypadku problemów z płatnością, należy skontaktować się z Administratorem.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Sekcja 6 */}
          <section className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-3">
                  § 6. Prawo odstąpienia od umowy
                </h2>
                <ol className="space-y-4 text-muted-foreground list-decimal ml-6">
                  <li>
                    <strong>Prawo odstąpienia:</strong> Użytkownikowi będącemu konsumentem przysługuje prawo do odstąpienia 
                    od umowy bez podania przyczyny w terminie 14 dni od dnia złożenia zamówienia, zgodnie z art. 27 ustawy 
                    z dnia 30 maja 2014 r. o prawach konsumenta.
                  </li>
                  <li>
                    <strong>Sposób odstąpienia:</strong> Aby skorzystać z prawa odstąpienia, Użytkownik powinien przesłać 
                    jednoznaczne oświadczenie o odstąpieniu od umowy na adres email: 
                    <a href="mailto:kontakt@paczkiwmasle.pl" className="text-primary hover:underline font-medium ml-1">
                      kontakt@paczkiwmasle.pl
                    </a>, podając numer zamówienia i datę jego złożenia.
                  </li>
                  <li>
                    <strong>Skutki odstąpienia:</strong> W przypadku skutecznego odstąpienia od umowy, Fundacja zwróci 
                    wszystkie otrzymane płatności w terminie 14 dni od dnia otrzymania oświadczenia o odstąpieniu, 
                    przy użyciu takiego samego sposobu płatności, jakiego użył Użytkownik.
                  </li>
                  <li>
                    <strong>Zgoda na wcześniejsze wykonanie usługi:</strong> Przed złożeniem zamówienia Użytkownik 
                    może wyrazić zgodę na rozpoczęcie realizacji usługi przed upływem 14-dniowego terminu do odstąpienia 
                    od umowy, poprzez zaznaczenie odpowiedniego pola w formularzu zamówienia. W przypadku wyrażenia takiej 
                    zgody i pełnego wykonania usługi (dostarczenia produktów do Organizacji) przed upływem tego terminu, 
                    Użytkownik traci prawo do odstąpienia od umowy zgodnie z art. 38 pkt 1 ustawy o prawach konsumenta.
                  </li>
                </ol>
                <div className="bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-6 mt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Informacja:</strong> Ze względu na specyfikę działania Platformy 
                    (zbieranie zamówień i realizacja zbiorcza w terminie 7-14 dni roboczych), w większości przypadków 
                    Użytkownik ma możliwość skorzystania z prawa odstąpienia przed dostarczeniem produktów do Organizacji. 
                    Status zamówienia można sprawdzić kontaktując się z Fundacją.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Sekcja 7 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 7. Reklamacje
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                Reklamacje dotyczące funkcjonowania Platformy lub realizacji zamówień można zgłaszać na adres: 
                <a href="mailto:kontakt@paczkiwmasle.pl" className="text-primary hover:underline font-medium ml-1">
                  kontakt@paczkiwmasle.pl
                </a>
              </li>
              <li>
                Reklamacja powinna zawierać:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>• Dane identyfikujące Użytkownika</li>
                  <li>• Numer zamówienia (jeśli dotyczy)</li>
                  <li>• Opis problemu</li>
                  <li>• Żądanie Użytkownika</li>
                </ul>
              </li>
              <li>
                Administrator rozpatruje reklamacje w ciągu 14 dni roboczych od daty otrzymania.
              </li>
              <li>
                Odpowiedź na reklamację zostanie przesłana na adres email podany w reklamacji.
              </li>
            </ol>
          </section>

          {/* Sekcja 8 - Gwarancja i rękojmia */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 8. Gwarancja i rękojmia
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                <strong>Charakter usługi:</strong> Fundacja świadczy usługę pośrednictwa polegającą na zakupie produktów 
                od dostawców i ich dostarczeniu do Organizacji. Fundacja nie jest sprzedawcą produktów w rozumieniu 
                przepisów o rękojmi za wady fizyczne i prawne rzeczy sprzedanej.
              </li>
              <li>
                <strong>Odpowiedzialność za jakość produktów:</strong> Fundacja dokłada wszelkich starań, aby produkty 
                dostarczane do Organizacji były pełnowartościowe i zgodne z opisem. Produkty pochodzą od zweryfikowanych 
                dostawców i objęte są gwarancją producenta (jeśli producent jej udziela).
              </li>
              <li>
                <strong>Reklamacja jakości produktów:</strong> W przypadku stwierdzenia wad produktów przez Organizację, 
                Fundacja pośredniczy w procesie reklamacyjnym u dostawcy. Organizacja powinna zgłosić wadę niezwłocznie 
                po jej wykryciu na adres: 
                <a href="mailto:kontakt@paczkiwmasle.pl" className="text-primary hover:underline font-medium ml-1">
                  kontakt@paczkiwmasle.pl
                </a>
              </li>
              <li>
                <strong>Termin rozpatrzenia:</strong> Reklamacje dotyczące jakości produktów są rozpatrywane w terminie 
                14 dni roboczych. W przypadku uznania reklamacji, Fundacja zapewni wymianę produktu lub zwrot środków.
              </li>
              <li>
                <strong>Uprawnienia konsumenta:</strong> Niezależnie od powyższych postanowień, Użytkownikowi będącemu 
                konsumentem przysługują uprawnienia wynikające z ustawy o prawach konsumenta oraz przepisów Kodeksu 
                cywilnego dotyczących rękojmi, w zakresie w jakim mają one zastosowanie do usługi pośrednictwa.
              </li>
            </ol>
          </section>

          {/* Sekcja 9 - Odpowiedzialność */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 9. Odpowiedzialność
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                Administrator dokłada wszelkich starań, aby Platforma działała prawidłowo i świadczone usługi 
                były realizowane z należytą starannością.
              </li>
              <li>
                Administrator ponosi odpowiedzialność za niewykonanie lub nienależyte wykonanie usługi pośrednictwa 
                na zasadach określonych w przepisach Kodeksu cywilnego.
              </li>
              <li>
                Administrator weryfikuje Organizacje przed dodaniem ich do Platformy i dba o jakość oferowanych produktów.
              </li>
              <li>
                W przypadku niedostarczenia produktów do Organizacji z winy Administratora, Użytkownikowi przysługuje 
                prawo do zwrotu wpłaconych środków lub ponownej realizacji zamówienia.
              </li>
              <li>
                Reklamacje dotyczące realizacji usługi są rozpatrywane zgodnie z § 7 Regulaminu.
              </li>
            </ol>
          </section>

          {/* Sekcja 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 10. Dane osobowe
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w 
              <a href="/prywatnosc" className="text-primary hover:underline font-medium mx-1">
                Polityce Prywatności
              </a>
              dostępnej na Platformie. Korzystanie z Platformy oznacza akceptację Polityki Prywatności.
            </p>
          </section>

          {/* Sekcja 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 11. Własność intelektualna
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                Wszelkie prawa do Platformy, w tym do jej zawartości, układu graficznego, znaków towarowych 
                i baz danych, należą do Administratora i są prawnie chronione.
              </li>
              <li>
                Kopiowanie, modyfikowanie lub rozpowszechnianie treści Platformy bez zgody Administratora jest zabronione.
              </li>
              <li>
                Organizacje udzielają Administratorowi niewyłącznej licencji na wykorzystanie materiałów 
                (zdjęcia, opisy) w ramach Platformy.
              </li>
            </ol>
          </section>

          {/* Sekcja 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 12. Zmiany Regulaminu
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                Administrator zastrzega sobie prawo do wprowadzania zmian w Regulaminie.
              </li>
              <li>
                O zmianach Użytkownicy zostaną poinformowani poprzez komunikat na Platformie lub email 
                (w przypadku posiadania Konta) z co najmniej 14-dniowym wyprzedzeniem.
              </li>
              <li>
                Kontynuowanie korzystania z Platformy po wejściu w życie zmian oznacza akceptację nowego Regulaminu.
              </li>
              <li>
                Użytkownik, który nie akceptuje zmian, powinien zaprzestać korzystania z Platformy.
              </li>
            </ol>
          </section>

          {/* Sekcja 13 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 13. Postanowienia końcowe
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                W sprawach nieuregulowanych w Regulaminie zastosowanie mają przepisy prawa polskiego, 
                w szczególności:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>• Kodeksu cywilnego</li>
                  <li>• Ustawy o świadczeniu usług drogą elektroniczną</li>
                  <li>• Ustawy o prawach konsumenta</li>
                  <li>• RODO</li>
                </ul>
              </li>
              <li>
                Ewentualne spory będą rozstrzygane przez sąd właściwy zgodnie z przepisami Kodeksu postępowania cywilnego. 
                W przypadku Użytkowników będących konsumentami, właściwość sądu określa się na zasadach ogólnych, 
                co oznacza, że konsument może wytoczyć powództwo przed sąd właściwy dla swojego miejsca zamieszkania.
              </li>
              <li>
                Konsumenci mają prawo skorzystać z pozasądowych sposobów rozstrzygania sporów 
                (mediacja, arbitraż konsumencki).
              </li>
              <li>
                Regulamin wchodzi w życie z dniem publikacji na Platformie.
              </li>
            </ol>
          </section>

          {/* Kontakt */}
          <section className="bg-primary/5 rounded-2xl p-6 border-2 border-primary/20">
            <h2 className="text-xl font-bold text-foreground mb-3">Kontakt</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                W przypadku pytań dotyczących Regulaminu, prosimy o kontakt:
              </p>
              <p className="flex items-center gap-2 text-primary font-medium">
                <FileText className="h-5 w-5" />
                <a href="mailto:kontakt@paczkiwmasle.pl" className="hover:underline">
                  kontakt@paczkiwmasle.pl
                </a>
              </p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}