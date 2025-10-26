// lib/queries.ts
import { supabase } from "../supabaseClient";
import { Course, Topic } from "@/types";

export async function getCourses(): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("id, title, description")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((course) => ({
    ...course,
    description: course.description ?? undefined, // ✅ normalize null → undefined
  }));
}

export async function getTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("id, title, content, course_id, created_at")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return (data ?? []).map((topic) => ({
    ...topic,
    content: topic.content ?? undefined, // ✅ normalize null → undefined
  }));
}
