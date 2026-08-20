import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { apiClient } from '../lib/api/client';
import { formatUserRole, formatUserStatus } from '../lib/formatters';

export const AccountPage: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [pwMessage, setPwMessage] = useState<string | null>(null);
  const [pwError, setPwError] = useState<string | null>(null);
  const [isChanging, setIsChanging] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMessage(null);
    setPwError(null);
    setIsChanging(true);
    try {
      const res: any = await apiClient.patch('/users/me/password', {
        currentPassword,
        newPassword,
      });
      setPwMessage(res.message || 'Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err: any) {
      setPwError(err.message || 'Failed to change password.');
    } finally {
      setIsChanging(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8 text-[#3B2A22]">

      {/* Header */}
      <div>
        <span className="tag-editorial mb-2 block">Account Ecosystem</span>
        <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">
          My Profile & Settings
        </h1>
      </div>

      {/* Profile Overview Card */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#111111] text-[#F4EFE7] font-heading font-semibold flex items-center justify-center text-2xl shadow-md">
              {user.firstName?.charAt(0)}
              {user.lastName?.charAt(0)}
            </div>
            <div>
              <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">
                {user.firstName} {user.lastName}
              </h2>
              <p className="font-sans text-xs text-[#8B7562] mt-0.5">{user.email}</p>
            </div>
          </div>

          <button
            onClick={() => logout()}
            className="btn-secondary text-xs !py-2.5 !px-5 self-start sm:self-auto"
          >
            Sign Out
          </button>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 text-xs pt-6 border-t border-[#D6C8B8]">
          <Link
            to="/account/profile"
            className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Campus</span>
              <span className="text-[10px] text-[#C8A46A] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Edit →</span>
            </div>
            <span className="font-sans font-semibold text-[#3B2A22] block truncate" title={user.college?.name || 'Assigned Campus'}>
              {user.college?.code || (user.college?.name ? user.college.name.substring(0, 16) : 'Verified Campus')}
            </span>
          </Link>

          <Link
            to="/account/profile"
            className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Branch</span>
              <span className="text-[10px] text-[#C8A46A] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Edit →</span>
            </div>
            <span className="font-sans font-semibold text-[#3B2A22] block truncate" title={user.course || 'Not set'}>
              {user.course || <span className="text-[#8B7562] italic font-normal">Not set</span>}
            </span>
          </Link>

          <Link
            to="/account/profile"
            className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all block group"
          >
            <div className="flex items-center justify-between">
              <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Semester</span>
              <span className="text-[10px] text-[#C8A46A] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">Edit →</span>
            </div>
            <span className="font-sans font-semibold text-[#3B2A22] block truncate">
              {user.semester ? `Semester ${user.semester}` : <span className="text-[#8B7562] italic font-normal">Not set</span>}
            </span>
          </Link>

          <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
            <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Role</span>
            <span className="font-sans font-semibold text-[#3B2A22] block truncate">{formatUserRole(user.role)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
            <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Account Status</span>
            <span className="font-sans font-semibold text-[#6E8A62] block truncate">{formatUserStatus(user.status)}</span>
          </div>

          <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
            <span className="font-sans text-[10px] tracking-[0.15em] uppercase text-[#8B7562] block font-semibold mb-1">Student ID</span>
            <span className="font-sans font-semibold text-[#3B2A22] inline-flex items-center gap-1">
              {user.isStudentVerified ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-[#6E8A62]">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C8A46A]">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Pending
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/orders" className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mb-4 group-hover:bg-[#111111] group-hover:text-[#F4EFE7] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-normal text-[#3B2A22] mb-1">My Orders</h3>
          <p className="text-xs text-[#8B7562]">View active purchases & escrow status</p>
        </Link>

        <Link to="/wishlist" className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mb-4 group-hover:bg-[#111111] group-hover:text-[#F4EFE7] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#9B5C52]">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-normal text-[#3B2A22] mb-1">Saved Wishlist</h3>
          <p className="text-xs text-[#8B7562]">Browse saved textbooks & course gear</p>
        </Link>

        <Link to="/price-alerts" className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#C8A46A] flex items-center justify-center mb-4 group-hover:bg-[#111111] group-hover:text-[#F4EFE7] transition-all text-lg">
            🔔
          </div>
          <h3 className="font-heading text-xl font-normal text-[#3B2A22] mb-1">Price Alerts</h3>
          <p className="text-xs text-[#8B7562]">Track products & price-drop alerts</p>
        </Link>

        <Link to="/seller/products" className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] hover:border-[#C8A46A] transition-all group">
          <div className="w-10 h-10 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] text-[#3B2A22] flex items-center justify-center mb-4 group-hover:bg-[#111111] group-hover:text-[#F4EFE7] transition-all">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <h3 className="font-heading text-xl font-normal text-[#3B2A22] mb-1">Seller Dashboard</h3>
          <p className="text-xs text-[#8B7562]">Manage active listings & earnings</p>
        </Link>
      </div>

      {/* Change Password Security Card */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <div>
          <h2 className="font-heading text-2xl font-normal text-[#3B2A22] mb-1">Security & Credentials</h2>
          <p className="text-xs text-[#8B7562]">Update your password and login credentials</p>
        </div>

        {pwMessage && (
          <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
            {pwMessage}
          </div>
        )}
        {pwError && (
          <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-sans text-xs font-semibold">
            {pwError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-editorial"
            />
          </div>

          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
              New Password
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-editorial"
            />
          </div>

          <button
            type="submit"
            disabled={isChanging}
            className="btn-primary py-3.5 px-6 text-xs uppercase tracking-wider"
          >
            {isChanging ? 'Updating Password…' : 'Update Password'}
          </button>
        </form>
      </div>

    </div>
  );
};
