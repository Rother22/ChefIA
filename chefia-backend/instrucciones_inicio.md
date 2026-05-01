# Guía de Inicio de ChefIA

Para iniciar tu aplicación por tu cuenta sin depender de nadie, siempre debes arrancar **dos cosas**: el backend (que procesa la IA y los precios) y el frontend (la página visual).

Para ello, necesitas abrir **dos pestañas o ventanas diferentes de la terminal** en tu Mac.

---

## Paso 1: Iniciar el Backend (Servidor y Gemini)

Abre tu primera ventana de terminal y copia/pega estos comandos uno por uno, presionando *Enter* al final de cada línea:

```bash
cd /Users/rother/Documents/Trabajo/ChefIa/chefia-backend
node server.js
```

> [!NOTE]
> Sabrás que funcionó cuando veas un mensaje que dice: `🚀 Servidor AXIOS Scraper (Aurrera/WM) corriendo en http://0.0.0.0:3001`. **No cierres esta ventana**, déjala abierta minimizada.

---

## Paso 2: Iniciar el Frontend (Página Web)

Abre una **nueva** pestaña o ventana de la terminal (puedes presionar `Cmd + T` si ya estás en la terminal) y pega estos comandos:

```bash
cd /Users/rother/Documents/Trabajo/ChefIa/chefia-app
3```

> [!NOTE]
> Sabrás que funcionó cuando veas unas letras verdes indicando las direcciones locales, por ejemplo:
> `➜  Local:   http://localhost:5173/`
> `➜  Network: http://192.168.0.213:5173/`

---

## Paso 3: Abrir la aplicación

Una vez que ambos servidores estén corriendo (cada uno en su propia pestaña de la terminal), simplemente abre tu navegador de internet (Chrome, Safari, etc.) y entra a cualquiera de estos enlaces:

- Si estás en la misma computadora: [http://localhost:5173](http://localhost:5173)
- Si estás en tu celular u otro dispositivo en la misma red WiFi: **http://192.168.0.213:5173**

---

##  ¿Cómo reiniciar el servidor o apagar la aplicación?

Si haces cambios grandes en el código (especialmente en el backend) o simplemente quieres apagar la aplicación al terminar de trabajar:

1. Ve a la ventana de la terminal que quieres detener.
2. Presiona las teclas **`Control + C`** al mismo tiempo. (Verás que el proceso se interrumpe y te devuelve la línea de comandos normal).
3. **Para volver a abrirlo (Reiniciar):** Simplemente vuelve a escribir el comando de inicio que corresponda y presiona Enter:
   - Para el backend: `node server.js`
   - Para el frontend: `npm run dev`

