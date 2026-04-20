import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/tokens.css'
import './styles/components.css'
import './index.css'
import App from './App.jsx'
import AuthProvider from './components/AuthProvider.jsx'
import { ThemeProvider } from './hooks/useTheme.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
