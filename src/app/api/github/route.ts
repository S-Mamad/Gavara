import { NextResponse } from "next/server";

const MOCK = {
  source: "mock" as const,
  profile: {
    login: "raxinshop",
    publicRepos: 24,
    followers: 118,
  },
  events: [
    {
      type: "PushEvent",
      repo: "raxinshop/landing",
      createdAt: "2h ago",
    },
    {
      type: "PullRequestEvent",
      repo: "raxinshop/hajiasal",
      createdAt: "1d ago",
    },
    {
      type: "CreateEvent",
      repo: "raxinshop/infra-notes",
      createdAt: "3d ago",
    },
    {
      type: "PushEvent",
      repo: "raxinshop/marham-ui",
      createdAt: "5d ago",
    },
  ],
};

export async function GET() {
  const token = process.env.GITHUB_TOKEN;
  const user = process.env.GITHUB_USERNAME ?? "raxinshop";

  if (!token) {
    return NextResponse.json(MOCK, {
      headers: { "Cache-Control": "s-maxage=300, stale-while-revalidate=600" },
    });
  }

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
    return NextResponse.json(MOCK);
  }
}
