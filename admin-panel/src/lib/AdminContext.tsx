import { createContext, useContext, useState } from 'react';

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
      const isDev = location.hostname === "localhost" && import.meta.env.DEV;
      const url = isDev 
        ? "http://localhost:5001/realness-score/us-central1/initCasConfig"
        : "https://us-central1-realness-score.cloudfunctions.net/initCasConfig";
      
      const response = await fetch(url);
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
