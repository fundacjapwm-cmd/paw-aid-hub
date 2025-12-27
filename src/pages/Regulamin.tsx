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
                    Administratorem Platformy jest <strong>Fundacja Pączki w Maśle</strong> z siedzibą w Polsce 
                    (dalej: "Administrator", "Fundacja" lub "Pośrednik").
                  </li>
                  <li>
                    <strong>Fundacja jest organizacją non-profit</strong>, która pełni rolę pośrednika między osobami chcącymi wspierać zwierzęta (Użytkownikami) 
                    a organizacjami opiekującymi się zwierzętami (Organizacjami). Fundacja nie jest stroną umowy darowizny - 
                    świadczy usługę pośrednictwa w zakupie i dostawie produktów.
                  </li>
                  <li>
                    <strong>Fundacja nie pobiera prowizji ani opłat za pośrednictwo.</strong> 100% środków wpłaconych przez Użytkowników 
                    przeznaczane jest na zakup produktów dla zwierząt oraz pokrycie kosztów ich dostawy do Organizacji.
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
                    Administrator zastrzega sobie prawo do zablokowania dostępu do Platformy w przypadku 
                    naruszenia Regulaminu.
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
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    <strong className="text-foreground">WAŻNE:</strong> Fundacja Pączki w Maśle świadczy <strong>usługę pośrednictwa</strong>. 
                    Użytkownik zleca Fundacji zakup wybranych produktów i ich dostarczenie do Organizacji. 
                    Fundacja nie jest stroną umowy darowizny między Użytkownikiem a Organizacją - 
                    jest pośrednikiem realizującym zakup w imieniu Użytkownika.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    <strong className="text-foreground">Fundacja nie pobiera prowizji.</strong> Jako organizacja non-profit, 
                    Fundacja nie nalicza żadnych opłat za pośrednictwo. Cała kwota wpłacona przez Użytkownika przeznaczana jest 
                    na zakup produktów oraz pokrycie kosztów logistycznych (dostawa do Organizacji).
                  </p>
                </div>
                <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
                  <li>
                    Fundacja nabywa produkty od zweryfikowanych dostawców i dostarcza je do Organizacji 
                    wskazanych przez Użytkownika.
                  </li>
                  <li>
                    Ceny produktów zawierają podatek VAT i są podane w złotych polskich (PLN). 
                    Cena obejmuje koszt produktu oraz koszty dostawy. <strong>Fundacja nie dolicza żadnej prowizji ani marży</strong> - 
                    działa jako organizacja non-profit wspierająca zwierzęta.
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
                    Platforma akceptuje płatności elektroniczne za pośrednictwem operatora płatności PayU S.A.
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
                    Płatność pokrywa koszt produktów oraz ewentualne koszty dostawy. 
                    <strong>Fundacja nie pobiera prowizji ani wynagrodzenia za pośrednictwo</strong> - 
                    100% środków jest przeznaczane na pomoc zwierzętom.
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
                <div className="bg-amber-50 dark:bg-amber-950/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl p-6">
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    <strong className="text-foreground">WAŻNE:</strong> Ze względu na specyfikę usługi pośrednictwa 
                    (natychmiastowe rozpoczęcie realizacji zlecenia zakupu), Użytkownik nie może odstąpić od umowy 
                    po dokonaniu płatności, zgodnie z art. 38 pkt 1 ustawy o prawach konsumenta.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Przed dokonaniem płatności, Użytkownik wyraża zgodę na natychmiastowe rozpoczęcie realizacji usługi 
                    pośrednictwa i przyjmuje do wiadomości, że traci prawo do odstąpienia od umowy z chwilą rozpoczęcia 
                    realizacji zlecenia przez Fundację.
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
                <a href="mailto:fundacjapwm@gmail.com" className="text-primary hover:underline font-medium ml-1">
                  fundacjapwm@gmail.com
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

          {/* Sekcja 8 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 8. Odpowiedzialność
            </h2>
            <ol className="space-y-3 text-muted-foreground list-decimal ml-6">
              <li>
                Administrator dokłada wszelkich starań, aby Platforma działała prawidłowo, jednak nie gwarantuje 
                nieprzerwanego dostępu do Platformy.
              </li>
              <li>
                Administrator nie ponosi odpowiedzialności za:
                <ul className="mt-2 ml-6 space-y-1">
                  <li>• Problemy techniczne po stronie Użytkownika</li>
                  <li>• Działania osób trzecich (dostawców płatności, kurierów)</li>
                  <li>• Sposób wykorzystania produktów przez organizacje</li>
                </ul>
              </li>
              <li>
                Administrator weryfikuje organizacje przed dodaniem ich do Platformy, jednak nie ponosi 
                odpowiedzialności za ich późniejsze działania.
              </li>
              <li>
                Użytkownik korzysta z Platformy na własną odpowiedzialność.
              </li>
            </ol>
          </section>

          {/* Sekcja 9 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 9. Dane osobowe
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Szczegółowe informacje dotyczące przetwarzania danych osobowych znajdują się w 
              <a href="/prywatnosc" className="text-primary hover:underline font-medium mx-1">
                Polityce Prywatności
              </a>
              dostępnej na Platformie. Korzystanie z Platformy oznacza akceptację Polityki Prywatności.
            </p>
          </section>

          {/* Sekcja 10 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 10. Własność intelektualna
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

          {/* Sekcja 11 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 11. Zmiany Regulaminu
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

          {/* Sekcja 12 */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              § 12. Postanowienia końcowe
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
                Ewentualne spory będą rozstrzygane przez sąd właściwy miejscowo dla siedziby Administratora.
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
                <a href="mailto:fundacjapwm@gmail.com" className="hover:underline">
                  fundacjapwm@gmail.com
                </a>
              </p>
            </div>
          </section>
        </Card>
      </div>
    </div>
  );
}