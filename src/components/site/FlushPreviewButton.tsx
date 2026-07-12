import { useEffect, useState } from "react";
import { Zap } from "lucide-react";

export function FlushPreviewButton() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "flushing" | "done" | "error">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    // Show only in dev/preview environments (localhost or Lovable preview).
    const hostname = window.location.hostname;
    const isDev = hostname === "localhost" || hostname.includes("lovableproject.com") || hostname.includes("lovable.app");
    setVisible(isDev);
  }, []);

  if (!visible) return null;

  async function handleFlush() {
    setStatus("flushing");
    // The /__hmr_flush endpoint only exists on the internal sandbox dev server.
    // On the preview/published domain it 404s, so we fall back to a hard reload,
    // which is what actually pulls the latest build into the browser.
    try {
      const res = await fetch("/__hmr_flush", { method: "POST" });
      if (res.ok) {
        setStatus("done");
        setTimeout(() => window.location.reload(), 300);
        return;
      }
    } catch {
      /* endpoint unavailable — fall back to reload below */
    }
    setStatus("done");
    setTimeout(() => window.location.reload(), 300);
  }

  return (
    <button
      type="button"
      onClick={handleFlush}
      title="Flush preview (atualizar HMR)"
      className="fixed left-3 top-3 z-[100] inline-flex items-center gap-1.5 rounded-md border border-white/20 bg-brand px-2.5 py-1.5 text-xs font-bold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
    >
      <Zap className="h-3.5 w-3.5" />
      {status === "flushing" && "Flush..."}
      {status === "done" && "Atualizado!"}
      {status === "error" && "Erro"}
      {status === "idle" && "Flush Preview"}
    </button>
  );
}
