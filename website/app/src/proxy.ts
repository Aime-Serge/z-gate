/**
 * Runs before every page and API route: keeps the CMS on its own host and
 * applies the security headers for the surface being served (see
 * src/lib/hosts.ts for the reasoning).
 *
 * Reads SITE_URL / ADMIN_URL straight from the environment instead of
 * src/lib/env.ts, so this stays independent of the CMS and database code
 * (Next.js runs proxy separately from render code).
 */
import { type NextRequest, NextResponse } from "next/server";
import { decideRoute, securityHeaders } from "@/lib/hosts";

const siteOrigin = (process.env["SITE_URL"] ?? "http://localhost:3002").replace(/\/$/, "");
const adminOrigin = process.env["ADMIN_URL"]?.replace(/\/$/, "") || null;
const options = {
  dev: process.env["NODE_ENV"] === "development",
  https: siteOrigin.startsWith("https://"),
};

export function proxy(request: NextRequest) {
  const decision = decideRoute(
    {
      host: request.headers.get("host"),
      pathname: request.nextUrl.pathname,
    },
    { siteOrigin, adminOrigin },
  );

  let response: NextResponse;
  if (decision.outcome === "not-found") {
    response = new NextResponse("Not found", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } else {
    response = NextResponse.next();
  }

  for (const [name, value] of Object.entries(securityHeaders(decision.surface, options))) {
    response.headers.set(name, value);
  }
  return response;
}

export const config = {
  // Static build assets don't need per-surface handling.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
