
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
  path: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const response = await fetch(path, {
    method: options.method ?? "GET",

    headers:
      options.body !== undefined
        ? { "Content-Type": "application/json" }
        : undefined,

    body:
      options.body !== undefined
        ? JSON.stringify(options.body)
        : undefined,

    // Send browser cookies with requests.
    credentials: "include",

    cache: "no-store",
  });

  const result: ApiResponse<T> | null =
    await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message ??
        `Request failed with status ${response.status}`
    );
  }

  return result;
}
