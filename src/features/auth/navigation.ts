export function safeRedirectPath(candidate: unknown, fallback = "/dashboard") {
  if (typeof candidate !== "string" || !candidate.startsWith("/")) {
    return fallback;
  }

  if (candidate.startsWith("//") || candidate.includes("\\")) {
    return fallback;
  }

  try {
    const url = new URL(candidate, "https://undangan-digital.local");

    if (url.origin !== "https://undangan-digital.local") {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}

export function pathWithMessage(
  path: string,
  kind: "error" | "success",
  message: string,
) {
  const url = new URL(path, "https://undangan-digital.local");
  url.searchParams.set(kind, message);

  return `${url.pathname}${url.search}`;
}
