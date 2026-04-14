import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PlayerPage from './pages/PlayerPage';
import HostPage from './pages/HostPage';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"      element={<PlayerPage />} />
        <Route path="/host"  element={<HostPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </BrowserRouter>
  );
}
