import type { Config } from "@react-router/dev/config";
import { source } from "./app/source";

export default {
  ssr: true,
  async prerender({ getStaticPaths }) {
    console.log(...getStaticPaths(), [
      ...source.getPages().map((page) => page.url),
    ]);
    return [...source.getPages().map((page) => page.url)];
  },
} satisfies Config;
