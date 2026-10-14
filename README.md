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

## Publicar en Vercel

1. vercel.com → *Add New* → *Project* → importar `TonioLive/portfolio`.
2. Framework preset: **Other**. Sin build command. Output: raíz.
3. *Deploy*. Cada push a `main` se publica solo.
4. Dominio propio: *Settings → Domains* y añadir los registros DNS que indique Vercel.

> No usar GitHub Pages en este repo: la cuenta ya tiene `dubedition.es` en la web principal y el portfolio saldría en `dubedition.es/portfolio`.

## Pendiente

- Foto en alta resolución (la actual sale del CV y es pequeña): reemplazar `assets/img/antonio.jpg` (vertical, 1000×1480 aprox.).
- Enlace a LinkedIn en la sección de contacto.
- Cuando haya URL definitiva: poner la URL absoluta en `og:image`, añadir `<link rel="canonical">` y `sitemap.xml`.
