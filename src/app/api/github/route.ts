import { NextResponse } from "next/server";

function unavailable() {
  return NextResponse.json(
    {
      source: "unavailable" as const,
      profile: null,
      events: [],
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const user = process.env.GITHUB_USERNAME ?? "raxinshop";

  if (!token) return unavailable();

  try {
    const headers = {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "raxinshop-landing",
    };

    const [profileRes, eventsRes] = await Promise.all([
      fetch(`https://api.github.com/users/${user}`, {
        headers,
        next: { revalidate: 300 },
      }),
      fetch(`https://api.github.com/users/${user}/events/public?per_page=5`, {
        headers,
        next: { revalidate: 300 },
      }),
    ]);

    if (!profileRes.ok) throw new Error("profile");

    const profile = (await profileRes.json()) as {
      login: string;
      public_repos: number;
      followers: number;
    };

    const eventsRaw = eventsRes.ok
      ? ((await eventsRes.json()) as {
          type: string;
          repo: { name: string };
          created_at: string;
        }[])
      : [];

    return NextResponse.json({
      source: "live",
      profile: {
        login: profile.login,
        publicRepos: profile.public_repos,
        followers: profile.followers,
      },
      events: eventsRaw.slice(0, 5).map((e) => ({
        type: e.type,
        repo: e.repo.name,
        createdAt: new Date(e.created_at).toLocaleDateString("fa-IR"),
      })),
    });
  } catch {
    return unavailable();
  }
}
