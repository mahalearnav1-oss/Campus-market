import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useCampusStore } from '../../stores/campusStore';
import { apiClient } from '../../lib/api/client';
import { ACADEMIC_BRANCHES, ACADEMIC_SEMESTERS, formatSemesterLabel } from '../../lib/academicConstants';

export interface CollegeOption {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
}

export const ProfileTab: React.FC = () => {
  const { user, fetchMe } = useAuthStore();
  const { setActiveCampus } = useCampusStore();

  // Personal Details State
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || '');
  const [isSaving, setIsSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Campus & Academic Selector State
  const [colleges, setColleges] = useState<CollegeOption[]>([]);
  const [isLoadingColleges, setIsLoadingColleges] = useState(true);
  const [selectedCollegeId, setSelectedCollegeId] = useState(user?.collegeId || user?.college?.id || '');
  const [selectedCourse, setSelectedCourse] = useState(user?.course || '');
  const [selectedSemester, setSelectedSemester] = useState(user?.semester ? String(user.semester) : '');
  const [isEditingCampus, setIsEditingCampus] = useState(false);
  const [isSavingCampus, setIsSavingCampus] = useState(false);
  const [campusMsg, setCampusMsg] = useState<string | null>(null);
  const [campusError, setCampusError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadColleges() {
      try {
        setIsLoadingColleges(true);
        const res: any = await apiClient.get('/colleges');
        if (isMounted) {
          const list = res?.data?.colleges || [];
          setColleges(list);
        }
      } catch (err: any) {
        // Handle gracefully
      } finally {
        if (isMounted) {
          setIsLoadingColleges(false);
        }
      }
    }
    loadColleges();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (user) {
      setSelectedCollegeId(user.collegeId || user.college?.id || '');
      setSelectedCourse(user.course || '');
      setSelectedSemester(user.semester ? String(user.semester) : '');
    }
  }, [user]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      setMsg(null);
      await apiClient.patch('/users/me', { firstName, lastName, phone: phoneNumber });
      await fetchMe();
      setMsg('Personal profile details successfully updated.');
    } catch (err: any) {
      setMsg(err.message || 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCampus = async (e: React.FormEvent) => {
    e.preventDefault();
    setCampusError(null);
    setCampusMsg(null);

    if (!selectedCollegeId) {
      setCampusError('Please select a valid university campus.');
      return;
    }

    try {
      setIsSavingCampus(true);
      const res: any = await apiClient.patch('/users/me', {
        collegeId: selectedCollegeId,
        course: selectedCourse.trim() || null,
        semester: selectedSemester ? parseInt(selectedSemester, 10) : null,
      });
      await fetchMe();

      const matchedCollege = colleges.find((c) => c.id === selectedCollegeId) || res?.data?.user?.college;
      if (matchedCollege) {
        setActiveCampus({
          id: matchedCollege.id,
          name: matchedCollege.name,
          code: matchedCollege.code,
        });
      }

      setCampusMsg('Academic profile & campus details successfully updated.');
      setIsEditingCampus(false);
    } catch (err: any) {
      setCampusError(err.message || 'Failed to update academic profile.');
    } finally {
      setIsSavingCampus(false);
    }
  };

  const currentCollege = user?.college || colleges.find((c) => c.id === (user?.collegeId || selectedCollegeId));

  return (
    <div className="space-y-8 text-[#3B2A22]">
      {/* ── Personal Details Card ──────────────────────────────── */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <div>
          <h2 className="font-heading text-3xl font-normal text-[#3B2A22] mb-1">Personal Details</h2>
          <p className="font-sans text-xs text-[#8B7562]">Update your public name and contact information</p>
        </div>

        {msg && (
          <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
            {msg}
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg font-sans text-xs">
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

      {/* ── University / Campus & Academic Section ──────────────── */}
      <div className="p-8 sm:p-10 rounded-[32px] bg-[#EDE5D9] border border-[#D6C8B8] shadow-warm-subtle space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="tag-editorial mb-1 block">Academic Context</span>
            <h2 className="font-heading text-3xl font-normal text-[#3B2A22]">Campus & Academic Profile</h2>
            <p className="font-sans text-xs text-[#8B7562] mt-0.5">
              Configure your campus, engineering branch, and current semester for tailored courseware recommendations
            </p>
          </div>

          {!isEditingCampus && (
            <button
              type="button"
              onClick={() => {
                setCampusError(null);
                setCampusMsg(null);
                setIsEditingCampus(true);
              }}
              className="btn-secondary text-xs !py-2.5 !px-5 self-start sm:self-auto"
            >
              Edit Academic Profile
            </button>
          )}
        </div>

        {campusMsg && (
          <div className="p-4 rounded-2xl bg-[#6E8A62]/15 border border-[#6E8A62]/30 text-[#6E8A62] font-sans text-xs font-semibold">
            {campusMsg}
          </div>
        )}

        {campusError && (
          <div className="p-4 rounded-2xl bg-[#9B5C52]/15 border border-[#9B5C52]/30 text-[#9B5C52] font-sans text-xs font-semibold">
            {campusError}
          </div>
        )}

        {isEditingCampus ? (
          <form onSubmit={handleSaveCampus} className="space-y-5 max-w-lg font-sans text-xs pt-2">
            <div>
              <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                University Campus <span className="text-[#9B5C52]">*</span>
              </label>

              {isLoadingColleges ? (
                <div className="input-editorial flex items-center justify-between text-xs text-[#8B7562] py-3.5 px-5">
                  <span>Loading available campuses…</span>
                  <div className="w-4 h-4 rounded-full border-2 border-[#C8A46A] border-t-transparent animate-spin" />
                </div>
              ) : (
                <select
                  required
                  value={selectedCollegeId}
                  onChange={(e) => {
                    setCampusError(null);
                    setSelectedCollegeId(e.target.value);
                  }}
                  className="input-editorial cursor-pointer"
                >
                  <option value="">Select your university / campus…</option>
                  {colleges.map((col) => (
                    <option key={col.id} value={col.id}>
                      {col.name} ({col.code}) — {col.city}, {col.state}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  Branch / Course
                </label>
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="input-editorial cursor-pointer"
                >
                  <option value="">Select your branch</option>
                  {ACADEMIC_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-2">
                  Current Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value)}
                  className="input-editorial cursor-pointer"
                >
                  <option value="">Select semester</option>
                  {ACADEMIC_SEMESTERS.map((sem) => (
                    <option key={sem} value={sem}>
                      Semester {sem}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isSavingCampus || isLoadingColleges || !selectedCollegeId}
                className="btn-primary py-3 px-6 text-xs uppercase tracking-wider"
              >
                {isSavingCampus ? 'Saving Profile…' : 'Save Academic Profile'}
              </button>
              <button
                type="button"
                disabled={isSavingCampus}
                onClick={() => {
                  setCampusError(null);
                  setSelectedCollegeId(user?.collegeId || user?.college?.id || '');
                  setSelectedCourse(user?.course || '');
                  setSelectedSemester(user?.semester ? String(user.semester) : '');
                  setIsEditingCampus(false);
                }}
                className="btn-ghost text-xs px-3 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="p-6 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#D6C8B8] border border-[#C8A46A]/40 text-[#3B2A22] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block">
                    Active University Affiliation
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-[#3B2A22] mt-0.5">
                    {currentCollege?.name || 'Assigned Campus'}
                  </h3>
                  <p className="font-sans text-xs text-[#6E5948] mt-1">
                    {currentCollege ? (
                      <>
                        <span className="font-semibold text-[#3B2A22]">Code:</span> {currentCollege.code}
                        {currentCollege.city && ` • ${currentCollege.city}, ${currentCollege.state}`}
                      </>
                    ) : (
                      'No verified campus assigned to profile.'
                    )}
                  </p>
                </div>
              </div>

              <div className="self-end sm:self-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#6E8A62]/15 text-[#6E8A62] border border-[#6E8A62]/30 text-[11px] font-sans font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6E8A62]" />
                  Campus Verified
                </span>
              </div>
            </div>

            {/* Academic Tags Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
                <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1">
                  Enrolled Branch / Course
                </span>
                <span className="font-sans font-semibold text-xs text-[#3B2A22]">
                  {user?.course || <span className="text-[#8B7562] italic font-normal">Not set</span>}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#E7DED1] border border-[#D6C8B8]">
                <span className="font-sans text-[10px] tracking-[0.15em] uppercase font-semibold text-[#8B7562] block mb-1">
                  Current Academic Semester
                </span>
                <span className="font-sans font-semibold text-xs text-[#3B2A22]">
                  {user?.semester ? formatSemesterLabel(user.semester) : <span className="text-[#8B7562] italic font-normal">Not set</span>}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

