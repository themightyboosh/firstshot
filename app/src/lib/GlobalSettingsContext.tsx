import { createContext, useContext, useEffect, useState } from 'react';
import { generationApi } from './api';

interface GlobalSettings {
  appName: string;
  appLogoUrl?: string;
  appLogoSvg?: string;
}

const GlobalSettingsContext = createContext<GlobalSettings>({ appName: '' });

export function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>({ appName: '' });

  useEffect(() => {
    generationApi.getGlobalSettings().then((data: any) => {
      if (data) {
        setSettings({
          appName: data.appName || '',
          appLogoUrl: data.appLogoUrl,
          appLogoSvg: data.appLogoSvg
        });
      }
    }).catch(console.error);
  }, []);

  return <GlobalSettingsContext.Provider value={settings}>{children}</GlobalSettingsContext.Provider>;
}

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
