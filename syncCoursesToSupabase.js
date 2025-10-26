// syncCoursesToSupabase.js
import "dotenv/config";
import https from "https";
import { createClient } from "@supabase/supabase-js";

// --- Config ---
const token = process.env.NOTION_TOKEN;
const coursesDbId = process.env.NOTION_COURSES_DB_ID;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// --- Helper for direct Notion API calls ---
function notionFetch(path, method = "GET", body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: "api.notion.com",
      path,
      method,
      headers: {
        "Authorization": `Bearer ${token}`,
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

// --- Helper: update Notion property value (for Supabase ID write-back) ---
async function updateNotionProperty(pageId, propId, value) {
  return notionFetch(`/v1/pages/${pageId}`, "PATCH", {
    properties: {
      [propId]: { rich_text: [{ text: { content: value } }] },
    },
  });
}

// --- Main sync ---
async function syncCourses() {
  console.log("🚀 Syncing Courses from Notion → Supabase");

  // 1️⃣ Get all courses
  const query = await notionFetch(`/v1/databases/${coursesDbId}/query`, "POST", {});
  const courses = query.results || [];
  console.log(`📚 Found ${courses.length} courses in Notion`);

  for (const page of courses) {
    const pageId = page.id.replace(/-/g, "");

    const title =
      page.properties?.Name?.title?.[0]?.plain_text?.trim() || "Untitled Course";
    const description =
      page.properties?.Description?.rich_text?.[0]?.plain_text || null;
    
    const supabaseIdProp = page.properties?.["Supabase ID"];
    const supabaseId =
      supabaseIdProp?.rich_text?.[0]?.plain_text?.trim() || null;

    // 2️⃣ Upsert into Supabase
    let dbId = supabaseId;

    if (!dbId) {
      // Insert new course → generate UUID automatically in Supabase
      const { data, error } = await supabase
        .from("courses")
        .insert({
          title,
          description,
        })
        .select("id")
        .single();

      if (error) {
        console.error(`❌ Error creating course "${title}":`, error.message);
        continue;
      }

      dbId = data.id;
      console.log(`🆕 Created new course "${title}" with id ${dbId}`);

      // Write back Supabase ID to Notion
      if (supabaseIdProp?.id) {
        await updateNotionProperty(page.id, supabaseIdProp.id, dbId);
        console.log(`🔗 Linked Supabase ID back to Notion`);
      }
    } else {
      // Update existing course
      const { error } = await supabase
        .from("courses")
        .upsert({
          id: dbId,
          title,
          description,
        });

      if (error) {
        console.error(`❌ Error updating course "${title}":`, error.message);
      } else {
        console.log(`✅ Updated existing course "${title}"`);
      }
    }
  }

  console.log("\n✨ Course sync complete!");
}

syncCourses().catch((err) =>
  console.error("💥 Fatal sync error:", err.message)
);
