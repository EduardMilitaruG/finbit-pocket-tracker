
# FinBit - Gestión Personal de Finanzas
# Documentación de Archivos del Proyecto

## ARCHIVOS PRINCIPALES DE CONFIGURACIÓN

### package.json
- Define las dependencias del proyecto (React, TypeScript, Tailwind, etc.)
- Scripts de construcción y desarrollo
- Metadatos del proyecto

### vite.config.ts
- Configuración del bundler Vite
- Define aliases de rutas (@/ apunta a src/)
- Configuración del servidor de desarrollo

### tailwind.config.ts
- Configuración de Tailwind CSS
- Define colores personalizados, temas, animaciones
- Sistema de diseño de la aplicación

### tsconfig.json
- Configuración de TypeScript
- Define reglas de compilación y tipado

## ARCHIVOS DE ENTRADA Y ESTILOS

### src/main.tsx
- Punto de entrada de la aplicación React
- Monta el componente App en el DOM

### src/App.tsx
- Componente raíz de la aplicación
- Maneja el estado global de autenticación
- Renderiza Login, Register o Dashboard según el estado

### src/index.css
- Estilos globales de Tailwind CSS
- Variables CSS personalizadas para el tema
- Configuración de colores y espaciados

## TIPOS DE DATOS

### src/types/User.ts
- Define las interfaces TypeScript:
  * User: estructura de usuario (id, username, password)
  * Transaction: estructura de transacciones
  * SavingsGoal: estructura de objetivos de ahorro

## SERVICIOS Y LÓGICA DE NEGOCIO

### src/services/IndexedDBService.ts
- Servicio para manejar la base de datos local (IndexedDB)
- Operaciones CRUD para usuarios, transacciones y objetivos
- Inicialización y gestión de la base de datos
- Convierte datos entre formatos español/inglés

## HOOKS PERSONALIZADOS

### src/hooks/use-toast.ts
- Hook para mostrar notificaciones toast
- Maneja estado de notificaciones temporales
- Sistema de feedback al usuario

### src/hooks/use-mobile.tsx
- Hook para detectar si el dispositivo es móvil
- Utilizado para diseño responsive

## COMPONENTES DE AUTENTICACIÓN

### src/components/Login.tsx
- Formulario de inicio de sesión
- Valida credenciales contra IndexedDB
- Maneja estado de carga e inicialización

### src/components/Register.tsx
- Formulario de registro de nuevos usuarios
- Validación de contraseñas
- Creación de usuarios en la base de datos

## COMPONENTES PRINCIPALES

### src/components/Dashboard.tsx
- Panel principal de la aplicación
- Sistema de pestañas para diferentes secciones
- Formulario para agregar transacciones
- Lista filtrable de transacciones
- Tarjetas de resumen financiero
- Funcionalidad de exportar a CSV

### src/components/SavingsGoals.tsx
- Gestión de objetivos de ahorro
- Formulario para crear nuevas metas
- Visualización del progreso con barras
- Botones para actualizar cantidades ahorradas

### src/components/Profile.tsx
- Perfil del usuario
- Exportar/importar datos CSV
- Funciones de gestión de cuenta
- Resetear datos (en desarrollo)

### src/components/Markets.tsx
- Simulación de datos de mercados financieros
- Gráficos de Bitcoin y S&P 500
- Datos mock actualizados cada 5 minutos
- Utiliza recharts para visualización

### src/components/ConexionBancaria.tsx
- Simulación de conexión bancaria
- Lista de bancos españoles
- Importación de transacciones de ejemplo
- Interfaz para futuras integraciones reales

## COMPONENTES UI (SHADCN/UI)

### src/components/ui/
- Componentes de interfaz reutilizables
- Basados en Radix UI con estilos de Tailwind
- Incluyen: botones, formularios, toast, charts, etc.
- Sistema de diseño consistente

### src/components/ui/toast.tsx
- Componente de notificaciones toast
- Muestra mensajes temporales al usuario

### src/components/ui/toaster.tsx
- Proveedor de contexto para toast
- Renderiza las notificaciones en pantalla

### src/components/ui/chart.tsx
- Componentes para gráficos
- Wrapper de recharts con estilos consistentes

## UTILIDADES

### src/lib/utils.ts
- Funciones utilitarias
- Combina clases CSS con cn() (clsx + tailwind-merge)

## PÁGINAS (NO UTILIZADAS ACTUALMENTE)

### src/pages/Index.tsx
- Página alternativa con fondo personalizado
- Misma funcionalidad que App.tsx pero con diseño diferente

### src/pages/NotFound.tsx
- Página de error 404
- Se muestra para rutas no encontradas

## ARCHIVOS DE RECURSOS

### public/lovable-uploads/38c5741a-b15a-4fdc-9613-a1c6dbe8397d.png
- Imagen de fondo utilizada en Index.tsx
- Recurso estático de la aplicación

## FLUJO DE LA APLICACIÓN

1. main.tsx → App.tsx (punto de entrada)
2. App.tsx verifica si hay usuario logueado
3. Si no hay usuario: muestra Login/Register
4. Si hay usuario: muestra Dashboard
5. Dashboard maneja todas las funcionalidades principales
6. IndexedDBService persiste todos los datos localmente

## CARACTERÍSTICAS PRINCIPALES

- ✅ Autenticación local (sin backend)
- ✅ Gestión de transacciones (ingresos/gastos)
- ✅ Objetivos de ahorro con progreso visual
- ✅ Filtros y búsqueda de transacciones
- ✅ Exportar/importar datos CSV
- ✅ Simulación de mercados financieros
- ✅ Diseño responsive con Tailwind CSS
- ✅ Notificaciones toast para feedback
- ✅ Validación de formularios
- ✅ Persistencia local con IndexedDB

## TECNOLOGÍAS UTILIZADAS

- React 18 (frontend framework)
- TypeScript (tipado estático)
- Vite (bundler y dev server)
- Tailwind CSS (estilos)
- IndexedDB (base de datos local)
- Recharts (gráficos)
- Shadcn/ui (componentes UI)
- Lucide React (iconos)

## NOTAS IMPORTANTES

- Toda la persistencia es local (IndexedDB)
- No hay backend real, es una aplicación frontend
- Los datos de mercados son simulados
- La conexión bancaria es una demo (no funcional)
- Ideal para un PFC/MVP de gestión financiera personal
