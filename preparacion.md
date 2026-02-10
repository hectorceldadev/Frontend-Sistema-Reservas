# PAUTAS DE ADAPTACIÓN (SETUP)

## CONFIGURACIÓN GLOBAL
- **Supabase Data**: 
  - `businessId`: ID único del negocio en la tabla `businesses`.
- **Diseño**:
  - `paleta`: Elegir color principal (ej: 'orange', 'blue').
  - `typography`: Elegir fuente.
  - `background`: Elegir patrón de fondo.

### METADATA
 - **Title**: Adaptar titles al negocio.
 - **Description**: Adaptar descripción al negocio.
 - **Site URL**: Colocar URL real del negocio.
 - **KeyWords**: Adaptar keywords.
 - **OpenGraph**: 
        - **Title**: Adaptar title.
        - **Description**: Adaptar descripción.
        - **URL**: Adaptar URL.
        - **SiteName**: Adaptar SiteName.
        - **Images**: Crear imágen openGraph y establecer alt.

### SCHEMA
 - **Business Type**: Definir tipo de negocio.
 - **Address**: Definir Calle o Avenida con número, Ciudad, CP, País
 - **GEO**: Coordenadas https://www.coordenadas-gps.com/
 - **Area Served**: Zonas cercanas (Pueblos, barrios...)
 - **Price Range**: Definir divisa.
 - **Opening Hours**: Definir horarios de apertura

## PAGE PRINCIPAL (HOME)

### NAVBAR
- **Logo**: 
  - Si es imagen: Viene de Supabase (`businesses` -> `logo_url`).
  - Si es texto: Se configura en `navBar.logo.text`.

### HERO
- **Badge**: Texto pequeño superior (ej: "EST. 2024").
- **Title**: H1 principal (SEO).
- **Desc**: Descripción corta, o adaptar la existente en el index SEO.
- **Imagen**: 
  - Prioridad: Supabase (`businesses` -> `hero_image_url`).
  - Fallback: Colocar imágen fallback.

### SERVICIOS
- **Metadata**: 
    - Adaptar titulo principal metadata.
    - Adaptar descripción metadata.
- **Descripcion**: Adaptar descripción.
- **Servicios (Datos)**: 
  - **ORIGEN: SUPABASE** (Tabla `services`).
  - *Acción*: Crear servicios en DB con título, precio, duración e icono.

### SERVICIO
- **Que incluye footer**: Adaptar texto al negocio.

### GALERÍA
- **Metadata**: 
    - Adaptar titulo principal metadata.
    - Adaptar descripción metadata.
- **Descripcion** Crear descripción galeria.
- **Layout**: Elegir 'marquee' (infinito) o 'grid'.
- **Imágenes**:
  - **ORIGEN: SUPABASE** (Tabla `business_gallery`).
  - *Acción*: Subir fotos al Storage y vincularlas en la tabla.

### REVIEWS
- **Descripcion**: Crear descripción.
- **Datos**: 
  - **Reviews** Copiar reviews de Google (Tamaño review constante).
  - *Acción*: Rellenar array `reviews.items` con testimonios reales o de Google Maps.

### CONTACTO
- **Metadata**: 
    - Adaptar titulo principal metadata.
    - Adaptar descripción metadata.
- **Descripcion**: Adaptar descripción.
- **Direccion**: Rellenar dirección, CP, ciudad y horarios (texto visible).
- **Horario**: Adaptar horarios.
- **Contacto**: Colocar número de télefono y adaptar links a Instagram y Whatsapp.
- **Mapa**:
  - `iframe`: Pegar el embed code de Google Maps.
  - `mapEmbedUrl`: Link directo para el botón "Cómo llegar".

---

## PÁGINAS INTERNAS

### SOBRE NOSOTROS
- **Metadata**: 
    - Adaptar titulo principal metadata.
    - Adaptar descripción metadata.
- **Badge**: Adaptar badge
- **Descripcion**: Textos `desc.part1` y `desc.part2` (Index).
- **Quote**: Adaptar o crear quote.
- **Stats**: Adaptar números (Años exp, Clientes...).
- **Equipo (Team)**:
  - **ORIGEN: SUPABASE** (Tabla `profiles`).
  - *Acción*: Crear perfiles en DB con nombre, cargo y foto (`avatar_url`).
- **Team Desc**: Adaptar descripción del equipo

### FOOTER
- **Logo**: Texto o Imagen.
- **Copyright**: Texto legal.
- **Navegación**: Links del footer (Index).

### EMAIL
 - **Business Name**: Definir nombre del negocio.
 - **Business Address**: Definir dirección del negocio Calle Avenida + Número.
 - **Logo URL**: Link del logo Supabase.
 - **Business Map**: Ubicación del negocio, sacarla de google maps.