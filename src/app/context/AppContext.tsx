import { User } from '@prisma/client';
import {useState, createContext, useContext, useEffect } from 'react';



interface AppContextType {
   theme: 'light' | 'dark';
   template: string;
   user: any | null;
   setUser: (user:User) => void;
   setTemplate: (html:string) => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  template: '',
  user: null,
  setUser: () => {},
  setTemplate: () => {}
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); 
    const [theme, setTheme] = useState<'light' | 'dark'>('light');
   
    const [template, setTemplate] = useState<string>('');

    /*
    useEffect(()=>{
      const getData =async () =>{
        const formData = new FormData();
        formData.append('email','john.doe@example.com');
        formData.append('password','1234567890');
        
        const request = await fetch('/api/apiHandler/login',{
          method:"POST",
          body:formData
        });
        
        const response = await request.json();
        
        console.log(response)
      setUser(response.resultado.user);
    }
    getData();
  },[])
  */
  
  return (
    <AppContext.Provider value={{user,template,setUser,theme,setTemplate}}>
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
