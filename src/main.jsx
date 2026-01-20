import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './utils/i18n';

import GlobalErrorBoundary from './components/GlobalErrorBoundary.jsx'

const rootContainer = document.getElementById('root');
if (rootContainer) {
  // CRITICAL: Force unregister Service Workers to clear stale cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (let registration of registrations) {
        registration.unregister();
        console.log('Old Service Worker unregistered');
      }
    });
  }

  createRoot(rootContainer).render(
    <StrictMode>
      <GlobalErrorBoundary>
        <App />
      </GlobalErrorBoundary>
    </StrictMode>,
  );
}
