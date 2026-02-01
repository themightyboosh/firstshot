export interface ImageGenerationJob {
  id: string;
  archetypeId: string;
  archetypeName: string;
  prompt: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  imageUrl?: string;
  error?: string;
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
}
