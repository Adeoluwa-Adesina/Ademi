// components/CourseCard.tsx
import Link from "next/link";
import InteractiveCanvas from "./InteractiveCanvas"; // Assumed import path

type CourseCardProps = {
  id: string;
  title: string;
  description?: string;
};

export default function CourseCard({ id, title, description }: CourseCardProps) {
  return (
    // Wrap the entire card in Link for navigation, matching the first code block
    <Link href={`/courses/${id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 cursor-pointer">
        
        {/*
          1. InteractiveCanvas (from the second code block)
          This provides the rich media/visual component for the card header.
        */}
        <InteractiveCanvas id={id} title={title} />
        
        <div className="p-4">
          {/* 2. Title and Description (from both code blocks)
            Using the bolder styling from the second block for visual hierarchy.
          */}
          <h3 className="font-bold text-lg">{title}</h3>
          
          {description && <p className="text-gray-600 text-sm mt-1">{description}</p>}
        </div>
      </div>
    </Link>
  );
}