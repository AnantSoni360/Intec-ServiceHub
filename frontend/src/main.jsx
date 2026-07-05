import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "871526383060-0f2gngmo5jj5qk4comuegt76vimftlr5.apps.googleusercontent.com"}>
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)
