import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/colecoes")({
  component: ColecoesPage,
});

function ColecoesPage() {
  return <CategoryPageLayout pageId="colecoes" />;
}
