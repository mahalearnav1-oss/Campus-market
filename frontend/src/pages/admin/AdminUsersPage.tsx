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
      <div className="flex flex-col sm:flex-row gap-3 bg-[#E7DED1] p-4 rounded-2xl border border-[#D6C8B8]">
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          className="input-editorial flex-1 text-xs py-2.5"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="input-editorial w-auto text-xs py-2.5 font-semibold cursor-pointer"
        >
          <option value="">All User Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
          <option value="BANNED">BANNED</option>
        </select>
        <button onClick={fetchUsers} className="btn-primary text-xs !py-2.5 !px-6">
          Search
        </button>
      </div>

      {/* User Data Table */}
      {isLoading ? (
        <div className="text-center py-16 text-xs text-[#8B7562]">Loading user accounts…</div>
      ) : (
        <div className="bg-[#E7DED1] border border-[#D6C8B8] rounded-[32px] overflow-hidden shadow-warm-subtle">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-sans text-xs">
              <thead>
                <tr className="bg-[#EDE5D9] border-b border-[#D6C8B8] text-[10px] font-semibold text-[#8B7562] uppercase tracking-wider">
                  <th className="p-4 pl-6">User Name / Email</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Campus ID Status</th>
                  <th className="p-4">Account Status</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6C8B8]">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-[#EDE5D9]/50 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#111111] text-[#F4EFE7] font-heading font-semibold text-sm flex items-center justify-center">
                          {u.firstName?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-heading text-lg font-normal text-[#3B2A22]">{u.firstName} {u.lastName}</p>
                          <p className="text-[11px] text-[#8B7562]">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-[#3B2A22] uppercase tracking-wider text-[10px]">
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4">
                      {u.isStudentVerified ? (
                        <span className="px-2.5 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-[10px] font-bold inline-flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          VERIFIED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#C8A46A]/20 text-[#3B2A22] border border-[#C8A46A]/40 text-[10px] font-bold inline-flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          PENDING
                        </span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          u.status === 'ACTIVE'
                            ? 'bg-[#6E8A62]/15 text-[#6E8A62]'
                            : 'bg-[#9B5C52]/15 text-[#9B5C52]'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    <td className="p-4 text-[#8B7562]">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <select
                        value={u.status}
                        onChange={(e) => handleUpdateStatus(u.id, e.target.value)}
                        className="bg-[#EDE5D9] text-[#3B2A22] border border-[#D6C8B8] rounded-xl px-2.5 py-1 text-xs font-semibold cursor-pointer focus:outline-none"
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                        <option value="BANNED">BANNED</option>
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
