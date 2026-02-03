import { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import { imageGenerationApi } from '../lib/api';
import type { ImageJobStatus } from '../lib/api';

export interface ImageGenerationState {
  status: 'idle' | 'queued' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  queuePosition?: number;
  error?: string;
  prompt?: string;
}

interface ImageGenerationPreviewProps {
  imageUrl?: string;
  jobId?: string;
  onImageGenerated: (imageUrl: string) => void;
  onJobComplete?: () => void;
  onError?: (error: string) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Unified image preview component with real-time generation status.
 * Handles all states: idle, queued, processing, completed, failed.
 * Auto-subscribes to job updates via Firestore realtime listener.
 */
export function ImageGenerationPreview({
  imageUrl,
  jobId,
  onImageGenerated,
  onJobComplete,
  onError,
  size = 'md',
  className = '',
}: ImageGenerationPreviewProps) {
  const [state, setState] = useState<ImageGenerationState>({ status: 'idle' });
  const [elapsedTime, setElapsedTime] = useState(0);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const sizeClasses = {
    sm: 'w-20 h-20',
    md: 'w-32 h-32',
    lg: 'w-48 h-48',
  };

  // Subscribe to job updates when jobId changes
  useEffect(() => {
    // Cleanup previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (!jobId) {
      setState({ status: 'idle' });
      setElapsedTime(0);
      startTimeRef.current = null;
      return;
    }

    // Start timer
    startTimeRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }
    }, 1000);

    // Initial state
    setState({ status: 'queued', jobId });

    // Subscribe to realtime updates
    unsubscribeRef.current = imageGenerationApi.subscribeToJob(jobId, (status: ImageJobStatus) => {
      console.log(`[ImagePreview] Job ${jobId}:`, status.status, status.queuePosition || '');

      if (status.status === 'completed' && status.imageUrl) {
        setState({ status: 'completed', jobId });
        onImageGenerated(status.imageUrl);
        onJobComplete?.();
        
        // Cleanup
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      if (status.status === 'failed') {
        const errorMsg = status.error || 'Unknown error';
        setState({ status: 'failed', jobId, error: errorMsg });
        onError?.(errorMsg);
        
        // Cleanup
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      if (status.status === 'processing') {
        setState({ 
          status: 'processing', 
          jobId,
          prompt: status.prompt 
        });
      } else if (status.status === 'pending') {
        setState({ 
          status: 'queued', 
          jobId,
          queuePosition: status.queuePosition 
        });
      }
    });

    // Safety timeout - cleanup after 10 minutes
    const safetyTimeout = setTimeout(() => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setState({ status: 'idle' });
    }, 600000);

    return () => {
      clearTimeout(safetyTimeout);
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [jobId, onImageGenerated, onJobComplete, onError]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const isGenerating = state.status === 'queued' || state.status === 'processing';

  // Render the appropriate state
  const renderContent = () => {
    // If generating, show generation UI (hide old image)
    if (isGenerating) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-3">
          {state.status === 'queued' ? (
            <>
              <Clock className="w-8 h-8 text-indigo-400 mb-2 animate-pulse" />
              <span className="text-xs font-medium text-indigo-600 text-center">
                In Queue
                {state.queuePosition && state.queuePosition > 1 && (
                  <span className="block text-indigo-400">
                    Position #{state.queuePosition}
                  </span>
                )}
              </span>
            </>
          ) : (
            <>
              <div className="relative mb-2">
                <Sparkles className="w-8 h-8 text-purple-500" />
                <div className="absolute inset-0 animate-ping">
                  <Sparkles className="w-8 h-8 text-purple-300 opacity-50" />
                </div>
              </div>
              <span className="text-xs font-medium text-purple-600 text-center">
                Generating...
              </span>
            </>
          )}
          <span className="text-[10px] text-gray-400 mt-1">
            {formatTime(elapsedTime)}
          </span>
          
          {/* Progress bar */}
          <div className="w-full mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-300 ${
                state.status === 'processing' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse' 
                  : 'bg-indigo-400'
              }`}
              style={{ 
                width: state.status === 'processing' ? '66%' : '33%'
              }}
            />
          </div>
        </div>
      );
    }

    // Failed state
    if (state.status === 'failed') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 p-3">
          <XCircle className="w-8 h-8 text-red-400 mb-2" />
          <span className="text-xs font-medium text-red-600 text-center">Failed</span>
          <span className="text-[10px] text-red-400 text-center mt-1 line-clamp-2">
            {state.error}
          </span>
        </div>
      );
    }

    // Completed state (briefly shows before imageUrl updates)
    if (state.status === 'completed' && !imageUrl) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-green-50 p-3">
          <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
          <span className="text-xs font-medium text-green-600">Complete!</span>
        </div>
      );
    }

    // Has image
    if (imageUrl) {
      return (
        <img 
          src={imageUrl} 
          alt="Preview" 
          className="w-full h-full object-cover"
        />
      );
    }

    // Empty state
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400">
        <ImageIcon className="w-8 h-8" />
      </div>
    );
  };

  return (
    <div 
      className={`${sizeClasses[size]} bg-gray-100 rounded-lg overflow-hidden border border-gray-300 relative ${className}`}
    >
      {renderContent()}
      
      {/* Generation active indicator */}
      {isGenerating && (
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        </div>
      )}
    </div>
  );
}

/**
 * Hook to manage image generation state.
 * Returns helpers for triggering generation and tracking state.
 */
export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | undefined>();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const startGeneration = async (
    generateFn: () => Promise<{ jobId: string }>,
    options?: {
      onSuccess?: (imageUrl: string) => void;
      onError?: (error: string) => void;
      clearImageUrl?: () => void;
    }
  ) => {
    setIsGenerating(true);
    setStatusMessage('Starting image generation...');
    
    // Clear old image immediately so user knows something is happening
    options?.clearImageUrl?.();

    try {
      const result = await generateFn();
      setCurrentJobId(result.jobId);
      setStatusMessage('Image queued for generation...');

      // Trigger processing
      imageGenerationApi.triggerJobProcessing(result.jobId).catch(err => {
        console.error('Trigger processing failed:', err);
      });

      return result.jobId;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to start generation';
      setStatusMessage(null);
      setIsGenerating(false);
      options?.onError?.(errorMsg);
      throw err;
    }
  };

  const handleJobComplete = (imageUrl?: string) => {
    setIsGenerating(false);
    setCurrentJobId(undefined);
    setStatusMessage(imageUrl ? 'Image generated successfully!' : null);
    
    // Auto-clear success message
    if (imageUrl) {
      setTimeout(() => setStatusMessage(null), 3000);
    }
  };

  const handleJobError = (error: string) => {
    setIsGenerating(false);
    setCurrentJobId(undefined);
    setStatusMessage(`Generation failed: ${error}`);
  };

  return {
    isGenerating,
    currentJobId,
    statusMessage,
    startGeneration,
    handleJobComplete,
    handleJobError,
    setStatusMessage,
  };
}
