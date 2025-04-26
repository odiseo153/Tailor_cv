import { User } from '@prisma/client';
import {useState, createContext, useContext, useEffect } from 'react';
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useSession } from "next-auth/react"


interface AppContextType {
  theme: 'light' | 'dark';
  template: string;
  templateId: string;
  user: any | null;
  authOpen:boolean;
  setAuthOpen: (authOpen:boolean) => void;
  setUser: (user:User | null) => void;
  setTemplate: (html:string) => void;
  setTemplateId: (id:string) => void;
}

export const useStore = create<AppContextType>()(
  persist(
    (set) => ({
      theme: 'light',
      template: '',
      templateId: '',
      user: null, 
      authOpen: false,
      setAuthOpen: (authOpen:boolean) => set({ authOpen }),
      setUser: (user:User | null) => set({ user }),
      setTemplate: (html:string) => set({ template: html }),
      setTemplateId: (id:string) => set({ templateId: id }),
    }),
    {
      name: 'cv-template-storage',
      partialize: (state) => ({ templateId: state.templateId }),
    }
  )
)

const AppContext = createContext<AppContextType>({
  theme: 'light',
  template: '',
  templateId: '',
  user: null,
  authOpen: false,
  setAuthOpen: () => {},
  setUser: () => {},
  setTemplate: () => {},
  setTemplateId: () => {},
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, setUser, theme, template, templateId, setTemplate, setTemplateId, authOpen, setAuthOpen } = useStore();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      setUser(session?.user as User);
      console.log(session?.user);
    } else {
      setUser(null);
    }
  }, [status, session, setUser]);

  return (
    <AppContext.Provider value={{ 
      user, 
      template, 
      templateId,
      setUser, 
      theme, 
      setTemplate,
      setTemplateId, 
      authOpen, 
      setAuthOpen 
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
