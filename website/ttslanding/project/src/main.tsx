import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

try {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (error) {
  console.error('Fatal App Error:', error);
  document.body.innerHTML = `
    <div style="background: #000; color: #fff; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: sans-serif; text-align: center; padding: 20px;">
      <h1 style="color: #60a5fa;">PastePlay Encountered an Error</h1>
      <p style="color: #9ca3af; max-width: 500px;">The website failed to load. This is usually caused by missing Supabase credentials in your Netlify settings.</p>
      <code style="background: #111; padding: 10px; border-radius: 8px; font-size: 12px; margin-top: 20px;">${error}</code>
    </div>
  `;
}
