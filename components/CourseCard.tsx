// components/CourseCard.tsx
import Link from "next/link";
import Image from "next/image";

type CourseCardProps = {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string; // optional thumbnail URL
};

export default function CourseCard({ id, title, description, thumbnail }: CourseCardProps) {
  return (
    <Link href={`/topics/${id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer">
        {thumbnail && (
          <Image
            src={thumbnail}
            alt={title}
            width={400}
            height={200}
            className="w-full h-48 object-cover"
          />
        )}
        <div className="p-4">
          <h3 className="font-bold text-lg">{title}</h3>
          {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        </div>
      </div>
    </Link>
  );
}
