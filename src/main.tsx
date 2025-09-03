import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import "./i18n"
import { ModalStackProvider } from './ModalContext.tsx'
import { ToastProvider } from './ToastContext.tsx'
import { DialogProvider } from './DialogContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <DialogProvider>
          <ModalStackProvider>
            <App />
          </ModalStackProvider>
        </DialogProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>,
)
