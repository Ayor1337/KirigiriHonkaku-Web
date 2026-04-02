// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { HomeView } from './components/views/HomeView';
import { InvestigationLayout } from './components/layout/InvestigationLayout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeView />} />
        <Route path="/game" element={<InvestigationLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
