interface Thread {
  id: string;
  title: string;
  appliedTags: string[];
  number?: number;
  body?: string;
  node_id?: string;
  archived: boolean | null;
  locked: boolean | null;
}

interface GitIssue {
  title: string;
  body: string;
  number: number;
  node_id: string;
  locked: boolean;
  state: "open" | "closed";
}

export { Thread, GitIssue };
