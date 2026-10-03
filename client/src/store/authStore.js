import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('dna_user') || 'null'),
  token: localStorage.getItem('dna_token') || null,

  login: (user, token) => {
    localStorage.setItem('dna_user', JSON.stringify(user));
    localStorage.setItem('dna_token', token);
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('dna_user');
    localStorage.removeItem('dna_token');
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
