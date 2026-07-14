import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/feminino")({
  component: FemininoPage,
});

function FemininoPage() {
  return <CategoryPageLayout pageId="feminino" />;
}
