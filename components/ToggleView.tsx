// components/ToggleView.tsx
"use client";

import { useState } from "react";
import CourseCard from "./CourseCard";
import TopicCard from "./TopicCard";

type Course = {
  id: string;
  title: string;
  description?: string | null;
};

type Topic = {
  id: string;
  title: string;
  content?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
};

export default function ToggleView({
  courses,
  topics,
}: {
  courses: Course[];
  topics: Topic[];
}) {
  const [view, setView] = useState<"courses" | "topics">("courses");

  return (
    <>
      {/* Toggle buttons */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={() => setView("courses")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            view === "courses"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Courses
        </button>
        <button
          onClick={() => setView("topics")}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            view === "topics"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Topics
        </button>
      </div>

      {/* Conditional render */}
      {view === "courses" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              description={course.description ?? undefined}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic) => (
            <TopicCard
              key={topic.id}
              id={topic.id}
              title={topic.title}
              excerpt={topic.excerpt || topic.content?.slice(0, 100)} // ✅ now matches TopicCard
              cover_image={topic.cover_image || undefined}
            />
          ))}
        </div>
      )}
    </>
  );
}
