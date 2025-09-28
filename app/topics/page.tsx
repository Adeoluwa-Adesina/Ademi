// app/topics/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Topic = {
  id: string;
  title: string;
  content: string | null;
  course_id: string;
};

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
        <Link href="/topics" className="text-blue-500 underline mt-4 block">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Topic not found.</p>
        <Link href="/topics" className="text-blue-500 underline mt-4 block">
          ← Back to Topics
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link href="/topics" className="text-blue-600 underline mb-4 block">
        ← Back to Topics
      </Link>

      <h1 className="text-3xl font-bold mb-3">{topic.title}</h1>
      <p className="text-gray-700 mb-6">
        {topic.content ?? "No content available for this topic."}
      </p>

      <Link
        href={`/courses/${topic.course_id}`}
        className="text-blue-600 underline block mt-6"
      >
        View Course →
      </Link>
    </div>
  );
}
