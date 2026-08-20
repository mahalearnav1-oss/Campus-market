import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../lib/api/client';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [activeReport, setActiveReport] = useState<any | null>(null);
  const [resolutionStatus, setResolutionStatus] = useState<'RESOLVED' | 'DISMISSED'>('RESOLVED');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmittingResolution, setIsSubmittingResolution] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function loadReports() {
    try {
      setIsLoading(true);
      const url = selectedStatus === 'ALL' ? '/admin/reports' : `/admin/reports?status=${selectedStatus}`;
      const res: any = await apiClient.get(url);
      setReports(res.data.reports || []);
    } catch (err) {
      // Ignore
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [selectedStatus]);

  const handleOpenReview = (report: any) => {
    setActiveReport(report);
    setResolutionStatus('RESOLVED');
    setResolutionNotes('');
    setActionError(null);
  };

  const handleResolveReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReport) return;

    try {
      setIsSubmittingResolution(true);
      setActionError(null);

      await apiClient.patch(`/admin/reports/${activeReport.id}/resolve`, {
        status: resolutionStatus,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });

      setActionSuccess(`Report #${activeReport.id.slice(0, 8)} marked as ${resolutionStatus}.`);
      setActiveReport(null);
      await loadReports();
    } catch (err: any) {
      setActionError(err.message || 'Failed to update report status.');
    } finally {
      setIsSubmittingResolution(false);
    }
  };

  const filterTabs = [
    { key: 'ALL', label: 'All Reports' },
    { key: 'PENDING', label: 'Pending Review' },
    { key: 'RESOLVED', label: 'Resolved' },
    { key: 'DISMISSED', label: 'Dismissed' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full bg-[#9B5C52]/15 text-[#9B5C52] border border-[#9B5C52]/30 text-[10px] font-bold uppercase tracking-wider">
            Pending
          </span>
        );
      case 'UNDER_REVIEW':
        return (
          <span className="px-3 py-1 rounded-full bg-[#C8A46A]/20 text-[#8B6A4F] border border-[#C8A46A]/40 text-[10px] font-bold uppercase tracking-wider">
            Under Review
          </span>
        );
      case 'RESOLVED':
        return (
          <span className="px-3 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-[10px] font-bold uppercase tracking-wider">
            Resolved
          </span>
        );
      case 'DISMISSED':
        return (
          <span className="px-3 py-1 rounded-full bg-[#8B7562]/20 text-[#6E5948] border border-[#8B7562]/30 text-[10px] font-bold uppercase tracking-wider">
            Dismissed
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full bg-[#EDE5D9] text-[#3B2A22] border border-[#D6C8B8] text-[10px] font-bold uppercase tracking-wider">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div>
        <span className="tag-editorial mb-2 block">Safety & Trust Moderation</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Content Reports</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">
          Review user-submitted reports on suspicious listings, counterfeit items, and abusive sellers
        </p>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] text-xs font-sans font-semibold flex items-center justify-between">
          <span>✓ {actionSuccess}</span>
          <button onClick={() => setActionSuccess(null)} className="hover:opacity-75">✕</button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-[#D6C8B8] pb-4">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-4 py-2 rounded-full font-sans text-xs font-semibold transition-all ${
              selectedStatus === tab.key
                ? 'bg-[#111111] text-[#F4EFE7]'
                : 'bg-[#EDE5D9] text-[#6E5948] hover:bg-[#E7DED1] hover:text-[#3B2A22] border border-[#D6C8B8]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-xs text-[#8B7562]">
          <div className="w-10 h-10 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          Loading report queue…
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6E8A62]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Active Abuse Reports</h3>
          <p className="font-sans text-xs text-[#8B7562] max-w-sm mx-auto">
            {selectedStatus === 'ALL'
              ? 'All campus moderation reports have been resolved.'
              : `No reports found matching filter "${selectedStatus}".`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r.id}
              className="p-6 sm:p-8 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#D6C8B8] pb-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-heading text-2xl font-normal text-[#3B2A22]">
                      Report #{r.id.slice(0, 8)}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#C8A46A]/20 text-[#8B6A4F] text-[10px] font-bold uppercase tracking-wider">
                      {r.targetType}
                    </span>
                    {getStatusBadge(r.status)}
                  </div>
                  <p className="font-sans text-xs text-[#9B5C52] font-semibold">
                    Violation: {r.reason}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => handleOpenReview(r)}
                    className="btn-primary text-xs !py-2 !px-5"
                  >
                    Take Action
                  </button>
                </div>
              </div>

              {/* Target & Reporter Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-sans text-xs bg-[#E7DED1] p-4 rounded-2xl border border-[#D6C8B8]">
                <div>
                  <span className="text-[10px] font-semibold text-[#8B7562] uppercase block">Reported Target</span>
                  {r.targetType === 'PRODUCT' ? (
                    <Link
                      to={`/products/${r.targetId}`}
                      className="font-semibold text-[#3B2A22] hover:underline block truncate"
                    >
                      {r.targetDetails?.title || `Product ID: ${r.targetId}`}
                    </Link>
                  ) : r.targetType === 'SELLER' ? (
                    <Link
                      to={`/sellers/${r.targetId}`}
                      className="font-semibold text-[#3B2A22] hover:underline block truncate"
                    >
                      {r.targetDetails?.storeName || `Seller ID: ${r.targetId}`}
                    </Link>
                  ) : (
                    <span className="font-semibold text-[#3B2A22] block truncate">
                      {r.targetDetails?.name || r.targetId}
                    </span>
                  )}
                  <span className="text-[10px] text-[#8B7562]">
                    Reported on {new Date(r.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-semibold text-[#8B7562] uppercase block">Reported By</span>
                  <span className="font-semibold text-[#3B2A22] block">
                    {r.reporter?.firstName || 'Student User'}
                  </span>
                  <span className="text-[11px] text-[#8B7562] block">{r.reporter?.email}</span>
                </div>
              </div>

              {/* Description & Resolution Notes */}
              <div className="font-sans text-xs space-y-2">
                {r.description && (
                  <p className="text-[#4A392F] leading-relaxed">
                    <strong className="text-[#3B2A22]">Reporter's Notes:</strong> {r.description}
                  </p>
                )}

                {r.resolutionNotes && (
                  <div className="p-3.5 rounded-2xl bg-[#F4EFE7] border border-[#D6C8B8] text-xs">
                    <span className="font-semibold text-[#3B2A22] block mb-0.5">Admin Moderation Notes:</span>
                    <p className="text-[#6E5948]">{r.resolutionNotes}</p>
                    {r.resolvedAt && (
                      <span className="text-[10px] text-[#8B7562] mt-1 block">
                        Resolved on {new Date(r.resolvedAt).toLocaleDateString('en-IN')}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review & Resolution Modal */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-2xl p-6 sm:p-8 space-y-6 text-[#3B2A22] max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-start justify-between border-b border-[#D6C8B8] pb-4">
              <div>
                <span className="tag-editorial mb-1 block">Moderation Action</span>
                <h2 className="font-heading text-2xl font-normal text-[#3B2A22]">
                  Review Report #{activeReport.id.slice(0, 8)}
                </h2>
                <p className="font-sans text-xs text-[#8B7562] mt-0.5">
                  Target: {activeReport.targetType} ({activeReport.reason})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveReport(null)}
                className="w-8 h-8 rounded-full bg-[#E7DED1] hover:bg-[#D6C8B8] text-[#8B7562] hover:text-[#3B2A22] flex items-center justify-center transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            {actionError && (
              <div className="p-3.5 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] text-xs font-sans font-semibold">
                {actionError}
              </div>
            )}

            <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] font-sans text-xs space-y-1.5">
              <p>
                <strong className="text-[#3B2A22]">Reason:</strong> {activeReport.reason}
              </p>
              {activeReport.description && (
                <p className="text-[#6E5948]">
                  <strong className="text-[#3B2A22]">Details:</strong> {activeReport.description}
                </p>
              )}
            </div>

            <form onSubmit={handleResolveReport} className="space-y-4 font-sans text-xs">
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  Action Decision
                </label>
                <select
                  value={resolutionStatus}
                  onChange={(e) => setResolutionStatus(e.target.value as any)}
                  className="input-editorial cursor-pointer"
                >
                  <option value="RESOLVED">
                    ✓ Mark Resolved (Policy action taken / Listing reviewed)
                  </option>
                  <option value="DISMISSED">
                    ✕ Dismiss Report (No violation found)
                  </option>
                </select>
              </div>

              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  Moderator Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Optional internal notes on action taken..."
                  className="input-editorial !py-3 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#D6C8B8]">
                <button
                  type="button"
                  onClick={() => setActiveReport(null)}
                  disabled={isSubmittingResolution}
                  className="btn-secondary !py-2.5 !px-5 text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingResolution}
                  className="btn-primary !py-2.5 !px-6 text-xs flex items-center gap-2"
                >
                  {isSubmittingResolution ? 'Saving…' : 'Save Decision'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
