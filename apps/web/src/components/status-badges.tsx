import { Badge } from "./ui/badge";
import type { Workflow, WorkflowRun } from "../lib/api";

function runVariant(status: WorkflowRun["status"]) {
  switch (status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "running":
      return "warning";
    default:
      return "neutral";
  }
}

export function RunStatusBadge({ status }: { status: WorkflowRun["status"] }) {
  return <Badge variant={runVariant(status)}>{status}</Badge>;
}

export function WorkflowStatusBadge({ status }: { status: Workflow["status"] }) {
  return (
    <Badge variant={status === "active" ? "success" : "neutral"}>{status}</Badge>
  );
}

