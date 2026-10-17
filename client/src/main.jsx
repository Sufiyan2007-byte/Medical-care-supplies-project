import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './i18n';
import './index.css';
import './motion.css';
import './brand-night.css';
import App from './App.jsx';
import { initTheme } from './utils/themes';

initTheme();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);

