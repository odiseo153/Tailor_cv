import { User } from '@prisma/client';
import {useState, createContext, useContext, useEffect } from 'react';



interface AppContextType {
   theme: 'light' | 'dark';
   user: any | null;
   setUser: (user:User) => void;
}

const AppContext = createContext<AppContextType>({
  theme: 'light',
  user: null,
  setUser: () => {}
});

export const AppContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null); 
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

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
    <AppContext.Provider value={{user,setUser,theme}}>
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
