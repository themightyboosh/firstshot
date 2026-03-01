import { createContext, useContext, useEffect, useState } from 'react';
import { generationApi } from './api';

interface GlobalSettings {
  appName: string;
  appLogoUrl?: string;
  appLogoSvg?: string;
}

const GlobalSettingsContext = createContext<GlobalSettings>({ appName: '' });

// Helper to update favicon dynamically
function updateFavicon(url?: string, svg?: string) {
  const existingLink = document.querySelector("link[rel='icon']") as HTMLLinkElement;
  
  if (svg) {
    // Convert SVG to data URL for favicon
    const svgBlob = new Blob([svg], { type: 'image/svg+xml' });
    const svgUrl = URL.createObjectURL(svgBlob);
    if (existingLink) {
      existingLink.href = svgUrl;
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = 'image/svg+xml';
      link.href = svgUrl;
      document.head.appendChild(link);
    }
  } else if (url) {
    // Use image URL directly
    if (existingLink) {
      existingLink.href = url;
      existingLink.type = 'image/png';
    } else {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = url;
      document.head.appendChild(link);
    }
  }
}

export function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<GlobalSettings>({ appName: '' });

  useEffect(() => {
    generationApi.getGlobalSettings().then((data: any) => {
      if (data) {
        const appName = data.appName || '';
        const appLogoUrl = data.appLogoUrl;
        const appLogoSvg = data.appLogoSvg;
        
        setSettings({
          appName,
          appLogoUrl,
          appLogoSvg
        });
        
        // Update document title dynamically
        if (appName) {
          document.title = `${appName} - Relationship Guidance`;
        }
        
        // Update favicon to use the logo
        updateFavicon(appLogoUrl, appLogoSvg);
      }
    }).catch(console.error);
  }, []);

  return <GlobalSettingsContext.Provider value={settings}>{children}</GlobalSettingsContext.Provider>;
}

export const useGlobalSettings = () => useContext(GlobalSettingsContext);
