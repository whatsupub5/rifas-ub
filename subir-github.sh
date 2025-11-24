#!/bin/bash

# Script para subir el proyecto a GitHub
# Reemplaza TU_USUARIO con tu usuario de GitHub

echo "🚀 Subiendo proyecto RIFAS UBIA a GitHub..."
echo ""

# Pide el usuario de GitHub
read -p "Ingresa tu usuario de GitHub: " GITHUB_USER

# Pide el nombre del repositorio (opcional, por defecto rifas-ubia)
read -p "Nombre del repositorio (Enter para 'rifas-ubia'): " REPO_NAME
REPO_NAME=${REPO_NAME:-rifas-ubia}

echo ""
echo "📦 Configurando repositorio remoto..."

# Agrega el remoto
git remote add origin https://github.com/$GITHUB_USER/$REPO_NAME.git 2>/dev/null || git remote set-url origin https://github.com/$GITHUB_USER/$REPO_NAME.git

echo "✅ Remoto configurado: https://github.com/$GITHUB_USER/$REPO_NAME.git"
echo ""

# Verifica que estamos en main
git branch -M main

echo "📤 Subiendo código a GitHub..."
echo ""

# Hace push
git push -u origin main

echo ""
echo "✅ ¡Proyecto subido exitosamente!"
echo "🌐 Visita: https://github.com/$GITHUB_USER/$REPO_NAME"

