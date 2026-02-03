import { ReactNode } from "react";

interface ContentCardProps {
  children: ReactNode;
  /** Additional classes */
  className?: string;
  /** Padding size */
  padding?: "sm" | "md" | "lg";
}

const paddingClasses = {
  sm: "p-4 md:p-6",
  md: "p-6 md:p-8",
  lg: "p-6 md:p-8 lg:p-12",
};

export function ContentCard({
  children,
  className = "",
  padding = "lg",
}: ContentCardProps) {
  return (
    <div
      className={`bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 ${paddingClasses[padding]} shadow-2xl ${className}`}
    >
      {children}
    </div>
  );
}
