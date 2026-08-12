import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        setIsLoading(true);
        const res: any = await apiClient.get('/admin/audit-logs');
        setLogs(res.data.logs || []);
      } catch (err) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }
    loadLogs();
  }, []);

  return (
    <div className="space-y-8 text-[#3B2A22]">
      <div>
        <span className="tag-editorial mb-2 block">System Governance</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Platform Audit Logs</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Immutable security record of administrative actions, user promotions, and system events</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading audit records…</div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="p-4 pl-6">Action</th>
                  <th className="p-4">Target Resource</th>
                  <th className="p-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="p-4 pl-6 font-semibold text-[#3B2A22]">{l.action}</td>
                    <td className="p-4 text-[#6E5948] font-mono">{l.resource}</td>
                    <td className="p-4 text-[#8B7562]">{new Date(l.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
