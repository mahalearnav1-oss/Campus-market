import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export interface AdminUserItem {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  isStudentVerified: boolean;
  createdAt: string;
  college?: { name: string } | null;
  seller?: { id: string; storeName: string } | null;
}

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      if (search) queryParams.append('search', search);
      if (statusFilter) queryParams.append('status', statusFilter);

      const res: any = await apiClient.get(`/admin/users?${queryParams.toString()}`);
      setUsers(res.data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const handleUpdateStatus = async (userId: string, newStatus: string) => {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, {
        status: newStatus,
        reason: `Admin status update to ${newStatus}`,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div>
        <span className="tag-editorial mb-2 block">User Directory</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">User Management</h1>
        <p className="font-sans text-xs text-[#8B7562] mt-1">Inspect user accounts, verify student badges, and manage suspensions or permissions</p>
      </div>

      {error && (
        <div className="p-4 bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-semibold text-xs rounded-2xl">
          {error}
        </div>
      )}

      {/* Warm Search Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-[#E7DED1] p-3.5 rounded-2xl border border-[#D6C8B8]">
        <input
          type="text"
          placeholder="Search by name or campus email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          className="input-editorial flex-1 text-xs py-2.5"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-editorial sm:w-auto text-xs py-2.5 font-semibold cursor-pointer"
        >
          <option value="">All User Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="BANNED">BANNED</option>
        </select>
        <button onClick={fetchUsers} className="btn-primary text-xs !py-2.5 !px-5 !min-h-[38px]">
          Search
        </button>
      </div>

      {/* User Data Table */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading user accounts…</div>
      ) : (
        <div className="bg-[#EDE5D9] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#E7DED1] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="py-4 px-6 text-left">User Name / Email</th>
                  <th className="py-4 px-4 text-left">Role</th>
                  <th className="py-4 px-4 text-center">Campus ID Status</th>
                  <th className="py-4 px-4 text-center">Account Status</th>
                  <th className="py-4 px-4 text-left">Registered Date</th>
                  <th className="py-4 px-6 text-right">Moderation Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]/60">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#E7DED1]/50 transition-colors">
                    <td className="py-4 px-6 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-xs flex items-center justify-center shrink-0">
                          {u.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-heading text-base font-medium text-[#3B2A22]">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-[#8B7562] font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 align-middle">
                      <span className="font-semibold text-[#3B2A22] uppercase tracking-wider text-[10px]">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                      {u.isStudentVerified ? (
                        <span className="badge-status badge-status-verified">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          VERIFIED
                        </span>
                      ) : (
                        <span className="badge-status badge-status-pending">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-4 align-middle text-center whitespace-nowrap">
                      <span
                        className={`badge-status ${
                          u.status === 'ACTIVE'
                            ? 'badge-status-active'
                            : 'badge-status-rejected'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 align-middle text-[#6E5948] text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>

                    <td className="py-4 px-6 align-middle text-right whitespace-nowrap">
                      <select
                        value={u.status}
                        onChange={(e) => handleUpdateStatus(u.id, e.target.value)}
                        className="bg-[#E7DED1] text-[#3B2A22] border border-[#D6C8B8] rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C8A46A]"
                      >
                        <option value="ACTIVE">Set Active</option>
                        <option value="SUSPENDED">Suspend</option>
                        <option value="BANNED">Ban</option>
                      </select>
                    </td>
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
