interface Thread {
  id: string;
  title: string;
  appliedTags: string[];
  number?: number;
  body?: string;
  node_id?: string;
  archived: boolean | null;
  locked: boolean | null;
  lockArchiving?: boolean;
  lockLocking?: boolean;
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

export { Thread, GitIssue, GitHubLabel };
