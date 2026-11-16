import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('prepai_user') || localStorage.getItem('dna_user') || 'null'),
  token: localStorage.getItem('prepai_token') || localStorage.getItem('dna_token') || null,

  login: (user, token) => {
    localStorage.setItem('prepai_user', JSON.stringify(user));
    localStorage.setItem('prepai_token', token);
    set({ user, token });
  },

  updateUser: (updatedFields) => {
    set((state) => {
      const nextUser = { ...(state.user || {}), ...updatedFields };
      localStorage.setItem('prepai_user', JSON.stringify(nextUser));
      return { user: nextUser };
    });
  },

  logout: () => {
    localStorage.removeItem('prepai_user');
    localStorage.removeItem('prepai_token');
    localStorage.removeItem('dna_user');
    localStorage.removeItem('dna_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
