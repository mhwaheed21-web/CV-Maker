import { create } from 'zustand'

const useProfileStore = create((set) => ({
  profile: null,
  loading: false,

  setProfile: (profile) => set({ profile }),
  setLoading: (loading) => set({ loading }),

  updatePersonal: (personal) =>
    set((state) => ({
      profile: { ...state.profile, personal },
    })),

  updateSection: (section, data) =>
    set((state) => ({
      profile: { ...state.profile, [section]: data },
    })),
}))

export default useProfileStore