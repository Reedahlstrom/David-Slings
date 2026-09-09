import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export const PRICE = 30;
export const IS_PREVIEW = import.meta.env.VITE_STOREFRONT_PREVIEW !== "false";
export interface Photo {
  src: string;
  alt: string;
  caption: string;
}
export interface Media {
  hero: string;
  photos: Photo[];
  video: string;
}
const initial: Media = {
  hero: "/images/sling-illustration.png",
  photos: [
    {
      src: "/images/river-stones.jpg",
      alt: "Smooth stones beside a sunny creek",
      caption: "A good place to spend an afternoon.",
    },
    {
      src: "/images/sling-illustration.png",
      alt: "An illustrated leather and paracord shepherd sling",
      caption: "A little leather. A little paracord.",
    },
    {
      src: "/images/grassy-field.jpg",
      alt: "Open grassy hills in the afternoon light",
      caption: "See you out there.",
    },
  ],
  video: "",
};
const MediaContext = createContext<{
  media: Media;
  setMedia: (value: Media) => void;
}>({ media: initial, setMedia: () => {} });
export function MediaProvider({ children }: { children: ReactNode }) {
  const [media, setMedia] = useState<Media>(initial);
  useEffect(() => {
    let active = true;
    fetch("/storefront.json")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then((value) => {
        if (active && validMedia(value)) setMedia(value);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  return (
    <MediaContext.Provider value={{ media, setMedia }}>
      {children}
    </MediaContext.Provider>
  );
}
export const useMedia = () => useContext(MediaContext);
export function validImage(value: unknown): value is string {
  return (
    typeof value === "string" &&
    (value.startsWith("/images/") ||
      /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(value))
  );
}
export function videoEmbed(value: string): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const id = ["www.youtube.com", "youtube.com", "m.youtube.com"].includes(
      url.hostname,
    )
      ? url.searchParams.get("v") ||
        url.pathname.match(/^\/(?:shorts|embed)\/([\w-]{11})/)?.[1]
      : url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : null;
    return id && /^[\w-]{11}$/.test(id)
      ? `https://www.youtube-nocookie.com/embed/${id}`
      : null;
  } catch {
    return null;
  }
}
export function validMedia(value: unknown): value is Media {
  if (!value || typeof value !== "object") return false;
  const item = value as Media;
  return (
    validImage(item.hero) &&
    Array.isArray(item.photos) &&
    item.photos.length > 0 &&
    item.photos.length <= 8 &&
    item.photos.every(
      (photo) =>
        validImage(photo.src) &&
        typeof photo.alt === "string" &&
        photo.alt.trim().length > 0 &&
        typeof photo.caption === "string",
    ) &&
    typeof item.video === "string" &&
    (!item.video || !!videoEmbed(item.video))
  );
}
