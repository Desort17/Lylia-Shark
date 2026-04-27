import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle phantom MetaMask errors potentially from browser extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && 
      (typeof event.reason === 'string' && event.reason.includes('MetaMask')) ||
      (event.reason.message && event.reason.message.includes('MetaMask'))
  ) {
    event.preventDefault();
    console.warn('Suppressed external MetaMask error:', event.reason);
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
