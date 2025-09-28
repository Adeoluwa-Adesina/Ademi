// app/courses/page.tsx
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type Course = {
  id: string;
  title: string;
  description: string | null;
};

export default async function CoursesPage() {
  // Fetch all courses
  const { data: courses, error } = await supabase
    .from("courses")
    .select("id, title, description")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="p-8">
        <p className="text-red-500 mb-4">
          Error loading courses: {error.message}
        </p>
        <Link
          href="/"
          className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Back to Home
        </Link>
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Courses</h1>
          <Link
            href="/"
            className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            ← Back to Home
          </Link>
        </div>
        <p className="text-gray-600">No courses available yet.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link
          href="/"
          className="inline-block bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
        >
          ← Back to Home
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: Course) => (
          <Link
            key={course.id}
            href={`/courses/${course.id}`}
            className="border rounded-lg p-4 shadow-sm hover:shadow-md transition block"
          >
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600 text-sm">
              {course.description ?? "No description available."}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
