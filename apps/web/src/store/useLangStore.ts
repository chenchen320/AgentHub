import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LangState {
  lang: 'zh' | 'en';
  setLang: (lang: 'zh' | 'en') => void;
}

export const useLangStore = create<LangState>()(
  persist(
    (set) => ({
      lang: 'zh',
      setLang: (lang) => set({ lang }),
    }),
    {
      name: 'agenthub-lang-settings',
    }
  )
);
