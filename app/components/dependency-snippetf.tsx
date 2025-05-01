"use client";

import { useQuery } from "@tanstack/react-query";
import { Fragment } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock";

interface DependencySnippetProps {
  groupId: string;
  artifactId: string;
  type: "snapshot" | "release";
}

const REPOSITORIES = {
  snapshot: [
    {
      id: "simplecloud-snapshots",
      url: "https://repo.simplecloud.app/snapshots",
    },
    { id: "buf-maven", url: "https://buf.build/gen/maven" },
  ],
  release: [{ id: "buf-maven", url: "https://buf.build/gen/maven" }],
} as const;

function getCodeString(
  language: "kotlin" | "groovy" | "maven",
  {
    repositories,
    groupId,
    artifactId,
    version,
  }: {
    repositories: (typeof REPOSITORIES)[keyof typeof REPOSITORIES];
    groupId: string;
    artifactId: string;
    version: string;
  }
) {
  switch (language) {
    case "kotlin":
      return [
        "repositories {",
        repositories.map((repo) => `    maven("${repo.url}")`).join("\n"),
        "}",
        "",
        "dependencies {",
        `    api("${groupId}:${artifactId}:${version}")`,
        "}",
      ].join("\n");

    case "groovy":
      return [
        "repositories {",
        repositories
          .map((repo) =>
            ["    maven {", `        url "${repo.url}"`, "    }"].join("\n")
          )
          .join("\n"),
        "}",
        "",
        "dependencies {",
        `    api '${groupId}:${artifactId}:${version}'`,
        "}",
      ].join("\n");

    case "maven":
      return [
        "<repositories>",
        repositories
          .map((repo) =>
            [
              "    <repository>",
              `        <id>${repo.id}</id>`,
              `        <url>${repo.url}</url>`,
              "    </repository>",
            ].join("\n")
          )
          .join("\n"),
        "</repositories>",
        "",
        "<dependency>",
        `    <groupId>${groupId}</groupId>`,
        `    <artifactId>${artifactId}</artifactId>`,
        `    <version>${version}</version>`,
        "</dependency>",
      ].join("\n");
  }
}

export function DependencySnippet({
  groupId,
  artifactId,
  type,
}: DependencySnippetProps) {
  const {
    data: version,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dependency-version", groupId, artifactId, type],
    queryFn: () => fetchLatestVersion(groupId, artifactId, type),
    staleTime: 1000 * 60 * 60,
  });

  if (isLoading) return <div>Loading dependency information...</div>;
  if (isError) return <div>Error: Version not found</div>;
  if (!version) return <div>Version not found</div>;

  const repositories = REPOSITORIES[type];

  return (
    <Tabs defaultValue="kotlin">
      <TabsList>
        <TabsTrigger value="kotlin">Kotlin</TabsTrigger>
        <TabsTrigger value="groovy">Groovy</TabsTrigger>
        <TabsTrigger value="maven">Maven</TabsTrigger>
      </TabsList>
      <TabsContent value="kotlin">
        <DynamicCodeBlock
          lang="kotlin"
          code={getCodeString("kotlin", {
            repositories,
            groupId,
            artifactId,
            version,
          })}
        />
      </TabsContent>
      <TabsContent value="groovy">
        <DynamicCodeBlock
          lang="groovy"
          code={getCodeString("groovy", {
            repositories,
            groupId,
            artifactId,
            version,
          })}
        />
      </TabsContent>
      <TabsContent value="maven">
        <DynamicCodeBlock
          lang="xml"
          code={getCodeString("maven", {
            repositories,
            groupId,
            artifactId,
            version,
          })}
        />
      </TabsContent>
    </Tabs>
  );
}

async function fetchLatestVersion(
  groupId: string,
  artifactId: string,
  type: "snapshot" | "release"
): Promise<string> {
  if (type === "snapshot") {
    const response = await fetch(
      `https://repo.simplecloud.app/api/maven/latest/version/snapshots/${groupId.replace(
        /\./g,
        "/"
      )}/${artifactId}?type=raw`
    );
    if (!response.ok) throw new Error("Version not found");
    const version = await response.text();
    if (!version) throw new Error("No version found");
    return version;
  }

  const response = await fetch(
    `https://search.maven.org/solrsearch/select?q=g:&quot;${groupId}&quot;+AND+a:&quot;${artifactId}&quot;&rows=1&wt=json`
  );
  if (!response.ok) throw new Error("Version not found");

  const data = await response.json();
  const version = data?.response?.docs?.[0]?.latestVersion;
  if (!version) throw new Error("No version found in Maven Central");

  return version;
}
