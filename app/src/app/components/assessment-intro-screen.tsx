import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cmsApi, CMSItem } from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Loader2 } from "lucide-react";
import { hasStoredArchetype, getStoredAnswers } from "@/lib/archetypeStorage";

export function AssessmentIntroScreen() {
  const navigate = useNavigate();
  const [content, setContent] = useState<CMSItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If archetype is already known, skip to situation selection
    if (hasStoredArchetype()) {
      const answers = getStoredAnswers();
      navigate("/situation", { state: { answers }, replace: true });
      return;
    }

    cmsApi.getItem('assessment_intro').then((data) => {
        setContent(data);
        setLoading(false);
    });
  }, []);

  const handleStart = () => {
    navigate("/questions");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8">
        {content?.imageUrl && (
            <img src={content.imageUrl} alt="Intro" className="w-full h-48 object-cover rounded-xl mb-6 border border-slate-700" />
        )}
        <h1 className="text-3xl font-bold text-white">{content?.title || 'Discover Your Archetype'}</h1>
        <p className="text-slate-300 text-lg leading-relaxed">
          {content?.copy || 'To give you the best advice, we need to understand your relationship style. This quick 8-question assessment will reveal your Archetype.'}
        </p>
        <Button 
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold py-6 rounded-xl text-lg shadow-lg hover:shadow-purple-500/25 transition-all duration-300"
        >
          {content?.buttonText || 'Start Assessment'}
        </Button>
      </div>
    </div>
  );
}
