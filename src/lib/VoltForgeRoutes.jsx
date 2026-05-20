import { Routes, Route } from 'react-router-dom';
import VoltForge from '@/pages/VoltForge';

export default function VoltForgeRoutes() {
  return (
    <Routes>
      {/* Main app with sub-routes for each view */}
      <Route path="/*" element={<VoltForge />} />
    </Routes>
  );
}