import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import "./i18n"
import { ModalStackProvider } from './ModalContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ModalStackProvider>
        <App />
      </ModalStackProvider>
    </BrowserRouter>
  </StrictMode>,
)
