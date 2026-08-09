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

  function handleFlush() {
    setStatus("flushing");
    // Calling /__hmr_flush from the page restarts the dev server while that
    // same HTTP request is open, which Node reports as ECONNRESET/"aborted".
    // A cache-bypassing navigation pulls the latest preview without killing
    // the active server request or triggering the blank-screen error overlay.
    setStatus("done");
    const url = new URL(window.location.href);
    url.searchParams.set("preview_refresh", Date.now().toString());
    setTimeout(() => window.location.replace(url), 150);
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
