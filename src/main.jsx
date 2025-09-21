import React from 'react'
import ReactDOM from 'react-dom/client'
// import App from './App.jsx'  // App original
// import AppSimplified from './AppSimplified.jsx'  // Versión con errores
import AppBasico from './AppBasico.jsx'  // ✅ Versión básica que funciona
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppBasico />
  </React.StrictMode>,
)

