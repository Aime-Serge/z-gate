import { headers } from "next/headers";
import { adminOrigin, env } from "@/lib/env";

// Built per request from the runtime SITE_URL, never at build time.
export const dynamic = "force-dynamic";

export async function GET() {
  const config = env();
  const host = (await headers()).get("host")?.toLowerCase();
  const onAdminHost = config.ADMIN_URL !== undefined && host === new URL(adminOrigin(config)).host;
  const body = onAdminHost
    ? "User-agent: *\nDisallow: /\n"
    : [
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "Disallow: /api/",
        "Allow: /api/media/file/",
        "",
        `Sitemap: ${config.SITE_URL}/sitemap.xml`,
        "",
      ].join("\n");
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
