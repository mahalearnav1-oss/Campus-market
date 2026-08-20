import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiClient } from '../lib/api/client';
import { RatingStars } from '../components/reviews/RatingStars';
import { ReviewModal, ExistingReviewData } from '../components/reviews/ReviewModal';
import { DisputeModal } from '../components/disputes/DisputeModal';
import { formatINR } from '../lib/formatters';

export const OrderDetailPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [disputeSuccessMsg, setDisputeSuccessMsg] = useState<string | null>(null);

  // Review Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: 'product' | 'seller';
    productId?: string;
    orderItemId?: string;
    orderId?: string;
    sellerId?: string;
    itemTitle: string;
    itemImage?: string | null;
    existingReview?: ExistingReviewData | null;
  }>({
    isOpen: false,
    type: 'product',
    itemTitle: '',
  });

  async function loadOrder() {
    if (!orderNumber) return;
    try {
      setIsLoading(true);
      const res: any = await apiClient.get(`/orders/${orderNumber}`);
      setOrder(res.data.order);
    } catch (err: any) {
      setError(err.message || 'Couldn\'t load order details. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
  }, [orderNumber]);

  const handleOpenProductReview = (item: any) => {
    setModalState({
      isOpen: true,
      type: 'product',
      productId: item.productId,
      orderItemId: item.id,
      itemTitle: item.snapshotTitle,
      itemImage: item.snapshotImage || item.product?.images?.[0]?.imageUrl || null,
      existingReview: item.review || null,
    });
  };

  const handleOpenSellerReview = () => {
    if (!order?.seller) return;
    setModalState({
      isOpen: true,
      type: 'seller',
      orderId: order.id,
      sellerId: order.seller.id,
      itemTitle: order.seller.storeName || 'Student Seller',
      existingReview: order.sellerReview || null,
    });
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading order receipt details…</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card text-center space-y-6 text-[#3B2A22]">
        <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-2">Order Not Found</h2>
          <p className="font-sans text-xs text-[#6E5948] leading-relaxed">{error || 'Order record does not exist.'}</p>
        </div>
        <Link to="/orders" className="btn-primary w-full text-xs">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">
      <Link to="/orders" className="inline-flex items-center gap-2 font-sans text-xs text-[#8B7562] hover:text-[#3B2A22] transition-colors">
        ← Back to Order History
      </Link>

      {/* Header Banner */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-2 block">Order Receipt</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Order #{order.orderNumber}</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-xs font-sans font-bold uppercase tracking-wider">
            {order.status}
          </span>
          <Link to={`/orders/${order.orderNumber}/tracking`} className="btn-primary text-xs !py-2.5 !px-5">
            Track Escrow Status →
          </Link>
        </div>
      </div>

      {/* Purchased Items Section */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <h3 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
          Purchased Course Items
        </h3>
        <div className="divide-y divide-[#D6C8B8] font-sans text-xs">
          {order.items?.map((item: any) => {
            const itemImg = item.snapshotImage || item.product?.images?.[0]?.imageUrl;
            return (
              <div key={item.id} className="py-5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {itemImg && (
                    <img
                      src={itemImg}
                      alt={item.snapshotTitle}
                      className="w-16 h-16 object-cover rounded-2xl border border-[#D6C8B8] bg-[#E7DED1] flex-shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="font-heading text-xl font-normal text-[#3B2A22]">{item.snapshotTitle}</h4>
                    <p className="text-[11px] text-[#8B7562] mt-0.5">Qty: {item.quantity}</p>

                    {/* Review State for Completed Orders */}
                    {order.status === 'COMPLETED' && (
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {item.hasReviewed ? (
                          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-[11px] font-semibold text-[#3B2A22]">
                            <RatingStars rating={item.review?.rating || 5} size="sm" />
                            <span>Rated {item.review?.rating}/5</span>
                          </div>
                        ) : null}

                        {item.hasReviewed && (
                          <button
                            type="button"
                            onClick={() => handleOpenProductReview(item)}
                            className="btn-secondary !py-1 !px-3 text-[11px] font-semibold"
                          >
                            Edit Review
                          </button>
                        )}

                        {item.canReview && (
                          <button
                            type="button"
                            onClick={() => handleOpenProductReview(item)}
                            className="btn-primary !py-1.5 !px-4 text-[11px] font-semibold inline-flex items-center gap-1.5 shadow-sm"
                          >
                            <span>★</span> Rate & Review
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <span className="font-heading text-2xl font-normal text-[#3B2A22] self-start sm:self-center">
                  {formatINR(item.lineTotal || item.snapshotPrice || item.snapshotUnitPrice)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="pt-6 border-t border-[#D6C8B8] flex justify-between items-baseline font-sans text-xs">
          <span className="font-heading text-xl text-[#3B2A22]">Total Order Amount</span>
          <span className="font-heading text-4xl font-normal text-[#3B2A22]">
            {formatINR(order.totalAmount)}
          </span>
        </div>
      </div>

      {/* Seller Review Banner if Completed */}
      {order.status === 'COMPLETED' && order.seller && (
        <div className="p-6 sm:p-8 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="tag-editorial mb-1 block">Seller Feedback</span>
            <h4 className="font-heading text-2xl font-normal text-[#3B2A22]">
              Storefront: {order.seller.storeName || 'Student Seller'}
            </h4>
            <p className="font-sans text-xs text-[#8B7562] mt-0.5">
              How was your handover & communication experience with this seller?
            </p>
          </div>

          <div>
            {order.hasReviewedSeller ? (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E7DED1] border border-[#D6C8B8] text-xs font-semibold text-[#3B2A22]">
                <RatingStars rating={order.sellerReview?.rating || 5} size="sm" />
                <span>Seller Rated ({order.sellerReview?.rating}★)</span>
              </div>
            ) : order.canReviewSeller ? (
              <button
                type="button"
                onClick={handleOpenSellerReview}
                className="btn-secondary !py-2.5 !px-5 text-xs font-semibold"
              >
                ★ Rate Seller
              </button>
            ) : null}
          </div>
        </div>
      )}

      {/* Dispute Success Alert */}
      {disputeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] text-xs font-sans font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{disputeSuccessMsg}</span>
          </div>
          <button onClick={() => setDisputeSuccessMsg(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Active Dispute Information Card */}
      {order.dispute && (
        <div className="p-6 sm:p-8 rounded-[28px] bg-[#9B5C52]/10 border border-[#9B5C52]/25 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#9B5C52]/20 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#9B5C52] animate-pulse" />
              <h4 className="font-heading text-xl font-normal text-[#9B5C52]">
                Escrow Dispute Active ({order.dispute.reason.replace(/_/g, ' ')})
              </h4>
            </div>
            <span className="font-sans text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#9B5C52]/15 text-[#9B5C52] border border-[#9B5C52]/30 self-start sm:self-auto">
              Status: {order.dispute.status.replace(/_/g, ' ')}
            </span>
          </div>

          <div className="font-sans text-xs text-[#6E5948] space-y-2">
            <p>
              <strong className="text-[#3B2A22]">Dispute Explanation:</strong> {order.dispute.explanation}
            </p>
            {order.dispute.resolutionNotes && (
              <div className="p-3.5 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] text-xs space-y-1">
                <span className="font-semibold text-[#3B2A22] block">Resolution Decision / Admin Notes:</span>
                <p className="text-[#6E5948]">{order.dispute.resolutionNotes}</p>
              </div>
            )}
            <p className="text-[11px] text-[#8B7562]">
              Submitted on {new Date(order.dispute.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      )}

      {/* Open Dispute Action Section (If eligible and not disputed) */}
      {!order.dispute && ['PAID_ESCROW', 'SELLER_ACCEPTED', 'DELIVERED_PENDING_INSPECTION', 'COMPLETED'].includes(order.status) && (
        <div className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans text-xs">
          <div>
            <h4 className="font-heading text-xl font-normal text-[#3B2A22]">
              Need Help with this Campus Exchange?
            </h4>
            <p className="text-[#8B7562] mt-0.5">
              If the item condition was misrepresented, or the handover could not be completed, you can open an escrow dispute.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsDisputeModalOpen(true)}
            className="btn-secondary !py-2.5 !px-5 text-xs text-[#9B5C52] border-[#9B5C52]/40 hover:border-[#9B5C52] hover:bg-[#9B5C52]/10 shrink-0 inline-flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>Open Dispute</span>
          </button>
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onSuccess={() => {
          loadOrder();
        }}
        type={modalState.type}
        productId={modalState.productId}
        orderItemId={modalState.orderItemId}
        orderId={modalState.orderId}
        sellerId={modalState.sellerId}
        itemTitle={modalState.itemTitle}
        itemImage={modalState.itemImage}
        existingReview={modalState.existingReview}
      />

      {/* Dispute Modal */}
      <DisputeModal
        isOpen={isDisputeModalOpen}
        onClose={() => setIsDisputeModalOpen(false)}
        onSuccess={() => {
          setDisputeSuccessMsg('Dispute submitted successfully. Our resolution team will review the case.');
          loadOrder();
        }}
        orderId={order.id}
        orderNumber={order.orderNumber}
      />
    </div>
  );
};

