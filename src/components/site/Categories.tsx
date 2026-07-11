import { ArrowRight } from "lucide-react";
import { CATEGORIES } from "@/lib/shop-data";
import { getDirectDriveUrl } from "@/lib/home-service";

const CAT_IMAGE_MAP: Record<string, string> = {
  catMasc: CATEGORIES[0]?.image || "",
  catFem: CATEGORIES[1]?.image || "",
  catSolar: CATEGORIES[2]?.image || "",
  catPrem: CATEGORIES[3]?.image || "",
};

export interface CategoriesData {
  list: Array<{
    title: string;
    description: string;
    imageKey: string;
    imageUrl?: string;
  }>;
}

export function Categories({ data }: { data?: CategoriesData }) {
  const list = data?.list || CATEGORIES.map((cat, idx) => ({
    title: cat.title,
    description: cat.description,
    imageKey: idx === 0 ? "catMasc" : idx === 1 ? "catFem" : idx === 2 ? "catSolar" : "catPrem",
  }));

  return (
    <section id="categorias" className="bg-[#fafafa] py-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((cat, idx) => {
            const imageSrc = (cat.imageUrl && getDirectDriveUrl(cat.imageUrl)) || CAT_IMAGE_MAP[cat.imageKey] || CATEGORIES[idx]?.image;
            return (
              <a
                key={cat.title}
                href="#mais-vendidos"
                className="group relative flex h-40 overflow-hidden rounded-lg border border-border bg-[#f2f2f2] transition-transform hover:-translate-y-1"
              >
                <div className="flex flex-1 flex-col justify-center p-5">
                  <h3 className="font-display text-lg font-extrabold tracking-tight text-ink">
                    {cat.title}
                  </h3>
                  <p className="mt-1 max-w-[8rem] text-xs leading-snug text-muted-foreground">
                    {cat.description}
                  </p>
                  <span className="mt-auto inline-flex h-7 w-7 items-center justify-center rounded-full border border-ink/20 text-ink transition-colors group-hover:border-brand group-hover:text-brand">
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                <div className="w-[46%] shrink-0">
                  <img
                    src={imageSrc}
                    alt={`Categoria ${cat.title}`}
                    width={600}
                    height={700}
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
