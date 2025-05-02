import {
  loader,
  type MetaData,
  type PageData,
  type Source,
  type VirtualFile,
} from "fumadocs-core/source";
import matter from "gray-matter";
import * as path from "node:path";
import type { PageTree } from "fumadocs-core/server";
import React from "react";

const files = Object.entries(
  import.meta.glob<true, "raw">("/content/docs/**/*", {
    eager: true,
    query: "?raw",
    import: "default",
  })
);

const virtualFiles: VirtualFile[] = files.flatMap(([file, content]) => {
  const ext = path.extname(file);
  const virtualPath = path.relative(
    "content/docs",
    path.join(process.cwd(), file)
  );

  if (ext === ".mdx" || ext === ".md") {
    const parsed = matter(content);

    return {
      type: "page",
      path: virtualPath,
      data: {
        ...parsed.data,
        content: parsed.content,
      },
    };
  }

  if (ext === ".json") {
    return {
      type: "meta",
      path: virtualPath,
      data: JSON.parse(content),
    };
  }

  return [];
});

// Function to attach the soon property to the page tree
function attachFile(node: PageTree.Item, file?: { data: Record<string, any> }) {
  // Create a reference to where the page data might be stored
  // Get the filename from the node's $ref
  if (node.type === "page" && node.$ref && node.$ref.file) {
    // Find the corresponding virtual file
    const virtualFile = virtualFiles.find(
      (vf) => vf.path === node.$ref!.file && vf.type === "page"
    );

    // If we found the file and it has soon: true, attach it to the node
    if (virtualFile && (virtualFile.data as any).soon === true) {
      (node as any).soon = true;
    }

    if (virtualFile && (virtualFile.data as any).badge) {
      (node as any).badge = (virtualFile.data as any).badge;
    }

    if (virtualFile && (virtualFile.data as any).badgeColor) {
      (node as any).badgeColor = (virtualFile.data as any).badgeColor;
    }
  }

  return node;
}

export const source = loader({
  source: {
    files: virtualFiles,
  } as Source<{
    pageData: PageData & {
      content: string;
      soon?: boolean;
    };
    metaData: MetaData;
  }>,
  baseUrl: "/",
  pageTree: {
    attachFile,
  },
});
