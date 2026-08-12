import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export const AdminReportsPage: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReports() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/reports');
        setReports(res.data.reports || []);
      } catch (err) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadReports();
  }, []);

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">Safety & Community</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Content Reports & Moderation</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Review flagged messages, inappropriate listings, and seller reports</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading report queue…</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#6E8A62]">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Active Abuse Reports</h3>
          <p className="font-sans text-xs text-[#8B7562]">All campus moderation reports have been resolved.</p>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-xs">
          {reports.map((r) => (
            <div key={r.id} className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex justify-between items-start gap-4">
              <div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#9B5C52]/15 text-[#9B5C52] text-[10px] font-bold uppercase mb-2 inline-block">
                  {r.reason || 'Flagged Content'}
                </span>
                <p className="font-heading text-xl font-normal text-[#3B2A22]">{r.details || 'Message reported for policy review'}</p>
                <p className="text-[11px] text-[#8B7562] mt-1">Reported by: {r.reporter?.firstName || 'User'}</p>
              </div>

              <button className="btn-secondary text-xs !py-2 !px-4">
                Resolve Report
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
