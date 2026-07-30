import { getDirectDriveUrl } from "@/lib/home-service";

interface Hero2Props {
  data: {
    show?: boolean;
    name?: string;
    imageUrl?: string;
    linkUrl?: string;
    imagePositionY?: number;
    desktopHeight?: number;
    mobileHeight?: number;
    desktopWidth?: number;
  };
}

export function Hero2({ data }: Hero2Props) {
  if (data.show === false) return null;

  const imageUrl = data.imageUrl ? getDirectDriveUrl(data.imageUrl) : "";
  const posY = data.imagePositionY !== undefined ? data.imagePositionY : 50;

  const desktopHeight = data.desktopHeight !== undefined ? data.desktopHeight : 380;
  const mobileHeight = data.mobileHeight !== undefined ? data.mobileHeight : 180;
  const desktopWidth = data.desktopWidth !== undefined ? data.desktopWidth : 1500;

  if (!imageUrl) return null;

  const BannerContent = (
    <div className="w-full h-full overflow-hidden rounded-2xl relative shadow-md group transition-all duration-300">
      <img
        src={imageUrl}
        alt={data.name || "Banner Principal 2"}
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
          title={data.name || "Banner Principal 2"}
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
