import { createContext, useContext, useEffect, useState } from 'react';
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
      // In production we would call the cloud function
      // For now, we can manually trigger the seed function URL if needed
      // or call a callable function if we made one.
      // We made `initCasConfig` as an onRequest function.
      
      const response = await fetch(`http://localhost:5001/realness-score/us-central1/initCasConfig`);
      const result = await response.json();
      alert(result.message);
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
