"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, type WorkflowStatus } from "../../../lib/api";
import {
  WorkflowTemplateEditor,
  type WorkflowTemplateDraft,
} from "../../../components/workflow-template-editor";

const emptyDraft: WorkflowTemplateDraft = {
  name: "",
  slug: "",
  description: "",
  category: "",
  status: "active" satisfies WorkflowStatus,
  providerType: "simulated",
  inputSchema: { fields: [] },
};

export default function NewWorkflowPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">New workflow</h1>
        <div className="text-sm text-muted-foreground">
          Create a lightweight workflow template for the catalog. Execution remains
          simulated in the MVP.
        </div>
        <div className="text-sm">
          <Link className="underline" href="/workflows">
            Back to workflows
          </Link>
        </div>
      </section>

      <WorkflowTemplateEditor
        mode="create"
        initial={emptyDraft}
        onSubmit={async (draft) => {
          const workflow = await api.createWorkflow(draft);
          router.push(`/workflows/${workflow.slug}`);
          return workflow;
        }}
      />
    </div>
  );
}
