// app/topics/[id]/page.tsx
import { supabase } from "@/supabaseClient";
import Link from "next/link";
import Image from "next/image"; // CORRECTED: Removed StaticImport from named exports
import ReactMarkdown, { Components } from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { notFound } from "next/navigation";
import React from "react";
import InteractiveLoader from "@/components/Interactive/InteractiveLoader";

type MediaItem = {
  type: "image" | "video" | "pdf" | string;
  url: string;
  caption?: string;
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
      "id, title, content_markdown, cover_image, media, interactive_component, course_id, notion_last_edited"
    )
    .eq("id", id)
    .single();

  if (error) {
    return <p className="p-8 text-red-500">Error loading topic: {error.message}</p>;
  }

  if (!topic) return notFound();

  const mediaItems: MediaItem[] = Array.isArray(topic.media) ? topic.media : [];

  const content = topic.content_markdown ?? "No content available.";

  // Custom ReactMarkdown components
  const components: Components = {
    // Paragraphs — look for interactive placeholder text
    p: ({ children }) => {
      const text = React.Children.toArray(children)
        .map((child) => (typeof child === "string" ? child : ""))
        .join("")
        .trim();

      // Detect "[Interactive Visualization: Label]" anywhere in the paragraph
      const match = text.match(/\[Interactive Visualization:\s*([^\]]+)\]/i);
      if (match) {
        const label = match[1].trim();
        const key = label.toLowerCase().replace(/\s+/g, "-");
        return (
          <div className="my-8 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">{label}</h2>
            {/* InteractiveLoader is expected to be a client component that dynamically loads the visual */}
            <InteractiveLoader keyName={key} label={label} />
          </div>
        );
      }

      return <p>{children}</p>;
    },

    // Render images in markdown using next/image where possible
    img: ({ src, alt }) => {
      if (!src) return null;
      // Next.js Image expects absolute URL or allowed domain configured
      return (
        <div className="my-4">
          {/* Cover image uses a dynamic URL from Notion/Supabase, hence the type assertion */}
          <Image src={src as string} alt={alt ?? "image"} width={800} height={450} className="rounded-lg" />
          {alt && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{alt}</p>}
        </div>
      );
    },
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Back link */}
      <Link href={topic.course_id ? `/courses/${topic.course_id}` : `/courses`} className="text-blue-600 underline block mb-4">
        ← Back to Course
      </Link>

      {/* Title */}
      <h1 className="text-3xl font-bold mb-4">{topic.title}</h1>

      {/* Last updated */}
      {topic.notion_last_edited && (
        <p className="text-sm text-gray-500 mb-4">
          Last updated: {new Date(topic.notion_last_edited).toLocaleString()}
        </p>
      )}

      {/* Cover Image */}
      {topic.cover_image && (
        <div className="relative w-full h-64 mb-6">
          {/* Cover image uses a dynamic URL from Notion/Supabase, hence the type assertion */}
          <Image src={topic.cover_image as string} alt={topic.title} fill className="object-cover rounded-lg" />
        </div>
      )}

      {/* Markdown content with math + interactivity */}
      <div className="prose prose-lg max-w-none mb-6 dark:prose-invert">
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={components}>
          {content}
        </ReactMarkdown>
      </div>

      {/* Media items (structured list) */}
      {mediaItems.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Resources</h2>
          <div className="space-y-4">
            {mediaItems.map((item, i) => {
              const t = (item.type || "").toLowerCase();
              if (t === "image") {
                return (
                  // Type assertion maintained to fix the original 'string | Blob' issue
                  <Image 
                    key={i} 
                    src={item.url as string} 
                    alt={item.caption ?? "Media image"} 
                    width={800} 
                    height={450} 
                    className="rounded-lg" 
                  />
                );
              }
              if (t === "video") {
                return (
                  <div key={i} className="aspect-video">
                    <iframe src={item.url} className="w-full h-full rounded-lg" allow="autoplay; encrypted-media" allowFullScreen />
                  </div>
                );
              }
              if (t === "pdf") {
                return (
                  <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                    {item.caption ?? "View PDF Resource"}
                  </a>
                );
              }
              // fallback: render as link
              return (
                <a key={i} href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {item.caption ?? item.url}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}