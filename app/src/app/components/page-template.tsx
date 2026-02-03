import { ReactNode } from "react";
import { Navigation } from "@/app/components/navigation";
import { motion } from "motion/react";

interface PageTemplateProps {
  children: ReactNode;
  /** Show navigation bar at top */
  showNavigation?: boolean;
  /** Maximum width of content area */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "4xl" | "full";
  /** Center content vertically */
  centerContent?: boolean;
  /** Additional classes for the container */
  className?: string;
  /** Animate page entrance */
  animate?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "4xl": "max-w-4xl",
  full: "max-w-full",
};

export function PageTemplate({
  children,
  showNavigation = true,
  maxWidth = "4xl",
  centerContent = false,
  className = "",
  animate = true,
}: PageTemplateProps) {
  const content = animate ? (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full ${maxWidthClasses[maxWidth]} ${className}`}
    >
      {children}
    </motion.div>
  ) : (
    <div className={`w-full ${maxWidthClasses[maxWidth]} ${className}`}>
      {children}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex flex-col">
      {showNavigation && <Navigation />}

      <div
        className={`flex-1 container mx-auto px-4 py-8 md:py-12 lg:py-16 ${
          centerContent ? "flex items-center justify-center" : ""
        }`}
      >
        {content}
      </div>
    </div>
  );
}
