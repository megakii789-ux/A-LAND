import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

// Development must not cache source/HMR responses. Only the post-build worker is qualified.
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {
      console.warn('Offline installation did not complete. Do not assume offline availability.');
    });
  });
}
const root = document.getElementById('root');
if (!root) throw new Error('APP_ROOT_MISSING');
createRoot(root).render(<App />);
