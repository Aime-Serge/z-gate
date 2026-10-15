import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";
import { parseEnv } from "@/lib/env";

const valid = {
  DATABASE_URL: "postgres://u:p@localhost:5432/db",
  PAYLOAD_SECRET: "x".repeat(32),
  SITE_URL: "https://www.example.rw/",
};

describe("parseEnv", () => {
  afterEach(() => {
    delete process.env["NEXT_PHASE"];
  });

  it("parses a valid runtime environment and normalises SITE_URL", () => {
    const env = parseEnv(valid);
    expect(env.SITE_URL).toBe("https://www.example.rw");
    expect(env.MEDIA_DIR).toBe("./media");
  });

  it("fails fast at runtime when secrets are missing, naming only the variables", () => {
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: "short" })).toThrow(/PAYLOAD_SECRET/);
    expect(() => parseEnv({ ...valid, PAYLOAD_SECRET: "short" })).not.toThrow(/short/);
    expect(() => parseEnv({ SITE_URL: valid.SITE_URL })).toThrow(/DATABASE_URL/);
  });

  it("treats empty optional values copied from .env.example as unset", () => {
    const env = parseEnv({
      ...valid,
      SMTP_HOST: "",
      SMTP_USER: "",
      SMTP_PASS: "",
      TRUSTED_PROXIES: "1",
    });
    expect(env.SMTP_HOST).toBeUndefined();
    expect(env.TRUSTED_PROXIES).toBe(1);
  });

  it("requires a separate admin host in production", () => {
    const prod = { ...valid, NODE_ENV: "production" };
    expect(() => parseEnv(prod)).toThrow(/ADMIN_URL is required/);
    expect(() => parseEnv({ ...prod, ADMIN_URL: "https://www.example.rw" })).toThrow(
      /different host/,
    );
    expect(() => parseEnv({ ...prod, ADMIN_URL: "https://cms.example.rw" })).not.toThrow();
  });

  it("accepts the documented .env.example as-is", () => {
    const text = readFileSync(
      fileURLToPath(new URL("../../../.env.example", import.meta.url)),
      "utf8",
    );
    const fromFile = Object.fromEntries(
      text
        .split(/\r?\n/)
        .filter((line) => /^[A-Z_]+=/.test(line))
        .map((line) => [line.slice(0, line.indexOf("=")), line.slice(line.indexOf("=") + 1)]),
    );
    expect(() => parseEnv(fromFile)).not.toThrow();
  });

  it("tolerates a missing environment only during `next build`", () => {
    process.env["NEXT_PHASE"] = "phase-production-build";
    expect(() => parseEnv({})).not.toThrow();
    // CI blanks the values on purpose; blanks must not defeat the placeholders.
    expect(() =>
      parseEnv({
        NODE_ENV: "production",
        DATABASE_URL: "",
        SITE_URL: "",
        ADMIN_URL: "",
        PAYLOAD_SECRET: "",
      }),
    ).not.toThrow();
  });
});
