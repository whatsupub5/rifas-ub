# 🔥 GUÍA DE MIGRACIÓN A FIREBASE - FASE 1 MVP

## 📋 RESUMEN DE CAMBIOS

Esta migración transforma el prototipo que usa `localStorage` en un MVP funcional con Firebase Firestore, enfocándose en el flujo crítico: **Compra sin Registro**.

---

## ✅ PASO 1: LIMPIEZA DE CÓDIGO (COMPLETADO)

### Archivos Modificados:
- ✅ `index.html` - Removido chatbot widget y script
- ✅ Comentadas referencias a IA y chatbot

### Archivos a Eliminar/Comentar (Opcional):
- `js/chatbot.js` - Ya no se carga
- `js/ai-generator.js` - Funcionalidad removida
- `ai-generator.html` - Página removida

---

## ✅ PASO 2: CONFIGURACIÓN FIREBASE (COMPLETADO)

### Archivo Creado: `js/firebase-config.js`

**IMPORTANTE**: Debes reemplazar los valores de configuración:

```javascript
const firebaseConfig = {
    apiKey: "TU_API_KEY_AQUI",
    authDomain: "TU_PROJECT_ID.firebaseapp.com",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_PROJECT_ID.appspot.com",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};
```

**Cómo obtener las credenciales:**
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto nuevo o selecciona uno existente
3. Ve a Project Settings > General
4. En "Your apps", crea una nueva app web
5. Copia los valores de configuración

---

## 🔄 PASO 3: ESQUEMA DE DATOS EN FIRESTORE

### Collection: `rifas`

```javascript
{
  id: "auto-generado",
  titulo: "iPhone 15 Pro Max",
  descripcion: "Nuevo sellado...",
  precio: 5000,
  numerosTotales: 100,
  imagenUrl: "https://...",
  organizadorId: "user123",
  estado: "active" | "paused" | "completed" | "cancelled",
  fechaFin: "2024-12-31",
  premio: "iPhone 15 Pro Max 256GB",
  condiciones: ["Condición 1", "Condición 2"],
  createdAt: Timestamp,
  updatedAt: Timestamp,
  numerosVendidos: [
    {
      numero: 5,
      estado: "pagado",
      comprador: {
        nombre: "Juan Pérez",
        email: "juan@email.com",
        telefono: "627039947",
        userId: "user123" | null,
        isGuest: true | false
      },
      metodoPago: "nequi" | "daviplata" | "paypal",
      fechaCompra: Timestamp,
      precio: 5000
    }
  ]
}
```

---

## 🔄 PASO 4: REFACTORIZACIÓN DE ARCHIVOS

### 4.1 `js/rifa-detalle.js` → `js/rifa-detalle-firebase.js`

**Cambios principales:**

1. **loadRifaDetail()** - Ahora usa Firestore:
   ```javascript
   // ANTES (localStorage)
   const rifa = getRifaById(rifaId);
   
   // DESPUÉS (Firestore)
   const rifaRef = doc(db, 'rifas', rifaId);
   const rifaSnap = await getDoc(rifaRef);
   const rifaData = rifaSnap.data();
   ```

2. **generateNumberGrid()** - Obtiene números desde Firestore:
   ```javascript
   // ANTES (localStorage)
   const numbersState = JSON.parse(localStorage.getItem(`rifa_${rifaId}_numbers`) || '{}');
   
   // DESPUÉS (Firestore)
   const rifaSnap = await getDoc(rifaRef);
   const numerosVendidos = rifaSnap.data().numerosVendidos || [];
   ```

3. **processRifaPayment()** - Usa transacciones de Firestore:
   ```javascript
   // ANTES (localStorage - sin protección de concurrencia)
   localStorage.setItem(`rifa_${rifaId}_numbers`, JSON.stringify(numbersState));
   
   // DESPUÉS (Firestore Transaction - protege contra concurrencia)
   await runTransaction(db, async (transaction) => {
     // Verificar si número está disponible
     // Si está disponible, agregarlo al array
     transaction.update(rifaRef, {
       numerosVendidos: arrayUnion(numeroVendido)
     });
   });
   ```

**Manejo de Errores de Concurrencia:**
- Si dos usuarios intentan comprar el mismo número simultáneamente
- La transacción detecta el conflicto
- Solo uno puede completar la compra
- El otro recibe: "Lo sentimos, el número X acaba de ser vendido"

---

### 4.2 `js/rifas.js` - Actualizar para usar Firestore

**Cambios necesarios:**

