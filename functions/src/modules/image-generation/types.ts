export interface ImageGenerationJob {
  id: string;
  archetypeId: string;
  archetypeName: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
  queuePosition?: number; // Position in queue (1 = next up)
  createdAt: string;
  updatedAt: string;
}

export interface GenerateImageRequest {
  archetypeId: string;
  archetypeName: string;
  prompt: string;
}

export interface JobStatusResponse {
  status: string;
  imageUrl?: string;
  error?: string;
  queuePosition?: number; // Position in queue for pending jobs
}
