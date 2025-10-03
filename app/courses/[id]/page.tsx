// app/courses/[id]/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import TopicCard from "@/components/TopicCard";

export default async function CourseDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  // Fetch course
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, description")
    .eq("id", id)
    .single();

  if (courseError) {
    return (
      <div className="p-8">
        <p className="text-red-500">Error loading course: {courseError.message}</p>
        <Link href="/courses" className="text-blue-500 underline mt-4 block">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8">
        <p className="text-gray-600">Course not found.</p>
        <Link href="/courses" className="text-blue-500 underline mt-4 block">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  // Fetch topics
  const { data: topics, error: topicsError } = await supabase
    .from("topics")
    .select("id, title, excerpt, content_markdown, cover_image, course_id")
    .eq("course_id", id)
    .order("created_at", { ascending: true });

  if (topicsError) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-red-500">Error loading topics: {topicsError.message}</p>
        <Link href="/courses" className="text-blue-500 underline mt-4 block">
          ← Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Back link */}
      <Link href="/courses" className="text-blue-600 underline mb-4 block">
        ← Back to Courses
      </Link>

      {/* Course title + desc */}
      <h1 className="text-3xl font-bold mb-3">{course.title}</h1>
      <p className="text-gray-700 mb-6">{course.description}</p>

      {/* Topics Gallery */}
      <h2 className="text-2xl font-semibold mb-4">Topics</h2>
      {Array.isArray(topics) && topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              excerpt={topic.excerpt || topic.content_markdown?.slice(0, 100)}
              cover_image={topic.cover_image}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No topics available for this course yet.</p>
      )}
    </div>
  );
}
