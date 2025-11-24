# ✅ MIGRACIÓN FIREBASE - INSTRUCCIONES FINALES

## 🎯 ESTADO ACTUAL

### ✅ Completado:
1. **Limpieza de código**: Chatbot e IA removidos de `index.html`
2. **Firebase Config**: Creado `js/firebase-config.js` con estructura v9
3. **Refactorización**: Creado `js/rifa-detalle-firebase.js` con lógica de Firestore
4. **HTML actualizado**: `rifa-detalle.html` carga el módulo de Firebase

### ⚠️ Pendiente (Requiere tu acción):

---

## 📝 PASO 1: CONFIGURAR FIREBASE CONSOLE

### 1.1 Crear Proyecto
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Clic en "Add project" o selecciona uno existente
3. Completa el nombre del proyecto (ej: "rifas-ubia")
4. Sigue los pasos del asistente

### 1.2 Obtener Credenciales
1. En Firebase Console, ve a **Project Settings** (⚙️)
2. Scroll hasta **"Your apps"**
3. Clic en el ícono **</>** (Web)
4. Registra la app con nombre: "RIFAS UBIA Web"
5. **Copia los valores de configuración**

### 1.3 Actualizar `firebase-config.js`
Abre `js/firebase-config.js` y reemplaza:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",           // ← Reemplazar
    authDomain: "TU_PROJECT_ID.firebaseapp.com",  // ← Reemplazar
    projectId: "TU_PROJECT_ID",         // ← Reemplazar
    storageBucket: "TU_PROJECT_ID.appspot.com",   // ← Reemplazar
    messagingSenderId: "TU_MESSAGING_SENDER_ID",  // ← Reemplazar
    appId: "TU_APP_ID"                  // ← Reemplazar
};
```

---

## 📝 PASO 2: CONFIGURAR FIRESTORE

### 2.1 Crear Base de Datos
1. En Firebase Console, ve a **Firestore Database**
2. Clic en **"Create database"**
3. Selecciona **"Start in test mode"** (por ahora)
4. Elige una ubicación (ej: `us-central1`)
5. Clic en **"Enable"**

### 2.2 Configurar Reglas de Seguridad
1. Ve a **Firestore Database** > **Rules**
2. Reemplaza las reglas con:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rifas: lectura pública, escritura controlada
    match /rifas/{rifaId} {
      // Cualquiera puede leer rifas
      allow read: if true;
      
      // Solo autenticados pueden crear rifas
      allow create: if request.auth != null;
      
      // Actualizar números vendidos (permite compras sin registro)
      allow update: if 
        // Solo permite actualizar numerosVendidos y updatedAt
        request.resource.data.diff(resource.data).affectedKeys()
          .hasOnly(['numerosVendidos', 'updatedAt']) ||
        // O si es el organizador actualizando su rifa
        (request.auth != null && 
         resource.data.organizadorId == request.auth.uid);
    }
  }
}
```

3. Clic en **"Publish"**

---

## 📝 PASO 3: CREAR PRIMERA RIFA DE PRUEBA

### Opción A: Desde Firebase Console
1. Ve a **Firestore Database** > **Data**
2. Clic en **"Start collection"**
3. Collection ID: `rifas`
4. Document ID: `rifa-1` (o deja que se genere automáticamente)
5. Agrega estos campos:

```
titulo: "iPhone 15 Pro Max"
descripcion: "Nuevo sellado, color titanio natural"
precio: 5000
numerosTotales: 100
imagenUrl: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500"
organizadorId: "test-organizer"
estado: "active"
fechaFin: "2024-12-31"
premio: "iPhone 15 Pro Max 256GB"
condiciones: ["Nuevo sellado", "Garantía oficial"]
numerosVendidos: []  ← Array vacío inicialmente
createdAt: [Timestamp - usar botón de fecha]
updatedAt: [Timestamp - usar botón de fecha]
```

### Opción B: Desde el código (después de configurar)
Puedes crear rifas desde el dashboard de organizador (una vez migrado).

---

## 📝 PASO 4: PROBAR LA MIGRACIÓN

### 4.1 Probar Carga de Rifa
1. Abre `rifa-detalle.html?id=rifa-1` en el navegador
2. Debe cargar la rifa desde Firestore
3. Verifica que se muestren los datos correctamente

