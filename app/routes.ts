import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/index.tsx"),
  route("api/search", "routes/docs/search.ts"),

  // Old route mappings
  route("quickstart", "routes/mapping/quickstart.tsx"),
  route("structure", "routes/mapping/structure.tsx"),
  route("controller", "routes/mapping/controller.tsx"),
  route("droplet", "routes/mapping/droplet.tsx"),
  route("cli", "routes/mapping/cli.tsx"),
  route("dashboard", "routes/mapping/dashboard.tsx"),
  route("troubleshooting", "routes/mapping/troubleshooting.tsx"),
  route("testimonials", "routes/mapping/testimonials.tsx"),

  // API routes
  route("api", "routes/mapping/api.tsx"),
  route("api/player", "routes/mapping/api.player.tsx"),

  // Droplet routes
  route("droplet/overview", "routes/mapping/droplet.overview.tsx"),
  route("droplet/serverhost", "routes/mapping/droplet.serverhost.tsx"),
  route("droplet/player", "routes/mapping/droplet.player.tsx"),

  // Plugin routes
  route("plugins", "routes/mapping/plugins.tsx"),
  route(
    "plugins/server-registration",
    "routes/mapping/plugins.server-registration.tsx"
  ),
  route("plugins/cloud-command", "routes/mapping/plugins.cloud-command.tsx"),
  route(
    "plugins/proxy-essentials",
    "routes/mapping/plugins.proxy-essentials.tsx"
  ),
  route("plugins/notify", "routes/mapping/plugins.notify.tsx"),
  route("plugins/prefixes", "routes/mapping/plugins.prefixes.tsx"),
  route("plugins/signs", "routes/mapping/plugins.signs.tsx"),
  route("plugins/npcs", "routes/mapping/plugins.npcs.tsx"),
  route("plugins/placeholders", "routes/mapping/plugins.placeholders.tsx"),
  route(
    "plugins/server-connection",
    "routes/mapping/plugins.server-connection.tsx"
  ),

  // Resources routes
  route("resources/servers", "routes/mapping/resources.servers.tsx"),
  route("resources/groups", "routes/mapping/resources.groups.tsx"),
  route("resources/permissions", "routes/mapping/resources.permissions.tsx"),
  route("resources/templates", "routes/mapping/resources.templates.tsx"),

  // Catch-all route for documentation
  route("/*", "routes/docs/page.tsx"),
] satisfies RouteConfig;
