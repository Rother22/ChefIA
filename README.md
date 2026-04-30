# 👨‍🍳 ChefIA

<div align="center">
  <img src="chefia-app/public/logo.svg" alt="ChefIA Logo" width="200" height="200" onerror="this.style.display='none'">
  <br>
  <strong>Generador y Compilador de Recetas con Inteligencia Artificial</strong>
</div>

<br>

**ChefIA** es una aplicación web que utiliza inteligencia artificial (Google Gemini API) para asistir a los usuarios en la cocina. El proyecto se divide en dos módulos principales:
1. **Generador de Recetas**: Crea recetas deliciosas de manera dinámica.
2. **Compilador y Precios**: Una herramienta útil para estandarizar recetas, analizar el costo de los ingredientes y ayudar en la gestión de precios de platillos.

---

## 🚀 Características Principales

* **Generación de Recetas Inteligente**: Interactúa con la IA para obtener recetas personalizadas.
* **Cálculo de Costos (Compilador)**: Ingresa tus ingredientes y ChefIA calculará y compilará los costos.
* **Interfaz de Usuario Intuitiva**: Diseño moderno dividido en secciones claras, optimizado para ser responsivo tanto en navegadores de escritorio como en dispositivos móviles.
* **Acceso en Red Local**: Configurado para poder ser accedido a través de cualquier dispositivo en tu red local de manera sencilla.

---

## 🛠️ Tecnologías Utilizadas

Este proyecto sigue una arquitectura Cliente-Servidor separada en dos directorios:

### Frontend (`/chefia-app`)
* **React** (v19) - Biblioteca principal para la interfaz de usuario.
* **Vite** - Empaquetador y servidor de desarrollo ultrarrápido.
* **CSS Puro** - Estilos responsivos y modernos.

### Backend (`/chefia-backend`)
* **Node.js** & **Express** - Servidor backend rápido y ligero.
* **Google GenAI API** (`@google/genai`) - Motor principal de Inteligencia Artificial utilizando los modelos de Gemini.
* **Axios** & **Cheerio** - Para procesamiento y peticiones externas.
* **Cors** & **Dotenv** - Seguridad de red y gestión de variables de entorno.

---

## ⚙️ Instalación y Configuración

Sigue estos pasos para levantar el entorno de desarrollo en tu máquina local.

### Prerrequisitos
* **Node.js** (v18 o superior)
* **npm** (Node Package Manager)
* Una clave API válida de Google Gemini (Google AI Studio).

### 1. Clonar el repositorio
```bash
git clone https://github.com/Rother22/ChefIA.git
cd ChefIA
```

### 2. Configurar el Backend
```bash
cd chefia-backend
npm install
```
Crea un archivo `.env` en la raíz de `chefia-backend` e incluye tu clave de API:
```env
GEMINI_API_KEY=tu_clave_api_aqui
PORT=3000
```
Inicia el servidor backend:
```bash
node server.js
```

### 3. Configurar el Frontend
Abre una nueva terminal en la raíz del proyecto.
```bash
cd chefia-app
npm install
```
Inicia el servidor de desarrollo de Vite (accesible en red local):
```bash
npm run dev
```

---

## 🌐 Uso en Red Local
El frontend de Vite está configurado para exponerse en tu red (mediante `--host`). Al ejecutar `npm run dev`, verás en tu consola una dirección IP local (ej. `http://192.168.x.x:5173`). Puedes ingresar a esa URL desde tu celular u otra computadora conectada a la misma red WiFi para usar ChefIA.

## 📄 Licencia

Este proyecto se encuentra bajo la licencia **ISC** (o la definida en el archivo `LICENSE`).
