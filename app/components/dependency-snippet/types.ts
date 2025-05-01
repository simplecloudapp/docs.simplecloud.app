export type BuildTool = "kotlin" | "groovy" | "maven";

export type Repository = {
  url: string;
};

export type Dependency = {
  groupId: string;
  artifactId: string;
  version?: string;
  type?: string;
  autoFetch?: boolean;
};

export interface DependencySnippetProps {
  defaultValue?: BuildTool;
  dependencies: Dependency[];
  repositories?: Repository[];
  type?: "snapshot" | "release";
}
