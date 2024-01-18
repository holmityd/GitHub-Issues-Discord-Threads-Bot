import { Request } from "express";

interface Thread {
  id: string;
  title: string;
  appliedTags: string[];
  number?: number;
  body?: string;
  node_id?: string;
  comments: ThreadComment[];
  archived: boolean | null;
  locked: boolean | null;
  lockArchiving?: boolean;
  lockLocking?: boolean;
}

interface ThreadComment {
  id: string;
  git_id: number;
}

interface GitIssue {
  title: string;
  body: string;
  number: number;
  node_id: string;
  locked: boolean;
  state: "open" | "closed";
}

interface GitHubLabel {
  id: number;
  node_id: string;
  url: string;
  name: string;
  color: string;
  default: boolean;
  description: string;
}

// eslint-disable-next-line no-unused-vars
type GithubHandlerFunction = (req: Request) => void;

export { Thread, ThreadComment, GitIssue, GitHubLabel, GithubHandlerFunction };
