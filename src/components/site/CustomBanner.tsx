import { CustomBannerData, getDirectDriveUrl } from "@/lib/home-service";

interface CustomBannerProps {
  data: CustomBannerData;
}

export function CustomBanner({ data }: CustomBannerProps) {
  const imageUrl = data.imageUrl ? getDirectDriveUrl(data.imageUrl) : "";
  const posY = data.imagePositionY !== undefined ? data.imagePositionY : 50;

  const desktopHeight = data.desktopHeight !== undefined ? data.desktopHeight : 200;
  const mobileHeight = data.mobileHeight !== undefined ? data.mobileHeight : 120;
  const desktopWidth = data.desktopWidth !== undefined ? data.desktopWidth : 1240;

  if (!imageUrl) {
    return (
      <div className="mx-auto max-w-[1240px] px-4 sm:px-6 my-6">
        <div className="w-full h-32 sm:h-40 bg-white/5 border border-dashed border-white/20 rounded-2xl flex flex-col items-center justify-center text-center p-4">
          <p className="text-sm font-semibold text-white/50 mb-1">Banner Personalizado: {data.name}</p>
          <p className="text-xs text-white/30">Nenhuma imagem configurada. Acesse o painel administrativo para fazer o upload.</p>
        </div>
      </div>
    );
  }

  const BannerContent = (
    <div className="w-full h-full overflow-hidden rounded-2xl relative shadow-md group transition-all duration-300">
      <img
        src={imageUrl}
        alt={data.name}
        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
        style={{ objectPosition: `center ${posY}%` }}
        referrerPolicy="no-referrer"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
    </div>
  );

  const style = {
    "--banner-desktop-h": `${desktopHeight}px`,
    "--banner-mobile-h": `${mobileHeight}px`,
    "--banner-desktop-w": `${desktopWidth}px`,
  } as React.CSSProperties;

  return (
    <section 
      style={style}
      className="mx-auto px-4 sm:px-6 my-6 md:my-8 w-full max-w-[var(--banner-desktop-w)] h-[var(--banner-mobile-h)] md:h-[var(--banner-desktop-h)]"
    >
      {data.linkUrl ? (
        <a 
          href={data.linkUrl} 
          className="block w-full h-full cursor-pointer"
          title={data.name}
        >
          {BannerContent}
        </a>
      ) : (
        <div className="w-full h-full">
          {BannerContent}
        </div>
      )}
    </section>
  );
}
