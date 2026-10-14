/**
 * Public site / CMS admin separation and per-surface security headers.
 * Used by src/proxy.ts; kept free of framework and database imports so it
 * runs on every request cheaply and is unit-testable.
 *
 * Why two hostnames: the CMS login cookie must never be readable by the
 * public pages' origin. Public pages are cached HTML, so they can't carry
 * per-request CSP nonces and need 'unsafe-inline' for Next.js hydration;
 * if admin and site shared an origin, any injection bug on a public page
 * could act with a signed-in editor's cookie. With the admin on its own
 * host (ADMIN_URL), the public origin has no authenticated surface at all
 * (docs/platform-v2/04-WEBSITE.md §9).
 */

export type Surface = "public" | "admin";

export type RouteDecision =
  { surface: Surface; outcome: "next" } | { surface: Surface; outcome: "not-found" };

export interface HostConfig {
  siteOrigin: string;
  /** null = single-host mode (local development only). */
  adminOrigin: string | null;
}

const isAdminPath = (path: string) => path === "/admin" || path.startsWith("/admin/");
const isApiPath = (path: string) => path === "/api" || path.startsWith("/api/");

/** Paths under /api the public host still serves. */
const isPublicApi = (path: string) =>
  path === "/api/health" || path === "/api/ready" || path.startsWith("/api/media/file/");

const hostOf = (origin: string) => new URL(origin).host.toLowerCase();

export function decideRoute(
  request: { host: string | null; pathname: string },
  config: HostConfig,
): RouteDecision {
  const { pathname } = request;

  if (!config.adminOrigin) {
    const admin = isAdminPath(pathname) || (isApiPath(pathname) && !isPublicApi(pathname));
    return { surface: admin ? "admin" : "public", outcome: "next" };
  }

  const host = (request.host ?? "").toLowerCase();
  if (host === hostOf(config.adminOrigin)) {
    if (
      isAdminPath(pathname) ||
      isApiPath(pathname) ||
      pathname.startsWith("/_next/") ||
      // Served here too, telling crawlers to stay out of the CMS host.
      pathname === "/robots.txt"
    ) {
      return { surface: "admin", outcome: "next" };
    }
    // Public pages live on the public host only. A plain 404 rather than a
    // cross-host redirect: Next.js rewrites proxy redirects it judges
    // same-origin into relative ones (next/dist/server/web/adapter.js),
    // which turned the redirect into a loop. Staff only use /admin here.
    return { surface: "admin", outcome: "not-found" };
  }

  // The public host - and any unexpected Host header - never exposes the
  // CMS: no admin UI and no Payload REST API beyond health and media files.
  if (isAdminPath(pathname) || (isApiPath(pathname) && !isPublicApi(pathname))) {
    return { surface: "public", outcome: "not-found" };
  }
  return { surface: "public", outcome: "next" };
}

const directives = (entries: Record<string, string[]>) =>
  Object.entries(entries)
    .map(([name, values]) => (values.length ? `${name} ${values.join(" ")}` : name))
    .join("; ");

/**
 * Content-Security-Policy per surface. 'unsafe-inline' scripts are needed
 * by Next.js hydration on cached pages (no nonces possible) and by the
 * Payload admin; the host split above is what makes that acceptable.
 * Everything else is locked to this origin: no third-party scripts,
 * frames, plugins or form targets. `dev` adds what next dev's hot
 * reloading needs.
 */
export function contentSecurityPolicy(
  surface: Surface,
  { dev, https }: { dev: boolean; https: boolean },
) {
  const script = ["'self'", "'unsafe-inline'", ...(dev ? ["'unsafe-eval'"] : [])];
  const common = {
    "default-src": ["'self'"],
    "script-src": script,
    "style-src": ["'self'", "'unsafe-inline'"],
    "connect-src": ["'self'", ...(dev ? ["ws:"] : [])],
    "frame-ancestors": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };
  const policy =
    surface === "admin"
      ? {
          ...common,
          "img-src": ["'self'", "data:", "blob:"],
          "font-src": ["'self'", "data:"],
          "worker-src": ["'self'", "blob:"],
        }
      : { ...common, "img-src": ["'self'", "data:"], "font-src": ["'self'"] };
  return directives(https ? { ...policy, "upgrade-insecure-requests": [] } : policy);
}

export function securityHeaders(surface: Surface, options: { dev: boolean; https: boolean }) {
  const headers: Record<string, string> = {
    "Content-Security-Policy": contentSecurityPolicy(surface, options),
  };
  if (surface === "admin") {
    // The CMS is never something search engines should index.
    headers["X-Robots-Tag"] = "noindex, nofollow";
  }
  return headers;
}
