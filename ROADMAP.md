# Roadmap del Proyecto — TechStore

## Visión general

Desarrollo de una aplicación web de e-commerce para una tienda de tecnología, compuesta por un cliente frontend en HTML/CSS/JS y una API REST en Node.js con base de datos MongoDB.

---

## Fase 1 — Base del proyecto

- Estructura inicial del servidor con Express.js
- Definición de los datos del catálogo (productos, usuarios, ventas)
- Endpoints básicos para listar y consultar productos
- Primer deploy del servidor funcionando en local

---

## Fase 2 — Migración a ES6 y cliente inicial

- Migración del código a sintaxis ES6 (módulos, arrow functions, const/let)
- Desarrollo del frontend con HTML semántico y Tailwind CSS
- Página de catálogo con grilla de productos responsiva
- Módulo de utilidades compartidas (`utils.js`): navbar dinámico, alertas toast, formato de precios en ARS
- Carrito de compras persistido en `localStorage`
- Páginas de login, registro, carrito, filtros y confirmación de compra

---

## Fase 3 — Integración CORS y comunicación cliente-servidor

- Configuración de CORS para permitir requests desde el cliente en puerto 5500
- Integración completa entre frontend y backend mediante `fetch()` con credenciales
- Navbar con estado de sesión dinámico (muestra usuario o link de login según corresponda)
- Badge de carrito actualizado en tiempo real

---

## Fase 4 — MongoDB, JWT y Bcrypt

- Migración de los datos a MongoDB (base de datos `techstore`, colecciones: `productos`, `usuarios`, `ventas`)
- Conexión a la base de datos con el driver nativo de MongoDB (patrón singleton en `db.js`)
- Autenticación de usuarios con JWT (token con expiración de 1 hora, almacenado en cookie `httpOnly`)
- Hash de contraseñas con Bcrypt (10 rounds)
- Middleware `verificarToken` para protección de rutas
- Endpoints protegidos: crear, modificar y eliminar ventas requieren sesión activa
- Login y logout con manejo de cookies (`sameSite: lax`)
- Registro de usuarios con validación de email duplicado (409 Conflict)
- Contraseña excluida de todas las respuestas de la API

---

## Fase 5 — Ventas, stock y datos finales

- Descuento automático de stock al confirmar una compra (`$inc: { stock: -cantidad }`)
- Validación de stock disponible antes de procesar la venta
- Validación de existencia de productos al crear una venta
- Restricción de eliminación: no se puede borrar un producto o usuario que tenga ventas asociadas (409 Conflict)
- Corrección del `sameSite` de la cookie para compatibilidad con el cliente
- Carga y verificación de los datos del catálogo (producto Redragon K552 y restantes)
- Variables de entorno gestionadas con `dotenv` (`.env` con URI de Mongo, nombre de DB, JWT secret y puerto)

---

## Stack tecnológico

| Capa | Tecnologías |
|------|------------|
| Frontend | HTML5, Tailwind CSS, JavaScript ES6 (módulos) |
| Backend | Node.js, Express.js 5 |
| Base de datos | MongoDB 7 (driver nativo) |
| Autenticación | JSON Web Tokens (JWT), Bcrypt |
| Comunicación | REST API, Fetch API, Cookies httpOnly |
| Herramientas | dotenv, cors, cookie-parser, Live Server |

---

## Estructura del proyecto

```
AW2TP222/               ← Backend (API REST)
├── server.js           ← Entrada principal
├── db.js               ← Conexión a MongoDB
├── middleware/
│   └── auth.js         ← Verificación de JWT
├── routes/
│   ├── productos.js    ← CRUD de productos + filtros
│   ├── usuarios.js     ← CRUD de usuarios + login/logout
│   └── ventas.js       ← CRUD de ventas + stock
└── .env                ← Variables de entorno

AW2-client/             ← Frontend
├── index.html          ← Catálogo de productos
├── login.html          ← Inicio de sesión
├── registro.html       ← Registro de usuario
├── carrito.html        ← Carrito y checkout
├── filtrar.html        ← Búsqueda con filtros
├── confirmacion.html   ← Confirmación de compra
├── img/productos/      ← Imágenes del catálogo
└── js/
    ├── utils.js        ← Utilidades compartidas
    ├── index.js        ← Lógica del catálogo
    ├── login.js        ← Lógica de autenticación
    ├── registro.js     ← Lógica de registro
    ├── carrito.js      ← Lógica del carrito y compra
    └── filtrar.js      ← Lógica de filtros
```
