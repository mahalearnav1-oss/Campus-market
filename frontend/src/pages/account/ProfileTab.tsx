import React, { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { apiClient } from '../../lib/api/client';

export const ProfileTab: React.FC = () => {
  const { user, fetchMe } = useAuthStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.patch('/users/me', { firstName, lastName, phoneNumber });
      await fetchMe();
      setMsg('Profile details successfully updated.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 text-[#3B2A22]">
      <div>
        <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-1">Personal Details</h2>
        <p className="font-sans text-xs text-[#8B7562]">Update your public name and contact information</p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-lg font-sans text-xs">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">First Name</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="input-editorial" />
          </div>
          <div>
            <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Last Name</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="input-editorial" />
          </div>
        </div>

        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Campus Email</label>
          <input type="email" disabled value={user?.email || ''} className="input-editorial opacity-60 cursor-not-allowed" />
        </div>

        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Phone Number</label>
          <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="+91 98765 43210" className="input-editorial" />
        </div>

        <button type="submit" disabled={isSaving} className="btn-primary py-3.5 px-6 text-xs uppercase tracking-wider mt-2">
          {isSaving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
