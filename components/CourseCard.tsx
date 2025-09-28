// components/CourseCard.tsx
import Link from "next/link";

type CourseCardProps = {
  id: string;
  title: string;
  description?: string;
};

export default function CourseCard({ id, title, description }: CourseCardProps) {
  return (
    <Link href={`/courses/${id}`}>
      <div className="p-4 border rounded-lg shadow hover:shadow-lg transition cursor-pointer">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && <p className="text-gray-600 mt-2">{description}</p>}
      </div>
    </Link>
  );
}
