import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/masculino")({
  component: MasculinoPage,
});

function MasculinoPage() {
  return <CategoryPageLayout pageId="masculino" />;
}
