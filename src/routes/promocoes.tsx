import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

export const Route = createFileRoute("/promocoes")({
  component: PromocoesPage,
});

function PromocoesPage() {
  return <CategoryPageLayout pageId="promocoes" />;
}
