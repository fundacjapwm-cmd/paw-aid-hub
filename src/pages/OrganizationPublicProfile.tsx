import { useParams, Link } from "react-router-dom";
import { Heart, Bone, PawPrint, Home } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import OrganizationProfileSkeleton from "@/components/OrganizationProfileSkeleton";
import { useOrganizationProfile } from "@/hooks/useOrganizationProfile";
import { OrganizationHeroSection } from "@/components/organization/OrganizationHeroSection";
import { OrganizationInfoCard } from "@/components/organization/OrganizationInfoCard";
import { OrganizationWishlistSection } from "@/components/organization/OrganizationWishlistSection";
import { OrganizationAnimalsSection } from "@/components/organization/OrganizationAnimalsSection";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function OrganizationPublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  
  const {
    organization,
    animals,
    orgWishlist,
    loading,
    selectedQuantities,
    cartTotalForOrg,
    handleQuantityChange,
    handleSetQuantity,
    handleAddProduct,
    handleRemoveAllFromCart,
    isInCart,
    getCartQuantity,
    removeFromCart,
  } = useOrganizationProfile(slug);

  if (loading) {
    return <OrganizationProfileSkeleton />;
  }

  if (!organization) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Organizacja nie znaleziona</h2>
          <p className="text-muted-foreground">Sprawdź adres URL i spróbuj ponownie</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9E5] via-white to-[#FFF0F5] relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-accent/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl" />

      {/* Hero Section */}
      <div className="md:container md:mx-auto md:px-8 py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto">
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
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/organizacje">Organizacje</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{organization.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <div className="relative bg-white/60 backdrop-blur-md border border-white/50 shadow-bubbly rounded-[3rem] p-8 md:p-12 overflow-hidden">
            {/* Decorative icons */}
            <Heart className="absolute top-8 left-8 h-32 w-32 text-primary/5 -rotate-12" />
            <Bone className="absolute bottom-8 right-8 h-40 w-40 text-accent/5 rotate-12" />
            <PawPrint className="absolute top-1/2 right-12 h-20 w-20 text-secondary/5 -rotate-6" />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 relative z-10">
              {/* Left column */}
              <div className="space-y-6">
                <OrganizationHeroSection organization={organization} />
                <OrganizationInfoCard 
                  organization={organization} 
                  animalsCount={animals.length}
                  isLoggedIn={!!user}
                />
              </div>

              {/* Right column - Wishlist */}
              <OrganizationWishlistSection
                orgWishlist={orgWishlist}
                organizationName={organization.name}
                selectedQuantities={selectedQuantities}
                cartTotalForOrg={cartTotalForOrg}
                onQuantityChange={handleQuantityChange}
                onSetQuantity={handleSetQuantity}
                onAddProduct={handleAddProduct}
                onRemoveFromCart={removeFromCart}
                onRemoveAllFromCart={handleRemoveAllFromCart}
                isInCart={isInCart}
                getCartQuantity={getCartQuantity}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Animals Section */}
      <OrganizationAnimalsSection animals={animals} organization={organization} />
    </div>
  );
}
