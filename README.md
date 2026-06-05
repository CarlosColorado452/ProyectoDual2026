# 市場 Motto hoshī! — Gestión de Inventario

Aplicación web para digitalizar y gestionar el inventario de una tienda de productos japoneses. Desarrollada por **Carlos Colorado Anselmo** como proyecto del módulo de desarrollo web.

---

## Descripción

Motto hoshī! permite gestionar productos (cómics, manga, figuras y otros artículos) desde el navegador, sin necesidad de servidor ni base de datos externa. Todos los datos se guardan en el `localStorage` del navegador.

La aplicación cuenta con dos roles de usuario:

- **Admin** — puede añadir, editar y eliminar productos.
- **Empleado** — solo puede consultar el inventario.

---

## Tecnologías

- HTML5 semántico
- CSS3 con Flexbox y Grid, diseño mobile-first
- JavaScript Vanilla (sin frameworks)
- localStorage para persistencia de datos

---

## Instalación

No requiere instalación ni servidor. Basta con abrir el proyecto en un navegador:

1. Descarga o clona el repositorio
2. Abre el archivo `index.html` en tu navegador

Si usas VS Code, se recomienda la extensión **Live Server** para evitar problemas con rutas relativas.

---

## Estructura de archivos

```
📁 proyecto/
  ├── index.html        → Portada con vídeo de fondo
  ├── login.html        → Inicio de sesión
  ├── registro.html     → Registro de usuario
  ├── menu.html         → Panel de control
  ├── inventario.html   → Gestión del inventario
  ├── anadir.html       → Formulario para añadir productos
  ├── styles.css        → Estilos globales
  ├── app.js            → Lógica de la aplicación
  └── img/              → Iconos de mensajes
```

---

## Uso

### Credenciales por defecto

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin | Administrador |
| empleado | 1234 | Empleado |

### Funcionalidades

- **Añadir producto** — nombre, categoría, precio, stock, imagen (URL o archivo local) y descripción.
- **Ver inventario** — grid de cards con buscador en tiempo real y filtros por categoría, precio y stock.
- **Editar producto** — modal con los datos precargados del producto seleccionado.
- **Eliminar producto** — desde el panel lateral de cada producto.
- **Gestión de stock** — botones + y − en el panel lateral para ajustar unidades.
- **Alerta de stock bajo** — productos con menos de 5 unidades se muestran en rojo.
- **Resumen** — panel de control con total de productos, categorías y productos con stock bajo.

---

## Notas

- Las imágenes subidas localmente se convierten a Base64 y se almacenan en el `localStorage`. Se recomienda usar imágenes en formato WebP de menos de 200KB.
- El `localStorage` tiene un límite aproximado de 5MB por dominio.
- Los datos de productos de ejemplo se cargan automáticamente la primera vez que se abre el inventario.
