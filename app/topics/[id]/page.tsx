// app/topics/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import TopicDetailCard from "@/components/TopicDetailCard";

export default async function TopicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch topic
  const { data: topic, error } = await supabase
    .from("topics")
    .select("id, title, content, course_id")
    .eq("id", id)
    .single();

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error loading topic: {error.message}</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Topic not found.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <TopicDetailCard
        id={topic.id}
        title={topic.title}
        content={topic.content}
        courseId={topic.course_id}
      />
    </div>
  );
}
