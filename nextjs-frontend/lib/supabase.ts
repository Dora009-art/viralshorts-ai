import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'public-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });
  if (error) console.error("Google login error:", error);
  return data;
}

export async function saveUserProject(userId: string, videoMeta: any, clips: any[]) {
  const { data, error } = await supabase
    .from('viral_projects')
    .insert([
      {
        user_id: userId,
        video_title: videoMeta.title,
        video_url: videoMeta.url,
        clips_data: clips,
        created_at: new Date().toISOString()
      }
    ]);
  return { data, error };
}
