// app/topics/page.tsx
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import Image from "next/image";

export default async function TopicsGalleryPage() {
  const { data: topics, error } = await supabase
    .from("topics")
    .select("id, title, excerpt, cover_image")
    .order("created_at", { ascending: true });

  if (error) {
    return <p className="p-8 text-red-500">Error loading topics: {error.message}</p>;
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Topics</h1>

      {topics && topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Link
              key={topic.id}
              href={`/topics/${topic.id}`}
              className="block border rounded-lg shadow-sm hover:shadow-md transition bg-white overflow-hidden"
            >
              {topic.cover_image && (
                <div className="relative w-full h-40">
                  <Image
                    src={topic.cover_image}
                    alt={topic.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h2 className="font-semibold text-lg">{topic.title}</h2>
                {topic.excerpt && (
                  <p className="text-sm text-gray-600 mt-2 line-clamp-3">{topic.excerpt}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-gray-600">No topics available yet.</p>
      )}
    </div>
  );
}
