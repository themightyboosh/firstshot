import { Zap } from "lucide-react";

interface LogoProps {
  size?: "small" | "medium" | "large";
  showText?: boolean;
}

export function Logo({ size = "medium", showText = true }: LogoProps) {
  const sizeClasses = {
    small: "w-8 h-8",
    medium: "w-12 h-12",
    large: "w-20 h-20",
  };

  const textSizeClasses = {
    small: "text-xl",
    medium: "text-2xl",
    large: "text-4xl",
  };

  const iconSizeClasses = {
    small: "w-5 h-5",
    medium: "w-7 h-7",
    large: "w-12 h-12",
  };

  return (
    <div className="flex items-center gap-3">
      <div
        className={`${sizeClasses[size]} bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg`}
      >
        <Zap className={`${iconSizeClasses[size]} text-white fill-white`} />
      </div>
      {showText && (
        <span
          className={`${textSizeClasses[size]} font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent`}
        >
          FirstShot
        </span>
      )}
    </div>
  );
}
