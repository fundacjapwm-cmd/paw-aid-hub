import Footer from '@/components/Footer';
import { useCheckout } from '@/hooks/useCheckout';
import { CheckoutEmptyCart } from '@/components/checkout/CheckoutEmptyCart';
import { CheckoutOrderSummary } from '@/components/checkout/CheckoutOrderSummary';
import { CheckoutPaymentForm } from '@/components/checkout/CheckoutPaymentForm';

const Checkout = () => {
  const {
    cart,
    cartTotal,
    user,
    loading,
    cartMinimized,
    setCartMinimized,
    customerName,
    setCustomerName,
    customerEmail,
    setCustomerEmail,
    password,
    setPassword,
    acceptTerms,
    setAcceptTerms,
    acceptPrivacy,
    setAcceptPrivacy,
    acceptDataProcessing,
    setAcceptDataProcessing,
    acceptWithdrawalWaiver,
    setAcceptWithdrawalWaiver,
    newsletter,
    setNewsletter,
    allConsentsChecked,
    handleSelectAll,
    handleCheckout,
  } = useCheckout();

  if (cart.length === 0) {
    return <CheckoutEmptyCart />;
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-background via-secondary/20 to-background pt-24 pb-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Finalizacja zamówienia
          </h1>

          <div className="grid md:grid-cols-2 gap-8">
            <CheckoutOrderSummary
              cart={cart}
              cartTotal={cartTotal}
              cartMinimized={cartMinimized}
              onToggleMinimize={() => setCartMinimized(!cartMinimized)}
            />

            <CheckoutPaymentForm
              user={user}
              loading={loading}
              cartTotal={cartTotal}
              customerName={customerName}
              setCustomerName={setCustomerName}
              customerEmail={customerEmail}
              setCustomerEmail={setCustomerEmail}
              password={password}
              setPassword={setPassword}
              acceptTerms={acceptTerms}
              setAcceptTerms={setAcceptTerms}
              acceptPrivacy={acceptPrivacy}
              setAcceptPrivacy={setAcceptPrivacy}
              acceptDataProcessing={acceptDataProcessing}
              setAcceptDataProcessing={setAcceptDataProcessing}
              acceptWithdrawalWaiver={acceptWithdrawalWaiver}
              setAcceptWithdrawalWaiver={setAcceptWithdrawalWaiver}
              newsletter={newsletter}
              setNewsletter={setNewsletter}
              allConsentsChecked={allConsentsChecked}
              onSelectAll={handleSelectAll}
              onSubmit={handleCheckout}
            />
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Checkout;
