// syncSupabaseToNotion.js
import "dotenv/config";
import https from "https";
import { createClient } from "@supabase/supabase-js";

/**
 * Required .env vars:
 * NOTION_TOKEN
 * NOTION_TOPICS_DB_ID
 * NOTION_COURSES_DB_ID
 * SUPABASE_URL
 * SUPABASE_SERVICE_KEY
 */

const token = process.env.NOTION_TOKEN;
const topicsDbId = process.env.NOTION_TOPICS_DB_ID;
const coursesDbId = process.env.NOTION_COURSES_DB_ID;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// ---------- Utility helpers ----------
function notionFetch(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.notion.com",
      path,
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Notion-Version": "2022-06-28",
      },
    };
    const req = https.request(options, (res) => {
      let raw = "";
      res.on("data", (chunk) => (raw += chunk));
      res.on("end", () => {
        try {
          resolve(JSON.parse(raw));
        } catch (e) {
          reject(new Error(`JSON parse error: ${raw}`));
        }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function createPage(databaseId, properties, children = []) {
  return notionFetch(`/v1/pages`, "POST", {
    parent: { database_id: databaseId },
    properties,
    children,
  });
}

async function updatePage(pageId, properties) {
  return notionFetch(`/v1/pages/${pageId}`, "PATCH", { properties });
}

// Basic Markdown → Notion paragraph blocks (simple fallback)
function markdownToBlocks(markdown) {
  const lines = markdown.split("\n").filter((l) => l.trim() !== "");
  return lines.map((line) => ({
    object: "block",
    type: "paragraph",
    paragraph: {
      rich_text: [{ type: "text", text: { content: line.slice(0, 2000) } }],
    },
  }));
}

// ---------- Courses Sync ----------
async function syncCoursesToNotion() {
  console.log("📚 Syncing courses Supabase → Notion...");
  const { data: courses, error } = await supabase.from("courses").select("*");
  if (error) throw new Error(error.message);
  console.log(`Found ${courses.length} courses in Supabase`);

  for (const course of courses) {
    const title = course.title || "Untitled Course";
    const desc = course.description || "";
    const cover = course.cover_image || null;
    const supabaseId = course.id;

    // Check if page already exists
    const query = await notionFetch(`/v1/databases/${coursesDbId}/query`, "POST", {
      filter: {
        property: "Supabase ID",
        rich_text: { equals: supabaseId },
      },
    });

    let pageId = null;

    if (query.results?.length > 0) {
      pageId = query.results[0].id;
      console.log(`🔁 Updating existing course: ${title}`);
      await updatePage(pageId, {
        Name: { title: [{ text: { content: title } }] },
        Description: { rich_text: [{ text: { content: desc } }] },
      });
    } else {
      console.log(`🆕 Creating new course: ${title}`);
      const res = await createPage(coursesDbId, {
        Name: { title: [{ text: { content: title } }] },
        Description: { rich_text: [{ text: { content: desc } }] },
        "Supabase ID": { rich_text: [{ text: { content: supabaseId } }] },
      });
      pageId = res.id;
    }

    if (cover) {
      await notionFetch(`/v1/pages/${pageId}`, "PATCH", {
        cover: { external: { url: cover } },
      });
    }
  }

  console.log("✅ Course sync complete!\n");
}

// ---------- Topics Sync ----------
async function syncTopicsToNotion() {
  console.log("🧩 Syncing topics Supabase → Notion...");
  const { data: topics, error } = await supabase
    .from("topics")
    .select("*, courses(title)");
  if (error) throw new Error(error.message);

  console.log(`Found ${topics.length} topics in Supabase`);

  for (const topic of topics) {
    const title = topic.title || "Untitled Topic";
    const excerpt = topic.excerpt || "";
    const cover = topic.cover_image || null;
    const interactive = topic.interactive_component || "";
    const mediaJson = JSON.stringify(topic.media || []);
    const supabaseId = topic.id;
    const markdown = topic.content_markdown || "";

    // Check if Notion page exists for this topic
    const query = await notionFetch(`/v1/databases/${topicsDbId}/query`, "POST", {
      filter: {
        property: "Supabase ID",
        rich_text: { equals: supabaseId },
      },
    });

    let pageId = null;
    if (query.results?.length > 0) {
      pageId = query.results[0].id;
      console.log(`🔁 Updating existing topic: ${title}`);

      await updatePage(pageId, {
        Name: { title: [{ text: { content: title } }] },
        Excerpt: { rich_text: [{ text: { content: excerpt } }] },
        Interactive: { rich_text: [{ text: { content: interactive } }] },
        "Media JSON": { rich_text: [{ text: { content: mediaJson } }] },
      });
    } else {
      console.log(`🆕 Creating new topic: ${title}`);
      const res = await createPage(
        topicsDbId,
        {
          Name: { title: [{ text: { content: title } }] },
          Excerpt: { rich_text: [{ text: { content: excerpt } }] },
          Interactive: { rich_text: [{ text: { content: interactive } }] },
          "Media JSON": { rich_text: [{ text: { content: mediaJson } }] },
          "Supabase ID": { rich_text: [{ text: { content: supabaseId } }] },
        },
        markdownToBlocks(markdown)
      );
      pageId = res.id;
    }

    if (cover) {
      await notionFetch(`/v1/pages/${pageId}`, "PATCH", {
        cover: { external: { url: cover } },
      });
    }

    // Attempt to link course if available
    if (topic.course_id) {
      const { data: course } = await supabase
        .from("courses")
        .select("id, title")
        .eq("id", topic.course_id)
        .single();

      if (course) {
        // Find course page in Notion
        const cq = await notionFetch(`/v1/databases/${coursesDbId}/query`, "POST", {
          filter: {
            property: "Supabase ID",
            rich_text: { equals: course.id },
          },
        });
        if (cq.results?.length > 0) {
          const coursePageId = cq.results[0].id;
          await notionFetch(`/v1/pages/${pageId}`, "PATCH", {
            properties: {
              Course: { relation: [{ id: coursePageId }] },
            },
          });
          console.log(`🔗 Linked course: ${course.title}`);
        }
      }
    }
  }

  console.log("✅ Topic sync complete!\n");
}

// ---------- Run both ----------
(async function runReverseSync() {
  try {
    await syncCoursesToNotion();
    await syncTopicsToNotion();
    console.log("🎉 Supabase → Notion reverse sync complete!");
  } catch (err) {
    console.error("💥 Reverse sync error:", err.message);
  }
})();
