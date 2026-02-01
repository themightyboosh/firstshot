# Image Generation Module

This module handles AI image generation for archetypes using Google Vertex AI Imagen.

## Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│  Admin Panel    │──────│  Cloud Function │──────│    Firestore    │
│  (Generate btn) │      │ generateImage   │      │  (Job Status)   │
└─────────────────┘      └────────┬────────┘      └─────────────────┘
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
              (with Redis)              (without Redis)
                    │                           │
           ┌────────▼────────┐         ┌────────▼────────┐
           │    BullMQ       │         │     Direct      │
           │    Queue        │         │   Processing    │
           └────────┬────────┘         └────────┬────────┘
                    │                           │
           ┌────────▼────────┐                  │
           │  BullMQ Worker  │                  │
           │  (Cloud Run)    │                  │
           └────────┬────────┘                  │
                    └───────────┬───────────────┘
                                │
                    ┌───────────▼───────────┐
                    │   Vertex AI Imagen    │
                    │  (imagen-3.0-generate │
                    │       -002)           │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │  Google Cloud Storage │
                    │  (archetype-images/)  │
                    └───────────────────────┘
```

## Setup

### 1. Enable Vertex AI API

```bash
gcloud services enable aiplatform.googleapis.com --project=realness-score
```

Or visit: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com?project=realness-score

### 2. Set up Firebase Storage

Visit: https://console.firebase.google.com/project/realness-score/storage

Click "Get Started" and follow the setup wizard.

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage
```

### 4. Configure Environment (Optional - for BullMQ)

If you want to use BullMQ for queue-based processing:

1. Create a Redis instance (Upstash recommended for serverless):
   - https://upstash.com/

2. Set the Redis URL:
```bash
firebase functions:config:set redis.url="redis://default:YOUR_PASSWORD@YOUR_HOST:PORT"
```

3. Deploy a BullMQ worker on Cloud Run (see worker example below)

**Without Redis**, jobs are processed directly in the Cloud Function (simpler setup).

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GOOGLE_CLOUD_PROJECT` | GCP Project ID | `realness-score` |
| `GCS_BUCKET_NAME` | Storage bucket | `realness-score.firebasestorage.app` |
| `IMAGEN_MODEL` | Imagen model version | `imagen-3.0-generate-002` |
| `REDIS_URL` | Redis connection string | (empty = direct processing) |

## Imagen Models

Available models (as of Jan 2026):

| Model | Speed | Quality | Notes |
|-------|-------|---------|-------|
| `imagen-4.0-ultra-generate-001` | Slow | Highest | Best quality |
| `imagen-4.0-generate-001` | Medium | High | Recommended |
| `imagen-4.0-fast-generate-001` | Fast | Good | For testing |
| `imagen-3.0-generate-002` | Medium | High | Current default |

## API Endpoints

### POST /generateArchetypeImage

Queue a new image generation job.

```json
{
  "archetypeId": "arch_123",
  "archetypeName": "The Guardian",
  "prompt": "A protective figure standing watch over a peaceful garden..."
}
```

Response:
```json
{
  "jobId": "uuid-here"
}
```

### GET /getImageJobStatus?jobId=xxx

Check job status.

Response:
```json
{
  "status": "completed",
  "imageUrl": "https://storage.googleapis.com/..."
}
```

Status values: `pending`, `processing`, `completed`, `failed`

### POST /processImageJob

Manually trigger processing for a specific job (used by workers).

```json
{
  "jobId": "uuid-here"
}
```

## BullMQ Worker (Cloud Run)

For production with high volume, deploy a separate worker:

```typescript
// worker.ts
import { startImageWorker } from './modules/image-generation';

const worker = startImageWorker();

process.on('SIGTERM', async () => {
  await worker.close();
  process.exit(0);
});
```

Deploy to Cloud Run with always-on instances.

## Troubleshooting

### "Failed to get access token"
- Ensure the Cloud Functions service account has Vertex AI permissions
- Grant `roles/aiplatform.user` to `PROJECT_ID@appspot.gserviceaccount.com`

### "Image blocked by safety filter"
- The prompt triggered Imagen's safety filters
- Try adjusting `safetySetting` parameter or modifying the prompt

### "No Redis configured" warning
- This is expected if you're not using BullMQ
- Jobs will process directly (synchronously)
