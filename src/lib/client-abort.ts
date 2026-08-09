type ErrorLike = {
  cause?: unknown;
  code?: unknown;
  message?: unknown;
  name?: unknown;
  status?: unknown;
};

// Reloading or navigating away can close the HTTP socket while SSR is still
// rendering. Node reports that normal disconnect as an error, sometimes
// wrapped by the request framework in a status-500 error.
export function isClientAbort(error: unknown): boolean {
  const seen = new Set<unknown>();
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.has(current)) {
    seen.add(current);
    const candidate = current as ErrorLike;
    const message = typeof candidate.message === "string" ? candidate.message.toLowerCase() : "";

    if (
      candidate.code === "ECONNRESET" ||
      candidate.code === "ECONNABORTED" ||
      candidate.name === "AbortError" ||
      message === "aborted" ||
      message === "the operation was aborted"
    ) {
      return true;
    }

    current = candidate.cause;
  }

  return false;
}