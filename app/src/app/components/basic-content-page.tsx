import { PageTemplate } from "@/app/components/page-template";
import { ContentCard } from "@/app/components/content-card";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface BasicContentPageProps {
  /** Page title */
  title: string;
  /** Main paragraph text */
  content: string;
  /** Square image URL */
  imageUrl?: string;
  /** Image alt text */
  imageAlt?: string;
  /** Optional action button */
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
}

export function BasicContentPage({
  title,
  content,
  imageUrl,
  imageAlt = "Content image",
  actionButton,
}: BasicContentPageProps) {
  return (
    <PageTemplate centerContent maxWidth="4xl">
      <ContentCard>
        {/* Square Image (optional) */}
        {imageUrl && (
          <div className="mb-8 flex justify-center">
            <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border-2 border-slate-700 shadow-lg">
              <ImageWithFallback
                src={imageUrl}
                alt={imageAlt}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Title */}
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-center">
          {title}
        </h1>

        {/* Content */}
        <p className="text-base md:text-lg text-slate-300 leading-relaxed text-center max-w-2xl mx-auto mb-8">
          {content}
        </p>

        {/* Action Button (optional) */}
        {actionButton && (
          <div className="flex justify-center">
            <button
              onClick={actionButton.onClick}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white font-semibold hover:shadow-lg hover:shadow-purple-500/50 transition-all group"
            >
              {actionButton.label}
              {actionButton.icon && (
                <span className="group-hover:translate-x-1 transition-transform">
                  {actionButton.icon}
                </span>
              )}
            </button>
          </div>
        )}
      </ContentCard>
    </PageTemplate>
  );
}
