import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("api/search", "routes/docs/search.ts"),
  route("/*", "routes/docs/page.tsx"),
] satisfies RouteConfig;
