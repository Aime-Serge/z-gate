/**
 * Product boundaries (docs/architecture/ADR/ADR-007-separate-product-backends.md):
 *
 *   website/   <-X->  elearning/      the two products never import each other
 *   website/, elearning/  -->  shared/  the only place they meet
 *   shared/    -X->  any product       shared code stays product-agnostic
 *   anything   -X->  legacy/           the frozen v1 portal is never a dependency
 *
 * Run: pnpm lint:boundaries (CI runs it in every product workflow).
 * Imports are followed to their real path, so a workspace-package import
 * (e.g. `@zgate/website`) is caught the same as a relative `../../website`.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "website-must-not-import-elearning",
      comment:
        "The website and the e-learning platform are separate products. Share code through shared/ instead.",
      severity: "error",
      from: { path: "^website/" },
      to: { path: "^elearning/" },
    },
    {
      name: "elearning-must-not-import-website",
      comment:
        "The e-learning platform and the website are separate products. Share code through shared/ instead.",
      severity: "error",
      from: { path: "^elearning/" },
      to: { path: "^website/" },
    },
    {
      name: "shared-must-not-import-products",
      comment:
        "shared/ is used by both products, so it can't depend on either of them (or on legacy/).",
      severity: "error",
      from: { path: "^shared/" },
      to: { path: "^(website|elearning|legacy)/" },
    },
    {
      name: "nothing-imports-legacy",
      comment: "legacy/ops is frozen. Nothing may depend on it.",
      severity: "error",
      from: { pathNot: "^legacy/" },
      to: { path: "^legacy/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: {
      path: "(^|/)(node_modules|\\.next|dist|coverage|test-results|playwright-report|media)/",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
