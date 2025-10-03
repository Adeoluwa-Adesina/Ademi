import os
import hashlib
import json
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

# --- Load environment variables ---
load_dotenv()

# --- Configuration ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
STORAGE_BUCKET = "topic-assets"
CONTENT_DIR = "content/"
CHECKSUM_FILE = ".upload_checksums.json"

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- Helpers ---
def compute_md5(file_path):
    """Compute MD5 checksum of a file."""
    hash_md5 = hashlib.md5()
    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(4096), b""):
            hash_md5.update(chunk)
    return hash_md5.hexdigest()

def load_checksums():
    """Load previously uploaded file checksums from disk."""
    if os.path.exists(CHECKSUM_FILE):
        with open(CHECKSUM_FILE, "r") as f:
            return json.load(f)
    return {}

def save_checksums(checksums):
    """Persist current checksums to disk."""
    with open(CHECKSUM_FILE, "w") as f:
        json.dump(checksums, f, indent=2)

def upload_asset(local_path, remote_path, checksums):
    """Upload file to Supabase Storage, skipping if unchanged."""
    checksum = compute_md5(local_path)

    # Skip if file already uploaded with same checksum
    if checksums.get(local_path) == checksum:
        print(f"⏩ Skipping (unchanged): {os.path.basename(local_path)}")
        return f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{remote_path}"

    # Try uploading (overwrites if exists)
    try:
        with open(local_path, "rb") as f:
            res = supabase.storage.from_(STORAGE_BUCKET).upload(remote_path, f)
        if res is None or "error" in str(res).lower():
            print(f"❌ Upload failed: {local_path}")
        else:
            print(f"✅ Uploaded: {os.path.basename(local_path)}")
            checksums[local_path] = checksum
    except Exception as e:
        print(f"❌ Failed to upload {local_path}: {e}")

    return f"{SUPABASE_URL}/storage/v1/object/public/{STORAGE_BUCKET}/{remote_path}"

def build_markdown(topic_name, asset_urls):
    """Generate markdown dynamically based on uploaded asset URLs."""
    md = f"# {topic_name}\n\n"
    for url in asset_urls:
        ext = os.path.splitext(url)[1].lower()
        if ext in [".png", ".jpg", ".jpeg", ".gif"]:
            md += f"![{os.path.basename(url)}]({url})\n\n"
        elif ext in [".mp4", ".webm"]:
            md += f"<video controls src=\"{url}\" width=\"600\"></video>\n\n"
        else:
            md += f"[Download file]({url})\n\n"
    return md

def process_topic_folder(topic_dir, checksums):
    """Sync one topic folder to Supabase."""
    topic_name = os.path.basename(topic_dir)
    print(f"\n🔄 Syncing topic: {topic_name}")

    assets_dir = os.path.join(topic_dir, "assets")
    if not os.path.exists(assets_dir):
        print(f"⚠️ No assets folder for {topic_name}")
        return

    asset_urls = []
    for file in os.listdir(assets_dir):
        local_path = os.path.join(assets_dir, file)
        remote_path = f"{topic_name}/{file}"
        public_url = upload_asset(local_path, remote_path, checksums)
        asset_urls.append(public_url)

    markdown = build_markdown(topic_name.replace("-", " ").title(), asset_urls)

    topic_data = {
        "slug": topic_name,
        "markdown_content": markdown,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }

    try:
        supabase.table("topics").upsert(topic_data).execute()
        print(f"✅ Synced topic: {topic_name}")
    except Exception as e:
        print(f"❌ Failed to upsert topic {topic_name}: {e}")

def main():
    print("🚀 Starting sync...")
    checksums = load_checksums()

    for topic_dir in os.listdir(CONTENT_DIR):
        full_path = os.path.join(CONTENT_DIR, topic_dir)
        if os.path.isdir(full_path):
            process_topic_folder(full_path, checksums)

    save_checksums(checksums)
    print("\n✅ Sync complete!")

if __name__ == "__main__":
    main()
