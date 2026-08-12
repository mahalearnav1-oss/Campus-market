import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export const AdminDisputesPage: React.FC = () => {
  const [disputes, setDisputes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDisputes() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/disputes');
        setDisputes(res.data.disputes || []);
      } catch (err) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadDisputes();
  }, []);

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">Resolution Center</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Disputes & Refunds</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Arbitrate escrow disputes between buyers and sellers regarding item condition or missing pickups</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading dispute resolution queue…</div>
      ) : disputes.length === 0 ? (
        <div className="text-center py-20 px-6 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#E7DED1] text-[#3B2A22] flex items-center justify-center mx-auto">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
              <path d="M12 3v18M3 7h18M6 12l-3 7h6l-3-7zM18 12l-3 7h6l-3-7z" />
            </svg>
          </div>
          <h3 className="font-heading text-3xl font-normal text-[#3B2A22]">No Open Escrow Disputes</h3>
          <p className="font-sans text-xs text-[#8B7562]">All campus transaction handshakes have been completed cleanly.</p>
        </div>
      ) : (
        <div className="space-y-4 font-sans text-xs">
          {disputes.map((d) => (
            <div key={d.id} className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle flex justify-between items-center gap-4">
              <div>
                <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">Dispute #{d.id.slice(0, 8)}</h3>
                <p className="text-[#6E5948] mt-1">Reason: {d.reason}</p>
              </div>
              <button className="btn-primary text-xs !py-2 !px-4">
                Arbitrate Dispute
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
