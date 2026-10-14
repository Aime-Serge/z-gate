import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
  PayloadRequest,
} from "payload";

/**
 * Public pages are rendered on first request and then cached until content
 * changes. The whole site is small, so any published change invalidates
 * every cached page rather than tracking which pages show which document.
 *
 * Scripts (seed, migrations) run outside a Next.js request, where
 * revalidatePath throws - they set `context.disableRevalidate`.
 */
function revalidateSite(req: PayloadRequest, context: Record<string, unknown>): void {
  if (context["disableRevalidate"]) return;
  try {
    revalidatePath("/", "layout");
  } catch (error) {
    // Expected for scripts and tests; anywhere else it means visitors may
    // see stale pages until the hourly safety-net revalidation.
    const reason = error instanceof Error ? error.message : String(error);
    req.payload.logger.warn(`Site revalidation skipped: ${reason}`);
  }
}

export const revalidateAfterChange: CollectionAfterChangeHook = ({
  doc,
  previousDoc,
  req,
  context,
}) => {
  // Draft saves don't change what visitors see - only publishes and
  // unpublishes do (previousDoc covers "was live, now isn't").
  const status = (doc as { _status?: string })._status;
  const previousStatus = (previousDoc as { _status?: string } | undefined)?._status;
  if (status === undefined || status === "published" || previousStatus === "published") {
    revalidateSite(req, context);
  }
  return doc;
};

export const revalidateAfterDelete: CollectionAfterDeleteHook = ({ doc, req, context }) => {
  revalidateSite(req, context);
  return doc;
};

export const revalidateGlobalAfterChange: GlobalAfterChangeHook = ({ doc, req, context }) => {
  revalidateSite(req, context);
  return doc;
};
