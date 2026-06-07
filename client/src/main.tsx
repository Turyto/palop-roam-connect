import { loadConsentedServices } from './lib/consent';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Initialise non-essential third-party services only if the user previously
// accepted cookies. On a fresh visit this is a no-op until the consent banner
// is accepted; essential services (Stripe, Supabase) load regardless.
loadConsentedServices();

createRoot(document.getElementById("root")!).render(<App />);
