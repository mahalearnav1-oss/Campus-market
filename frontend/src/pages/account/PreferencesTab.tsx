import React, { useState } from 'react';

export const PreferencesTab: React.FC = () => {
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [escrowAlerts, setEscrowAlerts] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Notification preferences updated successfully.');
  };

  return (
    <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 text-[#3B2A22]">
      <div>
        <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-1">Account Preferences</h2>
        <p className="font-sans text-xs text-[#8B7562]">Manage notifications and campus alerts</p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-lg font-sans text-xs">
        <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#3B2A22]">Email Digests & Offers</h4>
            <p className="text-[11px] text-[#8B7562] mt-0.5">Receive summary emails when new course books match your wishlist</p>
          </div>
          <button
            type="button"
            onClick={() => setEmailAlerts(!emailAlerts)}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${emailAlerts ? 'bg-[#6E8A62] justify-end' : 'bg-[#D6C8B8] justify-start'}`}
          >
            <div className="w-4 h-4 rounded-full bg-[#F4EFE7] shadow-sm" />
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-[#3B2A22]">Escrow Handshake Real-Time Alerts</h4>
            <p className="text-[11px] text-[#8B7562] mt-0.5">Instant alerts when buyer or seller updates meetup status</p>
          </div>
          <button
            type="button"
            onClick={() => setEscrowAlerts(!escrowAlerts)}
            className={`w-12 h-6 rounded-full transition-colors p-1 flex items-center ${escrowAlerts ? 'bg-[#6E8A62] justify-end' : 'bg-[#D6C8B8] justify-start'}`}
          >
            <div className="w-4 h-4 rounded-full bg-[#F4EFE7] shadow-sm" />
          </button>
        </div>

        <button type="submit" className="btn-primary py-3.5 px-6 text-xs uppercase tracking-wider mt-2">
          Save Preferences
        </button>
      </form>
    </div>
  );
};
