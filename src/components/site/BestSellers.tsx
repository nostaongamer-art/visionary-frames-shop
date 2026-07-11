import { useState } from "react";
import { Star, ShoppingCart, Heart, ArrowRight } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/shop-data";
import { useCart } from "@/hooks/use-cart";

function Stars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-3.5 w-3.5 fill-brand text-brand" />
      ))}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [liked, setLiked] = useState(false);

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="relative bg-[#f6f6f6] p-6">
        <span className="absolute left-3 top-3 z-10 rounded bg-ink px-2 py-1 text-[11px] font-bold text-white">
          {product.discount}
        </span>
        <img
          src={product.image}
          alt={product.name}
          width={700}
          height={600}
          loading="lazy"
          className="mx-auto h-36 w-full object-contain"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-sm font-bold text-ink">{product.name}</h3>
        <div className="mt-1.5 flex items-center gap-1.5">
          <Stars />
          <span className="text-xs text-muted-foreground">{product.reviews}</span>
        </div>

        <div className="mt-2.5 flex items-baseline gap-2">
          <span className="text-xs text-muted-foreground line-through">{product.oldPrice}</span>
          <span className="font-display text-lg font-extrabold text-brand">{product.price}</span>
        </div>
        <p className="mt-0.5 text-[11px] text-muted-foreground">{product.installment}</p>

        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={addItem}
            className="inline-flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-brand px-3 py-2.5 text-[11px] font-bold tracking-wide text-white transition-colors hover:bg-brand/90"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            ADICIONAR AO CARRINHO
          </button>
          <button
            onClick={() => setLiked((l) => !l)}
            aria-label="Favoritar"
            aria-pressed={liked}
            className="inline-flex h-[38px] w-[38px] shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-ink transition-colors hover:border-brand hover:text-brand"
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-brand text-brand" : ""}`} />
          </button>
        </div>
      </div>
    </div>
  );
}

function SeeAllButton() {
  return (
    <a
      href="#mais-vendidos"
      className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-transparent bg-ink px-4 py-2.5 text-xs font-bold tracking-wide text-white transition-colors hover:border-brand"
    >
      VER TODOS
      <ArrowRight className="h-3.5 w-3.5 text-brand" />
    </a>
  );
}

export function BestSellers() {
  return (
    <section id="mais-vendidos" className="bg-white py-14">
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6">
        <div className="relative mb-8 text-center">
          <p className="text-xs font-bold tracking-[0.2em] text-brand">ESCOLHAS QUE ENCANTAM</p>
          <h2 className="mt-1 font-display text-3xl font-extrabold tracking-tight text-ink">
            Mais Vendidos
          </h2>
          <div className="mt-4 flex justify-center sm:absolute sm:right-0 sm:top-1/2 sm:mt-0 sm:-translate-y-1/2">
            <SeeAllButton />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
