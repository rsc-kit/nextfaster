// @generated — do not edit. Written by the RSC build from the route tree.
//
// Turns Link, navigate() and route() into typed apis: an href that no route
// answers stops compiling. Delete this file and they fall back to `string`,
// which is what a project that has not built yet gets.

// `export {}` is load-bearing: in a file with no import or export,
// `declare module` *replaces* the real module rather than augmenting it,
// and Route and route() vanish from it with no error to explain why.
export {}

declare module '@rsc-kit/core/routes' {
  interface Register {
    routes:
      | "/"
      | "/[collection]"
      | "/order"
      | "/order-history"
      | "/products/[category]"
      | "/products/[category]/[subcategory]"
      | "/products/[category]/[subcategory]/[product]"
    search: {
      "/": SearchExportOf<typeof import("../src/app/(shop)/page")>
      "/[collection]": SearchExportOf<typeof import("../src/app/(shop)/[collection]/page")>
      "/order": SearchExportOf<typeof import("../src/app/order/page")>
      "/order-history": SearchExportOf<typeof import("../src/app/order-history/page")>
      "/products/[category]": SearchExportOf<typeof import("../src/app/(shop)/products/[category]/page")>
      "/products/[category]/[subcategory]": SearchExportOf<typeof import("../src/app/(shop)/products/[category]/[subcategory]/page")>
      "/products/[category]/[subcategory]/[product]": SearchExportOf<typeof import("../src/app/(shop)/products/[category]/[subcategory]/[product]/page")>
    }
  }
  interface RegisterRegions {
    // No sections or slots found under the source directory.
    regions: never
  }
  interface RegisterApi {
    apis:
      | "/api/search"
  }
}
