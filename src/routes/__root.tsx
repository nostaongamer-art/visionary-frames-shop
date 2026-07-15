import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
} from "@tanstack/react-router";
import { useState, useEffect, type ReactNode } from "react";
import { fetchHomePageContent } from "../lib/home-service";
import { fetchPageContent } from "../lib/page-service";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { FlushPreviewButton } from "../components/site/FlushPreviewButton";
import { CartProvider } from "@/hooks/use-cart";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Glasses — Óculos com Estilo | Armações e Solar Premium" },
      {
        name: "description",
        content:
          "Encontre o óculos perfeito para seu estilo. Mais de 200 modelos exclusivos, frete grátis para todo Brasil e até 12x sem juros na Glasses.",
      },
      { name: "author", content: "Glasses" },
      { property: "og:title", content: "Glasses — Óculos com Estilo | Armações e Solar Premium" },
      {
        property: "og:description",
        content:
          "Encontre o óculos perfeito para seu estilo. Mais de 200 modelos exclusivos, frete grátis para todo Brasil e até 12x sem juros na Glasses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Glasses — Óculos com Estilo | Armações e Solar Premium" },
      { name: "twitter:description", content: "Encontre o óculos perfeito para seu estilo. Mais de 200 modelos exclusivos, frete grátis para todo Brasil e até 12x sem juros na Glasses." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/191437c3-a1c8-4a7d-b64c-5cb883e49b57/id-preview-aa4b4e2b--3d190ce2-acb1-4707-92e7-b7e726860b15.lovable.app-1783728966766.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/191437c3-a1c8-4a7d-b64c-5cb883e49b57/id-preview-aa4b4e2b--3d190ce2-acb1-4707-92e7-b7e726860b15.lovable.app-1783728966766.png" },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Montserrat:wght@600;700;800;900&display=swap",
      },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function CustomStylesInjector() {
  const [colors, setColors] = useState<any>(null);
  const location = useLocation();
  const currentPath = location.pathname;

  useEffect(() => {
    let pageId = "home";
    if (currentPath.includes("/colecoes")) pageId = "colecoes";
    else if (currentPath.includes("/masculino")) pageId = "masculino";
    else if (currentPath.includes("/feminino")) pageId = "feminino";
    else if (currentPath.includes("/solar")) pageId = "solar";
    else if (currentPath.includes("/premium")) pageId = "premium";
    else if (currentPath.includes("/promocoes")) pageId = "promocoes";

    // 1. Tentar ler do localStorage primeiro para carregamento instantâneo
    if (typeof window !== "undefined") {
      try {
        const cachedKey = pageId === "home" ? "glasses_home_page_content" : `glasses_page_content_${pageId}`;
        const cached = localStorage.getItem(cachedKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.colors) {
            setColors(parsed.colors);
          } else if (pageId !== "home") {
            // Se o catálogo não tiver cores próprias, puxa da home
            const homeCached = localStorage.getItem("glasses_home_page_content");
            if (homeCached) {
              const homeParsed = JSON.parse(homeCached);
              if (homeParsed && homeParsed.colors) {
                setColors(homeParsed.colors);
              }
            }
          }
        }
      } catch (e) {
        console.error("Failed to read from localStorage:", e);
      }
    }

    // 2. Fetch do banco de dados para garantir que está atualizado
    async function loadColors() {
      try {
        if (pageId === "home") {
          const data = await fetchHomePageContent();
          if (data && data.colors) {
            setColors(data.colors);
          }
        } else {
          const data = await fetchPageContent(pageId);
          if (data && data.colors) {
            setColors(data.colors);
          } else {
            // Se a página não tiver cores, puxa as da home
            const homeData = await fetchHomePageContent();
            if (homeData && homeData.colors) {
              setColors(homeData.colors);
            }
          }
        }
      } catch (e) {
        console.error("Failed to fetch colors:", e);
      }
    }
    loadColors();

    // 3. Ouvir alterações feitas na área administrativa no mesmo navegador
    const handleStorageChange = () => {
      try {
        const cachedKey = pageId === "home" ? "glasses_home_page_content" : `glasses_page_content_${pageId}`;
        const cached = localStorage.getItem(cachedKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.colors) {
            setColors(parsed.colors);
          }
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [currentPath]);

  if (!colors) return null;

  // Generate CSS custom variables override stylesheet
  const css = `
    :root {
      ${colors.brand ? `--brand: ${colors.brand} !important;` : ""}
      ${colors.brandHover ? `--brand-2: ${colors.brandHover} !important;` : ""}
      ${colors.ink ? `--ink: ${colors.ink} !important;` : ""}
      ${colors.ink2 ? `--ink-2: ${colors.ink2} !important;` : ""}
      ${colors.ink3 ? `--ink-3: ${colors.ink3} !important;` : ""}
      ${colors.banner ? `--banner: ${colors.banner} !important;` : ""}
      ${colors.hairline ? `--hairline: ${colors.hairline} !important;` : ""}
      ${colors.background ? `--background: ${colors.background} !important;` : ""}
      ${colors.foreground ? `--foreground: ${colors.foreground} !important;` : ""}
      ${colors.logoAccent ? `--logo-accent: ${colors.logoAccent} !important;` : ""}
      ${colors.logoText ? `--logo-text: ${colors.logoText} !important;` : ""}
    }
  `;

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <CustomStylesInjector />
        {/* Dev-only helper to flush the HMR gate without spending credits. */}
        <FlushPreviewButton />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <Outlet />
      </CartProvider>
    </QueryClientProvider>
  );
}
