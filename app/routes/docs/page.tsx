import type { Route } from "./+types/page";
import { DocsLayout } from "@/components/notebook/layouts/docs";
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from "@/components/notebook/layouts/page";
import { source } from "@/source";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { executeMdxSync } from "@fumadocs/mdx-remote/client";
import type { PageTree } from "fumadocs-core/server";
import { createCompiler } from "@fumadocs/mdx-remote";
import * as path from "node:path";
import { Accordion } from "fumadocs-ui/components/accordion";
import { Tab, Tabs } from "fumadocs-ui/components/tabs";
import { Card, Cards } from "fumadocs-ui/components/card";
import { Step, Steps } from "fumadocs-ui/components/steps";
import { File, Folder, Files } from "fumadocs-ui/components/files";
import { Callout } from "@/components/ui/callout";
import { Logo } from "@/components/ui/logo";
import { ImageZoom } from "@/components/ui/image-zoom";
import { CustomSidebarItem } from "@/components/notebook/layout/custom-sidebar-item";
import { Button } from "@/components/ui/button";
import { Link, redirect } from "react-router";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import { DependencySnippet } from "@/components/dependency-snippet";

export function meta({ data }: Route.MetaArgs) {
  const { title, description } = data?.page?.data;
  return [{ title: `${title} - SimpleCloud`, description }];
}
const compiler = createCompiler({
  development: false,
});

export async function loader({ params }: Route.LoaderArgs) {
  const slugs = params["*"].split("/").filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) {
    if (slugs.length === 1) {
      return redirect(`/docs/${slugs[0]}/overview`);
    }

    throw new Error("Not found");
  }

  const compiled = await compiler.compileFile({
    path: path.resolve("content/docs", page.file.path),
    value: page.data.content,
  });

  return {
    page,
    compiled: compiled.toString(),
    tree: source.pageTree,
  };
}

export default function Page(props: Route.ComponentProps) {
  const { page, compiled, tree } = props.loaderData;
  const { default: Mdx, toc } = executeMdxSync(compiled);

  return (
    <DocsLayout
      nav={{
        title: <Logo className="h-8" />,
        mode: "top",
        transparentMode: "top",
      }}
      sidebar={{
        collapsible: false,
        components: {
          Item: CustomSidebarItem,
        },
      }}
      tabMode="navbar"
      tree={tree as PageTree.Root}
    >
      {!page.data.soon ? (
        <DocsPage
          toc={toc}
          tableOfContent={{
            style: "clerk",
          }}
          breadcrumb={{
            enabled: true,
            includeSeparator: true,
          }}
        >
          <DocsTitle>{page.data.title}</DocsTitle>
          <DocsDescription>{page.data.description}</DocsDescription>
          <DocsBody>
            <Mdx
              components={{
                ...defaultMdxComponents,
                Accordion: ({ children, ...props }) => (
                  <Accordion {...props}>{children}</Accordion>
                ),
                Callout: ({ children, ...props }) => (
                  <Callout {...props}>{children}</Callout>
                ),
                Tabs: ({ children, ...props }) => (
                  <Tabs {...props}>{children}</Tabs>
                ),
                Tab: ({ children, ...props }) => (
                  <Tab {...props}>{children}</Tab>
                ),
                Card: ({ children, ...props }) => (
                  <Card {...props}>{children}</Card>
                ),
                Cards: ({ children, ...props }) => (
                  <Cards {...props}>{children}</Cards>
                ),
                Steps: ({ children, ...props }) => (
                  <Steps {...props}>{children}</Steps>
                ),
                Step: ({ children, ...props }) => (
                  <Step {...props}>{children}</Step>
                ),
                File: ({ children, ...props }) => (
                  <File {...props}>{children}</File>
                ),
                Folder: ({ children, ...props }) => (
                  <Folder {...props}>{children}</Folder>
                ),
                Files: ({ children, ...props }) => (
                  <Files {...props}>{children}</Files>
                ),
                img: (props) => <ImageZoom {...(props as any)} />,
                Image: (props) => <ImageZoom {...(props as any)} />,
                DependencySnippet: (props) => <DependencySnippet {...props} />,
              }}
            />
          </DocsBody>
        </DocsPage>
      ) : (
        <div className="flex flex-col items-center gap-4 justify-center h-full min-h-screen w-full container mx-auto">
          <h1 className="text-3xl font-bold">Page is under construction</h1>
          <p className="text-sm text-muted-foreground">
            This page has not been created yet. Our team is workin hard on it!
          </p>
          <Button variant="outline" asChild>
            <Link to="/docs">Back to docs</Link>
          </Button>
        </div>
      )}
    </DocsLayout>
  );
}