1. **initRifasGrid()** - Cargar desde Firestore:
   ```javascript
   // ANTES
   const myRifas = JSON.parse(localStorage.getItem('myRifas') || '[]');
   const allRifas = [...sampleRifas, ...myRifas];
   
   // DESPUÉS
   const rifasRef = collection(db, 'rifas');
   const q = query(rifasRef, where('estado', '==', 'active'));
   const querySnapshot = await getDocs(q);
   const allRifas = querySnapshot.docs.map(doc => ({
     id: doc.id,
     ...doc.data()
   }));
   ```

2. **getRifaById()** - Usar Firestore:
   ```javascript
   // ANTES
   const allRifas = [...sampleRifas, ...myRifas];
   return allRifas.find(r => r.id == rifaId);
   
   // DESPUÉS
   const rifaRef = doc(db, 'rifas', rifaId);
   const rifaSnap = await getDoc(rifaRef);
   if (rifaSnap.exists()) {
     return { id: rifaSnap.id, ...rifaSnap.data() };
   }
   return null;
   ```

---

## 📝 PASO 5: ACTUALIZAR HTML

### `rifa-detalle.html`

Cambiar la carga del script:

```html
<!-- ANTES -->
<script src="js/rifa-detalle.js"></script>

<!-- DESPUÉS -->
<script type="module" src="js/rifa-detalle-firebase.js"></script>
```

### `index.html`

Ya actualizado para cargar `firebase-config.js` primero.

---

## 🚀 PASO 6: CONFIGURAR FIRESTORE

### Reglas de Seguridad (Firestore Rules)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Rifas: lectura pública, escritura solo autenticada
    match /rifas/{rifaId} {
      allow read: if true; // Cualquiera puede leer
      allow write: if request.auth != null; // Solo autenticados pueden escribir
      
      // Permitir actualizar numerosVendidos sin autenticación (para compras de invitados)
      allow update: if request.resource.data.diff(resource.data).affectedKeys()
        .hasOnly(['numerosVendidos', 'updatedAt']);
    }
  }
}
```

**NOTA**: Para permitir compras sin registro, necesitas ajustar las reglas o usar Cloud Functions.

---

## ✅ CHECKLIST DE IMPLEMENTACIÓN

### Configuración Inicial
- [ ] Crear proyecto en Firebase Console
- [ ] Obtener credenciales de configuración
- [ ] Actualizar `firebase-config.js` con credenciales reales
- [ ] Configurar Firestore Database
- [ ] Configurar reglas de seguridad

### Migración de Código
- [ ] Reemplazar `rifa-detalle.js` con versión Firebase
- [ ] Actualizar `rifas.js` para usar Firestore
- [ ] Actualizar `rifa-detalle.html` para cargar módulo
- [ ] Probar carga de rifas desde Firestore
- [ ] Probar compra sin registro con transacciones

### Testing
- [ ] Probar compra de número disponible
- [ ] Probar compra de número ya vendido (debe fallar)
- [ ] Probar compra simultánea (concurrencia)
- [ ] Verificar que números vendidos se muestran correctamente
- [ ] Verificar datos de comprador se guardan correctamente

---

## 🐛 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Firebase: Error (auth/unauthorized)"
**Solución**: Verificar reglas de Firestore y credenciales

### Error: "Cannot read property 'data' of undefined"
**Solución**: Verificar que el documento existe antes de acceder a `.data()`

### Error: "Transaction failed: Number already sold"
**Solución**: Este es el comportamiento esperado - el número fue vendido por otro usuario

### Error: "Module not found: firebase-config.js"
**Solución**: Verificar que el script se carga con `type="module"`

---

## 📊 ESTRUCTURA DE ARCHIVOS FINAL

```
js/
├── firebase-config.js          ✅ NUEVO - Configuración Firebase
├── rifa-detalle-firebase.js    ✅ NUEVO - Versión con Firestore
├── rifa-detalle.js             ⚠️  REEMPLAZAR con versión Firebase
├── rifas.js                    ⚠️  ACTUALIZAR para usar Firestore
├── main.js                     ✅ Sin cambios
└── auth.js                     ⚠️  (Pendiente para Fase 2)

index.html                      ✅ Actualizado (chatbot removido)
rifa-detalle.html               ⚠️  Actualizar carga de script
```

---

## 🎯 PRÓXIMOS PASOS (Fase 2)

1. Migrar autenticación a Firebase Auth
2. Migrar sistema de pagos
3. Migrar reseñas y preguntas
4. Implementar Storage para imágenes

---

**Estado Actual**: ✅ Configuración lista, código refactorizado
**Siguiente Paso**: Configurar Firebase Console y probar

