import { create } from 'zustand';

export interface Campus {
  id: string;
  name: string;
  code: string;
}

interface CampusState {
  activeCampus: Campus | null;
  setActiveCampus: (campus: Campus) => void;
}

export const useCampusStore = create<CampusState>((set) => ({
  activeCampus: {
    id: 'default-harvard-uuid',
    name: 'Harvard University',
    code: 'HARVARD',
  },
  setActiveCampus: (activeCampus) => set({ activeCampus }),
}));
