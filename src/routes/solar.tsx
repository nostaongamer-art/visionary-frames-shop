import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/solar")({
  component: SolarPage,
});

function SolarPage() {
  return <CategoryPageLayout pageId="solar" />;
}
