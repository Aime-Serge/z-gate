/**
 * Read-side data access for public pages.
 *
 * Every query runs as an anonymous visitor (`overrideAccess: false`, no
 * user) and asks for the published version (`draft: false`), so the
 * collections' own read rules - published documents only - decide what
 * the public site can show. A draft can't leak through a missed filter.
 */
import config from "@payload-config";
import { getPayload } from "payload";
import { isDivisionSlug } from "@/collections/Divisions";
import type { Article, Course, Division, Page, Redirect, SiteSetting } from "@/payload-types";

const publicRead = { overrideAccess: false, draft: false } as const;

export async function getSiteSettings(): Promise<SiteSetting> {
  const payload = await getPayload({ config });
  return payload.findGlobal({ slug: "site-settings", ...publicRead });
}

export async function getPageBySlug(slug: string): Promise<Page | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
    ...publicRead,
  });
  return result.docs[0] ?? null;
}

export async function getDivisionBySlug(slug: string): Promise<Division | null> {
  // Unknown values would hit the enum column and fail (22P02) instead of
  // simply not matching - the website's version of finding N-7.
  if (!isDivisionSlug(slug)) return null;
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "divisions",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publicRead,
  });
  return result.docs[0] ?? null;
}

export async function listDivisions(): Promise<Division[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "divisions",
    sort: "order",
    limit: 10,
    ...publicRead,
  });
  return result.docs;
}

export async function listCourses(): Promise<Course[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "courses",
    sort: "title",
    limit: 50,
    ...publicRead,
  });
  return result.docs;
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "courses",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publicRead,
  });
  return result.docs[0] ?? null;
}

export async function listArticles(limit = 50): Promise<Article[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    sort: "-publishedOn",
    limit,
    ...publicRead,
  });
  return result.docs;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "articles",
    where: { slug: { equals: slug } },
    limit: 1,
    ...publicRead,
  });
  return result.docs[0] ?? null;
}

/** CMS-managed redirect for a path, if any (checked before returning 404). */
export async function findRedirect(path: string): Promise<Redirect | null> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "redirects",
    where: { from: { equals: path } },
    limit: 1,
    ...publicRead,
  });
  return result.docs[0] ?? null;
}

/** Forms only collect personal data once a privacy notice is live. */
export async function isPrivacyNoticeLive(): Promise<boolean> {
  return (await getPageBySlug("privacy")) !== null;
}

export async function listPages(): Promise<Page[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "pages",
    limit: 200,
    depth: 0,
    ...publicRead,
  });
  return result.docs;
}
