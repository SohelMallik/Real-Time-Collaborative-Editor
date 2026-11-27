// React StrictMode helps catch common bugs and deprecated APIs during development
import { StrictMode } from 'react'
// createRoot is the React 18+ API to mount the React app into the DOM
import { createRoot } from 'react-dom/client'
// Import the main root App component
import App from './App/App.jsx'

// Find the <div id="root"> in index.html and render our React application inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
