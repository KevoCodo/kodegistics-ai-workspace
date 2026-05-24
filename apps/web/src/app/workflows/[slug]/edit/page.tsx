import { WorkflowEditClient } from "./workflow-edit-client";

export default async function WorkflowEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <WorkflowEditClient slug={slug} />;
}

