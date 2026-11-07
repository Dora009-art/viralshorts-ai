/**
 * ViralShorts AI - API Client Bridge
 * Interacts with FastAPI backend & external social platforms
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface GenerateShortsParams {
  url: string;
  targetDuration: number; // 30, 45, 60
  shortsCount: number;    // 1-5
}

export interface PostToAllParams {
  clipId: string;
  title: string;
  description: string;
  hashtags: string[];
  platforms: string[]; // ['yt', 'ig', 'fb', 'tt', 'li', 'th']
  videoUrl: string;
}

export const apiClient = {
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/api/health`);
    return res.json();
  },

  async generateShorts(params: GenerateShortsParams) {
    const res = await fetch(`${API_BASE_URL}/api/generate-shorts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: params.url,
        target_duration: params.targetDuration,
        shorts_count: params.shortsCount
      })
    });
    if (!res.ok) throw new Error("Failed to generate shorts");
    return res.json();
  },

  async postToAll(params: PostToAllParams) {
    const res = await fetch(`${API_BASE_URL}/api/social/post-all`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clip_id: params.clipId,
        title: params.title,
        description: params.description,
        hashtags: params.hashtags,
        platforms: params.platforms,
        video_url: params.videoUrl
      })
    });
    if (!res.ok) throw new Error("Failed to post to social platforms");
    return res.json();
  }
};
