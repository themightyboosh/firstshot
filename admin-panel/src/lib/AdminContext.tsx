import { createContext, useContext, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

interface AdminContextType {
  seedDatabase: () => Promise<void>;
  loading: boolean;
}

const AdminContext = createContext<AdminContextType>({
  seedDatabase: async () => {},
  loading: false
});

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(false);

  const seedDatabase = async () => {
    setLoading(true);
    try {
      const initCasConfig = httpsCallable(functions, 'initCasConfig');
      // Pass force: true to ensure update happens since we changed seed data
      const result = await initCasConfig({ force: true });
      alert((result.data as any).message);
    } catch (error) {
      console.error("Error seeding database:", error);
      alert("Error seeding database. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminContext.Provider value={{ seedDatabase, loading }}>
      {children}
    </AdminContext.Provider>
  );
};
