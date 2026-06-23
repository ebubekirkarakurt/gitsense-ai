import { supabase } from "./supabase";

export async function saveAnalysis(
  projectId: string,
  title: string,
  diffText: string,
  suggestions: any[],
  stats: any
) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("analyses")
    .insert({
      project_id: projectId,
      user_id: user.id,
      title,
      diff_text: diffText,
      suggestions,
      stats,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getAnalyses(projectId: string) {
  const { data, error } = await supabase
    .from("analyses")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function getRecentAnalyses() {
  const { data, error } = await supabase
    .from("analyses")
    .select("*, projects(name)")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) throw error;
  return data;
}