import { Star, ArrowRight } from "lucide-react";
import { TESTIMONIALS, BRANDS } from "@/lib/shop-data";
import { getDirectDriveUrl } from "@/lib/home-service";

const CLIENT_IMAGE_MAP: Record<string, string> = {
  client1: TESTIMONIALS[0]?.image || "",
  client2: TESTIMONIALS[1]?.image || "",
  client3: TESTIMONIALS[2]?.image || "",
};

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
      ))}
    </div>
  );
}

export interface TestimonialsData {
  title: string;
  subtitle: string;
  list: Array<{
    name: string;
    text: string;
    imageKey: string;
  }>;
}

export function Testimonials({ data }: { data?: TestimonialsData }) {
  const title = data?.title || "Nossos Clientes";
  const subtitle = data?.subtitle || "QUEM COMPROU, APROVOU";
  const list = data?.list || TESTIMONIALS.map((t, idx) => ({
    name: t.name,
    text: t.text,
    imageKey: `client${idx + 1}`,
  }));

  return (
    <>
      <section className="bg-white py-4">
        <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
          <div className="relative mb-8 text-center">
            <p className="text-xs font-bold tracking-[0.2em] text-brand">{subtitle}</p>
            <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">
              {title}
            </h2>
            <div className="mt-4 flex justify-center sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
              <a
                href="#"
                className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-ink px-4 py-2.5 text-xs font-bold tracking-wide text-white transition-colors hover:border-brand"
              >
                VER TODOS
                <ArrowRight className="h-3.5 w-3.5 text-brand" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {list.map((t, idx) => {
              const imageSrc = (t.imageUrl && getDirectDriveUrl(t.imageUrl)) || CLIENT_IMAGE_MAP[t.imageKey] || TESTIMONIALS[idx]?.image;
              return (
                <div
                  key={t.name}
                  className="flex gap-4 rounded-lg border border-border bg-card p-5 shadow-sm"
                >
                  <img
                    src={imageSrc}
                    alt={t.name}
                    width={512}
                    height={512}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-md object-cover"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink">{t.name}</p>
                    <div className="mt-0.5">
                      <Stars />
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">"{t.text}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Brand logos */}
      <section className="bg-white py-10">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-center gap-x-12 gap-y-6 px-4 sm:px-6">
          {BRANDS.map((brand) => (
            <span
              key={brand}
              className="font-display text-xl font-bold tracking-wide text-ink/80 sm:text-2xl"
            >
              {brand}
            </span>
          ))}
        </div>
      </section>
    </>
  );
}
