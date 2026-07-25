import { createFileRoute } from "@tanstack/react-router";
import { CategoryPageLayout } from "@/components/site/CategoryPageLayout";

interface ColecoesSearch {
  pageId?: string;
  category?: string;
}

export const Route = createFileRoute("/colecoes")({
  validateSearch: (search: Record<string, unknown>): ColecoesSearch => {
    return {
      pageId: search.pageId as string | undefined,
      category: search.category as string | undefined,
    };
  },
  component: ColecoesPage,
});

function ColecoesPage() {
  return <CategoryPageLayout pageId="colecoes" />;
}