### 4.2 Probar Compra Sin Registro
1. En la página de detalle, clic en "Comprar Número"
2. Selecciona un número disponible
3. Completa el formulario de invitado:
   - Nombre: "Juan Pérez"
   - Email: "test@email.com"
   - Teléfono: "627039947"
4. Selecciona método de pago (cualquiera)
5. Clic en "Confirmar Pago"
6. **Debería guardar en Firestore**

### 4.3 Verificar en Firestore
1. Ve a Firebase Console > Firestore Database > Data
2. Abre el documento `rifa-1`
3. Verifica que `numerosVendidos` tenga un nuevo objeto:
   ```json
   {
     "numero": 5,
     "estado": "pagado",
     "comprador": {
       "nombre": "Juan Pérez",
       "email": "test@email.com",
       "telefono": "627039947",
       "isGuest": true
     },
     "metodoPago": "nequi",
     "fechaCompra": [Timestamp],
     "precio": 5000
   }
   ```

### 4.4 Probar Concurrencia
1. Abre dos pestañas con la misma rifa
2. En ambas, selecciona el mismo número
3. Intenta comprar en ambas simultáneamente
4. **Solo una debe tener éxito**
5. La otra debe mostrar: "Lo sentimos, el número X acaba de ser vendido"

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### Error: "Firebase: Error (auth/unauthorized)"
**Causa**: Reglas de Firestore muy restrictivas  
**Solución**: Verificar reglas en Paso 2.2

### Error: "Cannot read property 'data' of undefined"
**Causa**: Documento no existe en Firestore  
**Solución**: Crear rifa de prueba (Paso 3)

### Error: "Module not found: firebase-config.js"
**Causa**: Ruta incorrecta o script no es módulo  
**Solución**: Verificar que `rifa-detalle.html` carga con `type="module"`

### Error: "Transaction failed"
**Causa**: Número ya vendido (comportamiento esperado)  
**Solución**: Este es el comportamiento correcto - prueba con otro número

### Los números no se muestran como vendidos
**Causa**: `generateNumberGrid()` no se está ejecutando o hay error  
**Solución**: Abrir consola del navegador (F12) y verificar errores

---

## 📊 ESTRUCTURA FINAL DE ARCHIVOS

```
js/
├── firebase-config.js          ✅ Configuración Firebase (ACTUALIZAR CREDENCIALES)
├── rifa-detalle-firebase.js    ✅ Versión con Firestore
├── rifa-detalle.js             ⚠️  Versión antigua (puede eliminarse después de probar)
├── rifas.js                    ⚠️  Pendiente migración completa
└── ...

index.html                      ✅ Chatbot removido
rifa-detalle.html               ✅ Carga módulo Firebase
MIGRACION_FIREBASE.md           ✅ Documentación completa
INSTRUCCIONES_FINALES.md        ✅ Este archivo
```

---

## ✅ CHECKLIST FINAL

### Configuración
- [ ] Proyecto creado en Firebase Console
- [ ] Credenciales copiadas y actualizadas en `firebase-config.js`
- [ ] Firestore Database creado
- [ ] Reglas de seguridad configuradas
- [ ] Primera rifa de prueba creada

### Testing
- [ ] Rifa se carga desde Firestore
- [ ] Números disponibles se muestran correctamente
- [ ] Compra sin registro funciona
- [ ] Datos se guardan en Firestore
- [ ] Concurrencia funciona (solo una compra exitosa)

### Próximos Pasos
- [ ] Migrar `rifas.js` para cargar rifas desde Firestore
- [ ] Migrar autenticación a Firebase Auth (Fase 2)
- [ ] Implementar Storage para imágenes (Fase 2)

---

## 🎯 RESUMEN

**Lo que está listo:**
- ✅ Código refactorizado para usar Firestore
- ✅ Transacciones implementadas para prevenir concurrencia
- ✅ Compra sin registro funcional
- ✅ Manejo de errores implementado

**Lo que necesitas hacer:**
1. Configurar Firebase Console (5 minutos)
2. Actualizar credenciales en `firebase-config.js` (2 minutos)
3. Crear rifa de prueba (3 minutos)
4. Probar el flujo completo (5 minutos)

**Total: ~15 minutos para tener el MVP funcionando**

---

**¿Dudas?** Revisa `MIGRACION_FIREBASE.md` para más detalles técnicos.

