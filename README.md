# TechStore API — Backend

API REST para un e-commerce de productos de tecnología. Permite gestionar productos, usuarios y ventas con autenticación stateful basada en JWT almacenado en cookie HttpOnly. Desarrollada como trabajo práctico para la materia Aplicaciones Web 2.

- **Deploy API:** https://techstore-api-326a.onrender.com
- **Deploy frontend:** https://aw-2-client.vercel.app
- **Repositorio frontend:** https://github.com/Thiago28G/AW2-client

---

## Tecnologías

| Tecnología | Uso |
|---|---|
| Node.js + Express | Servidor HTTP y definición de rutas |
| MongoDB Atlas | Base de datos NoSQL en la nube |
| Mongoose | ODM para modelar esquemas y validaciones |
| JSON Web Token (JWT) | Generación y verificación de tokens de autenticación |
| bcrypt | Hasheo de contraseñas antes de persistirlas |
| cookie-parser | Lectura de cookies en las requests |
| CORS | Control de orígenes permitidos para el frontend |
| dotenv | Carga de variables de entorno desde `.env` |

---

## Arquitectura

```
AW2TP222/
├── config/
│   └── db.js               # Conexión a MongoDB con Mongoose
├── models/
│   ├── Usuario.js           # Schema de usuario con hook de hasheo
│   ├── Producto.js          # Schema de producto con validaciones y enum de categorías
│   └── Venta.js             # Schema de venta con subdocumentos de ítems
├── controllers/
│   ├── usuarios.controller.js
│   ├── productos.controller.js
│   └── ventas.controller.js  # Lógica de negocio: stock, precio servidor, populate
├── routes/
│   ├── usuarios.routes.js
│   ├── productos.routes.js
│   └── ventas.routes.js     # Solo declaran ruta + middlewares + controller
├── middleware/
│   ├── auth.js              # verificarToken y verificarAdmin
│   ├── validarObjectId.js   # Valida formato de :id antes de llegar al controller
│   └── errorHandler.js      # notFound (404) y errorHandler centralizado (4 params)
├── utils/
│   ├── ApiError.js          # Clase de error con statusCode
│   └── asyncHandler.js      # Wrapper para eliminar try/catch en controllers
├── seed/
│   ├── seed.js              # Script de población inicial de la base
│   └── productos-original.json
├── .env.example
├── package.json
└── server.js                # Entry point: middlewares globales, rutas, arranque
```

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone https://github.com/Thiago28G/AW2Back.git
cd AW2Back

# 2. Instalar dependencias
npm install

# 3. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con los valores correspondientes

# 4. Poblar la base de datos con datos iniciales
npm run seed

# 5. Iniciar el servidor
npm start
```

---

## Variables de entorno

El archivo `.env` **no se versiona**. Hay un `.env.example` con las claves necesarias (sin valores).

| Variable | Descripción | Ejemplo |
|---|---|---|
| `MONGO_URI` | URI de conexión a MongoDB Atlas | `mongodb+srv://user:pass@cluster.mongodb.net/techstore` |
| `JWT_SECRET` | Clave secreta para firmar los tokens JWT | `mi_clave_super_secreta` |
| `PORT` | Puerto en que escucha el servidor | `3000` |
| `NODE_ENV` | Entorno de ejecución | `development` / `production` |
| `FRONTEND_URL` | URL del frontend en producción (para CORS) | `https://aw-2-client.vercel.app` |

---

## Endpoints

### Usuarios — `/api/usuarios`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/api/usuarios/registro` | Público | Registra un nuevo usuario |
| POST | `/api/usuarios/login` | Público | Autentica y devuelve cookie con JWT |
| POST | `/api/usuarios/logout` | Público | Elimina la cookie de sesión |
| GET | `/api/usuarios/perfil` | Autenticado | Devuelve los datos del usuario logueado |
| GET | `/api/usuarios` | Admin | Lista todos los usuarios |
| GET | `/api/usuarios/:id` | Admin | Obtiene un usuario por ID |
| PUT | `/api/usuarios/:id` | Autenticado | Actualiza el propio perfil (admin puede editar cualquiera) |
| DELETE | `/api/usuarios/:id` | Admin | Elimina un usuario (falla si tiene ventas) |

