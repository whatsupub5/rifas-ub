# 🚀 Guía para Subir a GitHub

## Pasos para subir tu proyecto a GitHub

### 1. Crear el repositorio en GitHub

1. Ve a [GitHub.com](https://github.com) e inicia sesión
2. Haz clic en el botón **"+"** en la esquina superior derecha
3. Selecciona **"New repository"**
4. Completa los datos:
   - **Repository name**: `rifas-ubia` (o el nombre que prefieras)
   - **Description**: "Plataforma web completa para gestión de rifas digitales"
   - **Visibility**: Elige **Public** o **Private**
   - **NO marques** "Initialize with README" (ya tenemos uno)
5. Haz clic en **"Create repository"**

### 2. Conectar tu repositorio local con GitHub

Después de crear el repositorio, GitHub te mostrará comandos. Usa estos:

```bash
# Navega a tu proyecto
cd "/Users/unaybayona/Downloads/Descargas_Organizadas/Descargas_Grandes/Paginas Web/PAGINA RIFAS UBIA"

# Agrega el remoto (reemplaza TU_USUARIO con tu usuario de GitHub)
git remote add origin https://github.com/TU_USUARIO/rifas-ubia.git

# Verifica que se agregó correctamente
git remote -v

# Sube tu código
git branch -M main
git push -u origin main
```

### 3. Si ya tienes el repositorio creado

Si ya creaste el repositorio en GitHub, solo necesitas:

```bash
# Agregar el remoto
git remote add origin https://github.com/TU_USUARIO/rifas-ubia.git

# Cambiar a la rama main
git branch -M main

# Subir el código
git push -u origin main
```

### 4. Autenticación

Si GitHub te pide autenticación:

**Opción A: Personal Access Token (Recomendado)**
1. Ve a GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Genera un nuevo token con permisos `repo`
3. Usa el token como contraseña cuando git te lo pida

**Opción B: SSH (Más seguro)**
```bash
# Genera una clave SSH (si no tienes una)
ssh-keygen -t ed25519 -C "tu_email@example.com"

# Agrega la clave a GitHub
# Copia el contenido de ~/.ssh/id_ed25519.pub
# Ve a GitHub → Settings → SSH and GPG keys → New SSH key

# Cambia el remoto a SSH
git remote set-url origin git@github.com:TU_USUARIO/rifas-ubia.git
```

## Comandos útiles

### Ver el estado del repositorio
```bash
git status
```

### Agregar cambios
```bash
git add .
git commit -m "Descripción de los cambios"
git push
```

### Ver el historial
```bash
git log --oneline
```

### Crear una nueva rama
```bash
git checkout -b nombre-de-la-rama
git push -u origin nombre-de-la-rama
```

## Estructura del proyecto en GitHub

Una vez subido, tu repositorio tendrá esta estructura:

```
rifas-ubia/
├── README.md
├── .gitignore
├── index.html
├── dashboard-*.html
├── css/
├── js/
├── assets/
└── *.md (documentación)
```

## Siguientes pasos

1. ✅ Código subido a GitHub
2. 📝 Agregar descripción al repositorio
3. 🏷️ Agregar topics/tags (ej: `rifas`, `javascript`, `html`, `css`)
4. 📋 Crear Issues para tareas pendientes
5. 🌿 Crear ramas para nuevas funcionalidades
6. 📄 Configurar GitHub Pages (opcional) para hosting

## GitHub Pages (Hosting gratuito)

Para publicar tu sitio en GitHub Pages:

1. Ve a Settings → Pages
2. En "Source", selecciona la rama `main` y carpeta `/ (root)`
3. Guarda
4. Tu sitio estará disponible en: `https://TU_USUARIO.github.io/rifas-ubia`

---

**¿Necesitas ayuda?** Revisa la [documentación de GitHub](https://docs.github.com)

