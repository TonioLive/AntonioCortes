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

- **Añadir un proyecto:** copia un bloque `<li class="project">` en `index.html`.
  - `data-areas` decide en qué filtros aparece: `web`, `sistemas`, `marketing`, `automatizacion` (separados por espacio).
  - Con captura: pon la imagen en `assets/img/` (1200×750, JPG) y usa `<img>` dentro de `.project__media`.
  - Sin captura: usa un panel `<div class="panel panel--navy|sea|slate|paper">`.
- **Colores y tipografía:** variables en `:root` al inicio de `styles.css`.

## Publicar

Son archivos estáticos: sirven en cualquier hosting que entregue HTML.

**GitHub Pages:** *Settings → Pages → Deploy from a branch → `main` / root*.
Ojo: la cuenta ya tiene `dubedition.es` en la web principal (`toniolive.github.io`), así que sin dominio propio el portfolio saldría en `dubedition.es/portfolio`. Con un dominio propio, se añade un archivo `CNAME` con el dominio y los registros DNS de GitHub Pages en el registrador.

## Pendiente

- Enlace a LinkedIn en la sección de contacto.
- Cuando haya URL definitiva: poner la URL absoluta en `og:image`, añadir `<link rel="canonical">` y `sitemap.xml`.
