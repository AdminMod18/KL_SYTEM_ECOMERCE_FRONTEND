# Estado del proyecto — Marketplace KL System

**Última actualización:** 27 de abril de 2026  

Este documento resume el avance del **frontend** (este repositorio) y del **backend** (microservicios en `..\KL_SYTEM_ECOMERCE`). Las rutas API citadas asumen un único origen base configurado en el cliente (p. ej. API Gateway o proxy); cada servicio puede exponer su propio puerto en desarrollo.

---

## Frontend (este repositorio)

| Área | Estado | Notas |
|------|--------|--------|
| **Stack** | Listo | Vite 5, React, React Router, Tailwind CSS, Axios |
| **Diseño UI** | Avanzado | Sistema tipo prototipo Figma “Market”: modo claro, tokens (`src/styles/tokens.js`), navbar/footer storefront, login/registro alineados al mismo diseño |
| **Home** | Listo | Hero, categorías, destacados, bloque confianza con iconos |
| **Catálogo** | Listo | Listado, filtros laterales, tarjetas de producto con categoría |
| **Detalle producto** | Listo | Ruta `/product/:id` |
| **Carrito** | Listo | Contexto React, líneas con categoría cuando existe |
| **Checkout** | Integrado | POST a `/orden` con líneas del carrito |
| **Login / Registro** | Integrado | `POST /auth/login`, `POST /usuarios`; JWT en `localStorage` |
| **Panel vendedor** (`/seller`) | UI mock | Datos estáticos; mensaje indica conectar APIs cuando estén listas |
| **Mis pedidos / cuenta** | No implementado | No hay rutas equivalentes al prototipo “Mis pedidos” aún |

### Integración API actual (`src/api/apiClient.js` + `src/services/*`)

| Operación | Endpoint usado | Observación |
|-----------|----------------|-------------|
| Listar productos | `GET /productos` | Errores mostrados en UI; sin datos mock |
| Login | `POST /auth/login` | Guarda `accessToken` y `roles` |
| Registro usuario | `POST /usuarios` | Redirige a login |
| Crear orden | `POST /orden` | Tras checkout |

**Configuración:** variable de entorno `VITE_API_URL` apunta a la base del API (gateway o servicio único).

---

## Backend (`..\KL_SYTEM_ECOMERCE` — microservicios Spring Boot)

Todos los servicios listados tienen **Gradle**, **`Dockerfile`** y controladores REST documentados con OpenAPI donde aplica.

| Servicio | Estado funcional (API) | Rutas / responsabilidad principal |
|----------|-------------------------|-----------------------------------|
| **auth-service** | Implementado | `POST /auth/login`, `GET /auth/roles` — JWT y roles |
| **user-service** | Implementado | `POST/GET … /usuarios` — altas y consulta de usuarios |
| **product-service** | Implementado | `GET /productos`, `POST /productos` — catálogo |
| **order-service** | Implementado | `POST /orden` — creación de órdenes |
| **payment-service** | Implementado | API de pagos (controlador REST presente) |
| **solicitud-service** | Implementado | `/solicitudes` — gestión de solicitudes |
| **validation-service** | Implementado | Validaciones + mock interno Datacrédito |
| **config-service** | Implementado | `/singleton` — metadatos singleton |
| **notification-service** | Implementado | API de notificaciones |
| **analytics-service** | Implementado | API de analítica |

### Infraestructura y operaciones

| Tema | Estado |
|------|--------|
| Docker por servicio | Presente (`Dockerfile` en cada servicio) |
| `docker-compose` en raíz del backend | No localizado en el árbol revisado — despliegue local puede ser manual por servicio |
| API Gateway unificado | No documentado aquí — este frontend asume una **base URL única** (`VITE_API_URL`) |
| README raíz del backend | No presente al momento de esta revisión |

### Coherencia front ↔ back

- Los endpoints que consume el SPA (`/productos`, `/auth/login`, `/usuarios`, `/orden`) tienen contraparte en **product**, **auth**, **user** y **order** services.
- En entorno real suele hacer falta un **gateway** o proxy que enrute `/productos`, `/auth`, `/usuarios`, `/orden` al servicio correcto, o bien variables por recurso.

---

## Próximos pasos sugeridos

1. **Frontend:** Pantalla “Mis pedidos” / área de cuenta si el backend expone listado de órdenes por cliente; conectar panel vendedor a APIs reales de inventario y ventas.
2. **Backend:** Documentar en README arranque local, puertos y opciones de gateway; añadir `docker-compose` si se desea levantar todo el stack con un comando.
3. **Integración:** Validar CORS y rutas tras desplegar gateway; pruebas end-to-end login → catálogo → checkout → orden.

---

*Documento generado para seguimiento interno; actualizar al cerrar hitos relevantes.*
