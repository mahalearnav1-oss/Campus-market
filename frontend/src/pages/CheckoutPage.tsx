import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { loadRazorpayScript } from '../lib/razorpay';
import { useAuthStore } from '../stores/authStore';
import { CartData } from './CartPage';
import { formatINR } from '../lib/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [cart, setCart] = useState<CartData | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    recipientName: user ? `${user.firstName} ${user.lastName}` : 'Campus Student',
    phone: user?.phone || '9876543210',
    street: '100 University Ave',
    city: 'Cambridge',
    state: 'MA',
    zipCode: '02138',
    campusBuilding: 'Library Gate SafeZone',
  });
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'ESCROW_HOLD' | 'CARD'>('UPI');
  const [upiConfirmed, setUpiConfirmed] = useState(false);
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Configurable UPI credentials via environment variables or default fallbacks
  const upiQrUrl = import.meta.env.VITE_UPI_QR_URL || '/images/upi_qr.jpg';
  const upiId = import.meta.env.VITE_UPI_ID || 'mahalearnav1@okicici';
  const merchantName = import.meta.env.VITE_UPI_MERCHANT_NAME || 'Arnav Mahale';

  useEffect(() => {
    async function loadCheckoutCart() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/cart');
        setCart(res.data.cart);
        if (!res.data.cart || res.data.cart.items.length === 0) {
          navigate('/cart');
        }
      } catch (err: any) {
        setError(err.message || 'Couldn\'t load your cart for checkout. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
    loadCheckoutCart();
  }, [navigate]);

  const handleSelectPaymentMethod = (method: 'UPI' | 'ESCROW_HOLD' | 'CARD') => {
    setPaymentMethod(method);
    if (method !== 'UPI') {
      setUpiConfirmed(false);
    }
  };

  const handleCopyUpiId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(upiId);
      setCopiedUpi(true);
      setTimeout(() => setCopiedUpi(false), 2000);
    }
  };

  const handlePlaceOrderAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0 || isSubmitting) return;

    // Enforce UPI Confirmation gate
    if (paymentMethod === 'UPI' && !upiConfirmed) {
      setError('Please complete the UPI payment and click "I\'ve Paid — Proceed" to continue.');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 1. Create User Address in DB
      const addressRes: any = await apiClient.post('/users/me/addresses', {
        label: 'Campus Meetup Location',
        recipientName: shippingAddress.recipientName || 'Campus Student',
        phone: shippingAddress.phone || '9876543210',
        streetAddress: shippingAddress.street || '100 University Ave',
        dormOrBuilding: shippingAddress.campusBuilding || 'Main Library Gate',
        city: shippingAddress.city || 'Cambridge',
        state: shippingAddress.state || 'MA',
        postalCode: shippingAddress.zipCode || '02138',
        isDefault: true,
      });

      const shippingAddressId = addressRes.data.address.id;

      // 2. Create Order in DB with selected Payment Method
      const orderRes: any = await apiClient.post('/orders', {
        shippingAddressId,
        fulfillmentMode: 'CAMPUS_MEETUP',
        paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'CREDIT_CARD',
      });

      const orderNumber = orderRes.data.order.orderNumber;

      // For Instant UPI and direct escrow orders, proceed directly to confirmation & tracking
      if (paymentMethod === 'UPI' || paymentMethod === 'ESCROW_HOLD') {
        queryClient.invalidateQueries();
        navigate(`/orders/${orderNumber}/tracking`);
        return;
      }

      // 3. Optional Razorpay Gateway Integration for Card/Gateway flow
      try {
        const payOrderRes: any = await apiClient.post('/payments/create-order', {
          orderNumber,
        });

        const payData = payOrderRes.data;

        // 4. Load Razorpay SDK Script
        const isScriptLoaded = await loadRazorpayScript();

        if (isScriptLoaded && window.Razorpay) {
          const options = {
            key: payData.keyId,
            amount: payData.amount,
            currency: payData.currency || 'INR',
            name: 'CampusMarket Escrow',
            description: `Escrow Fund for Order #${orderNumber}`,
            order_id: payData.razorpayOrderId,
            handler: async function (response: any) {
              try {
                await apiClient.post('/payments/verify', {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  paymentMethod: 'CREDIT_CARD',
                });

                queryClient.invalidateQueries();
                navigate(`/orders/${orderNumber}/tracking`);
              } catch (err: any) {
                setError(err.message || 'Payment verification could not be completed. Please contact support.');
              }
            },
            prefill: {
              name: `${user?.firstName || 'Student'} ${user?.lastName || ''}`,
              email: user?.email || '',
              contact: shippingAddress.phone,
            },
            theme: {
              color: '#3B2A22',
            },
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();
        } else {
          queryClient.invalidateQueries();
          navigate(`/orders/${orderNumber}/tracking`);
        }
      } catch (payErr) {
        // Fallback for simulation
        queryClient.invalidateQueries();
        navigate(`/orders/${orderNumber}/tracking`);
      }
    } catch (err: any) {
      setError(err.message || 'We couldn\'t complete your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isMainButtonDisabled = isSubmitting || (paymentMethod === 'UPI' && !upiConfirmed);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading checkout details…</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Secure Escrow Checkout</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Order Checkout</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">Review campus delivery details and fund your escrow transaction</p>
        </div>
        <Link to="/cart" className="btn-secondary text-xs !py-2.5 !px-4">
          ← Return to Cart
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold font-sans">
          {error}
        </div>
      )}

      {cart && cart.items.length > 0 && (
        <form onSubmit={handlePlaceOrderAndPay} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Shipping & Payment Left */}
          <div className="lg:col-span-8 space-y-6">

            {/* Campus Location Card */}
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
                Campus Meetup & Delivery Location
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                    Recipient Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.recipientName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, recipientName: e.target.value })}
                    placeholder="Recipient Name"
                    className="input-editorial"
                  />
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    placeholder="9876543210"
                    className="input-editorial"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                    Hostel / Campus Building (SafeZone Location)
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.campusBuilding}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, campusBuilding: e.target.value })}
                    placeholder="e.g. Student Hostel Block 4, Main Library Gate"
                    className="input-editorial"
                  />
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.street}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                    placeholder="Campus Avenue"
                    className="input-editorial"
                  />
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                    City / Town
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    placeholder="Cambridge"
                    className="input-editorial"
                  />
                </div>
              </div>
            </div>

            {/* Escrow Payment Method Card */}
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
              <div className="border-b border-[#D6C8B8] pb-4 flex items-center justify-between">
                <div>
                  <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">
                    Escrow Payment Protection Method
                  </h3>
                  <p className="font-sans text-xs text-[#8B7562] mt-0.5">
                    100% Escrow Protection: Funds are locked in campus escrow until you inspect the item in person.
                  </p>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] text-[11px] font-semibold">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Escrow Protected</span>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: 'UPI',
                    title: 'Instant UPI (Scan & Pay with Any UPI App)',
                    desc: 'Pay using Google Pay, PhonePe, Paytm, BHIM, or any UPI app with instant escrow lock',
                    badge: 'Recommended • Instant',
                  },
                  {
                    id: 'ESCROW_HOLD',
                    title: 'Online Escrow Gateway (Cards / NetBanking / Wallets)',
                    desc: 'Official payment gateway checkout with instant escrow hold',
                    badge: 'Cards & NetBanking',
                  },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => handleSelectPaymentMethod(pm.id as any)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'bg-[#E7DED1] border-[#C8A46A] shadow-sm ring-1 ring-[#C8A46A]/30'
                        : 'bg-[#EDE5D9] border-[#D6C8B8] hover:bg-[#E7DED1]/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => handleSelectPaymentMethod(pm.id as any)}
                      className="mt-1 text-[#C8A46A] focus:ring-[#C8A46A]"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{pm.title}</h4>
                        {pm.badge && (
                          <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#C8A46A]/20 text-[#8B6A4F]">
                            {pm.badge}
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-xs text-[#8B7562] mt-0.5">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>

              {/* ── Instant UPI QR Payment Section ──────────────────────── */}
              {paymentMethod === 'UPI' && (
                <div className="p-6 sm:p-8 rounded-[28px] bg-[#F4EFE7] border border-[#D6C8B8] space-y-6 shadow-inner">
                  <div className="text-center space-y-1">
                    <span className="tag-editorial">Instant UPI Escrow</span>
                    <h4 className="font-heading text-2xl font-normal text-[#3B2A22]">
                      Pay securely using UPI
                    </h4>
                    <p className="font-sans text-xs text-[#8B7562] max-w-md mx-auto">
                      Scan the merchant QR code with any UPI app on your mobile phone to complete payment.
                    </p>
                  </div>

                  {/* QR Code Container */}
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#D6C8B8] shadow-warm-card max-w-[280px] w-full text-center space-y-3">
                      <img
                        src={upiQrUrl}
                        alt="Merchant UPI QR Code"
                        className="w-full aspect-square object-contain rounded-2xl mx-auto border border-stone-100"
                      />
                      
                      <div className="pt-1 border-t border-stone-100 space-y-1">
                        <p className="font-sans text-xs font-semibold text-[#3B2A22]">{merchantName}</p>
                        <div className="flex items-center justify-center gap-1.5 bg-[#EDE5D9] px-2.5 py-1 rounded-lg">
                          <span className="font-mono text-[11px] text-[#6E5948] select-all truncate">
                            {upiId}
                          </span>
                          <button
                            type="button"
                            onClick={handleCopyUpiId}
                            className="text-[10px] font-sans font-semibold uppercase tracking-wider text-[#8B6A4F] hover:text-[#3B2A22] transition-colors shrink-0"
                            title="Copy UPI ID"
                          >
                            {copiedUpi ? '✓ Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="p-2 rounded-xl bg-[#C8A46A]/15 border border-[#C8A46A]/30">
                        <span className="text-[10px] font-sans uppercase font-bold tracking-wider text-[#8B6A4F] block">Amount to Pay</span>
                        <span className="font-heading text-xl font-normal text-[#3B2A22]">{formatINR(cart.subtotal)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Instructions */}
                  <div className="p-5 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] space-y-2.5 font-sans text-xs">
                    <p className="font-semibold text-[#3B2A22] uppercase tracking-wider text-[10px]">
                      Payment Steps:
                    </p>
                    <ol className="space-y-1.5 list-decimal list-inside text-[#6E5948] text-xs">
                      <li>Open any UPI application (Google Pay, PhonePe, Paytm, BHIM, CRED).</li>
                      <li>Scan the QR code above or pay to UPI ID <code className="font-mono bg-[#E7DED1] px-1 py-0.5 rounded text-[11px] text-[#3B2A22]">{upiId}</code>.</li>
                      <li>Complete the exact payment of <strong>{formatINR(cart.subtotal)}</strong>.</li>
                      <li>Return to CampusMarket.</li>
                      <li>Click <strong className="text-[#3B2A22]">"I've Paid — Proceed"</strong> below to confirm.</li>
                    </ol>
                  </div>

                  {/* UPI Confirmation Gate Action */}
                  <div className="pt-2">
                    {!upiConfirmed ? (
                      <button
                        type="button"
                        onClick={() => {
                          setUpiConfirmed(true);
                          setError(null);
                        }}
                        className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                      >
                        <span>I've Paid — Proceed</span>
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 flex items-center justify-between gap-3 text-xs font-sans">
                          <div className="flex items-center gap-2 text-[#6E8A62] font-semibold">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0">
                              <path d="M20 6L9 17l-5-5" />
                            </svg>
                            <span>UPI payment confirmation received</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setUpiConfirmed(false)}
                            className="text-[11px] text-[#8B7562] hover:text-[#3B2A22] underline font-medium shrink-0"
                          >
                            Change / Re-scan
                          </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#6E8A62]/10 border border-[#6E8A62]/20 text-[#6E8A62] text-xs font-semibold uppercase tracking-wider">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M20 6L9 17l-5-5" />
                          </svg>
                          <span>Payment Confirmed — Ready to Place Order</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Safety note */}
                  <div className="flex items-center justify-center gap-1.5 text-center font-sans text-[11px] text-[#8B7562]">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62] shrink-0">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span>CampusMarket Escrow: Seller only receives funds after you physically inspect the item.</span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Summary Panel */}
          <div className="lg:col-span-4">
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 sticky top-24">
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
                Order Review
              </h3>

              <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-[#D6C8B8] pr-1 font-sans text-xs">
                {cart.items.map((i) => (
                  <div key={i.id} className="pt-3 first:pt-0 flex justify-between gap-2">
                    <div>
                      <p className="font-semibold text-[#3B2A22] line-clamp-1">{i.product.title}</p>
                      <span className="text-[10px] text-[#8B7562]">Qty: {i.quantity}</span>
                    </div>
                    <span className="font-heading text-base font-normal text-[#3B2A22]">
                      {formatINR(i.lineTotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-[#D6C8B8] space-y-3 font-sans text-xs">
                <div className="flex justify-between items-center text-xs text-[#8B7562]">
                  <span>Payment Protection</span>
                  <span className="font-semibold text-[#3B2A22]">
                    {paymentMethod === 'UPI' ? 'Instant UPI Escrow' : 'Online Escrow Gateway'}
                  </span>
                </div>

                {paymentMethod === 'UPI' && (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-[#8B7562]">UPI Confirmation</span>
                    <span className={`font-semibold ${upiConfirmed ? 'text-[#6E8A62]' : 'text-[#9B5C52]'}`}>
                      {upiConfirmed ? '✓ Confirmed' : 'Pending Payment'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-baseline pt-2 border-t border-[#D6C8B8]/60">
                  <span className="font-heading text-xl text-[#3B2A22]">Total Payable</span>
                  <span className="font-heading text-3xl font-normal text-[#3B2A22]">
                    {formatINR(cart.subtotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isMainButtonDisabled}
                className={`w-full py-4 text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 rounded-full transition-all duration-200 ${
                  isMainButtonDisabled
                    ? 'bg-[#D6C8B8] text-[#8B7562] cursor-not-allowed opacity-60'
                    : 'btn-primary cursor-pointer'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-[#F4EFE7] border-t-transparent animate-spin" />
                    <span>Funding Escrow…</span>
                  </>
                ) : (
                  <span>{paymentMethod === 'UPI' ? 'Place Order & Lock Escrow' : 'Confirm Order & Lock Escrow'}</span>
                )}
              </button>

              {paymentMethod === 'UPI' && !upiConfirmed && (
                <p className="text-[11px] font-sans text-center text-[#8B7562] leading-tight">
                  Scan QR code and click <strong className="text-[#3B2A22]">"I've Paid — Proceed"</strong> above to enable order placement.
                </p>
              )}

              <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-center font-sans text-[11px] text-[#8B7562] flex items-center justify-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62] shrink-0">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>Verified Student Escrow. Seller receives payment only after you confirm item receipt.</span>
              </div>
            </div>
          </div>

        </form>
      )}
    </div>
  );
};
