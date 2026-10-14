import { describe, expect, it } from "vitest";
import { contentSecurityPolicy, decideRoute } from "./hosts";

const split = { siteOrigin: "https://www.example.rw", adminOrigin: "https://cms.example.rw" };
const req = (host: string, pathname: string) => ({ host, pathname });

describe("decideRoute with a separate admin host", () => {
  it("never serves the CMS on the public host", () => {
    for (const path of [
      "/admin",
      "/admin/collections/leads",
      "/api/leads",
      "/api/users/login",
      "/api",
    ]) {
      expect(decideRoute(req("www.example.rw", path), split)).toEqual({
        surface: "public",
        outcome: "not-found",
      });
    }
  });

  it("still serves pages, health checks and media files on the public host", () => {
    for (const path of [
      "/",
      "/academy/courses/x",
      "/api/health",
      "/api/ready",
      "/api/media/file/a.webp",
    ]) {
      expect(decideRoute(req("www.example.rw", path), split).outcome).toBe("next");
    }
  });

  it("treats an unknown Host header as public, never as admin", () => {
    expect(decideRoute(req("evil.example", "/admin"), split).outcome).toBe("not-found");
    expect(decideRoute(req("10.0.0.5:3002", "/api/health"), split).outcome).toBe("next");
  });

  it("serves the CMS and its API on the admin host", () => {
    expect(decideRoute(req("cms.example.rw", "/admin"), split)).toEqual({
      surface: "admin",
      outcome: "next",
    });
    expect(decideRoute(req("CMS.example.rw", "/api/leads"), split).outcome).toBe("next");
  });

  it("doesn't serve public pages on the admin host, but does serve robots.txt", () => {
    expect(decideRoute(req("cms.example.rw", "/about"), split)).toEqual({
      surface: "admin",
      outcome: "not-found",
    });
    expect(decideRoute(req("cms.example.rw", "/robots.txt"), split).outcome).toBe("next");
  });
});

describe("decideRoute in single-host mode (local development)", () => {
  const single = { siteOrigin: "http://localhost:3002", adminOrigin: null };
  it("serves everything, labelling the admin surface", () => {
    expect(decideRoute(req("localhost:3002", "/admin"), single)).toEqual({
      surface: "admin",
      outcome: "next",
    });
    expect(decideRoute(req("localhost:3002", "/contact"), single)).toEqual({
      surface: "public",
      outcome: "next",
    });
  });
});

describe("contentSecurityPolicy", () => {
  const prod = { dev: false, https: true };

  it("locks the public site to its own origin", () => {
    const csp = contentSecurityPolicy("public", prod);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("upgrade-insecure-requests");
    expect(csp).not.toContain("unsafe-eval");
    expect(csp).not.toMatch(/https?:\/\//);
  });

  it("allows no third-party hosts in the admin either", () => {
    expect(contentSecurityPolicy("admin", prod)).not.toMatch(/https?:\/\//);
  });

  it("only relaxes for local hot reloading", () => {
    expect(contentSecurityPolicy("public", { dev: true, https: false })).toContain("'unsafe-eval'");
    expect(contentSecurityPolicy("public", { dev: false, https: false })).not.toContain(
      "upgrade-insecure-requests",
    );
  });
});
