// components/TopicDetailCard.tsx
import Link from "next/link";

interface TopicDetailCardProps {
  id: string;
  title: string;
  content?: string | null;
  courseId: string;
}

export default function TopicDetailCard({
  id,
  title,
  content,
  courseId,
}: TopicDetailCardProps) {
  return (
    <article className="border rounded-lg p-6 shadow-sm bg-white hover:shadow-md transition">
      {/* Title links to topic detail page */}
      <Link href={`/topics/${id}`}>
        <h2 className="text-2xl font-bold mb-2 hover:underline">{title}</h2>
      </Link>

      <p className="text-gray-700 mb-6">
        {content ?? "No content available for this topic."}
      </p>

      <div className="flex justify-between items-center">
        <Link href="/topics" className="text-blue-600 underline text-sm">
          ← Back to Topics
        </Link>

        <Link
          href={`/courses/${courseId}`}
          className="text-blue-600 underline text-sm"
        >
          View Course →
        </Link>
      </div>
    </article>
  );
}
