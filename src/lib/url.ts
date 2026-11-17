export type SearchParams = Record<string, string | string[] | undefined>;

/**
 * Builds a same-page href that keeps the other query parameters while updating one
 * or more of them (pass null to remove). Used by the server-rendered tab links.
 */
export function pageHref(
  current: SearchParams,
  updates: Record<string, string | null>,
  hash?: string,
  path = "/",
): string {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(current)) {
    const first = Array.isArray(value) ? value[0] : value;
    if (first) {
      params.set(key, first);
    }
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }

  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
