# 🤖 Interfaz React para Cinemática Directa de Manipuladores

[![Ver la aplicación](https://img.shields.io/badge/🌐%20Ver%20Aplicación%20Online-000?style=for-the-badge&logo=vercel&logoColor=white)](https://matrices-cinematica-directa.vercel.app/)

![React](https://img.shields.io/badge/React-18.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Math.js](https://img.shields.io/badge/Math.js-AL-ff6f00?style=for-the-badge&logo=javascript&logoColor=white)
![Algebrite](https://img.shields.io/badge/Algebrite-Symbolic%20Math-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

Aplicación desarrollada en **React** que calcula la **cinemática directa** de un manipulador robótico de **n eslabones** usando parámetros **Denavit–Hartenberg (DH)**.  
Incluye generación de tablas de transformación homogénea, cálculo de **velocidades angulares y lineales** y determinante del Jacobiano para analizar **restricciones y singularidades**.

---

## 📋 Características principales

- **Ingreso de parámetros DH** de forma dinámica según el número de eslabones.
- **Generación automática** de tablas de transformación homogénea para cada par de eslabones.
- **Cálculo de velocidades angulares y lineales** usando formulaciones vectoriales y matriciales.
- **Evaluación del determinante del Jacobiano** para identificar singularidades y restricciones de movimiento.
- **Interfaz intuitiva** y adaptable para distintos robots.
- Soporte para **resultados simbólicos** (Algebrite) y numéricos (Math.js).
- **Simplificación trigonométrica avanzada** con aplicación automática de identidades trigonométricas.

---

## 🛠 Tecnologías utilizadas

- **React** → Interfaz y manejo de estado.
- **Math.js** → Operaciones numéricas y matriciales.
- **Algebrite** → Cálculos simbólicos.

---

## 🚀 Instalación y uso

### Prerrequisitos
- Node.js (versión 14 o superior)
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone https://github.com/santiago1525/Matrices-cinematica-directa.git

# Navegar al directorio
cd Matrices-cinematica-directa

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm start
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000).

---

## 📚 Scripts disponibles

### `npm start`
Ejecuta la aplicación en modo desarrollo.

### `npm test`
Lanza el runner de pruebas en modo interactivo.

### `npm run build`
Construye la aplicación para producción en la carpeta `build`.

### `npm run eject`
**Nota: Esta es una operación irreversible.** Expone todos los archivos de configuración.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo la Licencia MIT. Ver `LICENSE` para más información.

---

## 👨‍💻 Autor

**Santiago** - [@santiago1525](https://github.com/santiago1525)

## Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
