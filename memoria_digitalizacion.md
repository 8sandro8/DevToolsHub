# Memoria de Digitalización: Estudio comparativo de IDEs con IA y flujo agentic

## 1. Introducción
Los IDEs han pasado de ser editores de texto con autocompletado a entornos capaces de entender tareas complejas. Antes, el editor te ayudaba a escribir la siguiente línea de código; ahora puede leer el contexto de todo tu proyecto, proponer refactorizaciones completas y ejecutar partes del trabajo de forma autónoma. Este salto cambia la forma de programar: ya no solo escribes código, sino que coordinas agentes.

## 2. Análisis comparativo del estado del arte

### VS Code (con GitHub Copilot)
**Fortalezas:** Es el estándar. Muy estable y con una interfaz conocida. Sus funciones de IA destacan por el chat integrado, las sugerencias en línea rápidas y las acciones inteligentes. Es ideal para resolver dudas puntuales o generar bloques de código repetitivo.
**Debilidades:** Su autonomía es limitada. Sigue siendo una herramienta muy reactiva; espera a que el usuario le pida algo. En cambios que afectan a múltiples archivos, pierde el hilo fácilmente.
**Autonomía:** Baja-media.

### Cursor
**Fortalezas:** Está pensado desde cero para trabajar con el contexto de todo el proyecto. Su principal baza es el "Composer", una herramienta brutal para implementar tareas completas y automatizaciones. Tiene una experiencia de edición multiarchivo mucho más fluida que un editor clásico.
**Debilidades:** A veces sus sugerencias son demasiado conservadoras o fallan en la lógica de negocio específica. En proyectos grandes, requiere supervisión constante para no ensuciar el código.
**Autonomía:** Media-alta.

### Windsurf
**Fortalezas:** Se define como un IDE *agentic*. Su punto fuerte es mantener el flujo de trabajo y la continuidad de contexto. Da la sensación de estar trabajando con un agente integrado que entiende qué estás intentando hacer, acelerando mucho la codificación y resolución de bugs.
**Debilidades:** A veces propone cambios demasiado grandes y ambiciosos que no se ajustan a la intención real del desarrollador, obligando a deshacer trabajo.
**Autonomía:** Media-alta.

### Kiro
**Fortalezas:** Destaca por su enfoque estructurado. Es muy potente su uso de "Feature Specs" para pasar directamente de requerimientos técnicos a diseño e implementación. Su sistema de subagentes especializados, skills reutilizables y hooks da mucho control.
**Debilidades:** Es una herramienta menos madura y menos adoptada que las anteriores. Su curva de aprendizaje es mayor debido a su enfoque tan particular basado en flujos supervisados.
**Autonomía:** Media.

### Antigravity
**Fortalezas:** Propone un enfoque *agent-first*. Destaca por su capacidad para que los agentes planifiquen, ejecuten y verifiquen tareas moviéndose entre el editor, la terminal y el navegador. Su gestión de artefactos para documentar el trabajo es excelente.
**Debilidades:** Al ser de Google, estás más atado a su ecosistema. Aunque es muy autónomo, en tareas críticas de arquitectura sigue necesitando validación manual.
**Autonomía:** Alta.

## 3. Caso práctico real: Desarrollo de Frontend con API
Para validar la utilidad real de estas herramientas, he utilizado un flujo de trabajo agentic basado en **Antigravity** integrado con **Gemini**, apoyándome en **OpenCode**, donde un modelo GPT-mini ha actuado como mi orquestador principal.

**La tarea:** Desarrollar un frontend dinámico en JavaScript para consumir una API externa (Actividad de Aprendizaje de Lenguajes de Marcas). El proyecto requería implementar un listado de elementos, un buscador funcional y una vista de detalle, conectando todo a un backend con operaciones CRUD.

**Ejecución y utilidad real:**
En lugar de programar cada archivo de forma aislada, utilicé a mi orquestador (GPT-mini) para analizar los requerimientos. El orquestador dividió el problema y delegó la ejecución a subagentes:
1.  **Home y Buscador:** El agente analizó mi `index.html` y el archivo `app.js`, entendió el contexto y generó el código necesario para hacer el `fetch` a la API, renderizando dinámicamente las tarjetas con el nombre y 3 características de cada elemento. Además, implementó la lógica de filtrado del buscador sin que yo tuviera que escribir la función de cero.
2.  **Contexto multiarchivo:** Lo más destacable fue cómo el sistema mantuvo la coherencia. Al pedirle que creara la vista de detalle, el agente supo exactamente cómo enlazar el ID del elemento desde la Home hacia la nueva ruta, modificando el HTML y el JS de forma simultánea sin romper el código existente.

**Conclusión del caso:** La utilidad de este setup es inmensa. Mientras que VS Code me habría autocompletado un `fetch`, este flujo agentic me permitió implementar "funcionalidades completas" (como el buscador o la vista de detalle) operando sobre varios archivos a la vez.

## 4. Conclusiones finales
Tras el análisis y la prueba práctica, estas son mis conclusiones:
*   Para proyectos pequeños o mantenimiento rápido de código legado, **VS Code con Copilot** sigue siendo la opción más segura.
*   Para desarrollo ágil en proyectos medianos donde tocas muchos componentes, **Cursor** (con su Composer) o **Windsurf** marcan la diferencia.
*   Para un control exhaustivo desde los requisitos hasta el código, **Kiro** es la apuesta más interesante.
*   Para tareas complejas y experimentación con flujos 100% agentic, el stack que he utilizado (**Antigravity + OpenCode**) ofrece una autonomía real sin precedentes en el mercado actual.

Sin embargo, el límite de la IA asistida sigue siendo el mismo: el criterio. Los agentes pueden orquestar, planificar y escribir código muy rápido, pero no entienden la deuda técnica ni las decisiones de negocio a largo plazo. Siguen siendo asistentes avanzados que requieren un desarrollador al mando para revisar, probar y validar cada Pull Request.