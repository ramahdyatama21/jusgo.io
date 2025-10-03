import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Disable React DevTools in production
if (process.env.NODE_ENV === 'production') {
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = undefined;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)