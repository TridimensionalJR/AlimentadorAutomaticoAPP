import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Tridimensional Alimentador para pets",
    short_name: "Tridimensional",

    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",

    background_color: "#ffffff",
    theme_color: "#0d8ef0",

    lang: "pt-BR",

    icons: [
      {
        src: "/icon/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icon/maskable-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}