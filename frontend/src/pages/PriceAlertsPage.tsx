import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api/client';
import { queryClient } from '../lib/queryClient';
import { formatINR } from '../lib/formatters';
import { PriceAlertModal } from '../components/alerts/PriceAlertModal';

export interface UserPriceAlertItem {
  id: string;
  productId: string;
  targetPrice: number;
  currentPrice: number;
  savings: number;
  savingsPercentage: number;
  isActive: boolean;
  createdAt: string;
  triggeredAt?: string | null;
  product: {
    id: string;
    title: string;
    price: string;
    status: string;
    quantity: number;
    images?: Array<{ id: string; imageUrl: string; isPrimary: boolean }>;
    category?: { name: string; slug: string } | null;
    college?: { name: string; code: string } | null;
    seller?: { id: string; storeName: string; rating: number } | null;
  };
}

export const PriceAlertsPage: React.FC = () => {
  const [selectedAlert, setSelectedAlert] = useState<UserPriceAlertItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [loadingAlertId, setLoadingAlertId] = useState<string | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['my-price-alerts'],
    queryFn: async () => {
      const res: any = await apiClient.get('/price-alerts');
      return {
        alerts: (res.data?.alerts || []) as UserPriceAlertItem[],
        pagination: res.data?.pagination || { page: 1, total: 0 },
      };
    },
  });

  const alerts = data?.alerts || [];

  const handleOpenEdit = (alert: UserPriceAlertItem) => {
    setSelectedAlert(alert);
    setIsModalOpen(true);
  };

  const handleSaveAlert = async (targetPrice: number) => {
    if (!selectedAlert) return;
    try {
      setActionError(null);
      await apiClient.post(`/products/${selectedAlert.productId}/price-alert`, { targetPrice });
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['price-alert', selectedAlert.productId] });
      setActionSuccess(`Updated target price to ${formatINR(targetPrice)}!`);
    } catch (err: any) {
      throw err;
    }
  };

  const handleRemoveAlert = async (productId: string) => {
    try {
      setLoadingAlertId(productId);
      setActionError(null);
      await apiClient.delete(`/products/${productId}/price-alert`);
      await refetch();
      queryClient.invalidateQueries({ queryKey: ['price-alert', productId] });
      setActionSuccess('Price alert removed.');
    } catch (err: any) {
      setActionError(err.message || 'Couldn\'t remove alert. Please try again.');
    } finally {
      setLoadingAlertId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-8 text-[#3B2A22]">
      {/* Header Banner */}
      <div className="p-8 sm:p-12 rounded-[36px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="tag-editorial mb-3 block">Smart Price Drops & Restocks</span>
          <h1 className="font-heading text-4xl sm:text-5xl font-normal text-[#3B2A22] leading-tight">
            My Price Alerts
          </h1>
          <p className="font-sans text-xs sm:text-sm text-[#6E5948] max-w-xl mt-2 leading-relaxed">
            Track secondhand course textbooks, electronics, and lab tools. We will automatically notify you the moment a seller lowers their price to your target.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/products" className="btn-primary text-xs !py-3 !px-5 whitespace-nowrap">
            Browse Marketplace →
          </Link>
        </div>
      </div>

      {/* Action Messages */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] text-xs font-sans font-semibold flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="text-xs">✕</button>
        </div>
      )}

      {actionError && (
        <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-sans font-semibold flex items-center justify-between">
          <span>✕ {actionError}</span>
          <button onClick={() => setActionError(null)} className="text-xs">✕</button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 rounded-[32px] skeleton" />
          ))}
        </div>
      ) : isError ? (
        <div className="p-12 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] text-center font-sans text-xs text-[#9B5C52]">
          Failed to load price alerts. Please refresh the page.
        </div>
      ) : alerts.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] text-[#C8A46A] flex items-center justify-center mx-auto text-2xl">
            🔔
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">
            You don't have any active price alerts yet
          </h3>
          <p className="font-sans text-xs text-[#6E5948] max-w-md mx-auto leading-relaxed">
            Set alerts on courseware you want to purchase. When sellers drop their prices or restock, you'll receive immediate notifications.
          </p>
          <div className="pt-2">
            <Link to="/products" className="btn-primary text-xs">
              Explore Course Catalog
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map((alert) => {
            const primaryImg = alert.product.images?.find((img) => img.isPrimary)?.imageUrl || alert.product.images?.[0]?.imageUrl;
            return (
              <div
                key={alert.id}
                className="p-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-card hover:shadow-warm-hover transition-all flex flex-col justify-between space-y-4 group"
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C8A46A]/20 border border-[#C8A46A]/40 text-[#3B2A22] text-[10px] font-sans font-bold uppercase tracking-wider">
                      <span>🔔</span> Active Alert
                    </span>

                    {alert.product.college && (
                      <span className="text-[10px] font-sans font-semibold text-[#8B7562] truncate max-w-[120px]">
                        {alert.product.college.name}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail & Title */}
                  <div className="flex gap-4 items-start">
                    {primaryImg ? (
                      <img
                        src={primaryImg}
                        alt={alert.product.title}
                        className="w-16 h-16 rounded-2xl object-cover border border-[#D6C8B8] flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center text-xl flex-shrink-0">
                        📚
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${alert.productId}`}
                        className="font-heading text-lg font-normal text-[#3B2A22] hover:text-[#8B6A4F] transition-colors line-clamp-2"
                      >
                        {alert.product.title}
                      </Link>
                      {alert.product.seller && (
                        <p className="font-sans text-[11px] text-[#8B7562] mt-0.5">
                          Seller: {alert.product.seller.storeName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Price Metrics Grid */}
                  <div className="mt-5 p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] grid grid-cols-2 gap-3 text-xs font-sans">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8B7562] block">Current Price</span>
                      <span className="font-bold text-[#3B2A22] text-sm">{formatINR(alert.currentPrice)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#8B7562] block">Target Price</span>
                      <span className="font-bold text-[#C8A46A] text-sm">{formatINR(alert.targetPrice)}</span>
                    </div>

                    {alert.savings > 0 && (
                      <div className="col-span-2 pt-1 border-t border-[#D6C8B8]/60 flex items-center justify-between text-[11px]">
                        <span className="text-[#6E8A62] font-semibold">Potential Savings:</span>
                        <span className="font-bold text-[#6E8A62]">
                          {formatINR(alert.savings)} ({alert.savingsPercentage}% off)
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#D6C8B8]">
                  <Link
                    to={`/products/${alert.productId}`}
                    className="btn-primary flex-1 !py-2 !px-3 !min-h-[36px] text-center text-xs"
                  >
                    View Listing
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(alert)}
                    className="btn-secondary !py-2 !px-3 !min-h-[36px] text-xs"
                    title="Edit Target Price"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    disabled={loadingAlertId === alert.productId}
                    onClick={() => handleRemoveAlert(alert.productId)}
                    className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-full border border-[#D6C8B8] hover:border-[#9B5C52] text-[#8B7562] hover:text-[#9B5C52] hover:bg-[#9B5C52]/10 flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove Alert"
                    aria-label="Remove Alert"
                  >
                    {loadingAlertId === alert.productId ? (
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {selectedAlert && (
        <PriceAlertModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedAlert(null);
          }}
          productTitle={selectedAlert.product.title}
          productImage={selectedAlert.product.images?.[0]?.imageUrl}
          currentPrice={selectedAlert.currentPrice}
          initialTargetPrice={selectedAlert.targetPrice}
          onSaveAlert={handleSaveAlert}
          onRemoveAlert={() => handleRemoveAlert(selectedAlert.productId)}
        />
      )}
    </div>
  );
};
