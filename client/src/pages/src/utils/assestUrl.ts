const ASSETS =
  import.meta.env.VITE_ASSETS_URL ||
  (import.meta.env.VITE_API_URL
    ? String(import.meta.env.VITE_API_URL).replace(/\/api\/?$/, "")
    : "");

export function assetUrl(p?: string | null) {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;

  if (!ASSETS) return p;

  const base = ASSETS.replace(/\/+$/, "");
  const path = p.startsWith("/") ? p : `/${p}`;
  return `${base}${path}`;
}
