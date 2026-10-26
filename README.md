# Lara Inventory — Sistema de Gestión de Inventario para E-commerce

Panel administrativo y API RESTful de gestión de inventario multi-almacén para un e-commerce de artículos electrónicos (celulares, laptops, audífonos, cargadores, periféricos y accesorios). Diseñado con prácticas de arquitectura empresarial, trazabilidad inmutable de stock y control de acceso basado en roles y permisos.

---

## Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Arquitectura y Estructura del Proyecto](#-arquitectura-y-estructura-del-proyecto)
4. [Endpoints de la API (`/api/v1`)](#-endpoints-de-la-api-apiv1)
5. [Modelo de Datos y Reglas de Negocio](#-modelo-de-datos-y-reglas-de-negocio)
6. [Seguridad y Control de Acceso (RBAC)](#-seguridad-y-control-de-acceso-rbac)
7. [Requisitos Previos](#-requisitos-previos)
8. [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
9. [Usuarios de Demostración](#-usuarios-de-demostración)
10. [Pruebas y Calidad de Código](#-pruebas-y-calidad-de-código)
11. [Convenciones de Trabajo](#-convenciones-de-trabajo)

---

## Características Principales

- **Catálogo de productos con variantes:** Gestión jerárquica de categorías, marcas, proveedores, productos e imágenes con variantes por SKU único (color, almacenamiento, atributos en JSONB, precio, costo y stock mínimo).
- **Libro mayor de inventario inmutable (`stock_movements`):** El stock nunca se edita como un número arbitrario; cada entrada, salida, ajuste, devolución o transferencia queda registrada en un libro de solo-agregar protegido a nivel de PostgreSQL mediante triggers.
- **Gestión multi-almacén y órdenes de compra:** Control de stock disponible y reservado por ubicación (`warehouses`), con restricciones `CHECK` en base de datos para impedir saldos negativos y flujo de recepción parcial o total de mercancía (`purchase_orders`).
- **Seguridad por diseño:** Autenticación SPA mediante Laravel Sanctum (cookies HttpOnly + CSRF), limitación de intentos de login por correo e IP (`RateLimiter`), cifrado en reposo para datos sensibles de proveedores (`encrypted` casts), identificadores públicos ULID y cabeceras HTTP de seguridad.
- **Interfaz moderna (SPA React):** Dashboard con KPIs, tablas filtrables, gestión de variantes, modo claro/oscuro y vista previa de permisos por rol (basada en diseño creado en Figma Make).

---

## Stack Tecnológico

| Capa | Tecnología |
|---|---|
| **Backend** | PHP 8.2+ (Runtime 8.5 en Docker Sail), Laravel 12 (API REST `/api/v1`) |
| **Base de Datos** | PostgreSQL 18 (ULIDs, JSONB, `CHECK` constraints, triggers PL/pgSQL) |
| **Caché / Sesiones / Colas** | Redis |
| **Autenticación y Autorización** | Laravel Sanctum (SPA stateful + API tokens), `spatie/laravel-permission` |
| **Auditoría** | `spatie/laravel-activitylog` |
| **Frontend** | React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4, `lucide-react` |
| **Testing y Calidad** | Pest 3, PHPUnit, Larastan (PHPStan), Laravel Pint |
| **Infraestructura Local** | Docker & Docker Compose (Laravel Sail + Mailpit) |

---

## Arquitectura y Estructura del Proyecto

```text
Lara_E-commerce/
├── backend/                  # API REST en Laravel 12
│   ├── app/
│   │   ├── Enums/            # Enums de dominio (RoleName, MovementType, ProductStatus, etc.)
│   │   ├── Http/
│   │   │   ├── Controllers/Api/V1/
│   │   │   ├── Middleware/   # SecurityHeaders y middlewares de API
│   │   │   ├── Requests/     # Validación con Form Requests
│   │   │   └── Resources/    # Serialización segura con API Resources
│   │   └── Models/           # Modelos Eloquent con ULIDs y relaciones
│   ├── database/
│   │   ├── migrations/       # Esquema PostgreSQL, constraints y triggers
│   │   └── seeders/          # Roles, permisos y usuarios de demostración
│   ├── tests/Feature/        # Suite de pruebas de integración con Pest
│   └── compose.yaml          # Servicios Docker (laravel.test, pgsql, redis, mailpit)
├── frontend/                 # Aplicación SPA en React 19 + Vite + Tailwind CSS v4
│   ├── src/                  # Componentes, cliente API tipado y vistas conectadas a PostgreSQL
│   └── vite.config.ts        # Proxy de desarrollo hacia http://127.0.0.1:8000
└── README.md                 # Documentación general del proyecto
```

---

## Endpoints de la API (`/api/v1`)

| Módulo | Método y Ruta | Descripción | Permiso Requerido |
|---|---|---|---|
| **Auth** | `POST /api/v1/auth/login` | Inicio de sesión SPA con cookie `HttpOnly` + CSRF (`throttle:login`) | Público |
| **Auth** | `GET /api/v1/auth/me` | Perfil activo con roles y permisos efectivos | Autenticado |
| **Auth** | `POST /api/v1/auth/logout` | Cierre e invalidación de sesión | Autenticado |
| **Dashboard** | `GET /api/v1/dashboard` | KPIs en vivo, alertas de stock bajo y últimos movimientos | Autenticado |
| **Búsqueda** | `GET /api/v1/search?q=...` | Búsqueda global (`⌘K`) de productos, SKUs, almacenes y órdenes | Autenticado |
| **Productos** | `GET / POST /api/v1/products` | Listado filtrable y creación transaccional con variantes y stock inicial | `products.view` / `products.create` |
| **Productos** | `GET /api/v1/products/{id}` | Detalle de producto, variantes por almacén y kardex del producto | `products.view` |
| **Catálogo** | `GET / POST /api/v1/categories` | Árbol jerárquico de categorías | `categories.view` / `categories.create` |
| **Catálogo** | `GET / POST /api/v1/brands` | Fabricantes y marcas registradas | `brands.view` / `brands.create` |
| **Proveedores** | `GET / POST /api/v1/suppliers` | Proveedores con datos fiscales/contacto cifrados (`encrypted`) | `suppliers.view` / `suppliers.create` |
| **Almacenes** | `GET / POST / PATCH /api/v1/warehouses` | Gestión multi-almacén y existencias por ubicación | `warehouses.view` / `create` / `update` |
| **Inventario** | `GET / POST /api/v1/stock-movements` | Entradas, salidas, ajustes, devoluciones y transferencias atómicas | `stock.view` / `stock.move` / `stock.adjust` |
| **Compras** | `GET / POST /api/v1/purchase-orders` | Emisión y seguimiento de órdenes de compra a proveedores | `purchase-orders.view` / `create` |
| **Compras** | `POST /api/v1/purchase-orders/{id}/receive` | Recepción parcial o total con ingreso automático de stock | `purchase-orders.receive` |
| **Reportes** | `GET /api/v1/reports` | Valorización financiera a costo y venta por almacén y categoría | `reports.view` |
| **Reportes** | `GET /api/v1/reports/export` | Exportación CSV/Excel (UTF-8 BOM) del inventario valorizado | `reports.export` |
| **Usuarios** | `GET / POST / PATCH /api/v1/users` | Gestión de usuarios, activación y asignación de roles Spatie | `users.view` / `users.manage` |
| **Auditoría** | `GET /api/v1/audit-logs` | Bitácora en tiempo real desde `activity_log` | `audit.view` |

---

## Modelo de Datos y Reglas de Negocio

- **Claves primarias ULID:** Todas las entidades de negocio (`categories`, `brands`, `suppliers`, `products`, `product_variants`, `warehouses`, `stocks`, `stock_movements`, `purchase_orders`) usan ULIDs ordenables lexicográficamente para evitar la enumeración secuencial de recursos.
- **Inmutabilidad de movimientos:** La tabla `stock_movements` cuenta con el trigger `stock_movements_append_only` en PostgreSQL que bloquea cualquier intento de `UPDATE` o `DELETE`, garantizando trazabilidad histórica completa.
- **Integridad de saldos:** La tabla `stocks` aplica las restricciones `stocks_quantity_non_negative` (`quantity >= 0`) y `stocks_reserved_valid` (`reserved >= 0 AND reserved <= quantity`) directamente en el motor de base de datos.
- **Protección de datos sensibles (PII):** Los campos `tax_id`, `contact_email` y `contact_phone` de los proveedores se almacenan cifrados en reposo mediante el cast `encrypted` de Laravel.

---

## Seguridad y Control de Acceso (RBAC)

El sistema implementa cinco roles principales mediante `spatie/laravel-permission`:

| Rol | Descripción y Alcance |
|---|---|
| `super_admin` | Acceso total al sistema (`Gate::before`), gestión de usuarios, roles y auditoría. |
| `admin` | Gestión completa de catálogo, inventario, almacenes, compras y reportes (sin gestión de usuarios). |
| `inventory_manager` | Lectura de catálogo, registro de movimientos y ajustes de stock, órdenes de compra y recepción de mercancía. |
| `sales` | Acceso de **solo lectura** a catálogo, existencias, almacenes, órdenes y reportes. |
| `api_client` | Lectura acotada (`products.view`, `stock.view`) para integraciones con el storefront del e-commerce. |

---

## Requisitos Previos

- **Docker Desktop** (con Docker Compose v2+)
- **Node.js 22+** y **npm**
- **Git**
- *(Opcional en máquina anfitriona)* PHP 8.2+ y Composer 2

---

## Instalación y Puesta en Marcha

### 1. Clonar el repositorio

```bash
git clone https://github.com/OmarArroba/Lara_E-commerce.git
cd Lara_E-commerce
```

### 2. Levantar el Backend (Laravel + PostgreSQL + Redis + Mailpit)

```bash
cd backend
cp .env.example .env
docker compose up -d
```

Ejecutar migraciones y poblar roles, permisos y usuarios de prueba:

```bash
docker compose exec laravel.test php artisan key:generate
docker compose exec laravel.test php artisan migrate:fresh --seed
```

- **API Backend:** `http://localhost:8000`
- **Healthcheck:** `http://localhost:8000/up`
- **Mailpit (bandeja de correos local):** `http://localhost:8025`

### 3. Levantar el Frontend (React + Vite)

En una nueva terminal:

```bash
cd frontend
npm install
npm run dev
```

- **Aplicación Web (SPA):** `http://localhost:5173` *(el servidor de Vite redirige automáticamente `/api` y `/sanctum` hacia `http://localhost:8000`)*.

---

## Usuarios de Demostración

El seeder crea automáticamente los siguientes usuarios en entornos locales/desarrollo (nunca en producción):

| Nombre | Correo | Contraseña | Rol |
|---|---|---|---|
| Ana Martínez | `admin@lara.test` | `password` | `super_admin` |
| Carlos Ruiz | `inventory@lara.test` | `password` | `inventory_manager` |
| María López | `sales@lara.test` | `password` | `sales` |

---

## Pruebas y Calidad de Código

Ejecutar la suite de pruebas automatizadas con **Pest** (sobre la base de datos PostgreSQL `testing` en Docker):

```bash
cd backend
docker compose exec laravel.test ./vendor/bin/pest
```

Formatear código PHP con **Laravel Pint**:

```bash
cd backend
./vendor/bin/pint
```

Verificar tipos y compilar el frontend:

```bash
cd frontend
npm run build
```

---

## Convenciones de Trabajo

- **Commits:** Se sigue el estándar [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/) (`feat`, `fix`, `docs`, `refactor`, `test`, `chore`).
- **Arquitectura Backend:** Controladores delgados (`Controller` → `FormRequest` → `Action/Service` → `Model` → `JsonResource`), modelos en modo estricto fuera de producción y pruebas automatizadas con Pest.
