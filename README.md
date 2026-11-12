# Proyecto Capstone: Repuestos RS

## Asignatura / Sección: 2026_2_MA_CAPSTONE_005D
## Grupo: Grupo_8
## Institución: DUOC UC — Sede Maipú

---

##  Descripción del Proyecto
**Repuestos RS** es una plataforma web e-commerce diseñada para la gestión, búsqueda y comercialización de repuestos automotrices. Su propuesta central es simplificar la búsqueda de piezas mediante un selector avanzado y un modelo de compatibilidad vehicular detallado por motorización, permitiendo a los usuarios filtrar por datos del vehículo, patente o número VIN. Además, integra un panel de administración completo con control de inventario (CRUD) y seguridad basada en roles (RBAC).

**Tecnologías principales:**
- **Backend:** Python con Django y Django REST Framework (DRF).
- **Frontend:** Angular (Standalone Components, Reactive Forms).
- **Base de Datos:** SQLite (desarrollo).
- **Autenticación y Seguridad:** Sistema de sesiones de Django y Guards en Angular.

---

##  Estructura del Repositorio
La organización de carpetas y artefactos sigue la estructura definida para la sección `2026_2_MA_CAPSTONE_005D`:

```text
2026_2_MA_CAPSTONE_005D_GRUPO_X/
│
├── Fase 1/
│   ├── Evidencias Grupales/      # Informes, propuestas, actas y entregables
│   └── Evidencias Individuales/  # Bitácoras y evaluaciones individuales
│
├── Fase 2/
│   ├── Evidencias Grupales/      # Informes de avance
│   └── Evidencias Proyecto/
│       ├── Evidencias de documentación/ # Requisitos, diagramas UML, arquitectura, modelo DER
│       └── Evidencias de sistema/       # Código fuente backend (Django) y frontend (Angular)
│
└── Fase 3/
    ├── Evidencias Grupales/      # Informe final y presentación
    └── Evidencias Individuales/  # Evaluaciones finales y bitácoras

```

Ubicación del Código y Documentación

    Código y Artefactos del Sistema: Alojamientos en Fase 2 / Evidencias Proyecto / Evidencias de sistema

    Documentación Técnica y Arquitectura: Alojamientos en Fase 2 / Evidencias Proyecto / Evidencias de documentación


Tecnologías Utilizadas
Frontend

    Framework: Angular (v18+) con componentes Standalone.

    Formularios y Validación: Reactive Forms.

    Estilos: Bootstrap 5, diseño responsivo adaptado a modo oscuro.


Backend

    Framework: Django & Django REST Framework (DRF).

    Librerías de Utilidad: django-cors-headers para la integración con el cliente.

Base de Datos y Persistencia

    Gestor: SQLite (relacional).

    Modelado: Categorías, Subcategorías, Repuestos, Vehículos (con motorización detallada) y Compatibilidad Vehicular.


---

Requisitos e Instalación
Prerrequisitos

    Node.js (v18 o superior) y npm.

    Python (v3.10 o superior).

    Git.

---

Pasos para Ejecutar Localmente

    Clonar el repositorio:

    git clone https://github.com/tu-usuario/2026_2_MA_CAPSTONE_005D_GRUPO_8.git
    cd 2026_2_MA_CAPSTONE_005D_GRUPO_8

    Levantar el Backend (Django):
    Bash

    cd "Fase 2/Evidencias Proyecto/Evidencias de sistema/backend-repuestos"

    pip install -r requirements.txt
    python manage.py migrate
    python manage.py runserver

    Levantar el Frontend (Angular):
    Abre otra terminal, navega a la carpeta del cliente y ejecuta:

    cd "Fase 2/Evidencias Proyecto/Evidencias de sistema/frontend-repuestos"
    npm install
    ng serve












    
