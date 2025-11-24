# 🎟️ RIFAS UBIA - Plataforma de Rifas Digitales

Plataforma web completa para la gestión y participación en rifas digitales. RIFAS UBIA conecta organizadores y participantes en un entorno seguro, transparente y confiable.

## 📋 Características

### 👥 Para Compradores
- ✅ Navegación de rifas activas
- ✅ Selección de números disponibles
- ✅ Sistema de pagos (Nequi, Daviplata, PayPal)
- ✅ Dashboard personal con historial
- ✅ Descarga de comprobantes
- ✅ Sistema de favoritos
- ✅ **Compra sin necesidad de registrarse**

### 👤 Para Organizadores
- ✅ Creación y gestión de rifas
- ✅ Panel de control de ventas
- ✅ Gestión de números y participantes
- ✅ Reportes financieros
- ✅ Estadísticas en tiempo real

### 🔧 Para Administradores
- ✅ Gestión global del sistema
- ✅ Aprobación de organizadores
- ✅ Monitoreo de transacciones
- ✅ Configuración de comisiones
- ✅ Reportes del sistema

## 🚀 Estructura del Proyecto

```
PAGINA RIFAS UBIA/
├── index.html                  # Página principal
├── dashboard-comprador.html    # Dashboard de compradores
├── dashboard-organizador.html  # Dashboard de organizadores
├── dashboard-admin.html         # Dashboard de administradores
├── rifa-detalle.html           # Página de detalle de rifa
├── css/
│   ├── styles.css              # Estilos principales
│   ├── dashboard.css           # Estilos de dashboards
│   └── responsive.css          # Estilos responsive
├── js/
│   ├── main.js                 # Lógica principal
│   ├── auth.js                 # Autenticación
│   ├── rifas.js                # Gestión de rifas
│   ├── rifa-detalle.js         # Detalle de rifa
│   ├── dashboard-comprador.js  # Dashboard comprador
│   ├── dashboard-organizador.js # Dashboard organizador
│   └── dashboard-admin.js      # Dashboard admin
└── assets/                     # Imágenes y recursos
    └── logo-ub.png             # Logo (agregar aquí)
```

## 🛠️ Tecnologías Utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript (Vanilla)** - Lógica del frontend
- **Font Awesome** - Iconos
- **Google Fonts (Inter)** - Tipografía

## 📦 Instalación

1. Clona o descarga el proyecto
2. Abre `index.html` en tu navegador
3. Para desarrollo local, usa un servidor HTTP:
   ```bash
   # Con Python
   python -m http.server 8000
   
   # Con Node.js (http-server)
   npx http-server
   ```

## 🔐 Autenticación

El sistema incluye autenticación simulada. Para producción, necesitarás:

- Backend API (Node.js, Python, PHP, etc.)
- Base de datos (MySQL, PostgreSQL, MongoDB)
- Integración con pasarelas de pago reales
- Sistema de autenticación OAuth (Google, Facebook)

## 💳 Pasarelas de Pago

Actualmente configuradas (simuladas):
- ✅ Nequi
- ✅ Daviplata
- ✅ PayPal

**Nota:** Para producción, necesitarás:
- Credenciales de API de cada pasarela
- Webhooks para confirmación de pagos
- Sistema de verificación de transacciones

## 🎨 Personalización

### Colores
Edita las variables CSS en `css/styles.css`:
```css
:root {
    --primary-color: #2563eb;
    --secondary-color: #10b981;
    /* ... más variables */
}
```

### Logo
Reemplaza `assets/logo-ub.png` con el logo de tu universidad.

## 📱 Responsive

La aplicación es completamente responsive y funciona en:
- 📱 Móviles (320px+)
- 📱 Tablets (768px+)
- 💻 Desktop (1024px+)

## 🐛 Solución de Problemas

### Imágenes no cargan
- Verifica que los archivos estén en la carpeta `assets/`
- Las imágenes tienen fallback automático

### JavaScript no funciona
- Verifica la consola del navegador (F12)
- Asegúrate de que todos los archivos JS estén cargados

### Estilos no se aplican
- Verifica las rutas de los archivos CSS
- Limpia la caché del navegador (Ctrl+Shift+R)

## ✨ Funcionalidades Implementadas

### 🎯 Compra Sin Registro
- ✅ Cualquier persona puede comprar rifas sin necesidad de registrarse
- ✅ Formulario de datos de contacto para usuarios no registrados
- ✅ Guardado de compras de invitados

### 🖼️ Galería de Imágenes
- ✅ Soporte para múltiples imágenes por rifa
- ✅ Lightbox para visualización ampliada
- ✅ Navegación entre imágenes con thumbnails

### ⭐ Sistema de Reseñas
- ✅ Reseñas y calificaciones de organizadores
- ✅ Visualización de reseñas en página de detalle
- ✅ Sistema de confianza entre usuarios

### 💬 Preguntas y Respuestas
- ✅ Usuarios pueden hacer preguntas a organizadores
- ✅ Respuestas públicas visibles
- ✅ Disponible para usuarios registrados y no registrados

### 📊 Últimos Compradores
- ✅ Visualización de compradores recientes
- ✅ Información de números comprados

### 🔄 Estados de Carga
- ✅ Indicadores de carga (loading states)
- ✅ Skeleton screens para mejor UX

## 📝 TODO / Pendiente

- [ ] Integración con backend real
- [ ] Base de datos
- [ ] Pasarelas de pago reales
- [ ] Sistema de notificaciones push
- [ ] Integración con lotería oficial para sorteos
- [ ] Sistema de mensajería
- [ ] Optimización de imágenes
- [ ] Tests unitarios

## 👨‍💻 Desarrollo

Para contribuir:
1. Fork el proyecto
2. Crea una rama para tu feature
3. Realiza tus cambios
4. Envía un pull request

## 📄 Licencia

Este proyecto es propiedad de RIFAS UBIA.

## 📞 Contacto

- Email: unabayona323@gmail.com
- Teléfono: +34 627 039 947
- Ubicación: Colombia

---

**Desarrollado con ❤️ para RIFAS UBIA**
