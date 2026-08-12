import React, { useState } from 'react';

export const AddressesTab: React.FC = () => {
  const [campusHostel, setCampusHostel] = useState('Hostel Block 4, Room 202');
  const [city, setCity] = useState('Campus University Town');
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg('Campus delivery locations updated.');
  };

  return (
    <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6 text-[#3B2A22]">
      <div>
        <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-1">Campus Delivery Locations</h2>
        <p className="font-sans text-xs text-[#8B7562]">Saved campus meetups and hostel pickup points</p>
      </div>

      {msg && (
        <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
          {msg}
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-4 max-w-lg font-sans text-xs">
        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">Hostel / Campus Building</label>
          <input type="text" value={campusHostel} onChange={(e) => setCampusHostel(e.target.value)} className="input-editorial" />
        </div>

        <div>
          <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">University / City</label>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className="input-editorial" />
        </div>

        <button type="submit" className="btn-primary py-3.5 px-6 text-xs uppercase tracking-wider mt-2">
          Save Location
        </button>
      </form>
    </div>
  );
};
