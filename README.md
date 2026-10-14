# Portfolio · Antonio Cortés Jiménez

Web personal tipo CV: proyectos, áreas de trabajo, trayectoria y contacto.
Estática (HTML, CSS y JavaScript sin dependencias ni build), lista para Vercel o cualquier hosting.

## Estructura

```
index.html              Contenido completo de la web
favicon.svg
assets/
  css/styles.css        Estilos (tokens de color y tipografía al principio)
  js/main.js            Menú, filtro de proyectos, vista previa, línea de trayectoria, copiar correo
  img/                  Foto, capturas de proyectos e imagen para redes (og.jpg)
  fonts/                Source Serif 4 y Schibsted Grotesk alojadas aquí (licencia OFL)
```

## Editar contenido

- **Añadir un proyecto:** copia un bloque `<article class="case">` en `index.html`. Los casos alternan imagen a izquierda y derecha solos.
  - Con captura: pon la imagen en `assets/img/` (1200×750, JPG) dentro de `<figure class="frame">`, que le pone el marco de navegador.
  - Sin captura: usa un panel `<div class="panel panel--navy|sea|slate">` con cifras (`.panel__figures`) y etiquetas (`.panel__chips`).
- **Barras de resultados:** los valores van en CSS (`.growth__row--1`, `--2`, `--3`) en porcentaje sobre el valor más alto.
- **Colores y tipografía:** variables en `:root` al inicio de `styles.css`.

## Publicación

Publicada con GitHub Pages (rama `main`, raíz): **https://toniolive.github.io/AntonioCortes/**

Cada push a `main` se publica solo en uno o dos minutos. Todas las rutas son relativas, así que funciona también si algún día se cambia a un dominio propio (archivo `CNAME` + DNS). En ese caso hay que actualizar la URL en `canonical`, `og:url`, `og:image`, los datos estructurados y `sitemap.xml`.
