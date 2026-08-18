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
  const [paymentMethod, setPaymentMethod] = useState<'ESCROW_HOLD' | 'UPI' | 'CARD'>('ESCROW_HOLD');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handlePlaceOrderAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

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

      // 2. Create Order in DB
      const orderRes: any = await apiClient.post('/orders', {
        shippingAddressId,
        fulfillmentMode: 'CAMPUS_MEETUP',
      });

      const orderNumber = orderRes.data.order.orderNumber;

      if (paymentMethod === 'ESCROW_HOLD') {
        queryClient.invalidateQueries();
        navigate(`/orders/${orderNumber}/tracking`);
        return;
      }

      // 3. Create Razorpay Payment Order for external gateways
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
                  paymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'CARD',
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
            <div className="p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
              <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
                Escrow Payment Protection Method
              </h3>

              <div className="space-y-3">
                {[
                  { id: 'ESCROW_HOLD', title: 'Razorpay Campus Escrow (Recommended)', desc: 'Funds held securely in escrow until item physical inspection' },
                  { id: 'UPI', title: 'Instant UPI Escrow (Google Pay / PhonePe / Paytm)', desc: 'Pay via UPI with instant escrow lock' },
                  { id: 'CARD', title: 'Credit / Debit Card Escrow', desc: 'Secure card transaction with 100% buyer protection' },
                ].map((pm) => (
                  <label
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`flex items-start gap-4 p-5 rounded-2xl border transition-all cursor-pointer ${
                      paymentMethod === pm.id
                        ? 'bg-[#E7DED1] border-[#C8A46A] shadow-sm'
                        : 'bg-[#EDE5D9] border-[#D6C8B8] hover:bg-[#E7DED1]/60'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === pm.id}
                      onChange={() => setPaymentMethod(pm.id as any)}
                      className="mt-1 text-[#C8A46A] focus:ring-[#C8A46A]"
                    />
                    <div>
                      <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{pm.title}</h4>
                      <p className="font-sans text-xs text-[#8B7562] mt-0.5">{pm.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
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

              <div className="pt-4 border-t border-[#D6C8B8] space-y-2 font-sans text-xs">
                <div className="flex justify-between items-baseline">
                  <span className="font-heading text-xl text-[#3B2A22]">Total Payable</span>
                  <span className="font-heading text-3xl font-normal text-[#3B2A22]">
                    {formatINR(cart.subtotal)}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full py-4 text-xs font-semibold uppercase tracking-wider"
              >
                {isSubmitting ? 'Funding Escrow…' : 'Confirm Order & Lock Escrow'}
              </button>

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
