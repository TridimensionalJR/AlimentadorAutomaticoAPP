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
        src: "/assets/icon-192x192.jpeg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/assets/icon-512x512.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
      },
      {
        src: "/assets/maskable-icon-512x512.jpeg",
        sizes: "512x512",
        type: "image/jpeg",
        purpose: "maskable",
      },
    ],
  };
}