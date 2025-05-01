"use client";

import { useState } from "react";
import { useQueries } from "@tanstack/react-query";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";
import type {
  BuildTool,
  DependencySnippetProps,
  Repository,
  Dependency,
} from "./types";

const DEFAULT_REPOSITORIES = {
  snapshot: [
    { url: "https://repo.simplecloud.app/snapshots" },
    { url: "https://buf.build/gen/maven" },
  ],
  release: [{ url: "https://buf.build/gen/maven" }],
};

async function fetchLatestVersion(
  groupId: string,
  artifactId: string,
  type: "snapshot" | "release"
) {
  const url =
    type === "snapshot"
      ? `https://repo.simplecloud.app/api/maven/latest/version/snapshots/${groupId.replace(
          /\./g,
          "/"
        )}/${artifactId}?type=raw`
      : `https://search.maven.org/solrsearch/select?q=g:${groupId}+AND+a:${artifactId}&rows=1&wt=json`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Version not found");

  if (type === "snapshot") {
    return response.text();
  }

  const data = await response.json();
  return data?.response?.docs?.[0]?.latestVersion;
}

function getRepositoryCode(buildTool: BuildTool, repositories: Repository[]) {
  switch (buildTool) {
    case "kotlin":
      return `repositories {
    ${repositories.map((repo) => `maven("${repo.url}")`).join("\n    ")}
}`;

    case "groovy":
      return `repositories {
    ${repositories.map((repo) => `maven { url "${repo.url}" }`).join("\n    ")}
}`;

    case "maven":
      return `<repositories>
    ${repositories
      .map(
        (repo) => `<repository>
        <url>${repo.url}</url>
    </repository>`
      )
      .join("\n    ")}
</repositories>`;
  }
}

function getDependencyCode(
  buildTool: BuildTool,
  dependency: Dependency,
  version: string
) {
  const type = dependency.type ?? "compileOnly";

  switch (buildTool) {
    case "kotlin":
      return `    ${type}("${dependency.groupId}:${
        dependency.artifactId
      }:${version}")${
        type === "annotationProcessor"
          ? ` \n    // Use kapt if you\'re using Kotlin\n    kapt("${dependency.groupId}:${dependency.artifactId}:${version}")`
          : ""
      }`;

    case "groovy":
      return `    ${type} '${dependency.groupId}:${dependency.artifactId}:${version}'`;

    case "maven":
      if (type === "annotationProcessor") {
        return null;
      }
      return `    <dependency>
        <groupId>${dependency.groupId}</groupId>
        <artifactId>${dependency.artifactId}</artifactId>
        <version>${version}</version>
    </dependency>`;
  }
}

function getDependenciesCode(
  buildTool: BuildTool,
  dependencies: Dependency[],
  versions: (string | undefined)[]
) {
  const dependenciesCode = dependencies.map((dep, index) => {
    const version = dep.version ?? versions[index] ?? "latest";
    return getDependencyCode(buildTool, dep, version);
  });

  switch (buildTool) {
    case "kotlin":
    case "groovy":
      return `dependencies {
${dependenciesCode.join("\n")}
}`;

    case "maven":
      return `<dependencies>
${dependenciesCode.join("\n")}</dependencies>`;
  }
}

export function DependencySnippet({
  defaultValue = "kotlin",
  dependencies,
  repositories,
  type = "release",
}: DependencySnippetProps) {
  const [buildTool, setBuildTool] = useState<BuildTool>(defaultValue);

  // Fetch versions for all dependencies that need it
  const versionQueries = useQueries({
    queries: dependencies.map((dep) => ({
      queryKey: ["dependency-version", dep.groupId, dep.artifactId, type],
      queryFn: () => fetchLatestVersion(dep.groupId, dep.artifactId, type),
      staleTime: 1000 * 60 * 60,
      enabled: dep.autoFetch !== false && !dep.version,
    })),
  });

  const versions = versionQueries.map((query) => query.data);
  const repoList = repositories ?? DEFAULT_REPOSITORIES[type];

  const code = [
    getRepositoryCode(buildTool, repoList),
    getDependenciesCode(buildTool, dependencies, versions),
  ].join("\n\n");

  return (
    <Tabs
      defaultValue={defaultValue}
      onValueChange={(value) => setBuildTool(value as BuildTool)}
    >
      <TabsList>
        <TabsTrigger value="kotlin">Kotlin</TabsTrigger>
        <TabsTrigger value="groovy">Groovy</TabsTrigger>
        <TabsTrigger value="maven">Maven</TabsTrigger>
      </TabsList>
      <TabsContent value="kotlin">
        <DynamicCodeBlock lang="kotlin" code={code} />
      </TabsContent>
      <TabsContent value="groovy">
        <DynamicCodeBlock lang="groovy" code={code} />
      </TabsContent>
      <TabsContent value="maven">
        <DynamicCodeBlock lang="xml" code={code} />
      </TabsContent>
    </Tabs>
  );
}
