// testNotionFetch.js
import "dotenv/config";
import https from "https";

const token = process.env.NOTION_TOKEN;
const dbId = process.env.NOTION_DATABASE_ID;

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
          const parsed = JSON.parse(raw);
          resolve(parsed);
        } catch {
          reject(new Error(`Failed to parse JSON: ${raw}`));
        }
      });
    });

    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

(async () => {
  try {
    console.log("📥 Getting DB info");
    const db = await notionFetch(`/v1/databases/${dbId}`);
    console.log("✅ Database:", db.title?.[0]?.plain_text || "Untitled");

    console.log("📄 Querying DB pages");
    const pages = await notionFetch(`/v1/databases/${dbId}/query`, "POST", {});
    console.log("✅ Found", pages.results?.length, "pages");
    pages.results?.forEach((p) =>
      console.log("-", p.properties?.Name?.title?.[0]?.plain_text)
    );
  } catch (err) {
    console.error("❌", err.message);
  }
})();
