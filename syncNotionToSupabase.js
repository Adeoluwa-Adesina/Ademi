// syncNotionToSupabase.js
import "dotenv/config";
import https from "https";
import { NotionToMarkdown } from "notion-to-md";
import { createClient } from "@supabase/supabase-js";

/**
 * ENV required:
 * NOTION_TOKEN
 * NOTION_TOPICS_DB_ID
 * NOTION_COURSES_DB_ID (optional - used to look up courses relation)
 * SUPABASE_URL
 * SUPABASE_SERVICE_KEY
 */

const token = process.env.NOTION_TOKEN;
const topicsDbId = process.env.NOTION_TOPICS_DB_ID;
const coursesDbId = process.env.NOTION_COURSES_DB_ID || null;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- Low-level Notion fetch helper (uses explicit /v1/ path) ---
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

// --- Read a page's blocks recursively ---
async function getBlocks(blockId) {
  const blocks = [];
  let cursor = undefined;

  while (true) {
    const res = await notionFetch(
      `/v1/blocks/${blockId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`
    );

    if (!res.results) break;
    blocks.push(...res.results);
    if (!res.has_more) break;
    cursor = res.next_cursor;
  }
  return blocks;
}

// --- Helper: fetch a Notion page (used to inspect related course pages) ---
async function getPage(pageId) {
  return notionFetch(`/v1/pages/${pageId}`);
}

// --- Helper: write a simple text property back to a Notion page (used by courses sync) ---
async function updateNotionProperty(pageId, propertyObject) {
  // propertyObject is like: { "Supabase ID": { rich_text: [{ text: { content: 'uuid' } }] } }
  return notionFetch(`/v1/pages/${pageId}`, "PATCH", { properties: propertyObject });
}

// --- Helper: read related course mapping (given relation array) ---
async function resolveCourseRelation(relationArray) {
  // relationArray is from page.properties.Course.relation -> array of objects { id: 'page-id' }
  if (!relationArray || relationArray.length === 0) return null;

  // We'll try the first relation only (one-to-one)
  const relatedPageId = relationArray[0].id;
  const page = await getPage(relatedPageId);

  // Try to read a 'Supabase ID' property on the course's Notion page if present
  const supabaseIdProp = page.properties?.["Supabase ID"];
  const supabaseId = supabaseIdProp?.rich_text?.[0]?.plain_text?.trim();

  if (supabaseId) return supabaseId;

  // If there's no Supabase ID stored, fallback to using the course title and search in Supabase by title
  const courseTitle = page.properties?.Name?.title?.[0]?.plain_text?.trim();
  if (!courseTitle) return null;

  const { data: found, error } = await supabase
    .from("courses")
    .select("id")
    .ilike("title", courseTitle)
    .limit(1);

  if (error) {
    console.warn("Warning: error searching courses by title:", error.message);
    return null;
  }
  if (found && found.length > 0) return found[0].id;

  return null;
}

// --- Main sync routine for topics ---
async function syncTopics() {
  console.log("🚀 Starting topics sync (Notion → Supabase)");

  // fetch topics pages from Notion DB
  const query = await notionFetch(`/v1/databases/${topicsDbId}/query`, "POST", {});
  const pages = query.results || [];
  console.log(`📄 Found ${pages.length} topic page(s)`);

  const n2m = new NotionToMarkdown({ notionClient: { client: null } });

  for (const page of pages) {
    try {
      // canonical page id without dashes
      const notionPageId = page.id.replace(/-/g, "");
      const title = page.properties?.Name?.title?.[0]?.plain_text?.trim() || "Untitled";
      const excerpt = page.properties?.Excerpt?.rich_text?.[0]?.plain_text || null;
      const cover_image = page.cover?.external?.url || page.cover?.file?.url || null;
      const lastEdited = page.last_edited_time ? new Date(page.last_edited_time).toISOString() : null;

      // interactive component prop (text)
      const interactive_component = page.properties?.Interactive?.rich_text?.[0]?.plain_text || null;

      // media JSON (stored as plain text in Notion property - parse safely)
      let media = [];
      const mediaRaw = page.properties?.["Media JSON"]?.rich_text?.[0]?.plain_text || null;
      if (mediaRaw) {
        try {
          media = JSON.parse(mediaRaw);
        } catch (e) {
          console.warn(`Warning: failed to parse Media JSON for '${title}', storing as empty array.`);
          media = [];
        }
      }

      // Course relation resolution (if property exists)
      let course_id = null;
      if (page.properties?.Course?.relation) {
        course_id = await resolveCourseRelation(page.properties.Course.relation);
      }

      console.log(`\n🧩 Processing topic: ${title} (Notion page: ${page.id})`);

      // Fetch blocks + convert to Markdown
      const blocks = await getBlocks(page.id);
      const mdBlocks = await n2m.blocksToMarkdown(blocks);
      const markdown = n2m.toMarkdownString(mdBlocks).parent || "";

      // Prepare upsert payload
      const payload = {
        title,
        content_markdown: markdown,
        excerpt,
        cover_image,
        media,
        interactive_component,
        notion_page_id: page.id,
        notion_last_edited: lastEdited,
        course_id,
        updated_at: new Date().toISOString(),
      };

      // Upsert by notion_page_id to avoid duplicates. Ensure you have a unique constraint on notion_page_id
      const { error } = await supabase.from("topics").upsert(payload, { onConflict: "notion_page_id" });

      if (error) {
        console.error(`❌ Supabase upsert error for "${title}":`, error.message);
      } else {
        console.log(`✅ Synced topic: "${title}"`);
      }
    } catch (err) {
      console.error("❌ Error processing page:", err.message);
    }
  }

  console.log("\n✨ Topics sync complete!");
}

// --- Run the sync ---
syncTopics().catch((err) => console.error("💥 Fatal sync error:", err.message));
