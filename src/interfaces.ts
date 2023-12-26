interface Thread {
  id: string;
  title: string;
  appliedTags: string[];
  number?: number;
  body?: string;
  node_id?: string;
}

interface GitIssue {
  title: string;
  body: string;
  number: number;
  node_id: string;
}

export { Thread, GitIssue };
