
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

type ApiOptions = {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: unknown;
};

export async function apiRequest<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",

    headers:
      options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,

    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,

    // Browser sends the HTTP-only JWT cookie
    credentials: "include",

    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ??
      `Request failed: ${response.status}`
    );
  }

  return result as ApiResponse<T>;
}
