
export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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
    credentials: "include",
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success) {
    throw new ApiError(
      result?.message ??
        `Request failed with status ${response.status}`,
      response.status
    );
  }

  return result as ApiResponse<T>;
}

export function isAuthenticationError(
  error: unknown
): boolean {
  if (!(error instanceof ApiError)) {
    return false;
  }

  return (
    error.status === 401 ||
    (
      error.status === 400 &&
      /authentication required|token|not logged in/i.test(
        error.message
      )
    )
  );
}
