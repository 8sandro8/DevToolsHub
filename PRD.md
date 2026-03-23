# 🎯 Documento de Requisitos del Producto (PRD)
# Proyecto: DevToolsHub

## 1. Visión General
DevToolsHub es una plataforma web para gestionar y explorar herramientas de desarrollo (editores, CLIs, APIs, librerías, etc.). Permite crear un catálogo personal de herramientas con valoraciones, categorías, favoritos y búsqueda avanzada. Funciona desde cualquier navegador moderno como aplicación de escritorio moderna.

## 2. Público Objetivo
- **Desarrolladores individuales** que buscan organizar y valorar sus herramientas de desarrollo
- **Equipos técnicos** que necesitan compartir y estandarizar herramientas en su organización
- **Líderes de tecnología** interesados en evaluar adopción de nuevas tecnologías
- **Estudiantes** de desarrollo de software que exploran herramientas modernas

## 3. Funcionalidades Core (MVP - Producto Mínimo Viable)

### 3.1 Gestión de Herramientas (CRUD Completo)
- [ ] **Crear herramienta:** Formulario para añadir nueva herramienta con nombre, descripción, URL, logo, categoría(s), valoración (1-5 estrellas), marcado como favorito
- [ ] **Listar herramientas:** Vista paginada con tarjetas de herramientas, ordenable por nombre, fecha de creación, valoración, categoría
- [ ] **Ver detalle de herramienta:** Página completa con toda la información, historial de cambios (si aplica en futuras versiones)
- [ ] **Editar herramienta:** Modificación de datos existentes
- [ ] **Eliminar herramienta:** Eliminación lógica (soft-delete) con confirmación

### 3.2 Gestión de Categorías (CRUD Completo)
- [ ] **Crear categoría:** Formulario para añadir nueva categoría con nombre, color, descripción
- [ ] **Listar categorías:** Vista de todas las categorías disponibles
- [ ] **Ver detalle de categoría:** Mostrar herramientas asociadas a la categoría
- [ ] **Editar categoría:** Modificación de datos existentes
- [ ] **Eliminar categoría:** Eliminación con validación de herramientas asociadas

### 3.3 Búsqueda y Filtros Avanzados
- [ ] **Búsqueda global:** Buscar herramientas por nombre, descripción, tecnologías
- [ ] **Filtros avanzados:** Por categoría, valoración mínima, estado de favorito, rango de fechas
- [ ] **Búsqueda en tiempo real:** Actualización dinámica de resultados sin recarga
- [ ] **Ordenamiento:** Por nombre, valoración, fecha (ascendente/descendente)

### 3.4 Funcionalidades de Personalización
- [ ] **Marcar como favorito:** Herramientas favoritas accesibles desde sección dedicada
- [ ] **Valoración personal:** Sistema de estrellas (1-5) para cada herramienta
- [ ] **Notas personales:** Campo para anotaciones personales por herramienta (futura versión)

### 3.5 Página de Detalle de Herramienta
- [ ] **Vista completa:** Toda la información de la herramienta con diseño detallado
- [ ] **Historial de cambios:** Registro de modificaciones (futura versión)
- [ ] **Herramientas relacionadas:** Sugerencias basadas en categoría y valoración

## 4. Funcionalidades Futuras (Para la Fase 2)
- [ ] Dashboard con estadísticas de uso y tendencias
- [ ] Sistema de comentarios y reviews de usuarios
- [ ] Comparador visual de herramientas lado a lado
- [ ] Exportación de informes a PDF/CSV
- [ ] Integración con APIs externas (GitHub, NPM, PyPI) para datos en tiempo real
- [ ] Modo oscuro/tema claro con preferencia guardada
- [ ] PWA para instalación en escritorio y móvil
- [ ] Sistema de etiquetas/tags además de categorías
- [ ] Recomendaciones inteligentes basado en valoraciones similares

## 5. Restricciones o Reglas de Negocio
- **Eliminación lógica:** Las herramientas y categorías eliminadas se marcan como "archivadas", nunca se borran físicamente
- **Validación estricta:** Todos los campos de formulario deben validarse antes de guardar (URLs, formato de valoración, etc.)
- **Responsive design:** La aplicación debe funcionar en móvil, tablet y escritorio
- **Unicidad de categorías:** Los nombres de categoría deben ser únicos (case-insensitive)
- **Valoración limitada:** La valoración debe estar entre 1 y 5 estrellas enteras

## 6. Requisitos Técnicos Extracción - AA2

### 6.1 Lenguajes de Marcas (Frontend)
| Requisito | Descripción |
|-----------|-------------|
| HTML5 semántico | Estructura con header, nav, main, section, article, footer |
| CSS3 moderno | Flexbox, Grid, Custom Properties, animaciones |
| JavaScript vanilla | Interactividad sin frameworks (ES6+) |
| Accesibilidad | WCAG 2.1 - atributos ARIA, contraste, navegación por teclado |
| Responsive | Mobile-first, breakpoints en 768px y 1024px |
| Formularios | Validación nativa y con JavaScript, feedback visual |
| PWA | Service Workers para offline básico, manifest.json |
| Multimedia | Imágenes optimizadas, iconos SVG |

### 6.2 Entornos de Desarrollo (Backend)
| Requisito | Descripción |
|-----------|-------------|
| Node.js + Express | Servidor RESTful con Express.js |
| SQLite | Base de datos local con better-sqlite3 |
| CRUD completo | Create, Read, Update, Delete para todas las entidades |
| Validación | express-validator para sanitización y validación |
| Arquitectura MVC | Separación Controllers, Services, Models, Routes |
| Middleware | Manejo centralizado de errores, logging, CORS |
| Testing | Jest para tests unitarios básicos |

### 6.3 Digitalización (Integración)
| Requisito | Descripción |
|-----------|-------------|
| API GitHub | Búsqueda de repositorios, información de herramientas de código abierto |
| API NPM | Información de paquetes de Node.js (versiones, descargas, mantenimiento) |
| API REST | Endpoints documentados con JSON responses |
| Documentación | README.md con instrucciones de instalación |

## 7. VINCULO CON EL DISEÑO TÉCNICO (SDD)
Este documento define el **qué** y el **por qué**. El archivo `SDD.md` define el **cómo**.

- Cada funcionalidad del MVP (Sección 3) tiene correspondiente entrada en la sección 4 (`Endpoints del API Principal`) y sección 3 (`Modelos de Datos`) del SDD.md
- Las restricciones de negocio (Sección 5) se reflejan en las decisiones arquitectónicas documentadas en la sección 5 del SDD.md
- Antes de marcar una funcionalidad como "completada", verificar su implementación técnica en SDD.md