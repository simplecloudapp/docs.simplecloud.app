import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("docs/", "routes/docs/index.tsx"),
  route("docs/*", "routes/docs/page.tsx"),
  route("api/search", "routes/docs/search.ts"),
] satisfies RouteConfig;
