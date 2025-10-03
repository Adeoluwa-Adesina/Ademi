// app/topics/[id]/page.tsx
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";

type MediaItem = {
  type: "image" | "video" | "pdf";
  url: string;
};

export default async function TopicDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const { data: topic, error } = await supabase
    .from("topics")
    .select(
      "id, title, content_markdown, cover_image, media, interactive_component, course_id"
    )
    .eq("id", id)
    .single();

  if (error) {
    return <p className="p-8 text-red-500">Error loading topic: {error.message}</p>;
  }

  if (!topic) {
    return <p className="p-8 text-gray-600">Topic not found.</p>;
  }

  const mediaItems: MediaItem[] = topic.media || [];

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link
        href={`/courses/${topic.course_id}`}
        className="text-blue-600 underline block mb-4"
      >
        ← Back to Course
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>

      {/* Cover Image */}
      {topic.cover_image && (
        <div className="relative w-full h-64 mb-6">
          <Image
            src={topic.cover_image}
            alt={topic.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      {/* Markdown content w/ LaTeX */}
      <div className="prose prose-lg max-w-none mb-6">
        <ReactMarkdown
          remarkPlugins={[remarkMath]}
          rehypePlugins={[rehypeKatex]}
        >
          {topic.content_markdown ?? "No content available."}
        </ReactMarkdown>
      </div>

      {/* Media items */}
      {mediaItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Resources</h2>
          <div className="space-y-4">
            {mediaItems.map((item, i) => {
              if (item.type === "image") {
                return (
                  <Image
                    key={i}
                    src={item.url}
                    alt="Media resource"
                    width={600}
                    height={400}
                    className="rounded-lg"
                  />
                );
              }
              if (item.type === "video") {
                return (
                  <div key={i} className="aspect-video">
                    <iframe
                      src={item.url}
                      className="w-full h-full rounded-lg"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                );
              }
              if (item.type === "pdf") {
                return (
                  <a
                    key={i}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View PDF Resource
                  </a>
                );
              }
              return null;
            })}
          </div>
        </div>
      )}

      {/* Interactive component (WebGL, etc.) */}
      {topic.interactive_component && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">Interactive</h2>
          <div
            className="border rounded-lg p-4 bg-gray-50"
            dangerouslySetInnerHTML={{ __html: topic.interactive_component }}
          />
        </div>
      )}
    </div>
  );
}
