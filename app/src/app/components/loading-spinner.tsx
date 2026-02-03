import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  message?: string;
}

export function LoadingSpinner({ size = "medium", message }: LoadingSpinnerProps) {
  const sizeClasses = {
    small: "w-6 h-6",
    medium: "w-12 h-12",
    large: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <Loader2
        className={`${sizeClasses[size]} text-purple-500 animate-spin`}
      />
      {message && (
        <p className="text-slate-400 animate-pulse">{message}</p>
      )}
    </div>
  );
}
