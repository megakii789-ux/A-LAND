import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 注册 Service Worker (符合 PWA 标准规范)
if ('serviceWorker' in navigator && process.env.NODE_ENV !== 'test') {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        // 监听 service worker update
        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (installingWorker) {
            installingWorker.addEventListener('statechange', () => {
              if (
                installingWorker.state === 'installed' &&
                navigator.serviceWorker.controller
              ) {
                console.log('晴雨小岛已有新版本可用，后台更新就绪。');
              }
            });
          }
        });
      })
      .catch((error) => {
        console.warn('Service Worker 注册提示 (开发/离线环境):', error);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
