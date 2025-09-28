// components/TopicCard.tsx
import Link from "next/link";

interface TopicCardProps {
  id: string;
  title: string;
  content?: string; // ✅ use only string | undefined
}

export default function TopicCard({ id, title, content }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${id}`}
      className="block p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition"
    >
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {content && <p className="text-sm text-gray-600 line-clamp-2">{content}</p>}
    </Link>
  );
}
