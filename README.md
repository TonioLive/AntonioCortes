# Portfolio · Antonio Cortés Jiménez

Web personal tipo CV: proyectos, áreas de trabajo, trayectoria y contacto.
Estática (HTML, CSS y JavaScript sin dependencias ni build), lista para Vercel o cualquier hosting.

## Estructura

```
index.html              Contenido completo de la web
favicon.svg
assets/
  css/styles.css        Estilos (tokens de color y tipografía al principio)
  js/main.js            Menú, revelados, cifras, interfaces animadas, webs que se recorren con el scroll, inclinación, botonera móvil
  img/                  Foto, capturas completas de webs (WebP), fotos de aficiones e imagen para redes (og.jpg)
  fonts/                Source Serif 4 y Schibsted Grotesk alojadas aquí (licencia OFL)
```

## Editar contenido

- **Añadir un proyecto:** copia un bloque `<article class="case">` en `index.html`. Los casos alternan imagen a izquierda y derecha solos.
  - Web con captura: haz una captura de página completa a 1280 px de ancho, guárdala como WebP de 1000 px de ancho en `assets/img/` y ponla dentro de `<div class="frame__view" data-scroll-shot>`. La web se recorre sola al hacer scroll.
  - Sin captura: usa una recreación como `.booking` o `.shop`, con sus cifras reales.
  - Si en la captura salen menores, difumina o recorta esa parte antes de publicarla.
- **Barras de resultados:** los valores van en CSS (`.growth__row--1`, `--2`, `--3`) en porcentaje sobre el valor más alto.
- **Colores y tipografía:** variables en `:root` al inicio de `styles.css`.

## Publicación

Publicada con GitHub Pages (rama `main`, raíz): **https://toniolive.github.io/AntonioCortes/**

Cada push a `main` se publica solo en uno o dos minutos. Todas las rutas son relativas, así que funciona también si algún día se cambia a un dominio propio (archivo `CNAME` + DNS). En ese caso hay que actualizar la URL en `canonical`, `og:url`, `og:image`, los datos estructurados y `sitemap.xml`.
