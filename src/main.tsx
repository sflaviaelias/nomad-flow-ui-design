
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  // Log everything to help with debugging if the root is missing
  console.error(
    '[main.tsx] Root element with id "root" was not found in index.html.'
  );
  throw new Error('Root element not found: Please check your index.html for <div id="root"></div>');
} else {
  console.log('[main.tsx] Successfully found root element, bootstrapping React app.');
}

createRoot(rootElement!).render(<App />);
