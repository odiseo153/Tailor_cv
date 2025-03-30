import { User } from '@prisma/client';
import { useSession } from 'next-auth/react';
import {useState, createContext, useContext, useEffect } from 'react';
import { create } from 'zustand'





interface AppContextType {
  theme: 'light' | 'dark';
  template: string;
  user: any | null;
  authOpen:boolean;
  setAuthOpen: (authOpen:boolean) => void;
  setUser: (user:User) => void;
  setTemplate: (html:string) => void;
}

export const useStore = create<AppContextType>()((set) => ({
  theme: 'light',
  template: '',
  user: null, 
  authOpen: false,
  setAuthOpen: (authOpen:boolean) => set({ authOpen }),
  setUser: (user:User) => set({ user }),
  setTemplate: (html:string) => set({ template: html }),
}))

const AppContext = createContext<AppContextType>({
  theme: 'light',
  template: '',
  user: null,
  authOpen: false,
  setAuthOpen: () => {},
  setUser: () => {},
  setTemplate: () => {}
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const {user, setUser, theme, template, setTemplate,authOpen,setAuthOpen} = useStore();
    

  return (
    <AppContext.Provider value={{user,template,setUser,theme,setTemplate,authOpen,setAuthOpen}}>
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
