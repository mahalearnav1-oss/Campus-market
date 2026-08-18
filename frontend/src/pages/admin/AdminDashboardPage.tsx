import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';
import { formatINR } from '../../lib/formatters';

export interface DashboardMetrics {
  totalUsers: number;
  totalSellers: number;
  activeSellers: number;
  pendingSellers: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  ordersToday: number;
  totalRevenue: string;
  openReports: number;
  openDisputes: number;
  recentAuditLogs: Array<{ id: string; action: string; resource: string; createdAt: string; actor?: { firstName: string } }>;
}

export const AdminDashboardPage: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/dashboard');
        setMetrics(res.data);
      } catch (err: any) {
        setError(err.message || 'Failed to load admin analytics.');
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-4" />
        <p className="font-sans text-xs text-[#8B7562]">Loading platform analytics…</p>
      </div>
    );
  }

  if (error || !metrics) {
    return (
      <div className="p-6 bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-semibold rounded-2xl">
        {error || 'Failed to load data.'}
      </div>
    );
  }

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* Title */}
      <div>
        <span className="tag-editorial mb-2 block">Executive Control Room</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Platform Analytics Dashboard</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Live operational metrics and aggregated transaction analytics across all university campuses</p>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-[#E7DED1] border border-[#D6C8B8] p-6 rounded-[28px] space-y-2 shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">Total Registered Users</span>
          <span className="font-heading text-4xl font-normal text-[#3B2A22]">{metrics.totalUsers}</span>
          <span className="font-sans text-[11px] text-[#6E8A62] block font-semibold">Active campus buyers & sellers</span>
        </div>

        <div className="bg-[#E7DED1] border border-[#D6C8B8] p-6 rounded-[28px] space-y-2 shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">Verified Sellers</span>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-4xl font-normal text-[#3B2A22]">{metrics.activeSellers}</span>
            <span className="font-sans text-xs text-[#9B5C52] font-semibold">({metrics.pendingSellers} pending)</span>
          </div>
          <span className="font-sans text-[11px] text-[#8B7562] block">Active campus storefronts</span>
        </div>

        <div className="bg-[#E7DED1] border border-[#D6C8B8] p-6 rounded-[28px] space-y-2 shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">Active Catalog Items</span>
          <span className="font-heading text-4xl font-normal text-[#3B2A22]">{metrics.activeProducts}</span>
          <span className="font-sans text-[11px] text-[#8B7562] block">Out of {metrics.totalProducts} total catalog listings</span>
        </div>

        <div className="bg-[#E7DED1] border border-[#D6C8B8] p-6 rounded-[28px] space-y-2 shadow-warm-subtle">
          <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">Total Escrow GMV</span>
          <span className="font-heading text-4xl font-normal text-[#3B2A22]">{formatINR(metrics.totalRevenue || 0)}</span>
          <span className="font-sans text-[11px] text-[#6E8A62] block font-semibold">{metrics.totalOrders} total completed orders</span>
        </div>
      </div>

      {/* Warm Analytics Bar & Donut Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Activity Breakdown Bar Chart */}
        <div className="lg:col-span-2 bg-[#E7DED1] border border-[#D6C8B8] p-8 rounded-[32px] space-y-6 shadow-warm-subtle">
          <h2 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">
            Platform Activity Breakdown
          </h2>
          <div className="h-48 w-full flex items-end justify-between gap-4 pt-4 px-2 border-b border-[#D6C8B8]">
            {[
              { label: 'Users', val: metrics.totalUsers, color: 'bg-[#3B2A22]' },
              { label: 'Sellers', val: metrics.totalSellers, color: 'bg-[#C8A46A]' },
              { label: 'Products', val: metrics.totalProducts, color: 'bg-[#D7B98A]' },
              { label: 'Orders', val: metrics.totalOrders, color: 'bg-[#6E8A62]' },
              { label: 'Reports', val: metrics.openReports, color: 'bg-[#9B5C52]' },
              { label: 'Disputes', val: metrics.openDisputes, color: 'bg-[#C49A5A]' },
            ].map((bar) => {
              const maxVal = Math.max(metrics.totalUsers, metrics.totalProducts, metrics.totalOrders, 10);
              const heightPct = Math.max(15, (bar.val / maxVal) * 100);

              return (
                <div key={bar.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="font-sans text-xs font-bold text-[#3B2A22]">{bar.val}</span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full max-w-[48px] rounded-t-2xl ${bar.color} transition-all duration-500 group-hover:opacity-85`}
                  />
                  <span className="font-sans text-[11px] font-semibold text-[#8B7562] uppercase tracking-wider">{bar.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Minimal Donut Distribution Chart */}
        <div className="bg-[#E7DED1] border border-[#D6C8B8] p-8 rounded-[32px] flex flex-col justify-between shadow-warm-subtle">
          <div>
            <h2 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4 mb-6">
              Seller Status Ratio
            </h2>
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center my-4">
              <div className="w-full h-full rounded-full border-[14px] border-[#6E8A62] border-t-[#C8A46A] border-r-[#C8A46A] animate-spin-slow" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-heading text-3xl font-normal text-[#3B2A22]">
                  {metrics.totalSellers > 0 ? Math.round((metrics.activeSellers / metrics.totalSellers) * 100) : 0}%
                </span>
                <span className="font-sans text-[9px] font-bold text-[#8B7562] uppercase tracking-widest">Verified Ratio</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#D6C8B8] text-xs font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#6E8A62]" />
                <span className="text-[#6E5948]">Verified Sellers</span>
              </div>
              <span className="font-semibold text-[#3B2A22]">{metrics.activeSellers}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#C8A46A]" />
                <span className="text-[#6E5948]">Pending Verification</span>
              </div>
              <span className="font-semibold text-[#3B2A22]">{metrics.pendingSellers}</span>
            </div>
          </div>
        </div>

      </div>

      {/* Audit Log Timeline */}
      <div className="bg-[#E7DED1] border border-[#D6C8B8] p-8 rounded-[32px] space-y-4 shadow-warm-subtle">
        <h2 className="font-heading text-2xl font-normal text-[#3B2A22] border-b border-[#D6C8B8] pb-4">Recent Audit Log Stream</h2>
        {metrics.recentAuditLogs && metrics.recentAuditLogs.length > 0 ? (
          <div className="space-y-3">
            {metrics.recentAuditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-[#EDE5D9] border border-[#D6C8B8] flex items-center justify-between text-xs font-sans">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-[#111111] text-[#F4EFE7] font-sans font-bold text-[10px] uppercase">
                    {log.action}
                  </span>
                  <span className="text-[#3B2A22] font-medium">{log.resource}</span>
                </div>
                <span className="text-[#8B7562] text-[10px]">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-sans text-xs text-[#8B7562] py-4">No recent audit log entries recorded.</p>
        )}
      </div>

    </div>
  );
};
