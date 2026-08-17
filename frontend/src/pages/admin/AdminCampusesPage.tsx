import React, { useState, useEffect } from 'react';
import { apiClient } from '../../lib/api/client';

export interface AdminCampusItem {
  id: string;
  name: string;
  code: string;
  domain: string;
  city: string;
  state: string;
  latitude?: number | null;
  longitude?: number | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    users: number;
    products: number;
    safeZones: number;
  };
}

interface CampusFormData {
  name: string;
  code: string;
  domain: string;
  city: string;
  state: string;
  latitude: string;
  longitude: string;
}

const initialFormData: CampusFormData = {
  name: '',
  code: '',
  domain: '',
  city: '',
  state: '',
  latitude: '',
  longitude: '',
};

export const AdminCampusesPage: React.FC = () => {
  const [campuses, setCampuses] = useState<AdminCampusItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCampus, setEditingCampus] = useState<AdminCampusItem | null>(null);
  const [deletingCampus, setDeletingCampus] = useState<AdminCampusItem | null>(null);

  // Form state
  const [formData, setFormData] = useState<CampusFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof CampusFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalFeedback, setModalFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchCampuses = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res: any = await apiClient.get('/admin/campuses');
      setCampuses(res.data.campuses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load campuses.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCampuses();
  }, []);

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof CampusFormData, string>> = {};

    if (!formData.name.trim()) {
      errors.name = 'Campus name is required.';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
    } else if (formData.name.trim().length > 150) {
      errors.name = 'Name cannot exceed 150 characters.';
    }

    if (!formData.code.trim()) {
      errors.code = 'Campus code is required.';
    } else if (formData.code.trim().length < 2) {
      errors.code = 'Code must be at least 2 characters.';
    } else if (formData.code.trim().length > 20) {
      errors.code = 'Code cannot exceed 20 characters.';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required.';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required.';
    }

    if (formData.latitude && isNaN(Number(formData.latitude))) {
      errors.latitude = 'Latitude must be a valid number.';
    }

    if (formData.longitude && isNaN(Number(formData.longitude))) {
      errors.longitude = 'Longitude must be a valid number.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenAddModal = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setModalFeedback(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (campus: AdminCampusItem) => {
    setEditingCampus(campus);
    setFormData({
      name: campus.name,
      code: campus.code,
      domain: campus.domain || '',
      city: campus.city,
      state: campus.state,
      latitude: campus.latitude != null ? String(campus.latitude) : '',
      longitude: campus.longitude != null ? String(campus.longitude) : '',
    });
    setFormErrors({});
    setModalFeedback(null);
  };

  const handleCloseModals = () => {
    setIsAddModalOpen(false);
    setEditingCampus(null);
    setDeletingCampus(null);
    setFormData(initialFormData);
    setFormErrors({});
    setModalFeedback(null);
    setDeleteError(null);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setModalFeedback(null);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        domain: formData.domain.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      await apiClient.post('/admin/campuses', payload);
      await fetchCampuses();
      handleCloseModals();
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        message: err.message || 'Failed to create campus. Please verify your input.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCampus || !validateForm()) return;

    try {
      setIsSubmitting(true);
      setModalFeedback(null);

      const payload = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        domain: formData.domain.trim() || undefined,
        city: formData.city.trim(),
        state: formData.state.trim(),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      await apiClient.patch(`/admin/campuses/${editingCampus.id}`, payload);
      await fetchCampuses();
      handleCloseModals();
    } catch (err: any) {
      setModalFeedback({
        type: 'error',
        message: err.message || 'Failed to update campus.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!deletingCampus) return;

    try {
      setIsSubmitting(true);
      setDeleteError(null);

      await apiClient.delete(`/admin/campuses/${deletingCampus.id}`);
      await fetchCampuses();
      handleCloseModals();
    } catch (err: any) {
      setDeleteError(err.message || 'Unable to delete campus. Records may still reference it.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCampuses = campuses.filter((c) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.domain.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <span className="tag-editorial mb-2 block">Institution & Network</span>
          <h1 className="font-heading text-4xl font-normal text-[#3B2A22]">Campus Management</h1>
          <p className="font-sans text-xs text-[#8B7562] mt-1">
            Register, configure, and manage participating universities, colleges, and regional campuses
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="btn-primary text-xs !py-3 !px-6 shrink-0 flex items-center gap-2 shadow-warm-subtle"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add New Campus
        </button>
      </div>

      {/* Global Error Banner */}
      {error && (
        <div className="p-4 bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-semibold text-xs rounded-2xl flex items-center justify-between">
          <span>{error}</span>
          <button onClick={fetchCampuses} className="underline hover:text-[#3B2A22]">
            Retry
          </button>
        </div>
      )}

      {/* Search & Overview Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-[#E7DED1] p-4 rounded-2xl border border-[#D6C8B8] shadow-warm-subtle">
        <div className="flex-1 flex items-center gap-2 px-3 py-1 bg-[#F4EFE7] rounded-xl border border-[#D6C8B8]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#8B7562]">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Filter by campus name, code, domain, or city…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent text-xs text-[#3B2A22] placeholder-[#8B7562] focus:outline-none font-sans py-1.5"
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2 text-xs font-sans text-[#8B7562]">
          <span className="font-semibold text-[#3B2A22]">{filteredCampuses.length}</span> of{' '}
          <span className="font-semibold text-[#3B2A22]">{campuses.length}</span> campuses
        </div>
      </div>

      {/* Campus List Grid */}
      {isLoading ? (
        <div className="text-center py-20 bg-[#EDE5D9] rounded-[32px] border border-[#D6C8B8]">
          <div className="w-8 h-8 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin mx-auto mb-3" />
          <p className="font-sans text-xs text-[#8B7562]">Loading campus directory…</p>
        </div>
      ) : filteredCampuses.length === 0 ? (
        <div className="text-center py-20 bg-[#EDE5D9] rounded-[32px] border border-[#D6C8B8] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center mx-auto text-[#8B7562]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11M20 10v11M8 14v4M12 14v4M16 14v4" />
            </svg>
          </div>
          <h3 className="font-heading text-2xl font-normal text-[#3B2A22]">
            {search ? 'No Matching Campuses' : 'No Campuses Registered'}
          </h3>
          <p className="font-sans text-xs text-[#8B7562] max-w-sm mx-auto">
            {search
              ? 'Try refining your search keyword or clearing the filter.'
              : 'Add your first partner college or university campus to get started.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className="btn-secondary text-xs !py-2 !px-4 mt-2">
              Clear Search Filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCampuses.map((campus) => {
            const usersCount = campus._count?.users ?? 0;
            const productsCount = campus._count?.products ?? 0;
            const safeZonesCount = campus._count?.safeZones ?? 0;
            const hasUsage = usersCount > 0 || productsCount > 0;

            return (
              <div
                key={campus.id}
                className="p-6 rounded-[28px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle hover:border-[#C8A46A] transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Code badge & Actions */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-md bg-[#F4EFE7] border border-[#D6C8B8] font-sans text-[11px] font-bold tracking-wider text-[#3B2A22] uppercase">
                      {campus.code}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(campus)}
                        className="p-2 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] hover:border-[#C8A46A] text-[#3B2A22] transition-colors"
                        title="Edit Campus"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeletingCampus(campus)}
                        className="p-2 rounded-xl bg-[#F4EFE7] border border-[#D6C8B8] hover:border-[#9B5C52] text-[#9B5C52] transition-colors"
                        title="Delete Campus"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Campus Title & Location */}
                  <h3 className="font-heading text-2xl font-normal text-[#3B2A22] leading-tight mb-1">
                    {campus.name}
                  </h3>
                  <p className="font-sans text-xs text-[#8B7562] mb-3">
                    {campus.city}, {campus.state}
                  </p>

                  {/* Domain & Geo */}
                  <div className="space-y-1 text-[11px] font-sans text-[#6E5948] pb-4 border-b border-[#D6C8B8]/60">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#8B7562] font-semibold uppercase text-[9px] tracking-wider">Domain:</span>
                      <span className="font-mono text-[#3B2A22]">{campus.domain}</span>
                    </div>
                    {campus.latitude != null && campus.longitude != null && (
                      <div className="flex items-center gap-1.5 text-[#8B7562]">
                        <span className="font-semibold uppercase text-[9px] tracking-wider">GPS:</span>
                        <span>
                          {campus.latitude.toFixed(4)}, {campus.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom Usage Statistics */}
                <div className="pt-4 mt-2 grid grid-cols-3 gap-2 text-center bg-[#F4EFE7] p-2.5 rounded-2xl border border-[#D6C8B8]/70">
                  <div>
                    <div className="font-heading text-lg font-normal text-[#3B2A22]">{usersCount}</div>
                    <div className="font-sans text-[9px] text-[#8B7562] uppercase tracking-wider font-semibold">
                      Students
                    </div>
                  </div>
                  <div>
                    <div className="font-heading text-lg font-normal text-[#3B2A22]">{productsCount}</div>
                    <div className="font-sans text-[9px] text-[#8B7562] uppercase tracking-wider font-semibold">
                      Listings
                    </div>
                  </div>
                  <div>
                    <div className="font-heading text-lg font-normal text-[#3B2A22]">{safeZonesCount}</div>
                    <div className="font-sans text-[9px] text-[#8B7562] uppercase tracking-wider font-semibold">
                      Safe Zones
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD / EDIT CAMPUS MODAL */}
      {/* ========================================================================= */}
      {(isAddModalOpen || editingCampus) && (
        <div className="fixed inset-0 z-50 bg-[#3B2A22]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F4EFE7] border border-[#D6C8B8] rounded-[32px] max-w-lg w-full p-8 shadow-warm-hover overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="tag-editorial mb-1 block">{editingCampus ? 'Update' : 'Register'}</span>
                <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">
                  {editingCampus ? 'Edit Campus Details' : 'Add New Campus'}
                </h2>
              </div>
              <button
                onClick={handleCloseModals}
                className="w-8 h-8 rounded-full bg-[#E7DED1] border border-[#D6C8B8] flex items-center justify-center text-[#3B2A22] hover:bg-[#D6C8B8] transition-colors"
              >
                ✕
              </button>
            </div>

            {modalFeedback && (
              <div
                className={`p-4 rounded-2xl mb-6 text-xs font-semibold ${
                  modalFeedback.type === 'error'
                    ? 'bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52]'
                    : 'bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62]'
                }`}
              >
                {modalFeedback.message}
              </div>
            )}

            <form onSubmit={editingCampus ? handleEditSubmit : handleCreateSubmit} className="space-y-4">
              {/* Campus Name */}
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                  Campus / University Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                    if (formErrors.name) setFormErrors({ ...formErrors, name: undefined });
                  }}
                  placeholder="e.g. Harvard University"
                  className={`input-editorial text-xs w-full ${formErrors.name ? '!border-[#9B5C52]' : ''}`}
                />
                {formErrors.name && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.name}</p>}
              </div>

              {/* Code and Domain */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    Campus Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setFormData({
                        ...formData,
                        code: val,
                        domain: formData.domain || (val ? `${val.toLowerCase()}.edu` : ''),
                      });
                      if (formErrors.code) setFormErrors({ ...formErrors, code: undefined });
                    }}
                    placeholder="HARVARD"
                    className={`input-editorial text-xs w-full uppercase ${formErrors.code ? '!border-[#9B5C52]' : ''}`}
                  />
                  {formErrors.code && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.code}</p>}
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    Email / Web Domain
                  </label>
                  <input
                    type="text"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value.toLowerCase() })}
                    placeholder="harvard.edu"
                    className="input-editorial text-xs w-full lowercase"
                  />
                </div>
              </div>

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (formErrors.city) setFormErrors({ ...formErrors, city: undefined });
                    }}
                    placeholder="Cambridge"
                    className={`input-editorial text-xs w-full ${formErrors.city ? '!border-[#9B5C52]' : ''}`}
                  />
                  {formErrors.city && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.city}</p>}
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (formErrors.state) setFormErrors({ ...formErrors, state: undefined });
                    }}
                    placeholder="MA"
                    className={`input-editorial text-xs w-full ${formErrors.state ? '!border-[#9B5C52]' : ''}`}
                  />
                  {formErrors.state && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.state}</p>}
                </div>
              </div>

              {/* Latitude & Longitude (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    Latitude (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="42.3770"
                    className="input-editorial text-xs w-full"
                  />
                  {formErrors.latitude && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.latitude}</p>}
                </div>

                <div>
                  <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1.5">
                    Longitude (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="-71.1167"
                    className="input-editorial text-xs w-full"
                  />
                  {formErrors.longitude && <p className="font-sans text-[10px] text-[#9B5C52] mt-1">{formErrors.longitude}</p>}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-6 border-t border-[#D6C8B8] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModals}
                  className="btn-secondary text-xs !py-3 !px-5"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-xs !py-3 !px-7 flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Saving…
                    </>
                  ) : editingCampus ? (
                    'Update Campus'
                  ) : (
                    'Create Campus'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {deletingCampus && (
        <div className="fixed inset-0 z-50 bg-[#3B2A22]/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#F4EFE7] border border-[#D6C8B8] rounded-[32px] max-w-md w-full p-8 shadow-warm-hover">
            <div className="w-12 h-12 rounded-full bg-[#9B5C52]/15 border border-[#9B5C52]/30 flex items-center justify-center text-[#9B5C52] mx-auto mb-4">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h3 className="font-heading text-2xl font-normal text-[#3B2A22] text-center mb-2">
              Delete Campus: {deletingCampus.name}?
            </h3>

            <p className="font-sans text-xs text-[#6E5948] text-center mb-4 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-[#3B2A22]">{deletingCampus.code}</span>?
            </p>

            {/* In-Use Usage Warning */}
            {((deletingCampus._count?.users ?? 0) > 0 || (deletingCampus._count?.products ?? 0) > 0) && (
              <div className="p-3.5 rounded-2xl bg-[#C8A46A]/15 border border-[#C8A46A]/30 text-xs text-[#3B2A22] mb-4 space-y-1">
                <p className="font-semibold text-[#8B6A4F]">⚠️ Linked Records Detected:</p>
                <p className="text-[11px] text-[#6E5948]">
                  This campus currently has <strong>{deletingCampus._count?.users ?? 0} user(s)</strong> and{' '}
                  <strong>{deletingCampus._count?.products ?? 0} active listing(s)</strong>.
                </p>
                <p className="text-[11px] text-[#9B5C52] font-medium">
                  Deletion will be rejected by server security rules until records are reassigned.
                </p>
              </div>
            )}

            {deleteError && (
              <div className="p-3.5 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-xs font-medium text-[#9B5C52] mb-4">
                {deleteError}
              </div>
            )}

            <div className="pt-4 border-t border-[#D6C8B8] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModals}
                className="btn-secondary text-xs !py-2.5 !px-5"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSubmit}
                className="px-5 py-2.5 rounded-xl bg-[#9B5C52] hover:bg-[#834940] text-white font-sans text-xs font-semibold tracking-wider uppercase transition-colors flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Deleting…
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
