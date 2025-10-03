import "dotenv/config";
import { Client } from "@notionhq/client";

console.log("🚀 Testing Notion v5 connection...");

const notion = new Client({ auth: process.env.NOTION_TOKEN });

async function test() {
  try {
    const response = await notion.request({
      path: `databases/${process.env.NOTION_DATABASE_ID}/query`,
      method: "POST",
    });

    console.log("✅ Connection successful!");
    console.log(
      "Found pages:",
      response.results.map(
        (r) => r.properties?.Name?.title?.[0]?.plain_text ?? "Untitled"
      )
    );
  } catch (err) {
    console.error("❌ Notion API error:", err.message);
  }
}

test();
