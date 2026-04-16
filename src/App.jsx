import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Player route is the most-hit one (mobile players) — keep it eager so first paint is fast.
import PlayerPage from './pages/PlayerPage';

// Heavier / less-frequent routes are lazy so players don't download recharts, admin
// components, etc. unless they actually navigate there.
const HostPage  = lazy(() => import('./pages/HostPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/"      element={<PlayerPage />} />
          <Route path="/host"  element={<HostPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
