import { Font } from "@react-pdf/renderer";

// Registro de las fuentes principales de la aplicación para el PDF
Font.register({
  family: "Inter",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@v1.2/ofl/inter/static/Inter-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@v1.2/ofl/inter/static/Inter-Bold.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "Cairo",
  fonts: [
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@master/ofl/cairo/static/Cairo-Regular.ttf", fontWeight: 400 },
    { src: "https://cdn.jsdelivr.net/gh/google/fonts@master/ofl/cairo/static/Cairo-Bold.ttf", fontWeight: 700 },
  ],
});
