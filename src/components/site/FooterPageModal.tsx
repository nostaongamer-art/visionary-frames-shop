import { useEffect } from "react";
import { X, HelpCircle, FileText, Video } from "lucide-react";
import { FooterPageContent } from "@/lib/home-service";

interface FooterPageModalProps {
  page: FooterPageContent | null;
  isOpen: boolean;
  onClose: () => void;
}

function getYouTubeEmbedUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  let videoId = "";
  if (trimmed.includes("youtu.be/")) {
    videoId = trimmed.split("youtu.be/")[1]?.split("?")[0]?.split("&")[0] || "";
  } else if (trimmed.includes("youtube.com/watch")) {
    const reg = /[?&]v=([a-zA-Z0-9_-]+)/;
    const match = trimmed.match(reg);
    if (match && match[1]) videoId = match[1];
  } else if (trimmed.includes("youtube.com/embed/")) {
    videoId = trimmed.split("youtube.com/embed/")[1]?.split("?")[0]?.split("&")[0] || "";
  }

  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0`;
  }
  return null;
}

export function FooterPageModal({ page, isOpen, onClose }: FooterPageModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !page) return null;

  const embedUrl = getYouTubeEmbedUrl(page.youtubeUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] border border-gray-100">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-[#08090A] text-white border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#FF8A00]/20 rounded-lg border border-[#FF8A00]/30 text-[#FF8A00]">
              {page.category === "ajuda" ? (
                <HelpCircle className="h-5 w-5" />
              ) : (
                <FileText className="h-5 w-5" />
              )}
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#FF8A00]">
                {page.category === "ajuda" ? "Central de Ajuda" : "Institucional"}
              </span>
              <h2 className="text-lg font-bold text-white leading-tight">
                {page.title}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-gray-700 text-sm leading-relaxed">
          
          {/* YouTube Video Section (Only for Como Comprar when embedUrl exists) */}
          {page.id === "como-comprar" && embedUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-extrabold text-gray-900 uppercase tracking-wider">
                <Video className="h-4 w-4 text-[#FF8A00]" />
                <span>Vídeo Demonstrativo - Passo a Passo</span>
              </div>
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gray-200 shadow-md bg-black">
                <iframe
                  src={embedUrl}
                  title="Como Comprar na Glasses"
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Text Content */}
          <div className="whitespace-pre-line text-gray-800 space-y-2">
            {page.content}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#08090A] hover:bg-[#1a1c20] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer shadow"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
