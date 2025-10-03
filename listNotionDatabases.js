// listNotionDatabases.js

import "dotenv/config";
import { Client } from "@notionhq/client";

console.log("🔍 Starting Notion API access check...");

const NOTION_TOKEN = process.env.NOTION_TOKEN;
// Get the working database ID from the .env file
const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID; 

// 1. Check for token and initialize client
if (!NOTION_TOKEN) {
  console.error(
    "❌ Error: NOTION_TOKEN is not set in your .env file or environment."
  );
  console.log("👉 Please ensure your .env file has NOTION_TOKEN set to your ntn_... key.");
  process.exit(1);
}
const notion = new Client({ auth: NOTION_TOKEN });

// 2. Function to test the token validity (DEFINED FIRST)
// This must succeed before we attempt a database query.
async function checkTokenValidity() {
  try {
    await notion.users.retrieve({ user_id: "me" });
    console.log("✅ Token Check: NOTION_TOKEN is valid and authentication succeeded.");
    return true;
  } catch (error) {
    if (error.status === 401) {
      console.error("❌ Token Error: NOTION_TOKEN is invalid or expired (401 Unauthorized).");
    } else {
      console.error("❌ API Error during token check:", error.message);
    }
    return false;
  }
}

// 3. Main function to query the database directly (DEFINED SECOND)
// This uses the method that succeeded in your Python test.
async function queryDatabase() {
  // Check token validity before proceeding
  if (!(await checkTokenValidity())) {
    return;
  }

  if (!NOTION_DATABASE_ID) {
      console.error("❌ Error: NOTION_DATABASE_ID is not set in your .env file.");
      console.log(`👉 Please add the ID (28c1b570ebb980e68d1be2e2d0e8f490) to your .env file as NOTION_DATABASE_ID.`);
      return;
  }

  console.log(`\n🔍 Querying database directly with ID: ${NOTION_DATABASE_ID}`);

  try {
    // 3a. Retrieve metadata (like the title)
    const db_metadata = await notion.databases.retrieve({ 
        database_id: NOTION_DATABASE_ID
    });
    
    // 3b. Query the pages in the database
    const response = await notion.databases.query({
      database_id: NOTION_DATABASE_ID,
      page_size: 1, // Confirming access is the goal
    });

    const title =
      db_metadata.title?.[0]?.plain_text || "Untitled Database";

    console.log(`\n✅ Success! JavaScript access confirmed.`);
    console.log(`📚 Database Title: ${title}`);
    console.log(`🔑 Database ID: ${NOTION_DATABASE_ID}`);
    console.log(`📄 Sample Pages Found: ${response.results.length} (If > 0, you have read access)`);
    console.log("\n🥳 Your Node.js setup is now fully working and confirmed!");

  } catch (error) {
    // The previous error "notion.databases.query is not a function" 
    // means your package is old. This error handling assumes you have updated it.
    if (error.code === 'validation_error' || error.status === 404) {
        console.error("❌ Fatal Error in JS Database Query: Database Not Found (404/Validation Error)");
        console.log("👉 The token is valid, but the database ID is wrong OR the integration was disconnected from the database.");
    } else {
        console.error(`❌ Fatal Error in JS Database Query: ${error.message}`);
    }
  }
}

// 4. CALL the main function
queryDatabase();