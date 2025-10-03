// components/TopicCard.tsx
import Link from "next/link";
import Image from "next/image";

interface TopicCardProps {
  id: string;
  title: string;
  excerpt?: string | null;
  cover_image?: string | null;
  interactive_component?: string | null;
}

export default function TopicCard({
  id,
  title,
  excerpt,
  cover_image,
  interactive_component,
}: TopicCardProps) {
  return (
    <Link href={`/topics/${id}`} className="block">
      <article className="border rounded-lg p-4 shadow-sm bg-white hover:shadow-md transition flex flex-col">
        {/* Cover image or interactive preview */}
        <div className="relative w-full h-40 mb-3 rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
          {interactive_component ? (
            <div
              className="w-full h-full"
              dangerouslySetInnerHTML={{ __html: interactive_component }}
            />
          ) : cover_image ? (
            <Image
              src={cover_image}
              alt={title}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-gray-400 text-sm">No preview available</span>
          )}
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold mb-1 line-clamp-2">{title}</h2>

        {/* Excerpt */}
        <p className="text-gray-600 text-sm line-clamp-3 flex-1">
          {excerpt ?? "No description available."}
        </p>
      </article>
    </Link>
  );
}
