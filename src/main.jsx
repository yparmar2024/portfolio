import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './styles/utilities.css'
import { Analytics } from '@vercel/analytics/react';
import { SoundProvider } from './context/SoundContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <SoundProvider>
      <App />
      <Analytics />
    </SoundProvider>
  </React.StrictMode>,
)