export type XUserPost = {
  id: string;
  text: string;
  createdAt: string;
};

type XApiResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

type XApiFetch = (
  url: string,
  init: { headers: Record<string, string> },
) => Promise<XApiResponse>;

type XApiUserPayload = {
  data?: {
    id?: string;
    username?: string;
  };
  errors?: Array<{ title?: string; detail?: string }>;
};

type XApiTimelinePayload = {
  data?: Array<{
    id?: string;
    text?: string;
    created_at?: string;
  }>;
  errors?: Array<{ title?: string; detail?: string }>;
};

const X_API_BASE = "https://api.x.com/2";

function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "");
}

export function getXBearerToken(): string {
  return (
    process.env.X_BEARER_TOKEN ??
    process.env.TWITTER_BEARER_TOKEN ??
    ""
  ).trim();
}

export function isXApiReady(): boolean {
  return getXBearerToken().length > 0;
}

export function buildXPostUrl(handle: string, postId: string): string {
  return `https://x.com/${normalizeHandle(handle)}/status/${postId}`;
}

export function summarizeXPostText(text: string, maxLength = 96): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function clampMaxResults(value: number): number {
  return Math.min(100, Math.max(5, Math.floor(value)));
}

function xApiError(endpoint: string, status: number, payload: unknown): Error {
  const message =
    typeof payload === "object" && payload !== null && "errors" in payload
      ? JSON.stringify((payload as { errors?: unknown }).errors).slice(0, 240)
      : JSON.stringify(payload).slice(0, 240);
  return new Error(`X API ${endpoint} failed with ${status}: ${message}`);
}

async function readJson(response: XApiResponse): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function fetchXUserPosts(
  handle: string,
  {
    fetchFn = fetch as unknown as XApiFetch,
    maxResults = 20,
  }: {
    fetchFn?: XApiFetch;
    maxResults?: number;
  } = {},
): Promise<XUserPost[]> {
  const token = getXBearerToken();
  if (!token) throw new Error("X_BEARER_TOKEN is required to fetch X posts");

  const normalizedHandle = normalizeHandle(handle);
  const headers = { authorization: `Bearer ${token}` };
  const userUrl = new URL(
    `${X_API_BASE}/users/by/username/${encodeURIComponent(normalizedHandle)}`,
  );
  userUrl.searchParams.set("user.fields", "username");

  const userResponse = await fetchFn(userUrl.toString(), { headers });
  const userPayload = (await readJson(userResponse)) as XApiUserPayload;
  if (!userResponse.ok) {
    throw xApiError("user lookup", userResponse.status, userPayload);
  }

  const userId = userPayload.data?.id;
  if (!userId) return [];

  const timelineUrl = new URL(`${X_API_BASE}/users/${userId}/tweets`);
  timelineUrl.searchParams.set("max_results", String(clampMaxResults(maxResults)));
  timelineUrl.searchParams.set(
    "tweet.fields",
    "created_at,entities,lang,public_metrics",
  );
  timelineUrl.searchParams.set("exclude", "retweets,replies");

  const timelineResponse = await fetchFn(timelineUrl.toString(), { headers });
  const timelinePayload = (await readJson(timelineResponse)) as XApiTimelinePayload;
  if (!timelineResponse.ok) {
    throw xApiError("user timeline", timelineResponse.status, timelinePayload);
  }

  return (timelinePayload.data ?? [])
    .filter((post) => post.id && post.text)
    .map((post) => ({
      id: post.id as string,
      text: post.text as string,
      createdAt: post.created_at ?? "",
    }));
}
