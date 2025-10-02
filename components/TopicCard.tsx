// components/TopicCard.tsx
import Link from "next/link";
import Image from "next/image";

interface TopicCardProps {
  id: string;
  title: string;
  excerpt?: string;
  cover_image?: string;
}

export default function TopicCard({ id, title, excerpt, cover_image }: TopicCardProps) {
  return (
    <Link
      href={`/topics/${id}`}
      className="block bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-transform"
    >
      {/* Cover image */}
      {cover_image && (
        <div className="relative w-full h-40">
          <Image
            src={cover_image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Text content */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        {excerpt && (
          <p className="text-sm text-gray-600 line-clamp-3">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}
