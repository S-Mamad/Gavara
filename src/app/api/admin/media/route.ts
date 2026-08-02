import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET() {
  const dir = path.join(process.cwd(), "public", "uploads");
  try {
    const files = await fs.readdir(dir);
    const items = [];
    for (const name of files) {
      if (name.startsWith(".")) continue;
      const st = await fs.stat(path.join(dir, name));
      if (!st.isFile()) continue;
      items.push({
        name,
        url: `/uploads/${name}`,
        size: st.size,
        mtime: st.mtime.toISOString(),
      });
    }
    items.sort((a, b) => b.mtime.localeCompare(a.mtime));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ items: [] });
  }
}
