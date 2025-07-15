# Sistema de Gestión Hospitalaria - Sanatorio la Trinidad

Sistema completo de gestión hospitalaria con frontend React y backend Node.js + MySQL.

## 🚀 Características

- **Gestión de Personal**: Médicos, enfermeras, administrativos, recepcionistas y call center
- **Sistema de Citas**: Reserva y gestión de turnos médicos
- **Recordatorios**: Sistema de notificaciones y tareas pendientes
- **Blog/Anuncios**: Comunicaciones internas y noticias
- **Calendario Compartido**: Eventos y actividades del equipo
- **Tutoriales**: Guías y procedimientos internos
- **Autenticación**: Sistema de usuarios con roles

## 📋 Requisitos Previos

- **Node.js** (v18 o superior)
- **MySQL** (v8.0 o superior)
- **npm** o **yarn**

## 🛠️ Instalación

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd hospital-management-system
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la base de datos

#### Opción A: Configuración automática
```bash
# Crear base de datos y tablas
npm run db:migrate

# Insertar datos de ejemplo
npm run db:seed
```

#### Opción B: Configuración manual
1. Crear base de datos en MySQL:
```sql
CREATE DATABASE hospital_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Ejecutar scripts de migración:
```bash
npm run db:migrate
npm run db:seed
```

### 4. Configurar variables de entorno

El archivo `.env` ya está configurado con los valores por defecto:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=12345
DB_PORT=3306
DB_NAME=hospital_management
```

Si necesitas cambiar algún valor, edita el archivo `.env`.

### 5. Iniciar la aplicación
```bash
# Desarrollo (frontend + backend)
npm run dev

# Solo backend
npm run dev:server

# Solo frontend
npm run dev:client
```

## 🔐 Credenciales por Defecto

Después de ejecutar `npm run db:seed`:

- **Email**: admin@sanatoriolatrinidad.com
- **Password**: admin123
- **Rol**: Administrador

## 📁 Estructura del Proyecto

```
hospital-management-system/
├── src/                    # Frontend React
│   ├── components/         # Componentes React
│   ├── hooks/             # Custom hooks
│   ├── services/          # API services
│   ├── types/             # TypeScript types
│   └── utils/             # Utilidades
├── server/                # Backend Node.js
│   ├── config/            # Configuración DB
│   ├── routes/            # Rutas API
│   ├── scripts/           # Scripts de migración
│   └── uploads/           # Archivos subidos
├── .env                   # Variables de entorno
└── package.json
```

## 🌐 Endpoints de la API

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario

### Personal
- `GET /api/staff` - Listar personal
- `POST /api/staff` - Crear personal
- `PUT /api/staff/:id` - Actualizar personal
- `DELETE /api/staff/:id` - Eliminar personal

### Citas
- `GET /api/appointments` - Listar citas
- `POST /api/appointments` - Crear cita
- `PUT /api/appointments/:id` - Actualizar cita
- `DELETE /api/appointments/:id` - Eliminar cita

### Recordatorios
- `GET /api/reminders` - Listar recordatorios
- `POST /api/reminders` - Crear recordatorio
- `PATCH /api/reminders/:id/complete` - Completar recordatorio

### Blog/Anuncios
- `GET /api/blog` - Listar anuncios
- `POST /api/blog` - Crear anuncio
- `PUT /api/blog/:id` - Actualizar anuncio

### Calendario
- `GET /api/calendar` - Listar eventos
- `POST /api/calendar` - Crear evento
- `PUT /api/calendar/:id` - Actualizar evento

### Tutoriales
- `GET /api/tutorials` - Listar tutoriales
- `POST /api/tutorials` - Crear tutorial
- `PUT /api/tutorials/:id` - Actualizar tutorial

## 🗄️ Esquema de Base de Datos

### Tablas principales:
- `users` - Usuarios del sistema
- `staff` - Personal médico y administrativo
- `patients` - Pacientes
- `appointments` - Citas médicas
- `reminders` - Recordatorios y tareas
- `blog_posts` - Anuncios y comunicados
- `calendar_events` - Eventos del calendario
- `tutorials` - Tutoriales y guías

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Frontend + Backend
npm run dev:client       # Solo frontend
npm run dev:server       # Solo backend

# Base de datos
npm run db:migrate       # Crear tablas
npm run db:seed          # Insertar datos de ejemplo

# Producción
npm run build           # Construir frontend
npm run server          # Ejecutar servidor
```

## 🚀 Despliegue en Producción

### 1. Configurar variables de entorno
```env
NODE_ENV=production
DB_HOST=tu-servidor-mysql
DB_USER=tu-usuario
DB_PASSWORD=tu-password
JWT_SECRET=tu-clave-secreta-muy-segura
```

### 2. Construir la aplicación
```bash
npm run build
```

### 3. Ejecutar en producción
```bash
npm run server
```

## 🛡️ Seguridad

- Autenticación JWT
- Validación de datos en backend
- Sanitización de inputs
- Protección contra SQL injection
- CORS configurado

## 📝 Notas Importantes

1. **Backup de datos**: Realiza backups regulares de la base de datos
2. **Seguridad**: Cambia las credenciales por defecto en producción
3. **SSL**: Usa HTTPS en producción
4. **Logs**: Configura logging apropiado para producción

## 🐛 Solución de Problemas

### Error de conexión a MySQL
```bash
# Verificar que MySQL esté ejecutándose
sudo systemctl status mysql

# Verificar credenciales en .env
cat .env
```

### Error de permisos
```bash
# Dar permisos al usuario de MySQL
GRANT ALL PRIVILEGES ON hospital_management.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### Puerto ocupado
```bash
# Cambiar puerto en .env
PORT=3002
```

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.

---

**Desarrollado para Sanatorio la Trinidad** 🏥