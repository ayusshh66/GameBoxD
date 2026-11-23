export class SocialApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "SocialApiError";
  }
}
export async function socialRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    body?: unknown;
    signal?: AbortSignal;
  } = {},
): Promise<T> {
  const r = await fetch(path, {
    method: options.method ?? "GET",
    credentials: "include",
    cache: "no-store",
    signal: options.signal,
    headers:
      options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
  const json = await r.json().catch(() => null);
  if (!r.ok || !json?.success)
    throw new SocialApiError(
      json?.message ?? `Request failed (${r.status})`,
      r.status,
    );
  return json.data as T;
}
export const isUnauthenticated = (error: unknown) =>
  error instanceof SocialApiError &&
  (error.status === 401 || error.status === 403);
