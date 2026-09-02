# 🌐 Guía para Publicar TechNotes en Internet (Gratis)

Esta guía te explica paso a paso cómo subir la aplicación **TechNotes** a internet gratis para que los técnicos accedan desde cualquier sitio con datos móviles (4G/5G).

---

## 🚀 OPCIÓN 1: Publicación Permanente Gratis en Render.com (Recomendado - 24/7)

Con esta opción, la app estará activa **las 24 horas del día**, sin importar si tu ordenador del taller está encendido o apagado.

### Paso 1: Subir la carpeta a GitHub
1. Entra en [github.com](https://github.com) y crea una cuenta (o inicia sesión).
2. Crea un **Nuevo Repositorio** (puedes llamarlo `technotes-app` y ponerlo en *Privado*).
3. Sube los archivos de la carpeta `C:\Users\RAFA\Desktop\APP NOTAS TÉCNICO` al repositorio.

### Paso 2: Crear el servicio en Render
1. Entra en [render.com](https://render.com) y regístrate gratis (puedes iniciar sesión con tu cuenta de GitHub).
2. Haz clic en el botón azul **"New +"** -> Selecciona **"Web Service"**.
3. Selecciona tu repositorio de GitHub (`technotes-app`).
4. Configura estos campos sencillos:
   - **Name:** `technotes-empresa` *(o el nombre que prefieras)*
   - **Environment:** `Node`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm start`
5. Haz clic en **"Create Web Service"**.

En 2 minutos, Render compilará tu aplicación y te entregará tu propia dirección web HTTPS gratis:
👉 **`https://technotes-empresa.onrender.com`**

---

## ⚡ OPCIÓN 2: Probar el acceso desde la calle HOY MISMO (Túnel Instantáneo desde tu PC)

Si quieres que los técnicos prueben el enlace hoy sin necesidad de registrarte en plataformas:

1. Inicia la aplicación en tu PC haciendo doble clic en **`INICIAR_APP.bat`**.
2. Abre otra ventana de comandos (PowerShell / CMD) en tu carpeta del Escritorio y ejecuta:
   ```cmd
   npx localtunnel --port 3001
   ```
3. La consola te mostrará una dirección pública temporal como:
   `https://random-words-123.loca.lt`
4. Pasa ese enlace por WhatsApp a los técnicos para que prueben la aplicación en la calle.

---

## 📲 Instrucciones para enviar a los Técnicos (WhatsApp)

Copia y pega este mensaje a tus técnicos por WhatsApp junto con el enlace web de la app:

> 📱 **Paso único para instalar la App en el móvil:**
> 1. Abre este enlace en Chrome/Safari: `https://technotes-empresa.onrender.com`
> 2. En el menú de los 3 puntos (`⋮`), pulsa en **"Añadir a la pantalla de inicio"**.
> 3. ¡Listo! Ya tienes el icono de la app en tu teléfono para consultar y dejar avisos en cada cliente.
