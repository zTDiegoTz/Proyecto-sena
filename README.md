# Estación de Gasolina - Sistema de Gestión

## 📋 Descripción

Aplicación web completa para la gestión de una estación de gasolina con 6 surtidores, cada uno ofreciendo tres tipos de combustible: Extra, Corriente y ACPM (Diesel). El sistema incluye control de inventario, registro de ventas, gestión de usuarios con roles, control de turnos, reportes y estadísticas en tiempo real.

## ✨ Características Principales

### 🚗 Gestión de Surtidores
- **6 surtidores** con estado en tiempo real
- **3 tipos de combustible** por surtidor: Extra, Corriente, ACPM
- Control de estado: Disponible, Ocupado, Mantenimiento
- Inicio y finalización de ventas
- Monitoreo de stock por surtidor

### 💰 Sistema de Ventas Mejorado
- **Registro completo** con todos los campos solicitados:
  - Surtidor específico
  - Tipo de combustible
  - Cantidad vendida (galones)
  - Precio unitario
  - Valor total
  - Fecha y hora exacta
  - Bombero responsable
- Cálculo automático de totales
- Validación de stock disponible
- Historial completo con filtros avanzados

### 👥 Sistema de Usuarios y Roles
- **3 niveles de acceso**:
  - **Super Admin**: Acceso total, gestión de usuarios y reportes
  - **Administrador**: Gestión de surtidores, ventas y turnos
  - **Bombero**: Solo puede registrar ventas y gestionar su turno
- Autenticación segura
- Control de permisos por funcionalidad
- Gestión completa de usuarios

### ⏰ Control de Turnos
- **Registro de entrada y salida** de cada bombero
- Control de turnos activos
- Historial de turnos con duración
- Filtros por bombero y estado
- Estadísticas de turnos del día

### 📊 Inventario y Control
- Gestión de stock por tipo de combustible
- Configuración de precios globales
- Alertas de stock bajo
- Edición individual de stock por surtidor

### 📈 Reportes y Estadísticas
- Dashboard con métricas en tiempo real
- Ventas del día, semana y mes
- Análisis por tipo de combustible
- Gráficos de rendimiento por surtidor
- Exportación de datos

### 🎨 Interfaz Moderna
- Diseño responsive con Tailwind CSS
- Navegación intuitiva
- Componentes reutilizables
- Tema personalizado con colores profesionales

## 🛠️ Tecnologías Utilizadas

- **React 18** - Biblioteca de interfaz de usuario
- **JavaScript (ES6+)** - Lenguaje de programación
- **Tailwind CSS** - Framework de estilos
- **React Router** - Navegación entre páginas
- **Context API** - Gestión de estado global
- **Vite** - Herramienta de construcción
- **LocalStorage** - Persistencia de datos
- **Lucide React** - Iconos modernos
- **Recharts** - Gráficos y visualizaciones

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js (versión 16 o superior)
- npm o yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd estacion-gasolina
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar políticas de ejecución (Windows)**
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

4. **Ejecutar en modo desarrollo**
   ```bash
   npm run dev
   ```

5. **Abrir en el navegador**
   ```
   http://localhost:3000
   ```

### Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construcción para producción
- `npm run preview` - Vista previa de la construcción

## 📁 Estructura del Proyecto

