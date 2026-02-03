import { useGlobalSettings } from "@/lib/GlobalSettingsContext";

interface LogoProps {
  size?: "small" | "medium" | "large";
  className?: string;
}

export function Logo({ size = "medium", className }: LogoProps) {
  const { appLogoUrl, appLogoSvg } = useGlobalSettings();
  
  const sizeClasses = {
    small: "h-[calc(4rem-4px)]", // Header height (h-16 = 64px) minus 4px padding
    medium: "h-12",
    large: "h-20",
  };

  const finalClass = className || sizeClasses[size];

  // Priority: SVG code > URL > nothing
  if (appLogoSvg) {
    return (
      <div 
        className={`${finalClass} [&>svg]:h-full [&>svg]:w-auto`}
        dangerouslySetInnerHTML={{ __html: appLogoSvg }}
      />
    );
  }
  
  if (appLogoUrl) {
    return <img src={appLogoUrl} alt="Logo" className={`${finalClass} w-auto object-contain`} />;
  }
  
  // No logo configured - return nothing
  return null;
}
