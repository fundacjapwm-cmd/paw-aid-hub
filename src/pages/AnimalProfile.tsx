import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import AnimalProfileSkeleton from "@/components/AnimalProfileSkeleton";
import { useAnimalProfile } from "@/hooks/useAnimalProfile";
import { AnimalInfoCard } from "@/components/animal/AnimalInfoCard";
import { AnimalWishlistCard } from "@/components/animal/AnimalWishlistCard";
import { AnimalImageLightbox } from "@/components/animal/AnimalImageLightbox";
import { OtherAnimalsSection } from "@/components/animal/OtherAnimalsSection";
import Footer from "@/components/Footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const AnimalProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromOrganization = location.state?.fromOrganization || false;
  const fromOrganizationProfile = location.state?.fromOrganizationProfile || false;
  const organizationName = location.state?.organizationName;
  const organizationSlug = location.state?.organizationSlug;

  const {
    animal,
    loading,
    allImages,
    quantities,
    lightboxOpen,
    lightboxIndex,
    cartTotalForAnimal,
    totalWishlistCost,
    allItemsInCart,
    setLightboxOpen,
    openLightbox,
    handlePrevImage,
    handleNextImage,
    handleQuantityChange,
    handleSetQuantity,
    handleAddToCart,
    handleAddAllToCart,
    handleRemoveAllFromCart,
    isInCart,
    getCartQuantity,
    removeFromCart,
    otherAnimalsFromOrg,
  } = useAnimalProfile(id);

  if (loading) {
    return <AnimalProfileSkeleton />;
  }

  if (!animal) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Zwierzę nie zostało znalezione</h1>
          <Button onClick={() => navigate("/")}>Wróć do strony głównej</Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background">
        <main className="md:container md:mx-auto md:max-w-7xl md:px-8 py-8 px-4">
          {/* Breadcrumbs */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/" className="flex items-center gap-1">
                    <Home className="h-4 w-4" />
                    <span className="hidden sm:inline">Strona główna</span>
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              {fromOrganization ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/organizacja">Panel organizacji</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : fromOrganizationProfile && organizationSlug ? (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/organizacje">Organizacje</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to={`/organizacje/${organizationSlug}`}>{organizationName}</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              ) : (
                <>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/zwierzeta">Zwierzęta</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                </>
              )}
              <BreadcrumbItem>
                <BreadcrumbPage>{animal.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimalInfoCard animal={animal} onOpenLightbox={openLightbox} />
            </div>

            <div className="space-y-6">
              <AnimalWishlistCard
                animal={animal}
                quantities={quantities}
                cartTotalForAnimal={cartTotalForAnimal}
                totalWishlistCost={totalWishlistCost}
                allItemsInCart={allItemsInCart}
                onQuantityChange={handleQuantityChange}
                onSetQuantity={handleSetQuantity}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={removeFromCart}
                onAddAllToCart={handleAddAllToCart}
                onRemoveAllFromCart={handleRemoveAllFromCart}
                isInCart={isInCart}
                getCartQuantity={getCartQuantity}
              />
            </div>
          </div>
        </main>

        {/* Other animals from the same organization */}
        {otherAnimalsFromOrg && otherAnimalsFromOrg.length > 0 && id && (
          <OtherAnimalsSection
            animals={otherAnimalsFromOrg}
            currentAnimalId={id}
            organizationName={animal.organization}
            organizationSlug={animal.organizationSlug}
          />
        )}

        <AnimalImageLightbox
          open={lightboxOpen}
          onOpenChange={setLightboxOpen}
          images={allImages}
          currentIndex={lightboxIndex}
          animalName={animal.name}
          onPrev={handlePrevImage}
          onNext={handleNextImage}
        />
      </div>

      <Footer />
    </>
  );
};

export default AnimalProfile;
