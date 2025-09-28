// app/page.tsx
import { getCourses, getTopics } from "../lib/queries";
import ToggleView from "../components/ToggleView";

export default async function HomePage() {
  // Fetch Supabase data server-side
  const courses = await getCourses();
  const topics = await getTopics();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <ToggleView courses={courses} topics={topics} />
    </main>
  );
}
