# 📦 Proyecto: Sistema de Gestión Logística con Microservicios

Repositorio oficial del equipo **Neo-Team** para el proyecto de Ingeniería de Software 2 (2025).  
Este sistema implementa una arquitectura de microservicios orientada a la gestión logística con geolocalización, roles y notificaciones.

---

## 🚀 Sprint Actual

**Sprint 2: Gestión de Inventario y Pedidos**  
📆 _Duración:_ 1 semana

### ✅ Entregables:
1. Microservicio de gestión de inventario
2. Microservicio de gestión de pedidos
3. Funcionalidad de cargue masivo de inventario
4. Interfaz para gestión de inventario y pedidos
5. Notificaciones automatizadas (mensajes de texto)
6. Pruebas unitarias con Jest

### 📋 Criterios de aceptación:
- Carga masiva de al menos **10,000 productos** en menos de **5 minutos**
- Interfaces **responsivas** y compatibles con múltiples navegadores
- Notificaciones enviadas correctamente bajo condiciones predefinidas

---

## 👥 Normas del Equipo - Neo-Team

### 🧭 Reuniones y responsabilidades

- 🚨 Si no puedes asistir a una reunión o avanzar en tareas, **debes notificarlo al grupo** inmediatamente.
- El incumplimiento sin justificación será gestionado por decisión grupal.

### 📅 Ritmo Scrum

- ✅ **Daily**: Entre **11:00 p.m. y 11:00 a.m.** (Obligatorio)
- 🔄 **Retrospectiva**: Todos los **domingos a las 6:00 p.m.** (Obligatorio)

---

## ✅ Convención de Commits

Usamos el estándar **[Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)** adaptado al contexto Scrum.

```bash
<type>(<scope>): <short description>

type → tipo de cambio

scope → módulo afectado (ej: auth, roles, frontend, docker, inventory, orders, ci, etc.)

description → breve, en inglés, empieza en minúscula

## Type's mas usados
| Type       | Significado                                         |
| ---------- | --------------------------------------------------- |
| `feat`     | Nueva funcionalidad                                 |
| `fix`      | Corrección de bug o error                           |
| `docs`     | Cambios en documentación (`README`, Swagger, etc.)  |
| `style`    | Cambios de formato, indentación, sin alterar lógica |
| `refactor` | Refactorización sin cambiar funcionalidad           |
| `test`     | Añadir o modificar pruebas                          |
| `chore`    | Tareas menores como actualizaciones de dependencias |
| `ci`       | Cambios en la configuración de CI/CD                |
| `build`    | Cambios en el sistema de construcción o Docker      |

### Ejemplos:

feat(auth): add JWT token validation middleware
fix(roles): correct permission ID check logic
docs(api): update Swagger docs for /users endpoint
refactor(inventory): simplify product upload controller
test(orders): add unit test for order cancellation
chore(repo): update .gitignore to exclude .env files
ci(github): add GitHub Actions workflow for auth service
build(docker): add docker-compose for api gateway and auth

🗂️ Recursos del Proyecto

📐 Diagrama de Arquitectura

https://app.diagrams.net/#G1G79isVyWQXvmhJJ6jbb8WSRpSjw2HHyV#%7B%22pageId%22%3A%22LaZ66z_ETBU0VZ9eVKLd%22%7D


🗃️ Diagrama Entidad-Relación (BD)

https://app.diagrams.net/#G1ESQZYB6EA1VXCe2OzMjLZ-ymgNsFdrF-#%7B%22pageId%22%3A%22kYCpbzfKXXeAPK9tlQGw%22%7D

🎨 Prototipo Figma

https://www.figma.com/design/YzfoSf4PwWseI34STXT7qD/Prototipos?node-id=0-1&p=f&t=gNCu6g67EmXuZ8N9-0