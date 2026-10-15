/**
 * Product boundaries (docs/architecture/ADR/ADR-007-separate-product-backends.md):
 *
 *   website/   <-X->  elearning/      the two products never import each other
 *   website/, elearning/  -->  shared/  the only place they meet
 *   shared/    -X->  any product       shared code stays product-agnostic
 *   anything   -X->  legacy/           the frozen v1 portal is never a dependency
 *
 * Inside the website, the public site and the CMS are separate apps:
 *   website/frontend  -->  website/backend/src/contracts/ only (HTTP otherwise)
 *   website/backend   -X-> website/frontend
 *   frontend, contracts  -X->  Payload at runtime
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
    // Inside the website: the public site and the CMS are separate apps
    // that talk over HTTP. The frontend may use only the CMS's contracts
    // (types, schemas, webhook signing), and those stay free of Payload so
    // no CMS code ever runs in the public app.
    {
      name: "website-frontend-uses-only-backend-contracts",
      comment:
        "website/frontend talks to the CMS over HTTP. Import @zgate/website-backend/contracts, nothing else from website/backend.",
      severity: "error",
      from: { path: "^website/frontend/" },
      to: { path: "^website/backend/", pathNot: "^website/backend/src/contracts/" },
    },
    {
      name: "website-backend-must-not-import-frontend",
      comment: "The CMS never depends on the public site.",
      severity: "error",
      from: { path: "^website/backend/" },
      to: { path: "^website/frontend/" },
    },
    {
      name: "website-contracts-stay-self-contained",
      comment:
        "Contracts may use only each other and the generated content types, so importing them never pulls CMS code into the frontend.",
      severity: "error",
      from: { path: "^website/backend/src/contracts/" },
      to: {
        path: "^website/backend/",
        pathNot: "^website/backend/src/(contracts/|payload-types\\.ts$)",
      },
    },
    {
      name: "no-payload-runtime-in-website-frontend-or-contracts",
      comment:
        "Only the CMS runs Payload. The frontend may use @payloadcms/richtext-lexical (its React renderer imports only react) and nothing else from Payload.",
      severity: "error",
      from: { path: "^website/(frontend/|backend/src/contracts/)" },
      to: {
        dependencyTypesNot: ["type-only"],
        // Installed (resolved into node_modules) or not (a bare name).
        path: "(^|/node_modules/)(payload|@payloadcms/[^/]+)(/|$)",
        pathNot: "@payloadcms/richtext-lexical(/|$)",
      },
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
    // node_modules is only not followed (doNotFollow above), not excluded,
    // so the rules can see which packages product code imports. `dist` is
    // excluded only for our own packages: most npm packages resolve into a
    // dist/ folder, and excluding those would hide the import itself.
    exclude: {
      path: "(^|/)(\\.next|coverage|test-results|playwright-report|media)/|^(website|elearning|shared|legacy)/[^/]+/dist/",
    },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
      extensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
    },
  },
};
