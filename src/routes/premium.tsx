import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/premium")({
  component: PremiumPage,
});

function PremiumPage() {
  return <CategoryPageLayout pageId="premium" />;
}
