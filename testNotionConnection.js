// Corrected Test Script
import "dotenv/config";
import { Client } from "@notionhq/client";

console.log("🚀 Testing Notion v5 connection...");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function test() {
  try {
    // ----------------------------------------------------
    // FIX HERE: Use NOTION_TOPICS_DB_ID instead of NOTION_DATABASE_ID
    // ----------------------------------------------------
    const topicsDbId = process.env.NOTION_TOPICS_DB_ID; 

    if (!topicsDbId) {
        console.error("❌ Configuration Error: NOTION_TOPICS_DB_ID not found in environment variables.");
        return;
    }

    const response = await notion.request({
      // Use the correctly named variable
      path: `databases/${topicsDbId}/query`,
      method: "POST",
    });

    console.log("✅ Connection successful!");
    console.log(
      "Found pages:",
      response.results.map(
        (r) => r.properties?.Name?.title?.[0]?.plain_text ?? "Untitled"
      )
    );
    console.log(`Total pages found: ${response.results.length}`); // Log the count
    
  } catch (err) {
    console.error("❌ Notion API error:", err.message);
  }
}

test();