### Productos — `/api/productos`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/productos` | Público | Lista todos los productos |
| POST | `/api/productos/filtrar` | Público | Filtra por categoría, precio y/o disponibilidad |
| GET | `/api/productos/:id` | Público | Obtiene un producto por ID |
| POST | `/api/productos` | Admin | Crea un nuevo producto |
| PUT | `/api/productos/:id` | Admin | Actualiza un producto |
| DELETE | `/api/productos/:id` | Admin | Elimina un producto (falla si está en alguna venta) |

### Ventas — `/api/ventas`

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/api/ventas/mis-ventas` | Autenticado | Lista las ventas del usuario logueado |
| GET | `/api/ventas` | Admin | Lista todas las ventas |
| GET | `/api/ventas/:id` | Autenticado | Obtiene una venta (solo propia o admin) |
| POST | `/api/ventas` | Autenticado | Crea una venta (descuenta stock automáticamente) |
| PUT | `/api/ventas/:id` | Admin | Actualiza el estado de una venta |
| DELETE | `/api/ventas/:id` | Admin | Elimina una venta (repone el stock) |

---

## Modelo de datos

### Usuario
| Campo | Tipo | Detalles |
|---|---|---|
| `nombre` | String | Requerido, mínimo 2 caracteres |
| `email` | String | Requerido, único, formato válido |
| `password` | String | Requerido, mínimo 6 caracteres, excluido de queries por defecto |
| `rol` | String | `'usuario'` (default) / `'admin'` |
| `activo` | Boolean | Default `true`. Si es `false`, no puede loguearse |

### Producto
| Campo | Tipo | Detalles |
|---|---|---|
| `nombre` | String | Requerido, mínimo 3 caracteres |
| `descripcion` | String | Default `''` |
| `categoria` | String | Requerido, enum: `Computadoras`, `Periféricos`, `Monitores`, `Audio`, `Almacenamiento` |
| `precio` | Number | Requerido, mínimo 0 |
| `stock` | Number | Requerido, mínimo 0, default 0 |
| `disponible` | Boolean | Default `true` |
| `imagen` | String | Default `''` |
| `destacado` | Boolean | Default `false` |

### Venta
| Campo | Tipo | Detalles |
|---|---|---|
| `usuario` | ObjectId | Ref → Usuario. Requerido |
| `productos` | Array | Subdocumentos con `producto` (ref → Producto), `cantidad` y `precioUnitario` |
| `total` | Number | Calculado en el servidor con el precio real de la base |
| `estado` | String | Enum: `pendiente`, `pagada`, `enviada`, `cancelada`. Default `pendiente` |

**Relaciones:** Venta → Usuario (N:1) y Venta → Producto (N:M via subdocumento). Se resuelven con `.populate()`.

---

## Manejo de errores

Todos los errores pasan por el middleware `errorHandler` y devuelven siempre el mismo formato:
```json
{ "mensaje": "Descripción del error", "detalle": "..." }
```

| Código | Cuándo se devuelve |
|---|---|
| 400 | Body inválido, parámetro con mal formato, error de validación de Mongoose |
| 401 | Sin token, token inválido o expirado |
| 403 | Token válido pero sin permisos suficientes, cuenta inactiva |
| 404 | Recurso no encontrado, ruta inexistente |
| 409 | Email duplicado, intento de eliminar entidad con dependencias, stock insuficiente |
| 500 | Error interno no contemplado (en producción no expone el mensaje original) |

---

## Credenciales de demo

La base se puede resetear en cualquier momento con `npm run seed`.

| Email | Contraseña | Rol |
|---|---|---|
| admin@techstore.com | Admin1234 | admin |
| lucas@techstore.com | Lucas1234 | usuario |
| ana@techstore.com | Ana12345 | usuario |

> Estos datos son de demostración. No usar contraseñas similares en producción.

---

## Nota sobre cold start en Render

El plan gratuito de Render suspende el servidor después de 15 minutos de inactividad. La primera request tras ese período puede tardar hasta 60 segundos mientras el servidor vuelve a levantarse. Las siguientes requests son inmediatas.