```
estacion-gasolina/
├── public/
├── src/
│   ├── components/
│   │   ├── Sidebar.jsx
│   │   └── Login.jsx
│   ├── context/
│   │   └── GasStationContext.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Surtidores.jsx
│   │   ├── Ventas.jsx
│   │   ├── Turnos.jsx
│   │   ├── Inventario.jsx
│   │   ├── Usuarios.jsx
│   │   └── Reportes.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎯 Funcionalidades Principales

### 🔐 Sistema de Autenticación
- **Login seguro** con validación de credenciales
- **Protección de rutas** basada en roles
- **Sesiones persistentes** con LocalStorage
- **Logout automático** al cerrar sesión

### Dashboard
- Resumen de ventas del día
- Ingresos totales
- Surtidores activos
- Últimas transacciones
- Estadísticas por tipo de combustible

### Gestión de Surtidores
- Vista de estado de los 6 surtidores
- Inicio de venta con selección de combustible
- Finalización de venta con cantidad y precio
- Cambio de estado (Disponible/Ocupado/Mantenimiento)
- Monitoreo de stock en tiempo real

### Registro de Ventas Mejorado
- **Campos completos**:
  - Surtidor y nombre del surtidor
  - Tipo de combustible (Extra, Corriente, ACPM)
  - Cantidad vendida en galones
  - Precio unitario
  - Valor total calculado
  - Fecha y hora exacta
  - Bombero responsable de la venta
- Historial completo de transacciones
- Filtros avanzados por:
  - Surtidor específico
  - Tipo de combustible
  - Rango de fechas
  - Bombero responsable
- Estadísticas de ventas filtradas
- Resumen por tipo de combustible

### Control de Turnos
- **Inicio y fin de turnos** para cada bombero
- **Control de turnos activos** en tiempo real
- **Cálculo automático** de duración de turnos
- **Filtros por**:
  - Bombero específico
  - Estado del turno (activo/completado)
  - Fecha
- **Estadísticas del día**:
  - Turnos activos
  - Turnos completados
  - Total de turnos

### Gestión de Usuarios
- **Creación y edición** de usuarios
- **Asignación de roles**:
  - Super Admin
  - Administrador
  - Bombero
- **Control de estado** (activo/inactivo)
- **Gestión de permisos** por funcionalidad

### Control de Inventario
- Gestión de stock por tipo de combustible
- Configuración de precios globales
- Edición individual de stock por surtidor
- Alertas de stock bajo
- Resumen de ventas por combustible

### Reportes y Análisis
- Selección de períodos (Hoy, Ayer, Última semana, etc.)
- Métricas clave de rendimiento
- Gráficos de ventas por combustible
- Análisis por surtidor
- Tablas detalladas de transacciones

## 🔐 Sistema de Roles y Permisos

### Super Administrador
- **Acceso total** a todas las funcionalidades
- **Gestión de usuarios**: Crear, editar, eliminar
- **Configuración del sistema**
- **Reportes completos**
- **Auditoría de actividades**

### Administrador
- **Gestión de surtidores**: Cambiar estados, configurar
- **Gestión de ventas**: Ver historial, generar reportes
- **Control de turnos**: Ver todos los turnos, gestionar
- **Inventario**: Actualizar stock y precios
- **Reportes limitados**

### Bombero
- **Registro de ventas**: Solo puede registrar sus propias ventas
- **Gestión de turno propio**: Iniciar y finalizar su turno
- **Vista limitada** de información
- **Sin acceso** a gestión de usuarios o configuración

## 💾 Persistencia de Datos

El sistema utiliza **LocalStorage** para persistir:
- Estado de surtidores
- Historial de ventas
- Configuración de precios
- Stock de combustible
- **Usuarios y sesiones**
- **Turnos y registros**

Los datos se mantienen entre sesiones del navegador.

## 🎨 Diseño y UX

### Paleta de Colores
- **Primary**: Azul (#3b82f6) - Elementos principales
- **Success**: Verde (#22c55e) - Estados positivos
- **Warning**: Amarillo (#f59e0b) - Advertencias
- **Danger**: Rojo (#ef4444) - Errores y alertas

### Componentes Reutilizables
- Botones con estados (primary, secondary)
- Tarjetas informativas
- Campos de entrada estilizados
- Modales para acciones importantes

### Responsive Design
- Adaptable a dispositivos móviles
- Navegación optimizada para touch
- Layout flexible con Tailwind CSS

## 🔧 Configuración

### Usuarios por Defecto
- **Super Admin**: `admin` / `admin123`
- **Administrador**: `gerente` / `gerente123`
- **Bombero**: `bombero1` / `bombero123`

### Precios por Defecto
- **Extra**: $3.50 por galón
- **Corriente**: $3.20 por galón
- **ACPM**: $2.80 por galón

### Stock Inicial
- **Extra**: 1000 galones por surtidor
- **Corriente**: 1000 galones por surtidor
- **ACPM**: 1000 galones por surtidor

### Estados de Surtidor
- **Disponible**: Listo para ventas
- **Ocupado**: En proceso de venta
- **Mantenimiento**: Fuera de servicio

## 📊 Métricas y KPIs

### Ventas
- Total de ventas del día
- Ingresos por tipo de combustible
- Promedio de ventas por surtidor
- Tasa de ocupación de surtidores
- **Ventas por bombero**

### Inventario
- Stock disponible por combustible
- Rotación de inventario
- Alertas de stock bajo
- Eficiencia de surtidores

### Turnos
- **Horas trabajadas por bombero**
- **Eficiencia de turnos**
- **Tiempo promedio de turno**
- **Turnos activos vs completados**

### Rendimiento
- Tiempo promedio de transacción
- Surtidores más utilizados
- Combustible más vendido
- Horarios pico de ventas

## 🚀 Despliegue

### Construcción para Producción
```bash
npm run build
```

### Servidor de Vista Previa
```bash
npm run preview
```

### Despliegue en Servicios Web
- **Netlify**: Arrastrar carpeta `dist` al panel
- **Vercel**: Conectar repositorio Git
- **GitHub Pages**: Configurar GitHub Actions

## 🔒 Compatibilidad

### Navegadores Soportados
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Dispositivos
- Desktop (1920x1080+)
- Tablet (768x1024)
- Mobile (375x667+)

## 📝 Notas de Desarrollo

### Estado Global
El sistema utiliza React Context API con useReducer para manejar:
- Estado de surtidores
- Historial de ventas
- Configuración de precios
- Persistencia de datos
- **Sistema de usuarios y autenticación**
- **Control de turnos**

### Optimizaciones
- Lazy loading de componentes
- Memoización de cálculos costosos
- Debounce en filtros de búsqueda
- Optimización de re-renders

### Estructura de Datos
```javascript
// Ejemplo de estructura de venta mejorada
{
  id: 1234567890,
  surtidorId: 1,
  surtidorNombre: "Surtidor 1",
  tipoCombustible: "extra",
  cantidad: 25.50,
  precioUnitario: 3.50,
  valorTotal: 89.25,
  fechaHora: "2024-01-15T14:30:00.000Z",
  bomberoId: 3,
  bomberoNombre: "Juan Pérez"
}

// Ejemplo de estructura de turno
{
  id: 1234567890,
  bomberoId: 3,
  bomberoNombre: "Juan Pérez",
  horaEntrada: "2024-01-15T08:00:00.000Z",
  horaSalida: "2024-01-15T16:00:00.000Z",
  activo: false
}
```

## 🤝 Contribución

### Guías de Desarrollo
1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

### Estándares de Código
- Usar ESLint y Prettier
- Seguir convenciones de React
- Documentar funciones complejas
- Mantener componentes pequeños y reutilizables

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
1. Crear un issue en GitHub
2. Describir el problema o solicitud
3. Incluir pasos para reproducir
4. Especificar versión del navegador

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para la gestión eficiente de estaciones de gasolina**
