import { supabase } from "@/lib/supabaseClient"

export default async function CoursesPage() {
  const { data: courses, error } = await supabase.from("courses").select("*")

  if (error) return <p>Error: {error.message}</p>

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Courses</h1>
      {courses?.map((course) => (
        <div key={course.id} className="border p-2 mb-2 rounded">
          <h2 className="font-bold">{course.title}</h2>
          <p>{course.description}</p>
        </div>
      ))}
    </div>
  )
}
